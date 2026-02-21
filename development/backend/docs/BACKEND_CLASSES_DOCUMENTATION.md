# SeatsLabs Backend - Complete Class Documentation

> **Document Version:** 1.0  
> **Last Updated:** February 14, 2026  
> **Purpose:** Complete documentation of all backend classes, methods, and attributes

---

## Table of Contents

1. [Controllers](#controllers)
2. [Middleware](#middleware)
3. [Configuration](#configuration)
4. [Access Modifiers Legend](#access-modifiers-legend)

---

## Access Modifiers Legend

Since JavaScript doesn't have traditional access modifiers like Java/C++, we use the following conventions:

| Symbol         | Meaning      | Description                                                |
| -------------- | ------------ | ---------------------------------------------------------- |
| **🟢 public**  | Exported     | Function is exported from module and accessible externally |
| **🔴 private** | Not exported | Helper function used only within the module                |
| **📦 module**  | Module-level | Variable/constant shared across the module                 |

---

## Controllers

### 1. **authController.js**

**Purpose:** Handles user authentication (registration and login)

**Module Dependencies:**

- 📦 `pool` - Database connection pool (from `../config/database`)
- 📦 `bcrypt` - Password hashing library
- 📦 `jwt` - JSON Web Token for authentication

#### Methods (authController)

##### 🟢 `register(req, res)`

- **Access:** public (exported)
- **HTTP Method:** POST
- **Route:** `/api/auth/register`
- **Parameters:**
  - `req.body.userEmail` | `req.body.email` - User's email address
  - `req.body.userPassword` | `req.body.password` - Plain text password
  - `req.body.userRole` | `req.body.role` - User role (customer/advertiser/technician/manager)
  - `req.body.firstName` - First name
  - `req.body.lastName` - Last name
  - `req.body.phone` - Phone number
  - `req.body.address` - Address
  - `req.body.businessName` - Business name (for advertiser)
  - `req.body.contactPerson` - Contact person (for advertiser)
- **Returns:** `{ success: boolean, data: { userId, userEmail, userRole, token } }`
- **Description:** Creates a new user account with role-specific profile (customer, advertiser, technician, manager). Hashes password, creates user record, creates role-specific record, and returns JWT token.

##### 🟢 `login(req, res)`

- **Access:** public (exported)
- **HTTP Method:** POST
- **Route:** `/api/auth/login`
- **Parameters:**
  - `req.body.userEmail` - User's email
  - `req.body.userPassword` - Plain text password
- **Returns:** `{ success: boolean, data: { userId, userEmail, userRole, token } }`
- **Description:** Authenticates user credentials, verifies password hash, and returns JWT token for session management.

---

### 2. **customerController.js**

**Purpose:** Customer profile and vehicle management

**Module Dependencies:**

- 📦 `pool` - Database connection pool

#### Methods (customerController)

##### 🟢 `viewCustomer(req, res)`

- **Access:** public (exported)
- **HTTP Method:** GET
- **Route:** `/api/customers/:customerId`
- **Parameters:**
  - `req.params.customerId` - Customer ID
- **Returns:** `{ success: boolean, data: { customer profile + vehicles[] } }`
- **Description:** Retrieves customer profile with email and all associated vehicles.

##### 🟢 `viewAllCustomers(req, res)`

- **Access:** public (exported)
- **HTTP Method:** GET
- **Route:** `/api/customers`
- **Authorization:** Admin only
- **Returns:** `{ success: boolean, data: [...customers], meta: { total } }`
- **Description:** Lists all active customers with booking count. Includes user email and status.

##### 🟢 `updateCustomer(req, res)`

- **Access:** public (exported)
- **HTTP Method:** PUT
- **Route:** `/api/customers/:customerId`
- **Parameters:**
  - `req.params.customerId` - Customer ID
  - `req.body.customerFirstName` - First name (optional)
  - `req.body.customerLastName` - Last name (optional)
  - `req.body.customerPhone` - Phone (optional)
  - `req.body.customerAddress` - Address (optional)
- **Returns:** `{ success: boolean, data: { updated customer } }`
- **Description:** Updates customer profile information. Uses COALESCE for partial updates.

##### 🟢 `deleteCustomer(req, res)`

- **Access:** public (exported)
- **HTTP Method:** DELETE
- **Route:** `/api/customers/:customerId`
- **Parameters:**
  - `req.params.customerId` - Customer ID
- **Returns:** `{ success: boolean, data: { message } }`
- **Description:** Soft deletes customer by deactivating user account (sets userIsActive = false).

---

### 3. **advertiserController.js**

> **Note:** This controller follows the same pattern as customerController but for advertiser management. Methods: viewAdvertiser, viewAllAdvertisers, updateAdvertiser, deleteAdvertiser.

---

### 4. **technicianController.js**

**Purpose:** Workshop technician management

**Module Dependencies:**

- 📦 `pool` - Database connection pool
- 📦 `bcrypt` - Password hashing

#### Methods (technicianController)

##### 🟢 `addTechnician(req, res)`

- **Access:** public (exported)
- **HTTP Method:** POST
- **Route:** `/api/technicians`
- **Authorization:** Admin only
- **Parameters:**
  - `req.body.technicianFirstName` - First name (required)
  - `req.body.technicianLastName` - Last name (required)
  - `req.body.technicianPhone` - Phone number
  - `req.body.technicianSpecialization` - Specialization
  - `req.body.userEmail` - Login email (required)
  - `req.body.userPassword` - Login password (required)
- **Returns:** `{ success: boolean, data: { technician + userEmail } }`
- **Description:** Creates user record with role 'technician', then creates technician profile record. Two-step inheritance pattern implementation.

##### 🟢 `viewTechnician(req, res)`

- **Access:** public (exported)
- **HTTP Method:** GET
- **Route:** `/api/technicians/:technicianId`
- **Parameters:**
  - `req.params.technicianId` - Technician ID
- **Returns:** `{ success: boolean, data: { technician + userEmail } }`
- **Description:** Retrieves single technician with login email.

##### 🟢 `viewAllTechnicians(req, res)`

- **Access:** public (exported)
- **HTTP Method:** GET
- **Route:** `/api/technicians`
- **Returns:** `{ success: boolean, data: [...technicians], meta: { total } }`
- **Description:** Lists all active technicians.

##### 🟢 `updateTechnician(req, res)`

- **Access:** public (exported)
- **HTTP Method:** PUT
- **Route:** `/api/technicians/:technicianId`
- **Parameters:**
  - `req.params.technicianId` - Technician ID
  - `req.body.technicianFirstName` - First name (optional)
  - `req.body.technicianLastName` - Last name (optional)
  - `req.body.technicianPhone` - Phone (optional)
  - `req.body.technicianSpecialization` - Specialization (optional)
- **Returns:** `{ success: boolean, data: { updated technician } }`
- **Description:** Updates technician profile information.

##### 🟢 `deleteTechnician(req, res)`

- **Access:** public (exported)
- **HTTP Method:** DELETE
- **Route:** `/api/technicians/:technicianId`
- **Parameters:**
  - `req.params.technicianId` - Technician ID
- **Returns:** `{ success: boolean, data: { message } }`
- **Description:** Soft deletes technician by deactivating user account.

---

### 5. **paymentController.js**

**Purpose:** Financial transactions and invoice management

**Module Dependencies:**

- 📦 `pool` - Database connection pool

#### Methods (paymentController)

##### 🟢 `createPayment(req, res)`

- **Access:** public (exported)
- **HTTP Method:** POST
- **Route:** `/api/payments`
- **Parameters:**
  - `req.body.invoiceId` - Invoice ID (required)
  - `req.body.paymentAmount` - Amount (required)
  - `req.body.paymentMethod` - 'bank_transfer', 'credit_card', 'cash' (required)
  - `req.body.paymentReference` - External reference (optional)
  - `req.body.paymentSlipUrl` - URL of receipt photo (Bank Transfer only)
  - `req.body.paymentCardBrand` - e.g., 'Visa', 'MasterCard' (Credit Card only)
  - `req.body.paymentCardLastFour` - Last 4 digits (Credit Card only)
- **Returns:** `{ success: boolean, data: { payment } }`
- **Description:** Records a payment and automatically updates target status (e.g., activates Ads or marks Booking as accepted).

##### 🟢 `getInvoiceByBookingId(req, res)`

- **Access:** public (exported)
- **HTTP Method:** GET
- **Route:** `/api/payments/invoice/booking/:bookingId`
- **Returns:** `{ success: boolean, data: { invoice + details } }`
- **Description:** Retrieves billing information for a specific booking.

##### 🟢 `getAllPayment(req, res)`

- **Access:** public (exported)
- **HTTP Method:** GET
- **Route:** `/api/payments`
- **Authorization:** Manager only
- **Returns:** `{ success: boolean, data: [...payments] }`
- **Description:** Lists all system payments with associated customer/business names.

---

### 6. **userController.js**

**Purpose:** General user management (admin operations)

**Module Dependencies:**

- 📦 `pool` - Database connection pool
- 📦 `bcrypt` - Password hashing

#### Methods (userController)

##### 🟢 `getAllUsers(req, res)`

- **Access:** public (exported)
- **HTTP Method:** GET
- **Route:** `/api/users`
- **Authorization:** Admin/Manager
- **Returns:** `{ success: boolean, data: [...users] }`
- **Description:** Lists all users across all roles.

##### 🟢 `createUser(req, res)`

- **Access:** public (exported)
- **HTTP Method:** POST
- **Route:** `/api/users`
- **Authorization:** Admin/Manager
- **Parameters:**
  - `req.body.email` - Email (required)
  - `req.body.password` - Password (required)
  - `req.body.role` - Role (required)
  - Additional role-specific fields
- **Returns:** `{ success: boolean, data: { user } }`
- **Description:** Creates user with any role. Similar to register but admin-controlled.

##### 🟢 `updateUser(req, res)`

- **Access:** public (exported)
- **HTTP Method:** PUT
- **Route:** `/api/users/:userId`
- **Parameters:**
  - `req.params.userId` - User ID
  - Various user fields (optional)
- **Returns:** `{ success: boolean, data: { user } }`
- **Description:** Updates user information.

##### 🟢 `deleteUser(req, res)`

- **Access:** public (exported)
- **HTTP Method:** DELETE
- **Route:** `/api/users/:userId`
- **Parameters:**
  - `req.params.userId` - User ID
- **Returns:** `{ success: boolean }`
- **Description:** Deletes user (hard or soft delete).

---

### 6. **serviceCategoryController.js**

**Purpose:** Service category management

**Module Dependencies:**

- 📦 `pool` - Database connection pool

#### Methods (serviceCategoryController)

##### 🟢 `getAllCategories(req, res)`

- **Access:** public (exported)
- **HTTP Method:** GET
- **Route:** `/api/service-categories`
- **Returns:** `{ success: boolean, data: [...categories] }`
- **Description:** Lists all service categories ordered alphabetically.

##### 🟢 `createCategory(req, res)`

- **Access:** public (exported)
- **HTTP Method:** POST
- **Route:** `/api/service-categories`
- **Authorization:** Admin
- **Parameters:**
  - `req.body.name` - Category name (required)
  - `req.body.description` - Description
- **Returns:** `{ success: boolean, data: { category } }`
- **Description:** Creates new service category.

##### 🟢 `updateCategory(req, res)`

- **Access:** public (exported)
- **HTTP Method:** PUT
- **Route:** `/api/service-categories/:id`
- **Parameters:**
  - `req.params.id` - Category ID
  - `req.body.name` - Name (optional)
  - `req.body.description` - Description (optional)
- **Returns:** `{ success: boolean, data: { category } }`
- **Description:** Updates category information.

##### 🟢 `deleteCategory(req, res)`

- **Access:** public (exported)
- **HTTP Method:** DELETE
- **Route:** `/api/service-categories/:id`
- **Parameters:**
  - `req.params.id` - Category ID
- **Returns:** `{ success: boolean, message }`
- **Description:** Deletes category (fails if used by services).

---

### 7. **serviceController.js**

**Purpose:** Individual service management

**Module Dependencies:**

- 📦 `pool` - Database connection pool

#### Methods (serviceController)

##### 🟢 `addService(req, res)`

- **Access:** public (exported)
- **HTTP Method:** POST
- **Route:** `/api/services`
- **Authorization:** Admin
- **Parameters:**
  - `req.body.serviceName` - Service name (required)
  - `req.body.serviceDescription` - Description
  - `req.body.serviceDuration` - Duration in minutes (required)
  - `req.body.servicePrice` - Price (required)
  - `req.body.serviceCategoryId` - Category ID
- **Returns:** `{ success: boolean, data: { service } }`
- **Description:** Creates new service. Validates uniqueness and required fields.

##### 🟢 `viewService(req, res)`

- **Access:** public (exported)
- **HTTP Method:** GET
- **Route:** `/api/services/:serviceId`
- **Parameters:**
  - `req.params.serviceId` - Service ID
- **Returns:** `{ success: boolean, data: { service } }`
- **Description:** Retrieves single service with category name.

##### 🟢 `viewAllServices(req, res)`

- **Access:** public (exported)
- **HTTP Method:** GET
- **Route:** `/api/services`
- **Returns:** `{ success: boolean, data: [...services] }`
- **Description:** Lists all active services with category information.

##### 🟢 `updateService(req, res)`

- **Access:** public (exported)
- **HTTP Method:** PUT
- **Route:** `/api/services/:serviceId`
- **Authorization:** Admin
- **Parameters:**
  - `req.params.serviceId` - Service ID
  - `req.body.serviceName` - Name (optional)
  - `req.body.serviceDescription` - Description (optional)
  - `req.body.serviceDuration` - Duration (optional)
  - `req.body.servicePrice` - Price (optional)
  - `req.body.serviceCategoryId` - Category ID (optional)
- **Returns:** `{ success: boolean, data: { service } }`
- **Description:** Updates service information.

##### 🟢 `deleteService(req, res)`

- **Access:** public (exported)
- **HTTP Method:** DELETE
- **Route:** `/api/services/:serviceId`
- **Authorization:** Admin
- **Parameters:**
  - `req.params.serviceId` - Service ID
- **Returns:** `{ success: boolean, data: { message } }`
- **Description:** Soft deletes service (sets isActive = false). Preserves booking history.

---

### 8. **servicePackageController.js**

**Purpose:** Service package/bundle management

**Module Dependencies:**

- 📦 `pool` - Database connection pool

#### Methods (servicePackageController)

##### 🟢 `getAllPackages(req, res)`

- **Access:** public (exported)
- **HTTP Method:** GET
- **Route:** `/api/service-packages`
- **Returns:** `{ success: boolean, data: [...packages with services] }`
- **Description:** Lists all active packages with their included services (JSON aggregation).

##### 🟢 `createPackage(req, res)`

- **Access:** public (exported)
- **HTTP Method:** POST
- **Route:** `/api/service-packages`
- **Authorization:** Admin
- **Parameters:**
  - `req.body.name` - Package name (required)
  - `req.body.description` - Description
  - `req.body.price` - Package price (required)
  - `req.body.serviceIds` - Array of service IDs to include
- **Returns:** `{ success: boolean, data: { package } }`
- **Description:** Creates package and links services. Uses transactions for data consistency.

##### 🟢 `updatePackage(req, res)`

- **Access:** public (exported)
- **HTTP Method:** PUT
- **Route:** `/api/service-packages/:id`
- **Parameters:**
  - `req.params.id` - Package ID
  - `req.body.name` - Name (optional)
  - `req.body.description` - Description (optional)
  - `req.body.price` - Price (optional)
  - `req.body.serviceIds` - New service IDs (optional, replaces all)
  - `req.body.isActive` - Active status (optional)
- **Returns:** `{ success: boolean }`
- **Description:** Updates package. If serviceIds provided, clears and re-adds all services.

##### 🟢 `deletePackage(req, res)`

- **Access:** public (exported)
- **HTTP Method:** DELETE
- **Route:** `/api/service-packages/:id`
- **Parameters:**
  - `req.params.id` - Package ID
- **Returns:** `{ success: boolean }`
- **Description:** Soft deletes package.

---

### 9. **bookingController.js**

**Purpose:** Service booking management

**Module Dependencies:**

- 📦 `pool` - Database connection pool

#### Helper Methods (bookingController)

##### 🔴 `generateRefNumber()`

- **Access:** private (not exported)
- **Parameters:** None
- **Returns:** String (e.g., "SL-20250315-4829")
- **Description:** Generates unique booking reference number using timestamp and random number.

#### Public Methods (bookingController)

##### 🟢 `addBooking(req, res)`

- **Access:** public (exported)
- **HTTP Method:** POST
- **Route:** `/api/bookings`
- **Authorization:** Customer
- **Parameters:**
  - `req.body.bookingDate` - Date (required)
  - `req.body.bookingStartTime` - Start time (required)
  - `req.body.bookingEndTime` - End time (required)
  - `req.body.bookingCustomerId` - Customer ID (required)
  - `req.body.bookingVehicleId` - Vehicle ID (required)
  - `req.body.bookingServiceId` - Service ID (mutually exclusive with packageId)
  - `req.body.bookingPackageId` - Package ID (mutually exclusive with serviceId)
  - `req.body.bookingNotes` - Notes
- **Returns:** `{ success: boolean, data: { booking } }`
- **Description:** Creates new booking, generates ref number, creates tracking record, adds history entry.

##### 🟢 `viewBooking(req, res)`

- **Access:** public (exported)
- **HTTP Method:** GET
- **Route:** `/api/bookings/:bookingId`
- **Parameters:**
  - `req.params.bookingId` - Booking ID
- **Returns:** `{ success: boolean, data: { booking with details } }`
- **Description:** Retrieves booking with customer, vehicle, service, and technician information.

##### 🟢 `viewAllBookings(req, res)`

- **Access:** public (exported)
- **HTTP Method:** GET
- **Route:** `/api/bookings`
- **Query Parameters:**
  - `status` - Filter by status (optional)
  - `date` - Filter by date (optional)
  - `customerId` - Filter by customer (optional)
  - `technicianId` - Filter by technician (optional)
- **Returns:** `{ success: boolean, data: [...bookings] }`
- **Description:** Lists bookings with optional filters. Includes full details via JOINs.

##### 🟢 `updateBooking(req, res)`

- **Access:** public (exported)
- **HTTP Method:** PUT
- **Route:** `/api/bookings/:bookingId`
- **Parameters:**
  - `req.params.bookingId` - Booking ID
  - `req.body.bookingStatus` - Status (optional)
  - `req.body.bookingTechnicianId` - Technician ID (optional)
  - `req.body.bookingNotes` - Notes (optional)
  - Other booking fields
- **Returns:** `{ success: boolean, data: { booking } }`
- **Description:** Updates booking status, technician assignment, etc. Creates tracking and history records.

##### 🟢 `deleteBooking(req, res)`

- **Access:** public (exported)
- **HTTP Method:** DELETE
- **Route:** `/api/bookings/:bookingId`
- **Parameters:**
  - `req.params.bookingId` - Booking ID
- **Returns:** `{ success: boolean }`
- **Description:** Cancels booking (sets status to 'cancelled'). Preserves history.

---

### 10. **feedbackController.js**

**Purpose:** Customer feedback and ratings

**Module Dependencies:**

- 📦 `pool` - Database connection pool

#### Methods (feedbackController)

##### 🟢 `addFeedback(req, res)`

- **Access:** public (exported)
- **HTTP Method:** POST
- **Route:** `/api/feedbacks`
- **Authorization:** Customer
- **Parameters:**
  - `req.body.feedbackRating` - Rating 1-5 (required)
  - `req.body.feedbackComment` - Comment text
  - `req.body.feedbackCustomerId` - Customer ID (required)
  - `req.body.feedbackBookingId` - Booking ID (required, must be completed)
  - `req.body.feedbackTechnicianId` - Technician ID
- **Returns:** `{ success: boolean, data: { feedback } }`
- **Description:** Adds feedback for completed booking. Validates booking status and uniqueness.

##### 🟢 `viewFeedback(req, res)`

- **Access:** public (exported)
- **HTTP Method:** GET
- **Route:** `/api/feedbacks/:feedbackId`
- **Parameters:**
  - `req.params.feedbackId` - Feedback ID
- **Returns:** `{ success: boolean, data: { feedback } }`
- **Description:** Retrieves single feedback with customer and booking details.

##### 🟢 `viewAllFeedbacks(req, res)`

- **Access:** public (exported)
- **HTTP Method:** GET
- **Route:** `/api/feedbacks`
- **Query Parameters:**
  - `customerId` - Filter by customer
  - `technicianId` - Filter by technician
- **Returns:** `{ success: boolean, data: [...feedbacks] }`
- **Description:** Lists feedbacks with optional filters.

##### 🟢 `updateFeedback(req, res)`

- **Access:** public (exported)
- **HTTP Method:** PUT
- **Route:** `/api/feedbacks/:feedbackId`
- **Parameters:**
  - `req.params.feedbackId` - Feedback ID
  - `req.body.feedbackRating` - Rating (optional)
  - `req.body.feedbackComment` - Comment (optional)
- **Returns:** `{ success: boolean, data: { feedback } }`
- **Description:** Updates existing feedback.

##### 🟢 `deleteFeedback(req, res)`

- **Access:** public (exported)
- **HTTP Method:** DELETE
- **Route:** `/api/feedbacks/:feedbackId`
- **Parameters:**
  - `req.params.feedbackId` - Feedback ID
- **Returns:** `{ success: boolean }`
- **Description:** Deletes feedback permanently.

---

### 11. **advertisementController.js**

**Purpose:** Advertisement management

**Module Dependencies:**

- 📦 `pool` - Database connection pool

#### Methods (advertisementController)

##### 🟢 `addAdvertisement(req, res)`

- **Access:** public (exported)
- **HTTP Method:** POST
- **Route:** `/api/advertisements`
- **Authorization:** Advertiser, Admin
- **Parameters:**
  - `req.body.advertisementTitle` - Ad title (required)
  - `req.body.advertisementImageUrl` - Image URL
  - `req.body.advertisementStartDate` - Start date (required)
  - `req.body.advertisementEndDate` - End date (required)
  - `req.body.advertisementAdvertiserId` - Advertiser ID (required)
  - `req.body.advertisementPlacementId` - Placement ID
- **Returns:** `{ success: boolean, data: { ad } }`
- **Description:** Creates ad with 'pending' status. Validates date range.

##### 🟢 `viewAdvertisement(req, res)`

- **Access:** public (exported)
- **HTTP Method:** GET
- **Route:** `/api/advertisements/:advertisementId`
- **Parameters:**
  - `req.params.advertisementId` - Ad ID
- **Returns:** `{ success: boolean, data: { ad } }`
- **Description:** Retrieves single ad with placement details.

##### 🟢 `viewAllAdvertisements(req, res)`

- **Access:** public (exported)
- **HTTP Method:** GET
- **Route:** `/api/advertisements`
- **Query Parameters:**
  - `status` - Filter by status
  - `advertiserId` - Filter by advertiser
- **Returns:** `{ success: boolean, data: [...ads] }`
- **Description:** Lists ads with optional filters.

##### 🟢 `updateAdvertisement(req, res)`

- **Access:** public (exported)
- **HTTP Method:** PUT
- **Route:** `/api/advertisements/:advertisementId`
- **Parameters:**
  - `req.params.advertisementId` - Ad ID
  - Various ad fields (optional)
- **Returns:** `{ success: boolean, data: { ad } }`
- **Description:** Updates ad details and status.

##### 🟢 `deleteAdvertisement(req, res)`

- **Access:** public (exported)
- **HTTP Method:** DELETE
- **Route:** `/api/advertisements/:advertisementId`
- **Parameters:**
  - `req.params.advertisementId` - Ad ID
- **Returns:** `{ success: boolean }`
- **Description:** Deletes ad permanently.

##### 🟢 `viewAdvertisementPlacements(req, res)`

- **Access:** public (exported)
- **HTTP Method:** GET
- **Route:** `/api/advertisements/placements`
- **Returns:** `{ success: boolean, data: [...placements] }`
- **Description:** Lists all available ad placements (admin-managed).

---

### 12. **campaignController.js**

**Purpose:** Advertisement campaign management

**Module Dependencies:**

- 📦 `pool` - Database connection pool

#### Methods (campaignController)

##### 🟢 `createCampaign(req, res)`

- **Access:** public (exported)
- **HTTP Method:** POST
- **Route:** `/api/campaigns`
- **Authorization:** Advertiser, Admin
- **Parameters:**
  - `req.body.campaignName` - Campaign name (required)
  - `req.body.campaignBudget` - Budget
  - `req.body.campaignStartDate` - Start date (required)
  - `req.body.campaignEndDate` - End date (required)
  - `req.body.campaignAdvertiserId` - Advertiser ID (required)
- **Returns:** `{ success: boolean, data: { campaign } }`
- **Description:** Creates new campaign with 'pending' status.

##### 🟢 `getAllCampaigns(req, res)`

- **Access:** public (exported)
- **HTTP Method:** GET
- **Route:** `/api/campaigns`
- **Query Parameters:**
  - `status` - Filter by status
  - `advertiserId` - Filter by advertiser
- **Returns:** `{ success: boolean, data: [...campaigns] }`
- **Description:** Lists campaigns with optional filters.

##### 🟢 `getCampaignById(req, res)`

- **Access:** public (exported)
- **HTTP Method:** GET
- **Route:** `/api/campaigns/:campaignId`
- **Parameters:**
  - `req.params.campaignId` - Campaign ID
- **Returns:** `{ success: boolean, data: { campaign + ads[] } }`
- **Description:** Retrieves campaign with all associated ads.

##### 🟢 `updateCampaign(req, res)`

- **Access:** public (exported)
- **HTTP Method:** PUT
- **Route:** `/api/campaigns/:campaignId`
- **Parameters:**
  - `req.params.campaignId` - Campaign ID
  - Various campaign fields (optional)
- **Returns:** `{ success: boolean, data: { campaign } }`
- **Description:** Updates campaign information.

##### 🟢 `deleteCampaign(req, res)`

- **Access:** public (exported)
- **HTTP Method:** DELETE
- **Route:** `/api/campaigns/:campaignId`
- **Parameters:**
  - `req.params.campaignId` - Campaign ID
- **Returns:** `{ success: boolean }`
- **Description:** Deletes campaign (cascades to ads if configured).

##### 🟢 `addAdToCampaign(req, res)`

- **Access:** public (exported)
- **HTTP Method:** POST
- **Route:** `/api/campaigns/:campaignId/ads`
- **Parameters:**
  - `req.params.campaignId` - Campaign ID
  - `req.body.advertisementTitle` - Ad title (required)
  - `req.body.advertisementImageUrl` - Image URL
  - `req.body.advertisementStartDate` - Start date (required)
  - `req.body.advertisementEndDate` - End date (required)
  - `req.body.advertisementPlacementId` - Placement ID
- **Returns:** `{ success: boolean, data: { ad } }`
- **Description:** Creates ad and associates it with campaign.

---

### 13. **reportController.js**

**Purpose:** Business intelligence and analytics reports

**Module Dependencies:**

- 📦 `pool` - Database connection pool

#### Methods (reportController)

##### 🟢 `generateDailyBookingReport(req, res)`

- **Access:** public (exported)
- **HTTP Method:** GET
- **Route:** `/api/reports/dailyBooking`
- **Authorization:** Admin, Manager
- **Query Parameters:**
  - `date` - Report date (required, format: YYYY-MM-DD)
- **Returns:** `{ success: boolean, data: { reportPeriod, summary, bookings[] } }`
- **Description:** Generates daily booking summary with status breakdown and detailed booking list.

##### 🟢 `generateRevenueReport(req, res)`

- **Access:** public (exported)
- **HTTP Method:** GET
- **Route:** `/api/reports/revenueAnalysis`
- **Authorization:** Admin, Manager
- **Query Parameters:**
  - `startDate` - Start date (required)
  - `endDate` - End date (required)
- **Returns:** `{ success: boolean, data: { reportPeriod, summary, serviceRevenue, adRevenue } }`
- **Description:** Analyzes revenue from services and advertisements over date range.

##### 🟢 `generateTechnicianPerformanceReport(req, res)`

- **Access:** public (exported)
- **HTTP Method:** GET
- **Route:** `/api/reports/technicianPerformance`
- **Authorization:** Admin, Manager
- **Query Parameters:**
  - `startDate` - Start date (required)
  - `endDate` - End date (required)
- **Returns:** `{ success: boolean, data: { reportPeriod, technicians[] } }`
- **Description:** Shows technician workload, completion rate, and average rating.

##### 🟢 `generateAdPerformanceReport(req, res)`

- **Access:** public (exported)
- **HTTP Method:** GET
- **Route:** `/api/reports/adPerformance`
- **Authorization:** Admin, Manager
- **Query Parameters:**
  - `startDate` - Start date (required)
  - `endDate` - End date (required)
- **Returns:** `{ success: boolean, data: { reportPeriod, summary, byPlacement[], topAds[] } }`
- **Description:** Analyzes ad impressions and clicks by placement and individual ads.

---

### 14. **trackingController.js**

**Purpose:** Handles tracking of service progress

**Module Dependencies:**

- 📦 `pool` - Database connection pool

#### Methods (trackingController)

##### 🟢 `getServiceTracking(req, res)`

- **Access:** public (exported)
- **HTTP Method:** GET
- **Route:** `/api/tracking`
- **Returns:** `{ success: boolean, data: [...tracks] }`
- **Description:** Retrieves all active service tracking records for manager oversight.

##### 🟢 `getHistory(req, res)`

- **Access:** public (exported)
- **HTTP Method:** GET
- **Route:** `/api/tracking/history/:bookingId`
- **Parameters:**
  - `req.params.bookingId` - Booking ID
- **Returns:** `{ success: boolean, data: [...history] }`
- **Description:** Retrieves full tracking event history for a specific booking.

##### 🟢 `updateStatus(req, res)`

- **Access:** public (exported)
- **HTTP Method:** POST
- **Route:** `/api/tracking/update`
- **Parameters:**
  - `req.body.bookingId` - Booking ID (required)
  - `req.body.status` - 'started', 'in_progress', 'completed' (required)
- **Returns:** `{ success: boolean, message }`
- **Description:** Adds a new tracking record and automatically synchronizes the associated booking's status.

---

## Middleware

### **authMiddleware.js**

**Purpose:** JWT authentication and role-based authorization

**Module Dependencies:**

- 📦 `jwt` - JSON Web Token library
- 📦 `dotenv` - Environment variable configuration

#### Methods (authMiddleware)

##### 🟢 `authMiddleware(req, res, next)`

- **Access:** public (exported)
- **Type:** Express middleware
- **Parameters:**
  - `req` - Express request object
  - `req.headers.authorization` - Bearer token (required)
  - `res` - Express response object
  - `next` - Express next function
- **Side Effects:** Sets `req.user = { userId, userEmail, userRole }`
- **Description:** Validates JWT token from Authorization header, verifies signature, and attaches decoded user data to request. Calls next() if valid, returns 401 if invalid.

##### 🟢 `authorizeRole(...allowedRoles)`

- **Access:** public (exported)
- **Type:** Higher-order function returning middleware
- **Parameters:**
  - `...allowedRoles` - Array of allowed role strings (e.g., 'admin', 'manager')
- **Returns:** Middleware function
- **Description:** Creates role-checking middleware. Checks if authenticated user's role is in allowedRoles. Returns 403 if unauthorized, calls next() if authorized.

**Usage Example:**

```javascript
router.get("/admin-only", authMiddleware, authorizeRole("admin"), handler);
```

---

## Configuration

### **database.js** (config/database.js)

**Purpose:** PostgreSQL connection pool

**Module Dependencies:**

- 📦 `pg` - PostgreSQL client for Node.js
- 📦 `dotenv` - Environment variables

**Exported:**

- 📦 `pool` - PostgreSQL connection pool instance

**Configuration:**

- Uses environment variables: `DB_NAME`, `DB_HOST`, `DB_PORT`
- Connection pooling for efficient database access

---

## Summary Statistics

| Category                  | Count |
| ------------------------- | ----- |
| **Total Controllers**     | 14    |
| **Total Public Methods**  | 69    |
| **Total Private Methods** | 1     |
| **Middleware Functions**  | 2     |
| **Database Tables Used**  | 19    |

---

## Method Naming Conventions

| Pattern     | Meaning                                 | Example                           |
| ----------- | --------------------------------------- | --------------------------------- |
| `add*`      | Create new record                       | `addService`, `addBooking`        |
| `create*`   | Create new record (alternative)         | `createCategory`, `createPackage` |
| `view*`     | Retrieve single record                  | `viewService`, `viewCustomer`     |
| `viewAll*`  | Retrieve multiple records               | `viewAllServices`                 |
| `getAll*`   | Retrieve multiple records (alternative) | `getAllCategories`                |
| `update*`   | Modify existing record                  | `updateService`                   |
| `delete*`   | Remove record                           | `deleteService`                   |
| `generate*` | Create report                           | `generateDailyBookingReport`      |
| `get*`      | Retrieve records (general)              | `getServiceTracking`              |

---

**End of Documentation**
