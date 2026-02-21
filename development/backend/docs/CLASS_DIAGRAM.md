# SeatsLabs Backend - Class Diagram

> **Visual representation of all backend controllers and their methods**  
> **Format:** Mermaid UML Class Diagram  
> **Last Updated:** February 20, 2026

---

## How to View This Diagram

This diagram uses Mermaid syntax. You can view it in:

- GitHub/GitLab (auto-renders)
- VS Code with Mermaid extension
- Online at https://mermaid.live/

---

## Complete Backend Class Diagram

```mermaid
classDiagram
    %% ============================================
    %% AUTHENTICATION & MIDDLEWARE
    %% ============================================

    class authController {
        <<Controller>>
        +register(req, res) ResponseObject
        +login(req, res) ResponseObject
    }

    class authMiddleware {
        <<Middleware>>
        +authMiddleware(req, res, next) void
        +authorizeRole(...roles) Middleware
    }

    %% ============================================
    %% USER MANAGEMENT CONTROLLERS
    %% ============================================

    class userController {
        <<Controller>>
        +getAllUsers(req, res) ResponseObject
        +createUser(req, res) ResponseObject
        +updateUser(req, res) ResponseObject
        +deleteUser(req, res) ResponseObject
    }

    class customerController {
        <<Controller>>
        +viewCustomer(req, res) ResponseObject
        +viewAllCustomers(req, res) ResponseObject
        +updateCustomer(req, res) ResponseObject
        +deleteCustomer(req, res) ResponseObject
    }

    class technicianController {
        <<Controller>>
        +addTechnician(req, res) ResponseObject
        +viewTechnician(req, res) ResponseObject
        +viewAllTechnicians(req, res) ResponseObject
        +updateTechnician(req, res) ResponseObject
        +deleteTechnician(req, res) ResponseObject
    }

    %% ============================================
    %% SERVICE MANAGEMENT CONTROLLERS
    %% ============================================

    class serviceCategoryController {
        <<Controller>>
        +getAllCategories(req, res) ResponseObject
        +createCategory(req, res) ResponseObject
        +updateCategory(req, res) ResponseObject
        +deleteCategory(req, res) ResponseObject
    }

    class serviceController {
        <<Controller>>
        +addService(req, res) ResponseObject
        +viewService(req, res) ResponseObject
        +viewAllServices(req, res) ResponseObject
        +updateService(req, res) ResponseObject
        +deleteService(req, res) ResponseObject
    }

    class servicePackageController {
        <<Controller>>
        +getAllPackages(req, res) ResponseObject
        +createPackage(req, res) ResponseObject
        +updatePackage(req, res) ResponseObject
        +deletePackage(req, res) ResponseObject
    }

    class timeSlotController {
        <<Controller>>
        +getAllTimeSlots(req, res) ResponseObject
        +createTimeSlot(req, res) ResponseObject
        +updateTimeSlot(req, res) ResponseObject
        +deleteTimeSlot(req, res) ResponseObject
    }

    %% ============================================
    %% BOOKING & TRACKING CONTROLLERS
    %% ============================================

    class bookingController {
        <<Controller>>
        -generateRefNumber() String
        +addBooking(req, res) ResponseObject
        +viewBooking(req, res) ResponseObject
        +viewAllBookings(req, res) ResponseObject
        +updateBooking(req, res) ResponseObject
        +deleteBooking(req, res) ResponseObject
    }

    class trackingController {
        <<Controller>>
        +getTrackingByBooking(req, res) ResponseObject
        +addTracking(req, res) ResponseObject
        +updateTracking(req, res) ResponseObject
    }

    class feedbackController {
        <<Controller>>
        +addFeedback(req, res) ResponseObject
        +viewFeedback(req, res) ResponseObject
        +viewAllFeedbacks(req, res) ResponseObject
        +updateFeedback(req, res) ResponseObject
        +deleteFeedback(req, res) ResponseObject
    }

    %% ============================================
    %% ADVERTISEMENT CONTROLLERS
    %% ============================================

    class advertisementController {
        <<Controller>>
        +addAdvertisement(req, res) ResponseObject
        +viewAdvertisement(req, res) ResponseObject
        +viewAllAdvertisements(req, res) ResponseObject
        +updateAdvertisement(req, res) ResponseObject
        +deleteAdvertisement(req, res) ResponseObject
        +viewAdvertisementPlacements(req, res) ResponseObject
    }

    class campaignController {
        <<Controller>>
        +createCampaign(req, res) ResponseObject
        +getAllCampaigns(req, res) ResponseObject
        +getCampaignById(req, res) ResponseObject
        +updateCampaign(req, res) ResponseObject
        +deleteCampaign(req, res) ResponseObject
        +addAdToCampaign(req, res) ResponseObject
    }

    class placementController {
        <<Controller>>
        +getAllPlacements(req, res) ResponseObject
        +createPlacement(req, res) ResponseObject
        +updatePlacement(req, res) ResponseObject
        +deletePlacement(req, res) ResponseObject
    }

    %% ============================================
    %% FINANCIAL CONTROLLERS
    %% ============================================

    class paymentController {
        <<Controller>>
        +getAllPayments(req, res) ResponseObject
        +getPaymentById(req, res) ResponseObject
        +getInvoice(req, res) ResponseObject
        +getAdInvoice(req, res) ResponseObject
        +createPayment(req, res) ResponseObject
    }

    class Payment {
        <<Entity>>
        +decimal paymentAmount
        +string paymentMethod
        +string paymentStatus
        +timestamp paymentDate
    }

    class BankTransferPayment {
        <<Entity>>
        +string paymentReference
        +string paymentSlipUrl
    }

    class CreditCardPayment {
        <<Entity>>
        +string paymentReference
        +string paymentCardBrand
        +string paymentCardLastFour
    }

    BankTransferPayment --|> Payment : inherits
    CreditCardPayment --|> Payment : inherits
    paymentController ..> Payment : manages

    class refundController {
        <<Controller>>
        +getAllRefunds(req, res) ResponseObject
        +getRefundById(req, res) ResponseObject
        +createRefund(req, res) ResponseObject
        +updateRefund(req, res) ResponseObject
    }

    %% ============================================
    %% COMMUNICATION & SUPPORT CONTROLLERS
    %% ============================================

    class complaintController {
        <<Controller>>
        +getAllComplaints(req, res) ResponseObject
        +getComplaintById(req, res) ResponseObject
        +createComplaint(req, res) ResponseObject
        +updateComplaint(req, res) ResponseObject
    }

    class settingsController {
        <<Controller>>
        +getAllSettings(req, res) ResponseObject
        +updateSetting(req, res) ResponseObject
    }

    %% ============================================
    %% REPORTING CONTROLLER
    %% ============================================

    class reportController {
        <<Controller>>
        +generateDailyBookingReport(req, res) ResponseObject
        +generateRevenueReport(req, res) ResponseObject
        +generateTechnicianPerformanceReport(req, res) ResponseObject
        +generateAdPerformanceReport(req, res) ResponseObject
    }

    %% ============================================
    %% DATABASE CONFIGURATION
    %% ============================================

    class DatabasePool {
        <<Configuration>>
        +query(sql, params) Promise~Result~
        +connect() Promise~Client~
    }

    %% ============================================
    %% RELATIONSHIPS
    %% ============================================

    %% All controllers use DatabasePool
    authController ..> DatabasePool : uses
    userController ..> DatabasePool : uses
    customerController ..> DatabasePool : uses
    technicianController ..> DatabasePool : uses
    serviceCategoryController ..> DatabasePool : uses
    serviceController ..> DatabasePool : uses
    servicePackageController ..> DatabasePool : uses
    timeSlotController ..> DatabasePool : uses
    bookingController ..> DatabasePool : uses
    trackingController ..> DatabasePool : uses
    feedbackController ..> DatabasePool : uses
    advertisementController ..> DatabasePool : uses
    campaignController ..> DatabasePool : uses
    placementController ..> DatabasePool : uses
    paymentController ..> DatabasePool : uses
    refundController ..> DatabasePool : uses
    complaintController ..> DatabasePool : uses
    settingsController ..> DatabasePool : uses
    reportController ..> DatabasePool : uses

    %% Controllers protected by middleware
    authMiddleware ..> userController : protects
    authMiddleware ..> customerController : protects
    authMiddleware ..> technicianController : protects
    authMiddleware ..> serviceCategoryController : protects
    authMiddleware ..> serviceController : protects
    authMiddleware ..> servicePackageController : protects
    authMiddleware ..> timeSlotController : protects
    authMiddleware ..> bookingController : protects
    authMiddleware ..> trackingController : protects
    authMiddleware ..> feedbackController : protects
    authMiddleware ..> advertisementController : protects
    authMiddleware ..> campaignController : protects
    authMiddleware ..> placementController : protects
    authMiddleware ..> paymentController : protects
    authMiddleware ..> refundController : protects
    authMiddleware ..> complaintController : protects
    authMiddleware ..> settingsController : protects
    authMiddleware ..> reportController : protects

    %% Business logic relationships
    serviceController ..> serviceCategoryController : uses
    servicePackageController ..> serviceController : uses
    bookingController ..> serviceController : uses
    bookingController ..> servicePackageController : uses
    bookingController ..> customerController : uses
    bookingController ..> technicianController : uses
    bookingController ..> timeSlotController : uses
    trackingController ..> bookingController : uses
    feedbackController ..> bookingController : uses
    campaignController ..> advertisementController : uses
    paymentController ..> bookingController : uses
    refundController ..> paymentController : uses
    complaintController ..> customerController : uses
    complaintController ..> bookingController : uses
    reportController ..> bookingController : uses
    reportController ..> advertisementController : uses
    reportController ..> technicianController : uses
```

---

## Simplified View: Controllers by Category

```mermaid
graph TB
    subgraph Authentication["🔐 Authentication"]
        AUTH[authController]
        AUTHMW[authMiddleware]
    end

    subgraph UserManagement["👥 User Management"]
        USER[userController]
        CUSTOMER[customerController]
        TECH[technicianController]
    end

    subgraph ServiceManagement["🔧 Service Management"]
        SCAT[serviceCategoryController]
        SERVICE[serviceController]
        PACKAGE[servicePackageController]
        TIMESLOT[timeSlotController]
    end

    subgraph BookingSystem["📅 Booking & Tracking"]
        BOOKING[bookingController]
        TRACKING[trackingController]
        FEEDBACK[feedbackController]
    end

    subgraph Advertising["📢 Advertising"]
        AD[advertisementController]
        CAMPAIGN[campaignController]
        PLACEMENT[placementController]
    end

    subgraph Financial["💰 Financial"]
        PAYMENT[paymentController]
        REFUND[refundController]
    end

    subgraph Support["📞 Support & Config"]
        COMPLAINT[complaintController]
        SETTINGS[settingsController]
    end

    subgraph Reporting["📊 Reporting"]
        REPORT[reportController]
    end

    subgraph Database["💾 Database"]
        DB[(PostgreSQL Pool)]
    end

    %% Middleware protects all
    AUTHMW -.->|protects| UserManagement
    AUTHMW -.->|protects| ServiceManagement
    AUTHMW -.->|protects| BookingSystem
    AUTHMW -.->|protects| Advertising
    AUTHMW -.->|protects| Financial
    AUTHMW -.->|protects| Support
    AUTHMW -.->|protects| Reporting

    %% All use database
    Authentication -->|uses| DB
    UserManagement -->|uses| DB
    ServiceManagement -->|uses| DB
    BookingSystem -->|uses| DB
    Advertising -->|uses| DB
    Financial -->|uses| DB
    Support -->|uses| DB
    Reporting -->|uses| DB

    %% Cross-module dependencies
    BookingSystem -->|reads| ServiceManagement
    BookingSystem -->|reads| UserManagement
    Financial -->|reads| BookingSystem
    Reporting -->|analyzes| BookingSystem
    Reporting -->|analyzes| Advertising

    style Authentication fill:#e1f5fe
    style UserManagement fill:#f3e5f5
    style ServiceManagement fill:#e8f5e9
    style BookingSystem fill:#fff3e0
    style Advertising fill:#fce4ec
    style Financial fill:#e8eaf6
    style Support fill:#fff8e1
    style Reporting fill:#f1f8e9
    style Database fill:#efebe9
```

---

## Controller Method Statistics

| Controller                    | Public Methods | Private Methods | Total  |
| :---------------------------- | :------------- | :-------------- | :----- |
| **authController**            | 2              | 0               | 2      |
| **userController**            | 4              | 0               | 4      |
| **customerController**        | 4              | 0               | 4      |
| **technicianController**      | 5              | 0               | 5      |
| **serviceCategoryController** | 4              | 0               | 4      |
| **serviceController**         | 5              | 0               | 5      |
| **servicePackageController**  | 4              | 0               | 4      |
| **timeSlotController**        | 4              | 0               | 4      |
| **bookingController**         | 5              | 1               | 6      |
| **trackingController**        | 3              | 0               | 3      |
| **feedbackController**        | 5              | 0               | 5      |
| **advertisementController**   | 6              | 0               | 6      |
| **campaignController**        | 6              | 0               | 6      |
| **placementController**       | 4              | 0               | 4      |
| **paymentController**         | 5              | 0               | 5      |
| **refundController**          | 4              | 0               | 4      |
| **complaintController**       | 4              | 0               | 4      |
| **settingsController**        | 2              | 0               | 2      |
| **reportController**          | 4              | 0               | 4      |
| **authMiddleware**            | 2              | 0               | 2      |
| **TOTAL**                     | **82**         | **1**           | **83** |

---

## Method Access Patterns

```mermaid
pie title Method Distribution by Category
    "User Management (13)" : 13
    "Service Management (17)" : 17
    "Booking & Tracking (14)" : 14
    "Advertising (16)" : 16
    "Financial (9)" : 9
    "Support & Config (6)" : 6
    "Reporting (4)" : 4
    "Authentication (4)" : 4
```

---

## Complete Database ER Diagram

```mermaid
erDiagram
    USER ||--o| CUSTOMER : "has profile"
    USER ||--o| ADVERTISER : "has profile"
    USER ||--o| TECHNICIAN : "has profile"
    USER ||--o| MANAGER : "has profile"
    USER ||--o{ NOTIFICATION : receives
    USER ||--o{ REPORT : generates

    CUSTOMER ||--o{ VEHICLE : owns
    CUSTOMER ||--o{ BOOKING : makes
    CUSTOMER ||--o{ FEEDBACK : writes
    CUSTOMER ||--o{ COMPLAINT : files
    CUSTOMER ||--o{ ENQUIRY : submits

    BOOKING }o--|| SERVICE : "books"
    BOOKING }o--o| SERVICE_PACKAGE : "or books"
    BOOKING }o--o| TECHNICIAN : "assigned to"
    BOOKING }o--|| VEHICLE : uses
    BOOKING }o--o| TIME_SLOT : "scheduled in"
    BOOKING ||--o{ SERVICE_TRACKING : tracked
    BOOKING ||--o{ BOOKING_HISTORY : has
    BOOKING ||--o| FEEDBACK : receives
    BOOKING ||--o{ COMPLAINT : "complained about"
    BOOKING ||--o{ INVOICE : billed

    SERVICE_CATEGORY ||--o{ SERVICE : contains
    SERVICE_PACKAGE ||--o{ SERVICE_PACKAGE_ITEM : contains
    SERVICE ||--o{ SERVICE_PACKAGE_ITEM : "included in"

    ADVERTISER ||--o{ ADVERTISEMENT_CAMPAIGN : creates
    ADVERTISER ||--o{ ADVERTISEMENT : creates

    ADVERTISEMENT_PLACEMENT ||--o{ ADVERTISEMENT_PRICING_PLAN : "priced by"
    ADVERTISEMENT_PLACEMENT ||--o{ ADVERTISEMENT : "placed at"
    ADVERTISEMENT_PRICING_PLAN ||--o{ ADVERTISEMENT_CAMPAIGN : "used by"
    ADVERTISEMENT_CAMPAIGN ||--o{ ADVERTISEMENT : contains
    ADVERTISEMENT ||--o{ ADVERTISEMENT_IMPRESSION : tracked
    ADVERTISEMENT ||--o{ ADVERTISEMENT_CLICK : tracked
    ADVERTISEMENT ||--o{ INVOICE : billed

    INVOICE ||--o{ PAYMENT : "paid via"
    INVOICE ||--o{ REFUND : "refunded via"

    USER {
        int userId PK
        string userEmail UK
        string userPassword
        string userRole
        boolean userIsActive
        timestamp userCreatedAt
    }

    CUSTOMER {
        int customerId PK
        string customerFirstName
        string customerLastName
        string customerPhone
        string customerAddress
        int userId FK
    }

    ADVERTISER {
        int advertiserId PK
        string advertiserBusinessName
        string advertiserContactPerson
        string advertiserContactEmail
        string advertiserContactPhone
        string advertiserAddress
        int userId FK
    }

    TECHNICIAN {
        int technicianId PK
        string technicianFirstName
        string technicianLastName
        string technicianPhone
        string technicianSpecialization
        int userId FK
    }

    MANAGER {
        int managerId PK
        string managerFirstName
        string managerLastName
        string managerPhone
        int userId FK
    }

    VEHICLE {
        int vehicleId PK
        string vehicleMake
        string vehicleModel
        int vehicleYear
        string vehicleRegNumber UK
        string vehicleColor
        string vehicleFuelType
        int customerId FK
    }

    SERVICE_CATEGORY {
        int serviceCategoryId PK
        string serviceCategoryName
        string serviceCategoryDescription
        boolean serviceCategoryIsActive
    }

    SERVICE {
        int serviceId PK
        string serviceName
        string serviceDescription
        int serviceDuration
        decimal servicePrice
        boolean serviceIsActive
        int serviceCategoryId FK
    }

    SERVICE_PACKAGE {
        int servicePackageId PK
        string servicePackageName
        string servicePackageDescription
        decimal servicePackagePrice
        boolean servicePackageIsActive
    }

    SERVICE_PACKAGE_ITEM {
        int servicePackageItemId PK
        int servicePackageId FK
        int serviceId FK
    }

    TIME_SLOT {
        int timeSlotId PK
        date timeSlotDate
        time timeSlotStartTime
        time timeSlotEndTime
        int timeSlotMaxCapacity
        boolean timeSlotIsActive
    }

    BOOKING {
        int bookingId PK
        date bookingDate
        time bookingStartTime
        time bookingEndTime
        string bookingStatus
        string bookingRefNumber UK
        string bookingCustomerNotes
        int customerId FK
        int vehicleId FK
        int serviceId FK
        int servicePackageId FK
        int technicianId FK
        int timeSlotId FK
        timestamp bookingCreatedAt
    }

    SERVICE_TRACKING {
        int serviceTrackingId PK
        string serviceTrackingStatus
        text serviceTrackingNotes
        int bookingId FK
        timestamp serviceTrackingCreatedAt
    }

    BOOKING_HISTORY {
        int bookingHistoryId PK
        string bookingHistoryAction
        int bookingId FK
        int userId FK
        timestamp bookingHistoryCreatedAt
    }

    FEEDBACK {
        int feedbackId PK
        int feedbackRating
        text feedbackComment
        int customerId FK
        int bookingId FK
        int technicianId FK
        timestamp feedbackCreatedAt
    }

    ADVERTISEMENT_PLACEMENT {
        int advertisementPlacementId PK
        string advertisementPlacementSlug UK
        string advertisementPlacementName UK
        string advertisementPlacementPage
        string advertisementPlacementPosition
        text advertisementPlacementDescription
        int advertisementPlacementWidth
        int advertisementPlacementHeight
        boolean advertisementPlacementIsFixed
    }

    ADVERTISEMENT_PRICING_PLAN {
        int advertisementPricingPlanId PK
        string advertisementPricingPlanName
        int advertisementPricingPlanDuration
        decimal advertisementPricingPlanPrice
        text advertisementPricingPlanDescription
        boolean advertisementPricingPlanIsActive
        int advertisementPlacementId FK
    }

    ADVERTISEMENT_CAMPAIGN {
        int advertisementCampaignId PK
        string advertisementCampaignName
        date advertisementCampaignStartDate
        date advertisementCampaignEndDate
        string advertisementCampaignStatus
        int advertiserId FK
        int advertisementPricingPlanId FK
    }

    ADVERTISEMENT {
        int advertisementId PK
        string advertisementTitle
        text advertisementImageUrl
        date advertisementStartDate
        date advertisementEndDate
        string advertisementStatus
        int advertiserId FK
        int advertisementPlacementId FK
        int advertisementCampaignId FK
    }

    ADVERTISEMENT_IMPRESSION {
        int advertisementImpressionId PK
        int advertisementId FK
        timestamp advertisementImpressionCreatedAt
    }

    ADVERTISEMENT_CLICK {
        int advertisementClickId PK
        int advertisementId FK
        timestamp advertisementClickCreatedAt
    }

    INVOICE {
        int invoiceId PK
        string invoiceNumber UK
        decimal invoiceAmount
        string invoiceStatus
        int bookingId FK
        int advertisementId FK
        timestamp invoiceCreatedAt
    }

    PAYMENT {
        int paymentId PK
        decimal paymentAmount
        string paymentMethod
        string paymentStatus
        timestamp paymentDate
        string paymentReference
        string paymentSlipUrl
        string paymentCardBrand
        string paymentCardLastFour
        int invoiceId FK
        timestamp paymentCreatedAt
    }

    REFUND {
        int refundId PK
        decimal refundAmount
        text refundReason
        string refundStatus
        timestamp refundDate
        int invoiceId FK
        timestamp refundCreatedAt
    }

    SYSTEM_SETTINGS {
        int settingId PK
        string settingKey UK
        text settingValue
        timestamp settingUpdatedAt
    }

    REPORT {
        int reportId PK
        string reportType
        date reportStartDate
        date reportEndDate
        jsonb reportData
        int userId FK
        timestamp reportCreatedAt
    }

    NOTIFICATION {
        int notificationId PK
        int userId FK
        string notificationTitle
        text notificationMessage
        string notificationType
        string notificationChannel
        boolean notificationIsRead
        timestamp notificationCreatedAt
    }

    COMPLAINT {
        int complaintId PK
        string complaintTitle
        text complaintDescription
        string complaintPriority
        string complaintStatus
        text complaintManagerResponse
        int customerId FK
        int bookingId FK
        timestamp complaintCreatedAt
        timestamp complaintResolvedAt
    }

    ENQUIRY {
        int enquiryId PK
        string enquiryName
        string enquiryEmail
        string enquiryPhone
        string enquirySubject
        text enquiryMessage
        string enquiryStatus
        int customerId FK
        timestamp enquiryCreatedAt
    }
```

---

## API Request Flow

```mermaid
sequenceDiagram
    participant Client
    participant AuthMW as authMiddleware
    participant AuthzMW as authorizeRole
    participant Controller
    participant DB as Database

    Client->>+AuthMW: HTTP Request + JWT Token
    AuthMW->>AuthMW: Verify JWT Token
    alt Token Valid
        AuthMW->>AuthMW: Decode & Attach User
        AuthMW->>+AuthzMW: Check Role Permission
        alt Role Authorized
            AuthzMW->>+Controller: Execute Business Logic
            Controller->>+DB: Query Database
            DB-->>-Controller: Return Data
            Controller-->>-AuthzMW: Response Data
            AuthzMW-->>-AuthMW: Pass Response
            AuthMW-->>-Client: 200 Success + Data
        else Role Unauthorized
            AuthzMW-->>Client: 403 Forbidden
        end
    else Token Invalid
        AuthMW-->>-Client: 401 Unauthorized
    end
```

---

**End of Class Diagram Documentation**
