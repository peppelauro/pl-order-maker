from fastapi import FastAPI, APIRouter, HTTPException, status
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from bson import ObjectId

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ==================== Models ====================

class Agent(BaseModel):
    id: Optional[str] = None
    name: str
    password: str
    email: Optional[str] = None
    phone: Optional[str] = None

class AgentLogin(BaseModel):
    name: str
    password: str

class Customer(BaseModel):
    id: Optional[str] = None
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None

class PointOfSale(BaseModel):
    id: Optional[str] = None
    customer_id: str
    name: str
    address: str
    city: Optional[str] = None
    phone: Optional[str] = None

class Product(BaseModel):
    id: Optional[str] = None
    name: str
    barcode: str
    price: float
    description: Optional[str] = None
    category: Optional[str] = None
    stock: Optional[int] = 0

class OrderProduct(BaseModel):
    product_id: str
    product_name: str
    barcode: str
    quantity: int
    price: float
    total: float

class Order(BaseModel):
    id: Optional[str] = None
    agent_id: str
    agent_name: str
    customer_id: str
    customer_name: str
    pos_id: str
    pos_name: str
    products: List[OrderProduct]
    delivery_date: str
    total_amount: float
    status: str = "pending"  # pending, synced, completed
    created_at: Optional[str] = None
    synced_at: Optional[str] = None

class OrderCreate(BaseModel):
    agent_id: str
    agent_name: str
    customer_id: str
    customer_name: str
    pos_id: str
    pos_name: str
    products: List[OrderProduct]
    delivery_date: str
    total_amount: float
    status: str = "pending"

# ==================== Helper Functions ====================

def object_id_to_str(doc):
    """Convert MongoDB ObjectId to string"""
    if doc and '_id' in doc:
        doc['id'] = str(doc['_id'])
        del doc['_id']
    return doc

# ==================== API Endpoints ====================

@api_router.get("/")
async def root():
    return {"message": "Order Management API", "version": "1.0"}

# ==================== Agents ====================

@api_router.get("/agents", response_model=List[Agent])
async def get_agents():
    """Get all agents"""
    agents = await db.agents.find().to_list(1000)
    return [Agent(**object_id_to_str(agent)) for agent in agents]

@api_router.post("/agents/login")
async def login_agent(login: AgentLogin):
    """Authenticate agent"""
    agent = await db.agents.find_one({"name": login.name, "password": login.password})
    if not agent:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    agent = object_id_to_str(agent)
    # Don't return password
    agent.pop('password', None)
    return {"success": True, "agent": agent}

# ==================== Customers ====================

@api_router.get("/customers", response_model=List[Customer])
async def get_customers():
    """Get all customers"""
    customers = await db.customers.find().to_list(1000)
    return [Customer(**object_id_to_str(customer)) for customer in customers]

@api_router.get("/customers/{customer_id}", response_model=Customer)
async def get_customer(customer_id: str):
    """Get single customer"""
    customer = await db.customers.find_one({"_id": ObjectId(customer_id)})
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return Customer(**object_id_to_str(customer))

# ==================== Points of Sale ====================

@api_router.get("/points-of-sale", response_model=List[PointOfSale])
async def get_points_of_sale(customer_id: Optional[str] = None):
    """Get all points of sale, optionally filtered by customer"""
    query = {}
    if customer_id:
        query["customer_id"] = customer_id
    
    pos_list = await db.points_of_sale.find(query).to_list(1000)
    return [PointOfSale(**object_id_to_str(pos)) for pos in pos_list]

# ==================== Products ====================

@api_router.get("/products", response_model=List[Product])
async def get_products(search: Optional[str] = None):
    """Get all products with optional search"""
    query = {}
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"barcode": {"$regex": search, "$options": "i"}}
        ]
    
    products = await db.products.find(query).to_list(1000)
    return [Product(**object_id_to_str(product)) for product in products]

@api_router.get("/products/barcode/{barcode}", response_model=Product)
async def get_product_by_barcode(barcode: str):
    """Get product by barcode"""
    product = await db.products.find_one({"barcode": barcode})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return Product(**object_id_to_str(product))

# ==================== Orders ====================

@api_router.post("/orders", response_model=Order)
async def create_order(order: OrderCreate):
    """Create a new order"""
    order_dict = order.dict()
    order_dict["created_at"] = datetime.utcnow().isoformat()
    order_dict["synced_at"] = datetime.utcnow().isoformat()
    order_dict["status"] = "synced"
    
    result = await db.orders.insert_one(order_dict)
    order_dict["id"] = str(result.inserted_id)
    
    logger.info(f"Order created: {order_dict['id']} by agent {order_dict['agent_name']}")
    return Order(**order_dict)

@api_router.get("/orders", response_model=List[Order])
async def get_orders(agent_id: Optional[str] = None):
    """Get all orders, optionally filtered by agent"""
    query = {}
    if agent_id:
        query["agent_id"] = agent_id
    
    orders = await db.orders.find(query).sort("created_at", -1).to_list(1000)
    return [Order(**object_id_to_str(order)) for order in orders]

@api_router.get("/orders/{order_id}", response_model=Order)
async def get_order(order_id: str):
    """Get single order"""
    order = await db.orders.find_one({"_id": ObjectId(order_id)})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return Order(**object_id_to_str(order))

# ==================== Data Seeding ====================

@api_router.post("/seed-data")
async def seed_data():
    """Seed initial data for testing"""
    
    # Check if data already exists
    existing_agents = await db.agents.count_documents({})
    if existing_agents > 0:
        return {"message": "Data already seeded"}
    
    # Seed Agents
    agents = [
        {"name": "John Doe", "password": "password123", "email": "john@example.com", "phone": "+1234567890"},
        {"name": "Jane Smith", "password": "password123", "email": "jane@example.com", "phone": "+1234567891"},
        {"name": "Mike Johnson", "password": "password123", "email": "mike@example.com", "phone": "+1234567892"},
    ]
    agent_result = await db.agents.insert_many(agents)
    
    # Seed Customers
    customers = [
        {"name": "ABC Store", "email": "abc@store.com", "phone": "+1111111111", "address": "123 Main St"},
        {"name": "XYZ Market", "email": "xyz@market.com", "phone": "+2222222222", "address": "456 Oak Ave"},
        {"name": "Best Shop", "email": "best@shop.com", "phone": "+3333333333", "address": "789 Pine Rd"},
        {"name": "Quick Mart", "email": "quick@mart.com", "phone": "+4444444444", "address": "321 Elm St"},
    ]
    customer_result = await db.customers.insert_many(customers)
    
    # Seed Points of Sale
    points_of_sale = [
        {"customer_id": str(customer_result.inserted_ids[0]), "name": "ABC Store - Downtown", "address": "123 Main St", "city": "New York", "phone": "+1111111111"},
        {"customer_id": str(customer_result.inserted_ids[0]), "name": "ABC Store - Uptown", "address": "124 Main St", "city": "New York", "phone": "+1111111112"},
        {"customer_id": str(customer_result.inserted_ids[1]), "name": "XYZ Market - Central", "address": "456 Oak Ave", "city": "Los Angeles", "phone": "+2222222222"},
        {"customer_id": str(customer_result.inserted_ids[2]), "name": "Best Shop - Main Location", "address": "789 Pine Rd", "city": "Chicago", "phone": "+3333333333"},
        {"customer_id": str(customer_result.inserted_ids[3]), "name": "Quick Mart - Store 1", "address": "321 Elm St", "city": "Houston", "phone": "+4444444444"},
    ]
    await db.points_of_sale.insert_many(points_of_sale)
    
    # Seed Products
    products = [
        {"name": "Coca Cola 330ml", "barcode": "5449000000996", "price": 1.50, "description": "Refreshing cola drink", "category": "Beverages", "stock": 100},
        {"name": "Pepsi 330ml", "barcode": "012000001642", "price": 1.45, "description": "Cola soft drink", "category": "Beverages", "stock": 150},
        {"name": "Lay's Chips Original", "barcode": "028400000000", "price": 2.99, "description": "Classic potato chips", "category": "Snacks", "stock": 200},
        {"name": "Snickers Bar", "barcode": "040000000013", "price": 1.25, "description": "Chocolate bar with peanuts", "category": "Candy", "stock": 300},
        {"name": "Sprite 330ml", "barcode": "5449000000687", "price": 1.50, "description": "Lemon-lime soda", "category": "Beverages", "stock": 120},
        {"name": "Doritos Nacho Cheese", "barcode": "028400000031", "price": 3.49, "description": "Nacho cheese tortilla chips", "category": "Snacks", "stock": 180},
        {"name": "Kit Kat", "barcode": "034000000036", "price": 1.15, "description": "Chocolate wafer bar", "category": "Candy", "stock": 250},
        {"name": "Red Bull 250ml", "barcode": "9002490100025", "price": 2.99, "description": "Energy drink", "category": "Beverages", "stock": 90},
        {"name": "Pringles Original", "barcode": "038000845012", "price": 2.49, "description": "Stackable potato crisps", "category": "Snacks", "stock": 160},
        {"name": "M&M's Peanut", "barcode": "040000000044", "price": 1.99, "description": "Chocolate candy with peanuts", "category": "Candy", "stock": 220},
    ]
    await db.products.insert_many(products)
    
    logger.info("Database seeded successfully")
    return {
        "message": "Data seeded successfully",
        "agents": len(agents),
        "customers": len(customers),
        "points_of_sale": len(points_of_sale),
        "products": len(products)
    }

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
