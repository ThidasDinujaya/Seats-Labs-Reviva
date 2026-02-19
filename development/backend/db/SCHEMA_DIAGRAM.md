# SeatsLabs Database Schema Diagram

## 📊 Entity Relationship Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER HIERARCHY                            │
└─────────────────────────────────────────────────────────────────┘

                          ┌──────────┐
                          │   user   │
                          │──────────│
                          │ userId   │ PK
                          │ email    │
                          │ password │
                          │ role     │
                          └────┬─────┘
                               │
                ┌──────────────┼──────────────┐
                │              │              │
                ▼              ▼              ▼
          ┌──────────┐   ┌──────────┐  ┌──────────┐
          │ customer │   │advertiser│  │technician│
          │──────────│   │──────────│  │──────────│
          │customerId│   │advertiserId│ │technicianId│
          │firstName │   │businessName│ │firstName │
          │lastName  │   │contactPerson│ │lastName  │
          │phone     │   │phone     │  │phone     │
          │address   │   │address   │  │specialization│
          └────┬─────┘   └────┬─────┘  └────┬─────┘
               │              │              │
               │              │              │
               ▼              ▼              ▼
          (vehicles)    (advertisements) (bookings)
          (bookings)                     (assigned)
          (feedback)


┌─────────────────────────────────────────────────────────────────┐
│                    BOOKING SYSTEM                                │
└─────────────────────────────────────────────────────────────────┘

┌──────────────┐         ┌──────────┐         ┌──────────┐
│serviceCategory│◄───────│ service  │◄────────│ booking  │
│──────────────│         │──────────│         │──────────│
│categoryId    │         │serviceId │         │bookingId │
│name          │         │name      │         │date      │
│description   │         │duration  │         │startTime │
└──────────────┘         │price     │         │endTime   │
                         │categoryId│         │status    │
                         └──────────┘         │refNumber │
                                              │customerId│
                                              │vehicleId │
                                              │serviceId │
                                              │technicianId│
                                              └────┬─────┘
                                                   │
                                    ┌──────────────┼──────────────┐
                                    │              │              │
                                    ▼              ▼              ▼
                            ┌──────────┐   ┌──────────┐  ┌──────────┐
                            │ feedback │   │ tracking │  │ history  │
                            │──────────│   │──────────│  │──────────│
                            │feedbackId│   │trackingId│  │historyId │
                            │rating    │   │status    │  │action    │
                            │comment   │   │notes     │  │userId    │
                            │bookingId │   │bookingId │  │bookingId │
                            └──────────┘   └──────────┘  └──────────┘


┌─────────────────────────────────────────────────────────────────┐
│                 ADVERTISEMENT SYSTEM                             │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────┐         ┌──────────────┐
│advertisementPlace│◄────────│advertisement │
│──────────────────│         │──────────────│
│placementId       │         │advertisementId│
│name              │         │title         │
│description       │         │content       │
│price             │         │imageUrl      │
└──────────────────┘         │startDate     │
                             │endDate       │
                             │status        │
                             │advertiserId  │
                             │placementId   │
                             └──────┬───────┘
                                    │
                         ┌──────────┴──────────┐
                         │                     │
                         ▼                     ▼
                  ┌──────────┐         ┌──────────┐
                  │impression│         │  click   │
                  │──────────│         │──────────│
                  │impressionId│       │clickId   │
                  │adId      │         │adId      │
                  │createdAt │         │createdAt │
                  └──────────┘         └──────────┘


┌─────────────────────────────────────────────────────────────────┐
│                    FINANCIAL SYSTEM                              │
└─────────────────────────────────────────────────────────────────┘

┌──────────┐         ┌──────────┐         ┌──────────┐
│ booking  │────────►│ invoice  │◄────────│ payment  │
│──────────│         │──────────│         │──────────│
│bookingId │         │invoiceId │         │paymentId │
└──────────┘         │number    │         │amount    │
                     │amount    │         │method    │
┌──────────┐         │status    │         │status    │
│   ad     │────────►│bookingId │         │date      │
│──────────│         │adId      │         │invoiceId │
│adId      │         └──────────┘         └──────────┘
└──────────┘


┌─────────────────────────────────────────────────────────────────┐
│                     REPORTING SYSTEM                             │
└─────────────────────────────────────────────────────────────────┘

┌──────────┐
│  report  │
│──────────│
│reportId  │
│type      │ ← dailyBooking, revenueAnalysis, 
│startDate │   technicianPerformance, customerSatisfaction
│endDate   │
│data      │ ← JSON storage
│generatedBy│
└──────────┘
```

---

## 🔑 Key Relationships

### **User Inheritance Pattern**
```
user (parent)
├── customer (child) - 1:1
├── advertiser (child) - 1:1
├── technician (child) - 1:1
└── manager (child) - 1:1
```

### **Customer Relationships**
```
customer
├── vehicles (1:many)
├── bookings (1:many)
└── feedback (1:many)
```

### **Booking Relationships**
```
booking
├── customer (many:1)
├── vehicle (many:1)
├── service (many:1)
├── technician (many:1) - optional
├── feedback (1:1)
├── serviceTracking (1:many)
└── bookingHistory (1:many)
```

### **Advertisement Relationships**
```
advertisement
├── advertiser (many:1)
├── placement (many:1) - optional
├── impressions (1:many)
└── clicks (1:many)
```

---

## 📋 Table Details

### **Core Tables (4)**

| Table | Primary Key | Foreign Keys | Purpose |
|-------|-------------|--------------|---------|
| user | userId | - | Authentication base |
| customer | customerId | userId | Customer profiles |
| advertiser | advertiserId | userId | Advertiser profiles |
| technician | technicianId | userId | Technician profiles |

### **Service Tables (6)**

| Table | Primary Key | Foreign Keys | Purpose |
|-------|-------------|--------------|---------|
| serviceCategory | categoryId | - | Service grouping |
| service | serviceId | categoryId | Available services |
| vehicle | vehicleId | customerId | Customer vehicles |
| booking | bookingId | customerId, vehicleId, serviceId, technicianId | Service bookings |
| serviceTracking | trackingId | bookingId | Progress tracking |
| bookingHistory | historyId | bookingId, userId | Audit trail |

### **Feedback Table (1)**

| Table | Primary Key | Foreign Keys | Purpose |
|-------|-------------|--------------|---------|
| feedback | feedbackId | customerId, bookingId, technicianId | Ratings & reviews |

### **Advertisement Tables (4)**

| Table | Primary Key | Foreign Keys | Purpose |
|-------|-------------|--------------|---------|
| advertisementPlacement | placementId | - | Ad locations |
| advertisement | advertisementId | advertiserId, placementId | Ad campaigns |
| advertisementImpression | impressionId | advertisementId | View tracking |
| advertisementClick | clickId | advertisementId | Click tracking |

### **Financial Tables (2)**

| Table | Primary Key | Foreign Keys | Purpose |
|-------|-------------|--------------|---------|
| invoice | invoiceId | bookingId, advertisementId | Billing |
| payment | paymentId | invoiceId | Payment records |

### **Reporting Table (1)**

| Table | Primary Key | Foreign Keys | Purpose |
|-------|-------------|--------------|---------|
| report | reportId | userId (generatedBy) | Business analytics |

---

## 🔒 Constraints & Rules

### **Enum Constraints**

```sql
-- User roles
userRole IN ('customer', 'advertiser', 'technician', 'admin')

-- Booking status
bookingStatus IN ('pending', 'approved', 'in_progress', 'completed', 'cancelled', 'rejected')

-- Advertisement status
advertisementStatus IN ('pending', 'active', 'expired', 'rejected')

-- Invoice status
invoiceStatus IN ('pending', 'paid', 'cancelled')

-- Payment status
paymentStatus IN ('pending', 'completed', 'failed')

-- Report types
reportType IN ('dailyBooking', 'revenueAnalysis', 'technicianPerformance', 'customerSatisfaction')
```

### **Check Constraints**

```sql
-- Feedback rating must be 1-5
feedbackRating >= 1 AND feedbackRating <= 5

-- Advertisement end date must be after start date
advertisementEndDate > advertisementStartDate
```

### **Unique Constraints**

```sql
-- One user per email
user.userEmail UNIQUE

-- One feedback per booking
feedback.feedbackBookingId UNIQUE

-- Unique booking reference numbers
booking.bookingRefNumber UNIQUE

-- Unique vehicle registration
vehicle.vehicleRegNumber UNIQUE
```

---

## 📊 Indexes for Performance

```sql
-- Authentication
idx_user_email ON user(userEmail)
idx_user_role ON user(userRole)

-- Booking queries
idx_booking_customer ON booking(bookingCustomerId)
idx_booking_date ON booking(bookingDate)
idx_booking_status ON booking(bookingStatus)
idx_booking_technician ON booking(bookingTechnicianId)

-- Feedback queries
idx_feedback_customer ON feedback(feedbackCustomerId)
idx_feedback_technician ON feedback(feedbackTechnicianId)
idx_feedback_rating ON feedback(feedbackRating)

-- Advertisement queries
idx_ad_advertiser ON advertisement(advertisementAdvertiserId)
idx_ad_status ON advertisement(advertisementStatus)
idx_ad_dates ON advertisement(advertisementStartDate, advertisementEndDate)

-- Payment queries
idx_payment_invoice ON payment(paymentInvoiceId)
idx_payment_date ON payment(paymentDate)
```

---

## 🔄 Cascade Rules

### **ON DELETE CASCADE**
- Delete user → Delete customer/advertiser/technician
- Delete customer → Delete vehicles, bookings, feedback
- Delete booking → Delete tracking, history
- Delete advertisement → Delete impressions, clicks

### **ON DELETE SET NULL**
- Delete technician → Set booking.technicianId to NULL
- Delete service category → Set service.categoryId to NULL

---

## 📈 Data Flow Examples

### **Customer Booking Flow**
```
1. Customer registers → user + customer tables
2. Customer adds vehicle → vehicle table
3. Customer creates booking → booking table
4. System creates tracking → serviceTracking table
5. Admin assigns technician → booking.technicianId updated
6. Status changes logged → bookingHistory table
7. Service completed → booking.status = 'completed'
8. Customer adds feedback → feedback table
```

### **Advertisement Flow**
```
1. Advertiser registers → user + advertiser tables
2. Advertiser creates ad → advertisement table (status: pending)
3. Admin approves → advertisement.status = 'active'
4. Ad displayed → advertisementImpression table
5. User clicks ad → advertisementClick table
6. Invoice generated → invoice table
7. Payment made → payment table
```

### **Report Generation Flow**
```
1. Admin requests report → API call
2. System queries relevant tables
3. Data aggregated and analyzed
4. Report saved → report table (JSON data)
5. Report returned to admin
```

---

## 🎯 Query Optimization Tips

1. **Use indexes** - All foreign keys and frequently queried columns are indexed
2. **Use views** - `vw_booking_details` for common booking queries
3. **Limit results** - Use LIMIT for large datasets
4. **Filter early** - Apply WHERE clauses before JOINs when possible
5. **Use prepared statements** - Prevents SQL injection and improves performance

---

## 📝 Notes

- All timestamps use `TIMESTAMP` type with default `CURRENT_TIMESTAMP`
- Prices use `DECIMAL(10, 2)` for accurate currency handling
- JSON data type used for flexible report storage
- Soft deletes implemented via `isActive` flags where appropriate
- Auto-incrementing IDs use `SERIAL` type

---

**Total Database Objects:**
- 28 Tables
- 25+ Indexes
- 3 Triggers
- 1 View
- Multiple Constraints

**Estimated Performance:**
- Handles 100,000+ bookings efficiently
- Sub-second query times with proper indexing
- Optimized for read-heavy workloads
