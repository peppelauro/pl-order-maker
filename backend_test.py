#!/usr/bin/env python3
"""
Comprehensive Backend API Testing for Sales Order App
Tests all endpoints with proper error handling and validation
"""

import requests
import json
import sys
from typing import Dict, Any, Optional

# Use the public backend URL from environment
BASE_URL = "https://sales-order-app-9.preview.emergentagent.com/api"

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    END = '\033[0m'
    BOLD = '\033[1m'

class TestResult:
    def __init__(self):
        self.passed = 0
        self.failed = 0
        self.errors = []
        
    def add_pass(self, test_name: str):
        self.passed += 1
        print(f"{Colors.GREEN}✓{Colors.END} {test_name}")
        
    def add_fail(self, test_name: str, error: str):
        self.failed += 1
        self.errors.append({"test": test_name, "error": error})
        print(f"{Colors.RED}✗{Colors.END} {test_name}")
        print(f"  {Colors.RED}Error: {error}{Colors.END}")
        
    def print_summary(self):
        print(f"\n{Colors.BOLD}{'='*60}{Colors.END}")
        print(f"{Colors.BOLD}Test Summary{Colors.END}")
        print(f"{Colors.BOLD}{'='*60}{Colors.END}")
        print(f"{Colors.GREEN}Passed: {self.passed}{Colors.END}")
        print(f"{Colors.RED}Failed: {self.failed}{Colors.END}")
        print(f"Total: {self.passed + self.failed}")
        
        if self.errors:
            print(f"\n{Colors.RED}{Colors.BOLD}Failed Tests:{Colors.END}")
            for i, error in enumerate(self.errors, 1):
                print(f"{i}. {error['test']}")
                print(f"   {error['error']}")
        
        return self.failed == 0

# Global test result tracker
result = TestResult()

# Store data for later tests
test_data = {
    "agent_id": None,
    "agent_name": None,
    "customer_id": None,
    "customer_name": None,
    "pos_id": None,
    "pos_name": None,
    "product_id": None,
    "product_name": None,
    "product_barcode": None,
    "product_price": None,
    "order_id": None
}

def test_api_call(
    test_name: str,
    method: str,
    endpoint: str,
    expected_status: int = 200,
    data: Optional[Dict[str, Any]] = None,
    params: Optional[Dict[str, Any]] = None,
    validate_func: Optional[callable] = None
) -> Optional[Dict[str, Any]]:
    """Generic API test function"""
    try:
        url = f"{BASE_URL}{endpoint}"
        
        if method == "GET":
            response = requests.get(url, params=params, timeout=10)
        elif method == "POST":
            response = requests.post(url, json=data, timeout=10)
        else:
            raise ValueError(f"Unsupported method: {method}")
        
        # Check status code
        if response.status_code != expected_status:
            result.add_fail(
                test_name,
                f"Expected status {expected_status}, got {response.status_code}. Response: {response.text[:200]}"
            )
            return None
        
        # Parse JSON response
        try:
            response_data = response.json()
        except json.JSONDecodeError:
            result.add_fail(test_name, f"Invalid JSON response: {response.text[:200]}")
            return None
        
        # Run custom validation if provided
        if validate_func:
            validation_error = validate_func(response_data)
            if validation_error:
                result.add_fail(test_name, validation_error)
                return None
        
        result.add_pass(test_name)
        return response_data
        
    except requests.exceptions.RequestException as e:
        result.add_fail(test_name, f"Request failed: {str(e)}")
        return None
    except Exception as e:
        result.add_fail(test_name, f"Unexpected error: {str(e)}")
        return None

def validate_list_length(expected_length: int):
    """Validator factory for list length"""
    def validator(data):
        if not isinstance(data, list):
            return f"Expected list, got {type(data)}"
        if len(data) != expected_length:
            return f"Expected {expected_length} items, got {len(data)}"
        return None
    return validator

def validate_has_keys(required_keys: list):
    """Validator factory for required keys"""
    def validator(data):
        if not isinstance(data, dict):
            return f"Expected dict, got {type(data)}"
        missing_keys = [key for key in required_keys if key not in data]
        if missing_keys:
            return f"Missing required keys: {missing_keys}"
        return None
    return validator

def validate_success_response(data):
    """Validate success response with agent object"""
    if not isinstance(data, dict):
        return f"Expected dict, got {type(data)}"
    if "success" not in data or not data["success"]:
        return "Expected success=True"
    if "agent" not in data:
        return "Missing 'agent' key in response"
    return None

print(f"\n{Colors.BOLD}{Colors.BLUE}{'='*60}{Colors.END}")
print(f"{Colors.BOLD}{Colors.BLUE}Sales Order App - Backend API Tests{Colors.END}")
print(f"{Colors.BOLD}{Colors.BLUE}{'='*60}{Colors.END}\n")
print(f"Base URL: {BASE_URL}\n")

# ==================== Test 1: Seed Data ====================
print(f"{Colors.BOLD}1. Testing Data Seeding{Colors.END}")
seed_response = test_api_call(
    "POST /api/seed-data",
    "POST",
    "/seed-data",
    validate_func=validate_has_keys(["message"])
)

# ==================== Test 2: Agent APIs ====================
print(f"\n{Colors.BOLD}2. Testing Agent APIs{Colors.END}")

# Get all agents
agents_response = test_api_call(
    "GET /api/agents (should return 3 agents)",
    "GET",
    "/agents",
    validate_func=validate_list_length(3)
)

if agents_response and len(agents_response) > 0:
    test_data["agent_id"] = agents_response[0].get("id")
    test_data["agent_name"] = agents_response[0].get("name")
    print(f"  {Colors.BLUE}→ Stored agent_id: {test_data['agent_id']}{Colors.END}")

# Agent login
login_response = test_api_call(
    "POST /api/agents/login (John Doe)",
    "POST",
    "/agents/login",
    data={"name": "John Doe", "password": "password123"},
    validate_func=validate_success_response
)

# Test invalid login
test_api_call(
    "POST /api/agents/login (invalid credentials - should fail)",
    "POST",
    "/agents/login",
    expected_status=401,
    data={"name": "Invalid User", "password": "wrongpassword"}
)

# ==================== Test 3: Customer APIs ====================
print(f"\n{Colors.BOLD}3. Testing Customer APIs{Colors.END}")

# Get all customers
customers_response = test_api_call(
    "GET /api/customers (should return 4 customers)",
    "GET",
    "/customers",
    validate_func=validate_list_length(4)
)

if customers_response and len(customers_response) > 0:
    test_data["customer_id"] = customers_response[0].get("id")
    test_data["customer_name"] = customers_response[0].get("name")
    print(f"  {Colors.BLUE}→ Stored customer_id: {test_data['customer_id']}{Colors.END}")
    
    # Get single customer
    test_api_call(
        f"GET /api/customers/{test_data['customer_id']}",
        "GET",
        f"/customers/{test_data['customer_id']}",
        validate_func=validate_has_keys(["id", "name"])
    )

# ==================== Test 4: Points of Sale APIs ====================
print(f"\n{Colors.BOLD}4. Testing Points of Sale APIs{Colors.END}")

# Get all points of sale
pos_response = test_api_call(
    "GET /api/points-of-sale (should return 5 locations)",
    "GET",
    "/points-of-sale",
    validate_func=validate_list_length(5)
)

if pos_response and len(pos_response) > 0:
    test_data["pos_id"] = pos_response[0].get("id")
    test_data["pos_name"] = pos_response[0].get("name")
    print(f"  {Colors.BLUE}→ Stored pos_id: {test_data['pos_id']}{Colors.END}")

# Get points of sale filtered by customer
if test_data["customer_id"]:
    filtered_pos = test_api_call(
        f"GET /api/points-of-sale?customer_id={test_data['customer_id']}",
        "GET",
        "/points-of-sale",
        params={"customer_id": test_data["customer_id"]},
        validate_func=lambda data: None if isinstance(data, list) and len(data) >= 1 else "Expected at least 1 POS for customer"
    )

# ==================== Test 5: Product APIs ====================
print(f"\n{Colors.BOLD}5. Testing Product APIs{Colors.END}")

# Get all products
products_response = test_api_call(
    "GET /api/products (should return 10 products)",
    "GET",
    "/products",
    validate_func=validate_list_length(10)
)

if products_response and len(products_response) > 0:
    test_data["product_id"] = products_response[0].get("id")
    test_data["product_name"] = products_response[0].get("name")
    test_data["product_barcode"] = products_response[0].get("barcode")
    test_data["product_price"] = products_response[0].get("price")
    print(f"  {Colors.BLUE}→ Stored product_id: {test_data['product_id']}{Colors.END}")

# Search products
search_response = test_api_call(
    "GET /api/products?search=cola",
    "GET",
    "/products",
    params={"search": "cola"},
    validate_func=lambda data: None if isinstance(data, list) and len(data) >= 1 else "Expected at least 1 product matching 'cola'"
)

# Get product by barcode (Coca Cola)
test_api_call(
    "GET /api/products/barcode/5449000000996 (Coca Cola)",
    "GET",
    "/products/barcode/5449000000996",
    validate_func=validate_has_keys(["id", "name", "barcode", "price"])
)

# Get product by invalid barcode (should return 404)
test_api_call(
    "GET /api/products/barcode/invalid-barcode (should return 404)",
    "GET",
    "/products/barcode/invalid-barcode",
    expected_status=404
)

# ==================== Test 6: Order APIs ====================
print(f"\n{Colors.BOLD}6. Testing Order APIs{Colors.END}")

# Create order
if all([test_data["agent_id"], test_data["customer_id"], test_data["pos_id"], test_data["product_id"]]):
    order_data = {
        "agent_id": test_data["agent_id"],
        "agent_name": test_data["agent_name"] or "John Doe",
        "customer_id": test_data["customer_id"],
        "customer_name": test_data["customer_name"] or "ABC Store",
        "pos_id": test_data["pos_id"],
        "pos_name": test_data["pos_name"] or "ABC Store - Downtown",
        "products": [
            {
                "product_id": test_data["product_id"],
                "product_name": test_data["product_name"] or "Coca Cola 330ml",
                "barcode": test_data["product_barcode"] or "5449000000996",
                "quantity": 10,
                "price": test_data["product_price"] or 1.50,
                "total": 15.00
            }
        ],
        "delivery_date": "2026-06-01T00:00:00Z",
        "total_amount": 15.00
    }
    
    order_response = test_api_call(
        "POST /api/orders (create new order)",
        "POST",
        "/orders",
        data=order_data,
        validate_func=validate_has_keys(["id", "agent_id", "customer_id", "products", "total_amount"])
    )
    
    if order_response:
        test_data["order_id"] = order_response.get("id")
        print(f"  {Colors.BLUE}→ Stored order_id: {test_data['order_id']}{Colors.END}")
else:
    result.add_fail("POST /api/orders", "Missing required test data (agent_id, customer_id, pos_id, or product_id)")

# Get all orders
orders_response = test_api_call(
    "GET /api/orders (get all orders)",
    "GET",
    "/orders",
    validate_func=lambda data: None if isinstance(data, list) and len(data) >= 1 else "Expected at least 1 order"
)

# Get orders filtered by agent
if test_data["agent_id"]:
    test_api_call(
        f"GET /api/orders?agent_id={test_data['agent_id']}",
        "GET",
        "/orders",
        params={"agent_id": test_data["agent_id"]},
        validate_func=lambda data: None if isinstance(data, list) and len(data) >= 1 else "Expected at least 1 order for agent"
    )

# Get single order
if test_data["order_id"]:
    test_api_call(
        f"GET /api/orders/{test_data['order_id']}",
        "GET",
        f"/orders/{test_data['order_id']}",
        validate_func=validate_has_keys(["id", "agent_id", "customer_id", "products", "total_amount"])
    )

# ==================== Print Summary ====================
success = result.print_summary()

# Exit with appropriate code
sys.exit(0 if success else 1)
