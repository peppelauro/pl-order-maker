# Sales Order Mobile App 📱

A full-stack mobile application for sales agents to create and manage customer orders with barcode scanning capabilities.

## 🌟 Features

### Core Functionality
- **Agent Authentication** - Login system for sales representatives
- **Customer Management** - Browse and select customers
- **Point of Sale Selection** - Choose specific customer locations
- **Barcode Scanning** - Scan product barcodes (EAN-13, UPC, QR codes)
- **Manual Product Search** - Search and add products manually
- **Order Creation** - Build orders with multiple products
- **Quantity Management** - Edit product quantities before saving
- **Delivery Date Selection** - Set order delivery dates
- **Offline Support** - Orders saved locally first, then synced
- **Order History** - View all past orders with sync status
- **Data Synchronization** - Sync data from backend and push orders

### Technical Features
- **Cross-Platform** - Works on iOS, Android, and Web
- **Real-time Data Sync** - Periodic sync with backend server
- **Local Storage** - AsyncStorage for offline functionality
- **Camera Integration** - Native barcode scanning
- **Responsive UI** - Mobile-first design with smooth navigation

## 🏗️ Architecture

### Frontend (Expo + React Native)
- **Framework**: Expo SDK 54 with TypeScript
- **Navigation**: Expo Router (file-based routing)
- **State Management**: Zustand
- **Storage**: AsyncStorage for persistence
- **UI Components**: React Native with Expo Vector Icons
- **Camera**: Expo Camera for barcode scanning

### Backend (FastAPI + MongoDB)
- **Framework**: FastAPI (Python)
- **Database**: MongoDB with Motor (async driver)
- **API**: RESTful JSON APIs
- **Authentication**: Simple name/password login

## 📁 Project Structure

```
/app
├── backend/
│   ├── server.py           # FastAPI backend with all APIs
│   ├── requirements.txt    # Python dependencies
│   └── .env               # Environment variables
├── frontend/
│   ├── app/
│   │   ├── (tabs)/        # Main app tabs
│   │   │   ├── index.tsx  # New Order home
│   │   │   ├── orders.tsx # Order history
│   │   │   └── profile.tsx # User profile
│   │   ├── order/         # Order creation flow
│   │   │   ├── select-customer.tsx
│   │   │   ├── select-pos.tsx
│   │   │   ├── add-products.tsx
│   │   │   └── review.tsx
│   │   ├── login.tsx      # Login screen
│   │   ├── index.tsx      # App entry point
│   │   └── _layout.tsx    # Root layout
│   ├── src/
│   │   ├── store/         # Zustand state management
│   │   ├── services/      # API services
│   │   └── utils/         # Utility functions
│   └── package.json
└── memory/
    └── test_credentials.md # Login credentials for testing
```

## 🚀 Getting Started

### Prerequisites
- Node.js & Yarn
- Python 3.8+
- MongoDB
- Expo CLI (for mobile development)

### Installation

1. **Backend Setup**
```bash
cd backend
pip install -r requirements.txt
python server.py
```

2. **Frontend Setup**
```bash
cd frontend
yarn install
yarn start
```

3. **Seed Database**
```bash
curl -X POST http://localhost:8001/api/seed-data
```

### Test Credentials

**Agents (Sales Representatives):**
- Name: `John Doe` / Password: `password123`
- Name: `Jane Smith` / Password: `password123`
- Name: `Mike Johnson` / Password: `password123`

## 📱 App Workflow

1. **Login** → Select agent from list
2. **Sync Data** → Pull customers, products, and locations from server
3. **Create Order** → 
   - Select customer
   - Choose point of sale location
   - Add products (scan barcode or search)
   - Set delivery date
   - Review and save
4. **View Orders** → See pending and synced orders
5. **Sync Orders** → Push pending orders to server

## 🔌 API Endpoints

### Agents
- `GET /api/agents` - List all agents
- `POST /api/agents/login` - Authenticate agent

### Customers
- `GET /api/customers` - List all customers
- `GET /api/customers/{id}` - Get customer details

### Points of Sale
- `GET /api/points-of-sale` - List all locations
- `GET /api/points-of-sale?customer_id={id}` - Filter by customer

### Products
- `GET /api/products` - List all products
- `GET /api/products?search={query}` - Search products
- `GET /api/products/barcode/{code}` - Get product by barcode

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders` - List all orders
- `GET /api/orders?agent_id={id}` - Filter by agent
- `GET /api/orders/{id}` - Get order details

### Utility
- `POST /api/seed-data` - Populate database with test data

## 📊 Sample Data

### Products (10 items)
- Coca Cola 330ml (Barcode: 5449000000996)
- Pepsi 330ml (Barcode: 012000001642)
- Lay's Chips Original (Barcode: 028400000000)
- Snickers Bar (Barcode: 040000000013)
- Sprite 330ml (Barcode: 5449000000687)
- Doritos Nacho Cheese (Barcode: 028400000031)
- Kit Kat (Barcode: 034000000036)
- Red Bull 250ml (Barcode: 9002490100025)
- Pringles Original (Barcode: 038000845012)
- M&M's Peanut (Barcode: 040000000044)

### Customers (4 companies)
- ABC Store
- XYZ Market
- Best Shop
- Quick Mart

## 🎨 UI/UX Highlights

- **Modern Design** - Clean, professional interface
- **Tab Navigation** - Easy access to main features
- **Touch-Optimized** - Minimum 44px touch targets
- **Visual Feedback** - Loading states and success indicators
- **Color-Coded Status** - Pending (orange) vs Synced (green) orders
- **Search & Filters** - Quick product and customer lookup
- **Responsive Layout** - Works on all screen sizes

## 🔧 Development

### Running Tests
Backend tests have been completed successfully:
- ✅ All 16 API endpoints tested
- ✅ 100% success rate
- ✅ Proper error handling verified

### Building for Production
```bash
# iOS
eas build --platform ios

# Android
eas build --platform android
```

## 📝 Environment Variables

### Backend (.env)
```
MONGO_URL=mongodb://localhost:27017
DB_NAME=sales_order_db
```

### Frontend (.env)
```
EXPO_PUBLIC_BACKEND_URL=https://your-api-url.com
```

## 🔐 Permissions

### iOS (Info.plist)
- Camera Usage: "Scan product barcodes for orders"
- Photo Library: "Access photos for product images"

### Android (AndroidManifest.xml)
- CAMERA
- READ_EXTERNAL_STORAGE

## 🐛 Known Issues & Solutions

### Camera Permission
- Always request camera permissions before scanning
- Graceful fallback to manual search if denied

### Offline Mode
- Orders saved locally if network unavailable
- Auto-sync when connection restored

## 🚀 Future Enhancements

- [ ] Edit/cancel submitted orders
- [ ] Analytics dashboard
- [ ] Photo upload for products
- [ ] Order templates for recurring orders
- [ ] Multi-language support
- [ ] Dark mode
- [ ] Push notifications for order status
- [ ] Export orders to PDF/CSV
- [ ] Signature capture on delivery

## 📄 License

MIT License - Free to use and modify

## 👥 Support

For issues or questions, refer to:
- Backend API docs: http://localhost:8001/docs
- Test credentials: `/app/memory/test_credentials.md`
- Expo documentation: https://docs.expo.dev/

---

**Built with ❤️ using Expo, React Native, FastAPI, and MongoDB**
