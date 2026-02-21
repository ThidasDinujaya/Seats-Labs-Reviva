# Unused SQL Attributes Report

> **Last Updated:** February 20, 2026
> **Purpose:** Lists all SQL database attributes that are NOT displayed as table headers in any Manager frontend page.

---

## Summary

| Total SQL Attributes | Displayed in Tables | Unused Attributes |
| :--- | :--- | :--- |
| ~150 | ~90 | ~60 |

---

## Unused Attributes by Table

### 1. `user` Table

| Attribute | Type | Notes |
| :--- | :--- | :--- |
| `userPassword` | VARCHAR(255) | Intentionally hidden — security-sensitive |

### 2. `customer` Table

| Attribute | Type | Notes |
| :--- | :--- | :--- |
| `customerId` | SERIAL PK | Referenced as FK in other pages, but no dedicated customer management table |
| `customerFirstName` | VARCHAR(100) | No customer table page |
| `customerLastName` | VARCHAR(100) | No customer table page |
| `customerPhone` | VARCHAR(20) | No customer table page |
| `customerAddress` | TEXT | No customer table page |
| `userId` (FK) | INTEGER | No customer table page |
| `customerCreatedAt` | TIMESTAMP | No customer table page |

### 3. `advertiser` Table

| Attribute | Type | Notes |
| :--- | :--- | :--- |
| `advertiserId` | SERIAL PK | Referenced as FK in ads pages |
| `advertiserBusinessName` | VARCHAR(255) | No dedicated advertiser table page |
| `advertiserContactPerson` | VARCHAR(100) | No dedicated advertiser table page |
| `advertiserPhone` | VARCHAR(20) | No dedicated advertiser table page |
| `advertiserAddress` | TEXT | No dedicated advertiser table page |
| `userId` (FK) | INTEGER | No dedicated advertiser table page |
| `advertiserCreatedAt` | TIMESTAMP | No dedicated advertiser table page |

### 4. `technician` Table

| Attribute | Type | Notes |
| :--- | :--- | :--- |
| `technicianId` | SERIAL PK | Referenced as FK in bookings |
| `technicianFirstName` | VARCHAR(100) | No dedicated technician table page |
| `technicianLastName` | VARCHAR(100) | No dedicated technician table page |
| `technicianPhone` | VARCHAR(20) | No dedicated technician table page |
| `technicianSpecialization` | VARCHAR(100) | No dedicated technician table page |
| `userId` (FK) | INTEGER | No dedicated technician table page |
| `technicianCreatedAt` | TIMESTAMP | No dedicated technician table page |

### 5. `manager` Table

| Attribute | Type | Notes |
| :--- | :--- | :--- |
| `managerId` | SERIAL PK | No dedicated manager table page |
| `managerFirstName` | VARCHAR(100) | No dedicated manager table page |
| `managerLastName` | VARCHAR(100) | No dedicated manager table page |
| `managerPhone` | VARCHAR(20) | No dedicated manager table page |
| `userId` (FK) | INTEGER | No dedicated manager table page |
| `managerCreatedAt` | TIMESTAMP | No dedicated manager table page |

### 6. `serviceCategory` Table

| Attribute | Type | Notes |
| :--- | :--- | :--- |
| `serviceCategoryCreatedAt` | TIMESTAMP | Not shown in table header |

### 7. `service` Table

| Attribute | Type | Notes |
| :--- | :--- | :--- |
| `serviceDescription` | TEXT | Not shown in service table |
| `serviceCreatedAt` | TIMESTAMP | Not shown in service table |

### 8. `servicePackage` Table

| Attribute | Type | Notes |
| :--- | :--- | :--- |
| `servicePackageUpdatedAt` | TIMESTAMP | Not shown in package table |
| `servicePackageCreatedAt` | TIMESTAMP | Not shown in package table |

### 9. `servicePackageItem` Table (Entire Table Unused)

| Attribute | Type | Notes |
| :--- | :--- | :--- |
| `servicePackageItemId` | SERIAL PK | No dedicated table display |
| `servicePackageId` (FK) | INTEGER | No dedicated table display |
| `serviceId` (FK) | INTEGER | No dedicated table display |

### 10. `vehicle` Table (Entire Table Unused)

| Attribute | Type | Notes |
| :--- | :--- | :--- |
| `vehicleId` | SERIAL PK | Referenced as FK in bookings |
| `vehicleMake` | VARCHAR(100) | No dedicated vehicle management table |
| `vehicleModel` | VARCHAR(100) | No dedicated vehicle management table |
| `vehicleRegNumber` | VARCHAR(50) | No dedicated vehicle management table |
| `customerId` (FK) | INTEGER | No dedicated vehicle management table |
| `vehicleCreatedAt` | TIMESTAMP | No dedicated vehicle management table |

### 11. `timeSlot` Table

| Attribute | Type | Notes |
| :--- | :--- | :--- |
| `timeSlotCreatedAt` | TIMESTAMP | Not shown in time slot table |

### 12. `booking` Table

| Attribute | Type | Notes |
| :--- | :--- | :--- |
| `bookingCustomerNotes` | TEXT | Not shown in table (used in modal) |
| `bookingTechnicianNotes` | TEXT | Not shown in table (used in modal) |
| `servicePackageId` (FK) | INTEGER | Not shown in table |
| `timeSlotId` (FK) | INTEGER | Not shown in table |

### 13. `serviceTracking` Table

| Attribute | Type | Notes |
| :--- | :--- | :--- |
| *(All attributes are displayed)* | — | — |

### 14. `bookingHistory` Table (Entire Table Unused)

| Attribute | Type | Notes |
| :--- | :--- | :--- |
| `bookingHistoryId` | SERIAL PK | No dedicated table display |
| `bookingHistoryAction` | VARCHAR(100) | No dedicated table display |
| `bookingId` (FK) | INTEGER | No dedicated table display |
| `userId` (FK) | INTEGER | No dedicated table display |
| `bookingHistoryCreatedAt` | TIMESTAMP | No dedicated table display |

### 15. `feedback` Table

| Attribute | Type | Notes |
| :--- | :--- | :--- |
| *(All attributes are displayed)* | — | — |

### 16. `advertisementPlacement` Table

| Attribute | Type | Notes |
| :--- | :--- | :--- |
| `advertisementPlacementDescription` | TEXT | Not shown in table |

### 17. `advertisementPricingPlan` Table

| Attribute | Type | Notes |
| :--- | :--- | :--- |
| `advertisementPricingPlanIsActive` | BOOLEAN | Not shown in table |
| `advertisementPlacementId` (FK) | INTEGER | Not shown in table |
| `advertisementPricingPlanCreatedAt` | TIMESTAMP | Not shown in table |

### 18. `advertisementCampaign` Table

| Attribute | Type | Notes |
| :--- | :--- | :--- |
| `advertisementPricingPlanId` (FK) | INTEGER | Not shown in table |

### 19. `advertisement` Table

| Attribute | Type | Notes |
| :--- | :--- | :--- |
| *(All attributes are displayed)* | — | — |

### 20. `advertisementImpression` Table (Entire Table Unused)

| Attribute | Type | Notes |
| :--- | :--- | :--- |
| `advertisementImpressionId` | SERIAL PK | No dedicated table display |
| `advertisementId` (FK) | INTEGER | No dedicated table display |
| `advertisementImpressionCreatedAt` | TIMESTAMP | No dedicated table display |

### 21. `advertisementClick` Table (Entire Table Unused)

| Attribute | Type | Notes |
| :--- | :--- | :--- |
| `advertisementClickId` | SERIAL PK | No dedicated table display |
| `advertisementId` (FK) | INTEGER | No dedicated table display |
| `advertisementClickCreatedAt` | TIMESTAMP | No dedicated table display |

### 22. `invoice` Table (Entire Table Unused)

| Attribute | Type | Notes |
| :--- | :--- | :--- |
| `invoiceId` | SERIAL PK | Referenced as FK in payments/refunds |
| `invoiceNumber` | VARCHAR(50) | No dedicated invoice table display |
| `invoiceAmount` | DECIMAL(10,2) | No dedicated invoice table display |
| `invoiceStatus` | VARCHAR(50) | No dedicated invoice table display |
| `bookingId` (FK) | INTEGER | No dedicated invoice table display |
| `advertisementId` (FK) | INTEGER | No dedicated invoice table display |
| `invoiceCreatedAt` | TIMESTAMP | No dedicated invoice table display |

### 23. `payment` Table

| Attribute | Type | Notes |
| :--- | :--- | :--- |
| *(All attributes are displayed)* | — | — |

### 24. `refund` Table

| Attribute | Type | Notes |
| :--- | :--- | :--- |
| `refundReason` | TEXT | Not shown in table (used in modal) |

### 25. `systemSettings` Table (Entire Table Unused)

| Attribute | Type | Notes |
| :--- | :--- | :--- |
| `settingId` | SERIAL PK | No dedicated settings table display |
| `settingKey` | VARCHAR(100) | No dedicated settings table display |
| `settingValue` | TEXT | No dedicated settings table display |
| `settingUpdatedAt` | TIMESTAMP | No dedicated settings table display |

### 26. `report` Table (Entire Table Unused in Manager Tables)

| Attribute | Type | Notes |
| :--- | :--- | :--- |
| `reportId` | SERIAL PK | Reports generated dynamically, not displayed in table format |
| `reportType` | VARCHAR(50) | Reports generated dynamically |
| `reportStartDate` | DATE | Reports generated dynamically |
| `reportEndDate` | DATE | Reports generated dynamically |
| `reportData` | JSONB | Reports generated dynamically |
| `userId` (FK) | INTEGER | Reports generated dynamically |
| `reportCreatedAt` | TIMESTAMP | Reports generated dynamically |

### 27. `notification` Table (Entire Table Unused)

| Attribute | Type | Notes |
| :--- | :--- | :--- |
| `notificationId` | SERIAL PK | No dedicated notification management table |
| `userId` (FK) | INTEGER | No dedicated notification management table |
| `notificationTitle` | VARCHAR(255) | No dedicated notification management table |
| `notificationMessage` | TEXT | No dedicated notification management table |
| `notificationType` | VARCHAR(50) | No dedicated notification management table |
| `notificationChannel` | VARCHAR(50) | No dedicated notification management table |
| `notificationIsRead` | BOOLEAN | No dedicated notification management table |
| `notificationCreatedAt` | TIMESTAMP | No dedicated notification management table |

### 28. `complaint` Table

| Attribute | Type | Notes |
| :--- | :--- | :--- |
| `complaintDescription` | TEXT | Not shown in table (used in modal) |
| `complaintManagerResponse` | TEXT | Not shown in table (used in modal) |
| `complaintResolvedAt` | TIMESTAMP | Not shown in table |

### 29. `enquiry` Table (Entire Table Unused)

| Attribute | Type | Notes |
| :--- | :--- | :--- |
| `enquiryId` | SERIAL PK | No dedicated enquiry management table |
| `enquiryName` | VARCHAR(255) | No dedicated enquiry management table |
| `enquiryEmail` | VARCHAR(255) | No dedicated enquiry management table |
| `enquiryPhone` | VARCHAR(20) | No dedicated enquiry management table |
| `enquirySubject` | VARCHAR(255) | No dedicated enquiry management table |
| `enquiryMessage` | TEXT | No dedicated enquiry management table |
| `enquiryStatus` | VARCHAR(50) | No dedicated enquiry management table |
| `customerId` (FK) | INTEGER | No dedicated enquiry management table |
| `enquiryCreatedAt` | TIMESTAMP | No dedicated enquiry management table |

---

## Entire Tables Without Dedicated Frontend Display

| Index | Table Name | Total Attributes | Reason |
| :--- | :--- | :--- | :--- |
| 1 | `customer` | 7 | Managed through `user` table; details in modals |
| 2 | `advertiser` | 7 | Managed through `user` table; details in modals |
| 3 | `technician` | 7 | Managed through `user` table; details in modals |
| 4 | `manager` | 6 | Managed through `user` table; details in modals |
| 5 | `servicePackageItem` | 3 | Junction table; managed in package edit modal |
| 6 | `vehicle` | 6 | Managed by customer portal |
| 7 | `bookingHistory` | 5 | Audit log; displayed in booking modal timeline |
| 8 | `advertisementImpression` | 3 | Analytics data; used in reports |
| 9 | `advertisementClick` | 3 | Analytics data; used in reports |
| 10 | `invoice` | 7 | Linked to payment/refund tables |
| 11 | `systemSettings` | 4 | Backend config; no table UI |
| 12 | `report` | 7 | Dynamic generation; not table-displayed |
| 13 | `notification` | 8 | Displayed as toast/dropdown, not table |
| 14 | `enquiry` | 9 | No dedicated page yet |

**Total: 14 tables (75 attributes) without direct table display**

---

**End of Unused Attributes Report**
