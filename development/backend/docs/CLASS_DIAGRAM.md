# SeatsLabs Backend - Class Diagram

> **Visual representation of all backend controllers and their methods**  
> **Format:** Mermaid UML Class Diagram  
> **Last Updated:** February 14, 2026

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
    
    %% ============================================
    %% BOOKING & FEEDBACK CONTROLLERS
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
    bookingController ..> DatabasePool : uses
    feedbackController ..> DatabasePool : uses
    advertisementController ..> DatabasePool : uses
    campaignController ..> DatabasePool : uses
    reportController ..> DatabasePool : uses
    
    %% Controllers protected by middleware
    authMiddleware ..> userController : protects
    authMiddleware ..> customerController : protects
    authMiddleware ..> technicianController : protects
    authMiddleware ..> serviceCategoryController : protects
    authMiddleware ..> serviceController : protects
    authMiddleware ..> servicePackageController : protects
    authMiddleware ..> bookingController : protects
    authMiddleware ..> feedbackController : protects
    authMiddleware ..> advertisementController : protects
    authMiddleware ..> campaignController : protects
    authMiddleware ..> reportController : protects
    
    %% Business logic relationships
    serviceController ..> serviceCategoryController : uses
    servicePackageController ..> serviceController : uses
    bookingController ..> serviceController : uses
    bookingController ..> servicePackageController : uses
    bookingController ..> customerController : uses
    bookingController ..> technicianController : uses
    feedbackController ..> bookingController : uses
    campaignController ..> advertisementController : uses
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
    end
    
    subgraph BookingSystem["📅 Booking System"]
        BOOKING[bookingController]
        FEEDBACK[feedbackController]
    end
    
    subgraph Advertising["📢 Advertising"]
        AD[advertisementController]
        CAMPAIGN[campaignController]
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
    AUTHMW -.->|protects| Reporting
    
    %% All use database
    Authentication -->|uses| DB
    UserManagement -->|uses| DB
    ServiceManagement -->|uses| DB
    BookingSystem -->|uses| DB
    Advertising -->|uses| DB
    Reporting -->|uses| DB
    
    %% Cross-module dependencies
    BookingSystem -->|reads| ServiceManagement
    BookingSystem -->|reads| UserManagement
    Advertising -->|creates| AD
    Reporting -->|analyzes| BookingSystem
    Reporting -->|analyzes| Advertising
    
    style Authentication fill:#e1f5fe
    style UserManagement fill:#f3e5f5
    style ServiceManagement fill:#e8f5e9
    style BookingSystem fill:#fff3e0
    style Advertising fill:#fce4ec
    style Reporting fill:#f1f8e9
    style Database fill:#efebe9
```

---

## Controller Method Statistics

| Controller | Public Methods | Private Methods | Total |
| :--- | :--- | :--- | :--- |
| **authController** | 2 | 0 | 2 |
| **userController** | 4 | 0 | 4 |
| **customerController** | 4 | 0 | 4 |
| **technicianController** | 5 | 0 | 5 |
| **serviceCategoryController** | 4 | 0 | 4 |
| **serviceController** | 5 | 0 | 5 |
| **servicePackageController** | 4 | 0 | 4 |
| **bookingController** | 5 | 1 | 6 |
| **feedbackController** | 5 | 0 | 5 |
| **advertisementController** | 6 | 0 | 6 |
| **campaignController** | 6 | 0 | 6 |
| **reportController** | 4 | 0 | 4 |
| **authMiddleware** | 2 | 0 | 2 |
| **TOTAL** | **56** | **1** | **57** |

---

## Method Access Patterns

```mermaid
pie title Method Distribution by Category
    "User Management (13)" : 13
    "Service Management (13)" : 13
    "Booking System (11)" : 11
    "Advertising (12)" : 12
    "Reporting (4)" : 4
    "Authentication (4)" : 4
```

---

## Database Entity Relationships (Simplified)

```mermaid
erDiagram
    USER ||--o{ CUSTOMER : "has profile"
    USER ||--o{ ADVERTISER : "has profile"
    USER ||--o{ TECHNICIAN : "has profile"
    USER ||--o{ MANAGER : "has profile"
    
    CUSTOMER ||--o{ VEHICLE : owns
    CUSTOMER ||--o{ BOOKING : makes
    CUSTOMER ||--o{ FEEDBACK : writes
    
    BOOKING }o--|| SERVICE : "books"
    BOOKING }o--|| SERVICE_PACKAGE : "or books"
    BOOKING }o--o| TECHNICIAN : "assigned to"
    BOOKING ||--o{ SERVICE_TRACKING : tracked
    BOOKING ||--o{ BOOKING_HISTORY : has
    BOOKING ||--o| FEEDBACK : receives
    
    SERVICE_CATEGORY ||--o{ SERVICE : contains
    SERVICE_PACKAGE ||--o{ SERVICE_PACKAGE_ITEM : contains
    SERVICE ||--o{ SERVICE_PACKAGE_ITEM : "included in"
    
    ADVERTISER ||--o{ CAMPAIGN : creates
    ADVERTISER ||--o{ ADVERTISEMENT : creates
    CAMPAIGN ||--o{ ADVERTISEMENT : contains
    ADVERTISEMENT_PLACEMENT ||--o{ ADVERTISEMENT : "placed at"
    ADVERTISEMENT ||--o{ AD_IMPRESSION : tracked
    ADVERTISEMENT ||--o{ AD_CLICK : tracked
    
    USER {
        int userId PK
        string userEmail
        string userPassword
        string userRole
        boolean userIsActive
        timestamp userCreatedAt
    }
    
    BOOKING {
        int bookingId PK
        date bookingDate
        time bookingStartTime
        time bookingEndTime
        string bookingStatus
        string bookingRefNumber
        int bookingCustomerId FK
        int bookingVehicleId FK
        int bookingServiceId FK
        int bookingPackageId FK
        int bookingTechnicianId FK
        timestamp bookingCreatedAt
    }
    
    ADVERTISEMENT {
        int advertisementId PK
        string advertisementTitle
        string advertisementImageUrl
        date advertisementStartDate
        date advertisementEndDate
        string advertisementStatus
        int advertisementAdvertiserId FK
        int advertisementPlacementId FK
        int advertisementCampaignId FK
        timestamp advertisementCreatedAt
    }
    
    CAMPAIGN {
        int campaignId PK
        string campaignName
        decimal campaignBudget
        date campaignStartDate
        date campaignEndDate
        string campaignStatus
        int campaignAdvertiserId FK
        timestamp campaignCreatedAt
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

## Controller Dependencies Graph

```mermaid
graph LR
    subgraph Core
        AUTH[authController]
        USER[userController]
    end
    
    subgraph Profiles
        CUST[customerController]
        TECH[technicianController]
    end
    
    subgraph Services
        SCAT[serviceCategoryController]
        SERV[serviceController]
        PKG[servicePackageController]
    end
    
    subgraph Operations
        BOOK[bookingController]
        FEED[feedbackController]
    end
    
    subgraph Marketing
        AD[advertisementController]
        CAMP[campaignController]
    end
    
    subgraph Analytics
        REP[reportController]
    end
    
    AUTH --> CUST
    AUTH --> TECH
    
    SCAT --> SERV
    SERV --> PKG
    SERV --> BOOK
    PKG --> BOOK
    
    CUST --> BOOK
    TECH --> BOOK
    BOOK --> FEED
    
    AD --> CAMP
    
    BOOK --> REP
    AD --> REP
    TECH --> REP
    
    style AUTH fill:#ffeb3b
    style USER fill:#ffeb3b
    style REP fill:#4caf50
```

---

**End of Class Diagram Documentation**
