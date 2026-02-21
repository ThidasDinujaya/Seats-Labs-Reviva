# SeatsLabs Database Schema Diagram

> **Last Updated:** February 20, 2026  
> **Database:** PostgreSQL (seatslabs_db)

---

## 📊 Entity Relationship Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER HIERARCHY                            │
└─────────────────────────────────────────────────────────────────┘

                          ┌──────────┐
                          │   user   │
                          │──────────│
                          │ userId   │ PK
                          │ email    │ UK
                          │ password │
                          │ role     │
                          │ isActive │
                          └────┬─────┘
                               │
                ┌──────────────┼──────────────┬──────────────┐
                │              │              │              │
                ▼              ▼              ▼              ▼
          ┌──────────┐   ┌──────────┐  ┌──────────┐  ┌──────────┐
          │ customer │   │advertiser│  │technician│  │ manager  │
          │──────────│   │──────────│  │──────────│  │──────────│
          │customerId│   │advertiserId│ │technicianId│ │managerId │
          │firstName │   │businessName│ │firstName │  │firstName │
          │lastName  │   │contactPerson│ │lastName  │  │lastName  │
          │phone     │   │phone     │  │phone     │  │phone     │
          │address   │   │address   │  │specialization│ │userId FK│
          └────┬─────┘   └────┬─────┘  └────┬─────┘  └──────────┘
               │              │              │
               │              │              │
               ▼              ▼              ▼
          (vehicles)    (advertisements) (bookings)
          (bookings)    (campaigns)      (assigned)
          (feedback)
          (complaints)
          (enquiries)


┌─────────────────────────────────────────────────────────────────┐
│                    SERVICE & BOOKING SYSTEM                       │
└─────────────────────────────────────────────────────────────────┘

┌──────────────┐         ┌──────────┐     ┌───────────┐
│serviceCategory│◄───────│ service  │◄────│  booking  │
│──────────────│         │──────────│     │───────────│
│categoryId    │         │serviceId │     │bookingId  │
│name          │         │name      │     │date       │
│description   │         │duration  │     │startTime  │
│isActive      │         │price     │     │endTime    │
└──────────────┘         │isActive  │     │status     │
                         │categoryId│     │refNumber  │
                         └──────────┘     │customerId │
                                          │vehicleId  │
┌──────────────┐  ┌─────────────────┐     │serviceId  │
│servicePackage│──│servicePackageItem│     │packageId  │
│──────────────│  │─────────────────│     │technicianId│
│packageId     │  │itemId           │     │timeSlotId │
│name          │  │packageId FK     │     └────┬──────┘
│description   │  │serviceId FK     │          │
│price         │  └─────────────────┘   ┌──────┼──────────────┐
└──────────────┘                        │      │              │
                                        ▼      ▼              ▼
                                ┌──────────┐  ┌──────────┐  ┌──────────┐
                                │ feedback │  │ tracking │  │ history  │
                                │──────────│  │──────────│  │──────────│
                                │feedbackId│  │trackingId│  │historyId │
                                │rating    │  │status    │  │action    │
                                │comment   │  │notes     │  │userId    │
                                │bookingId │  │bookingId │  │bookingId │
                                └──────────┘  └──────────┘  └──────────┘


┌──────────────┐
│  timeSlot    │
│──────────────│
│timeSlotId    │
│date          │
│startTime     │
│endTime       │
│maxCapacity   │
│isActive      │
└──────────────┘


┌─────────────────────────────────────────────────────────────────┐
│                 ADVERTISEMENT SYSTEM                              │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────┐       ┌──────────────────┐
│advertisementPlace│◄──────│advertisementPric.│
│──────────────────│       │──────────────────│
│placementId       │       │pricingPlanId     │
│slug              │       │name              │
│name              │       │duration (days)   │
│page              │       │price             │
│position          │       │description       │
│width             │       │isActive          │
│height            │       │placementId FK    │
│isFixed           │       └────────┬─────────┘
└──────┬───────────┘                │
       │              ┌─────────────┘
       │              │
       ▼              ▼
┌──────────────┐    ┌──────────────────┐
│advertisement │◄───│advertisementCamp.│
│──────────────│    │──────────────────│
│advertisementId│   │campaignId        │
│title         │    │name              │
│imageUrl      │    │startDate         │
│startDate     │    │endDate           │
│endDate       │    │status            │
│status        │    │advertiserId FK   │
│advertiserId  │    │pricingPlanId FK  │
│placementId   │    └──────────────────┘
│campaignId    │
└──────┬───────┘
       │
       ├──────────┐
       ▼          ▼
┌──────────┐  ┌──────────┐
│impression│  │  click   │
│──────────│  │──────────│
│impressionId│ │clickId  │
│adId      │  │adId     │
│createdAt │  │createdAt│
└──────────┘  └─────────┘


┌─────────────────────────────────────────────────────────────────┐
│                    FINANCIAL SYSTEM                               │
└─────────────────────────────────────────────────────────────────┘

┌──────────┐         ┌──────────┐         ┌──────────┐
│ booking  │────────►│ invoice  │◄────────│ payment  │
│──────────│         │──────────│         │──────────│
│bookingId │         │invoiceId │         │paymentId │
└──────────┘         │number    │         │amount    │
                     │amount    │         │method    │
┌──────────┐         │status    │         │status    │
│   ad     │────────►│bookingId │         │date      │
│──────────│         │adId      │         │reference │
│adId      │         └────┬─────┘         │invoiceId │
└──────────┘              │               └──────────┘
                          │
                          ▼
                    ┌──────────┐
                    │  refund  │
                    │──────────│
                    │refundId  │
                    │amount    │
                    │reason    │
                    │status    │
                    │date      │
                    │invoiceId │
                    └──────────┘


┌─────────────────────────────────────────────────────────────────┐
│                 SUPPORT & COMMUNICATION                           │
└─────────────────────────────────────────────────────────────────┘

┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  complaint   │     │   enquiry    │     │ notification │
│──────────────│     │──────────────│     │──────────────│
│complaintId   │     │enquiryId     │     │notificationId│
│title         │     │name          │     │userId FK     │
│description   │     │email         │     │title         │
│priority      │     │phone         │     │message       │
│status        │     │subject       │     │type          │
│managerResponse│    │message       │     │channel       │
│customerId FK │     │status        │     │isRead        │
│bookingId FK  │     │customerId FK │     └──────────────┘
└──────────────┘     └──────────────┘


┌─────────────────────────────────────────────────────────────────┐
│                 SYSTEM & REPORTING                                │
└─────────────────────────────────────────────────────────────────┘

┌──────────────┐     ┌──────────────┐
│systemSettings│     │    report    │
│──────────────│     │──────────────│
│settingId     │     │reportId      │
│key  UK       │     │type          │
│value         │     │startDate     │
│updatedAt     │     │endDate       │
└──────────────┘     │data (JSONB)  │
                     │userId FK     │
                     └──────────────┘
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
├── feedback (1:many)
├── complaints (1:many)
└── enquiries (1:many)
```

### **Booking Relationships**
```
booking
├── customer (many:1)
├── vehicle (many:1)
├── service (many:1)
├── servicePackage (many:1) - optional
├── technician (many:1) - optional
├── timeSlot (many:1) - optional
├── feedback (1:1)
├── serviceTracking (1:many)
├── bookingHistory (1:many)
├── complaints (1:many) - optional
└── invoices (1:many)
```

### **Advertisement Relationships**
```
advertisementPlacement
├── advertisementPricingPlan (1:many)
└── advertisements (1:many)

advertisementPricingPlan
└── advertisementCampaign (1:many)

advertisementCampaign
├── advertiser (many:1)
└── advertisements (1:many)

advertisement
├── advertiser (many:1)
├── placement (many:1) - optional
├── campaign (many:1) - optional
├── impressions (1:many)
├── clicks (1:many)
└── invoices (1:many)
```

### **Financial Relationships**
```
invoice
├── booking (many:1) - optional
├── advertisement (many:1) - optional
├── payments (1:many)
└── refunds (1:many)
```

---

## 📋 Complete Table Inventory

### **Core Tables (5)**

| Table | Primary Key | Foreign Keys | Purpose |
|-------|-------------|--------------|---------|
| user | userId | - | Authentication base |
| customer | customerId | userId | Customer profiles |
| advertiser | advertiserId | userId | Advertiser profiles |
| technician | technicianId | userId | Technician profiles |
| manager | managerId | userId | Manager profiles |

### **Service Tables (5)**

| Table | Primary Key | Foreign Keys | Purpose |
|-------|-------------|--------------|---------|
| serviceCategory | serviceCategoryId | - | Service grouping |
| service | serviceId | serviceCategoryId | Available services |
| servicePackage | servicePackageId | - | Package bundles |
| servicePackageItem | servicePackageItemId | servicePackageId, serviceId | Package contents |
| timeSlot | timeSlotId | - | Scheduling slots |

### **Vehicle Table (1)**

| Table | Primary Key | Foreign Keys | Purpose |
|-------|-------------|--------------|---------|
| vehicle | vehicleId | customerId | Customer vehicles |

### **Booking Tables (3)**

| Table | Primary Key | Foreign Keys | Purpose |
|-------|-------------|--------------|---------|
| booking | bookingId | customerId, vehicleId, serviceId, servicePackageId, technicianId, timeSlotId | Service bookings |
| serviceTracking | serviceTrackingId | bookingId | Progress tracking |
| bookingHistory | bookingHistoryId | bookingId, userId | Audit trail |

### **Feedback Table (1)**

| Table | Primary Key | Foreign Keys | Purpose |
|-------|-------------|--------------|---------|
| feedback | feedbackId | customerId, bookingId, technicianId | Ratings & reviews |

### **Advertisement Tables (6)**

| Table | Primary Key | Foreign Keys | Purpose |
|-------|-------------|--------------|---------|
| advertisementPlacement | advertisementPlacementId | - | Ad locations |
| advertisementPricingPlan | advertisementPricingPlanId | advertisementPlacementId | Pricing tiers |
| advertisementCampaign | advertisementCampaignId | advertiserId, advertisementPricingPlanId | Campaign management |
| advertisement | advertisementId | advertiserId, advertisementPlacementId, advertisementCampaignId | Ad creatives |
| advertisementImpression | advertisementImpressionId | advertisementId | View tracking |
| advertisementClick | advertisementClickId | advertisementId | Click tracking |

### **Financial Tables (3)**

| Table | Primary Key | Foreign Keys | Purpose |
|-------|-------------|--------------|---------|
| invoice | invoiceId | bookingId, advertisementId | Billing |
| payment | paymentId | invoiceId | Payment records |
| refund | refundId | invoiceId | Refund processing |

### **Support Tables (2)**

| Table | Primary Key | Foreign Keys | Purpose |
|-------|-------------|--------------|---------|
| complaint | complaintId | customerId, bookingId | Customer complaints |
| enquiry | enquiryId | customerId | General enquiries |

### **System Tables (3)**

| Table | Primary Key | Foreign Keys | Purpose |
|-------|-------------|--------------|---------|
| notification | notificationId | userId | User notifications |
| systemSettings | settingId | - | Application config |
| report | reportId | userId | Business analytics |

---

## 🔒 Constraints & Rules

### **Enum Constraints**

```sql
-- User roles
userRole IN ('customer', 'advertiser', 'technician', 'manager')

-- Booking status
bookingStatus IN ('pending', 'approved', 'in_progress', 'completed', 'cancelled', 'rejected')

-- Advertisement status
advertisementStatus IN ('pending', 'active', 'expired', 'rejected')

-- Campaign status
advertisementCampaignStatus IN ('pending', 'active', 'paused', 'completed', 'cancelled')

-- Invoice status
invoiceStatus IN ('pending', 'paid', 'cancelled')

-- Payment status
paymentStatus IN ('pending', 'completed', 'failed')

-- Refund status
refundStatus IN ('pending', 'completed', 'rejected')

-- Complaint priority
complaintPriority IN ('low', 'medium', 'high', 'critical')

-- Complaint status
complaintStatus IN ('open', 'in_progress', 'resolved', 'closed')

-- Enquiry status
enquiryStatus IN ('new', 'read', 'replied')

-- Report types
reportType IN ('dailyBooking', 'revenueAnalysis', 'technicianPerformance', 'customerSatisfaction')
```

### **Check Constraints**

```sql
-- Feedback rating must be 1-5
feedbackRating >= 1 AND feedbackRating <= 5

-- Advertisement end date must be after start date
advertisementEndDate > advertisementStartDate

-- Campaign end date must be after start date
advertisementCampaignEndDate > advertisementCampaignStartDate
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

-- Unique placement slugs
advertisementPlacement.advertisementPlacementSlug UNIQUE

-- Unique placement names
advertisementPlacement.advertisementPlacementName UNIQUE

-- Unique invoice numbers
invoice.invoiceNumber UNIQUE

-- Unique setting keys
systemSettings.settingKey UNIQUE

-- Unique time slot per date (composite)
timeSlot.(timeSlotDate, timeSlotStartTime, timeSlotEndTime) UNIQUE
```

---

## 🔄 Cascade Rules

### **ON DELETE CASCADE**
- Delete user → Delete customer/advertiser/technician/manager
- Delete customer → Delete vehicles, bookings, feedback
- Delete advertiser → Delete campaigns, advertisements
- Delete booking → Delete tracking, history
- Delete advertisement → Delete impressions, clicks
- Delete advertisementPlacement → Delete pricingPlans
- Delete invoice → Delete refunds

### **ON DELETE SET NULL**
- Delete technician → Set booking.technicianId to NULL
- Delete campaign → Set advertisement.campaignId to NULL
- Delete placement → Set advertisement.placementId to NULL
- Delete pricingPlan → Set campaign.pricingPlanId to NULL
- Delete customer → Set enquiry.customerId to NULL

---

## 📈 Data Flow Examples

### **Customer Booking Flow**
```
1. Customer registers → user + customer tables
2. Customer adds vehicle → vehicle table
3. Customer browses services → service + serviceCategory tables
4. Customer selects time slot → timeSlot table
5. Customer creates booking → booking table
6. System creates tracking → serviceTracking table
7. Manager assigns technician → booking.technicianId updated
8. Status changes logged → bookingHistory table
9. Service completed → booking.status = 'completed'
10. Invoice generated → invoice table
11. Customer pays → payment table
12. Customer leaves feedback → feedback table
```

### **Advertisement Flow**
```
1. Advertiser registers → user + advertiser tables
2. Manager creates placement → advertisementPlacement table
3. Manager creates pricing plan → advertisementPricingPlan table
4. Advertiser creates campaign → advertisementCampaign table (with pricing plan)
5. Advertiser creates ad → advertisement table (status: pending)
6. Manager approves → advertisement.status = 'active'
7. Ad displayed → advertisementImpression table
8. User clicks ad → advertisementClick table
9. Invoice generated → invoice table
10. Payment made → payment table
```

### **Complaint Flow**
```
1. Customer files complaint → complaint table (status: open)
2. Manager reviews → complaint.status = 'in_progress'
3. Manager responds → complaint.managerResponse updated
4. Complaint resolved → complaint.status = 'resolved'
```

---

## 📝 Total Database Summary

| Category | Count |
|----------|-------|
| **Total Tables** | **29** |
| **Total Foreign Keys** | **30+** |
| **Total Check Constraints** | **15+** |
| **Total Unique Constraints** | **10+** |

---

**End of Schema Diagram Documentation**
