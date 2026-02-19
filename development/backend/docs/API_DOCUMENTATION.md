# SeatsLabs API Documentation

## 🎉 API Setup Complete!

Your backend API is now fully operational with comprehensive Swagger documentation.

---

## 📍 Access Points

### **Main API Server**

- **URL:** `http://localhost:5000`
- **Status:** ✅ Running

### **Swagger API Documentation**

- **URL:** `http://localhost:5000/api-docs`
- **Features:**
  - Interactive API testing
  - Complete endpoint documentation
  - Request/response examples
  - Authentication testing with JWT tokens

---

## 🚀 Quick Start Guide

### 1. **Access Swagger Documentation**

Open your browser and navigate to:

```
http://localhost:5000/api-docs
```

### 2. **Test the API**

1. Start with **Authentication** endpoints
2. Register a new user or login
3. Copy the JWT token from the response
4. Click "Authorize" button in Swagger UI
5. Enter: `Bearer YOUR_TOKEN_HERE`
6. Now you can test all protected endpoints!

---

## 📚 API Endpoints Overview

### **Authentication** (`/api/auth`)

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### **Services** (`/api/services`)

- `POST /api/services` - Add service (Admin only)
- `GET /api/services` - Get all services
- `GET /api/services/:id` - Get service by ID
- `PUT /api/services/:id` - Update service (Admin only)
- `DELETE /api/services/:id` - Delete service (Admin only)

### **Bookings** (`/api/bookings`)

- `POST /api/bookings` - Create booking
- `GET /api/bookings` - Get all bookings (with filters)
- `GET /api/bookings/:id` - Get booking by ID
- `PUT /api/bookings/:id` - Update booking
- `DELETE /api/bookings/:id` - Cancel booking

### **Customers** (`/api/customers`)

- `GET /api/customers` - Get all customers (Admin only)
- `GET /api/customers/:id` - Get customer profile
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer (Admin only)

### **Technicians** (`/api/technicians`)

- `POST /api/technicians` - Add technician (Admin only)
- `GET /api/technicians` - Get all technicians
- `GET /api/technicians/:id` - Get technician by ID
- `PUT /api/technicians/:id` - Update technician (Admin only)
- `DELETE /api/technicians/:id` - Delete technician (Admin only)

### **Feedbacks** (`/api/feedbacks`)

- `POST /api/feedbacks` - Add feedback
- `GET /api/feedbacks` - Get all feedbacks (with filters)
- `GET /api/feedbacks/:id` - Get feedback by ID
- `PUT /api/feedbacks/:id` - Update feedback
- `DELETE /api/feedbacks/:id` - Delete feedback

### **Advertisements** (`/api/advertisements`)

- `POST /api/advertisements` - Create advertisement
- `GET /api/advertisements` - Get all advertisements (with filters)
- `GET /api/advertisements/:id` - Get advertisement by ID
- `PUT /api/advertisements/:id` - Update advertisement
- `DELETE /api/advertisements/:id` - Delete advertisement

### **Reports** (`/api/reports`)

- `GET /api/reports/dailyBooking?date=YYYY-MM-DD` - Daily booking report
- `GET /api/reports/revenueAnalysis?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD` - Revenue analysis
- `GET /api/reports/technicianPerformance?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD` - Technician performance
- `GET /api/reports/customerSatisfaction?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD` - Customer satisfaction

---

## 🔐 Authentication Flow

### **Step 1: Register a User**

```bash
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "userEmail": "john@example.com",
  "userPassword": "password123",
  "userRole": "customer",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "0771234567",
  "address": "123 Main St, Colombo"
}
```

### **Step 2: Login**

```bash
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "userEmail": "john@example.com",
  "userPassword": "password123"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "userId": 1,
    "userEmail": "john@example.com",
    "userRole": "customer",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### **Step 3: Use Token for Protected Routes**

```bash
GET http://localhost:5000/api/bookings
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 🛠️ Development Commands

### **Start Server (Development)**

```bash
npm run dev
```

- Uses nodemon for auto-restart on file changes

### **Start Server (Production)**

```bash
npm start
```

- Uses node directly

### **Stop Server**

Press `Ctrl + C` in the terminal

---

## 📁 Project Structure

```
backend/
├── config/
│   └── database.js          # PostgreSQL connection pool
├── controller/
│   ├── authController.js    # Registration & login
│   ├── serviceController.js # Service CRUD
│   ├── bookingController.js # Booking CRUD
│   ├── customerController.js # Customer CRUD
│   ├── technicianController.js # Technician CRUD
│   ├── feedbackController.js # Feedback CRUD
│   ├── advertisementController.js # Advertisement CRUD
│   └── reportController.js  # Business reports
├── middleware/
│   └── authMiddleware.js    # JWT authentication
├── routes/
│   ├── authRoutes.js        # Auth endpoints
│   ├── serviceRoutes.js     # Service endpoints
│   ├── bookingRoutes.js     # Booking endpoints
│   ├── customerRoutes.js    # Customer endpoints
│   ├── technicianRoutes.js  # Technician endpoints
│   ├── feedbackRoutes.js    # Feedback endpoints
│   ├── advertisementRoutes.js # Advertisement endpoints
│   └── reportRoutes.js      # Report endpoints
├── .env                     # Environment variables
├── server.js                # Main server file
└── package.json             # Dependencies
```

---

## 🎯 User Roles & Permissions

### **Customer**

- Register/Login
- Create bookings
- View own bookings
- Add feedback
- Update profile

### **Advertiser**

- Register/Login
- Create advertisements
- View own advertisements
- Update advertisements

### **Technician**

- Login (created by admin)
- View assigned bookings
- Update booking status

### **Admin**

- All customer permissions
- Manage services
- Manage technicians
- Approve/reject bookings
- Approve/reject advertisements
- Generate reports

---

## 🧪 Testing with Swagger

1. **Open Swagger UI:** `http://localhost:5000/api-docs`
2. **Expand any endpoint** to see details
3. **Click "Try it out"**
4. **Fill in the parameters**
5. **Click "Execute"**
6. **View the response**

### **For Protected Endpoints:**

1. First, login via `/api/auth/login`
2. Copy the `token` from response
3. Click **"Authorize"** button (🔒 icon at top)
4. Enter: `Bearer YOUR_TOKEN`
5. Click "Authorize"
6. Now all requests will include the token!

---

## 📊 Example API Calls

### **Create a Booking**

```json
POST /api/bookings
Authorization: Bearer YOUR_TOKEN

{
  "bookingDate": "2025-03-15",
  "bookingStartTime": "09:00",
  "bookingNotes": "Please check brakes",
  "bookingCustomerId": 1,
  "bookingVehicleId": 1,
  "bookingServiceId": 1
}
```

### **Get Daily Report**

```
GET /api/reports/dailyBooking?date=2025-03-15
Authorization: Bearer YOUR_TOKEN
```

### **Add Feedback**

```json
POST /api/feedbacks
Authorization: Bearer YOUR_TOKEN

{
  "feedbackRating": 5,
  "feedbackComment": "Excellent service!",
  "feedbackCustomerId": 1,
  "feedbackBookingId": 1,
  "feedbackTechnicianId": 1
}
```

---

## ✅ What's Included

- ✅ **8 Complete API Modules** with full CRUD operations
- ✅ **JWT Authentication** with role-based access control
- ✅ **Swagger Documentation** with interactive testing
- ✅ **Comprehensive Comments** in all code files
- ✅ **Error Handling** with proper HTTP status codes
- ✅ **Input Validation** for all endpoints
- ✅ **Database Connection** with PostgreSQL
- ✅ **CORS Configuration** for frontend integration
- ✅ **Environment Variables** for configuration
- ✅ **Graceful Shutdown** handling

---

## 🔗 Integration with Frontend

Your frontend can now make API calls to:

```javascript
const API_BASE_URL = "http://localhost:5000/api";

// Example: Login
const response = await fetch(`${API_BASE_URL}/auth/login`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    userEmail: "john@example.com",
    userPassword: "password123",
  }),
});

const data = await response.json();
const token = data.data.token;

// Example: Get bookings with token
const bookingsResponse = await fetch(`${API_BASE_URL}/bookings`, {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
```

---

## 🎓 Next Steps

1. **Explore Swagger UI** at `http://localhost:5000/api-docs`
2. **Test all endpoints** using the interactive interface
3. **Integrate with your frontend** using the API endpoints
4. **Create test data** through the API
5. **Generate reports** to see the analytics features

---

## 📞 Support

If you encounter any issues:

1. Check the terminal for error messages
2. Verify database connection in `.env` file
3. Ensure PostgreSQL is running
4. Check that port 5000 is not in use

---

**🎉 Your SeatsLabs API is ready to use!**

Visit: **http://localhost:5000/api-docs** to start exploring!
