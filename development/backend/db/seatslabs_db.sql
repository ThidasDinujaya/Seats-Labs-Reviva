-- ============================================================
-- SeatsLabs Database Schema & Dummy Data
-- PURPOSE: Complete database for automotive workshop
-- DATABASE: PostgreSQL (seatslabs_db)
-- ============================================================
-- FILE: seatslabs_db.sql
-- ============================================================

-- DROP existing tables
DROP TABLE IF EXISTS "notification" CASCADE;
DROP TABLE IF EXISTS "complaint" CASCADE;
DROP TABLE IF EXISTS "enquiry" CASCADE;
DROP TABLE IF EXISTS "bookingHistory" CASCADE;
DROP TABLE IF EXISTS "serviceTracking" CASCADE;
DROP TABLE IF EXISTS "feedback" CASCADE;
DROP TABLE IF EXISTS "refund" CASCADE;
DROP TABLE IF EXISTS "payment" CASCADE;
DROP TABLE IF EXISTS "invoice" CASCADE;
DROP TABLE IF EXISTS "advertisementClick" CASCADE;
DROP TABLE IF EXISTS "advertisementImpression" CASCADE;
DROP TABLE IF EXISTS "advertisement" CASCADE;
DROP TABLE IF EXISTS "advertisementCampaign" CASCADE;
DROP TABLE IF EXISTS "advertisementPlacement" CASCADE;
DROP TABLE IF EXISTS "timeSlot" CASCADE;
DROP TABLE IF EXISTS "booking" CASCADE;
DROP TABLE IF EXISTS "servicePackageItem" CASCADE;
DROP TABLE IF EXISTS "servicePackage" CASCADE;
DROP TABLE IF EXISTS "vehicle" CASCADE;
DROP TABLE IF EXISTS "service" CASCADE;
DROP TABLE IF EXISTS "serviceCategory" CASCADE;
DROP TABLE IF EXISTS "technician" CASCADE;
DROP TABLE IF EXISTS "customer" CASCADE;
DROP TABLE IF EXISTS "advertiser" CASCADE;
DROP TABLE IF EXISTS "manager" CASCADE;
DROP TABLE IF EXISTS "user" CASCADE;
DROP TABLE IF EXISTS "systemSettings" CASCADE;
DROP TABLE IF EXISTS "report" CASCADE;

-- ============================================================
-- SCHEMA DEFINITIONS 
-- ============================================================

-- ============================================================
-- CHAPTER 1: USER & IDENTITY MANAGEMENT
-- ============================================================

CREATE TABLE "user" (
    "userId" SERIAL PRIMARY KEY,
    "userEmail" VARCHAR(255) UNIQUE NOT NULL,
    "userPassword" VARCHAR(255) NOT NULL,
    "userRole" VARCHAR(50) NOT NULL CHECK ("userRole" IN ('customer', 'advertiser', 'technician', 'manager', 'admin')),
    "userIsActive" BOOLEAN DEFAULT TRUE,
    "userCreatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "customer" (
    "customerId" SERIAL PRIMARY KEY,
    "customerFirstName" VARCHAR(100) NOT NULL,
    "customerLastName" VARCHAR(100) NOT NULL,
    "customerPhone" VARCHAR(20),
    "customerAddress" TEXT,
    "userId" INTEGER UNIQUE NOT NULL,
    "customerCreatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("userId") REFERENCES "user"("userId") ON DELETE CASCADE
);

CREATE TABLE "advertiser" (
    "advertiserId" SERIAL PRIMARY KEY,
    "advertiserBusinessName" VARCHAR(255) NOT NULL,
    "advertiserContactPerson" VARCHAR(100),
    "advertiserPhone" VARCHAR(20),
    "advertiserAddress" TEXT,
    "userId" INTEGER UNIQUE NOT NULL,
    "advertiserCreatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("userId") REFERENCES "user"("userId") ON DELETE CASCADE
);

CREATE TABLE "technician" (
    "technicianId" SERIAL PRIMARY KEY,
    "technicianFirstName" VARCHAR(100) NOT NULL,
    "technicianLastName" VARCHAR(100) NOT NULL,
    "technicianPhone" VARCHAR(20),
    "technicianSpecialization" VARCHAR(100),
    "userId" INTEGER UNIQUE NOT NULL,
    "technicianCreatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("userId") REFERENCES "user"("userId") ON DELETE CASCADE
);

CREATE TABLE "manager" (
    "managerId" SERIAL PRIMARY KEY,
    "managerFirstName" VARCHAR(100) NOT NULL,
    "managerLastName" VARCHAR(100) NOT NULL,
    "managerPhone" VARCHAR(20),
    "userId" INTEGER UNIQUE NOT NULL,
    "managerCreatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("userId") REFERENCES "user"("userId") ON DELETE CASCADE
);

-- ============================================================
-- CHAPTER 2: SERVICE & PACKAGE MANAGEMENT
-- ============================================================

CREATE TABLE "serviceCategory" (
    "serviceCategoryId" SERIAL PRIMARY KEY,
    "serviceCategoryName" VARCHAR(100) UNIQUE NOT NULL,
    "serviceCategoryDescription" TEXT,
    "serviceCategoryCreatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "service" (
    "serviceId" SERIAL PRIMARY KEY,
    "serviceName" VARCHAR(255) UNIQUE NOT NULL,
    "serviceDescription" TEXT,
    "serviceDuration" INTEGER NOT NULL,
    "servicePrice" DECIMAL(10, 2) NOT NULL,
    "serviceCategoryId" INTEGER,
    "serviceIsActive" BOOLEAN DEFAULT TRUE,
    "serviceCreatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("serviceCategoryId") REFERENCES "serviceCategory"("serviceCategoryId") ON DELETE SET NULL
);

CREATE TABLE "servicePackage" (
    "servicePackageId" SERIAL PRIMARY KEY,
    "servicePackageName" VARCHAR(255) UNIQUE NOT NULL,
    "servicePackageDescription" TEXT,
    "servicePackagePrice" DECIMAL(10, 2) NOT NULL,
    "servicePackageIsActive" BOOLEAN DEFAULT TRUE,
    "servicePackageUpdatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "servicePackageCreatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "servicePackageItem" (
    "servicePackageItemId" SERIAL PRIMARY KEY,
    "servicePackageId" INTEGER NOT NULL,
    "serviceId" INTEGER NOT NULL,
    FOREIGN KEY ("servicePackageId") REFERENCES "servicePackage"("servicePackageId") ON DELETE CASCADE,
    FOREIGN KEY ("serviceId") REFERENCES "service"("serviceId") ON DELETE CASCADE
);

-- ============================================================
-- CHAPTER 3: CUSTOMER VEHICLE ASSETS
-- ============================================================

CREATE TABLE "vehicle" (
    "vehicleId" SERIAL PRIMARY KEY,
    "vehicleMake" VARCHAR(100) NOT NULL,
    "vehicleModel" VARCHAR(100) NOT NULL,
    "vehicleRegNumber" VARCHAR(50) UNIQUE NOT NULL,
    "customerId" INTEGER NOT NULL,
    "vehicleCreatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("customerId") REFERENCES "customer"("customerId") ON DELETE CASCADE
);

-- ============================================================
-- CHAPTER 4: BOOKING & APPOINTMENT SYSTEM
-- ============================================================

CREATE TABLE "timeSlot" (
    "timeSlotId" SERIAL PRIMARY KEY,
    "timeSlotStartTime" TIME NOT NULL UNIQUE,
    "timeSlotEndTime" TIME NOT NULL,
    "timeSlotMaxCapacity" INTEGER DEFAULT 2,
    "timeSlotIsActive" BOOLEAN DEFAULT TRUE,
    "timeSlotCreatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "booking" (
    "bookingId" SERIAL PRIMARY KEY,
    "bookingDate" DATE NOT NULL,
    "bookingStartTime" TIME NOT NULL,
    "bookingEndTime" TIME NOT NULL,
    "bookingStatus" VARCHAR(50) DEFAULT 'pending' CHECK ("bookingStatus" IN ('pending', 'accepted', 'in_progress', 'completed', 'cancelled', 'rejected')),
    "bookingCustomerNotes" TEXT,
    "bookingTechnicianNotes" TEXT,
    "bookingRefNumber" VARCHAR(50) UNIQUE NOT NULL,
    "customerId" INTEGER NOT NULL,
    "vehicleId" INTEGER NOT NULL,
    "serviceId" INTEGER,
    "servicePackageId" INTEGER,
    "technicianId" INTEGER,
    "timeSlotId" INTEGER,
    "bookingCreatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("customerId") REFERENCES "customer"("customerId") ON DELETE CASCADE,
    FOREIGN KEY ("vehicleId") REFERENCES "vehicle"("vehicleId") ON DELETE CASCADE,
    FOREIGN KEY ("serviceId") REFERENCES "service"("serviceId") ON DELETE CASCADE,
    FOREIGN KEY ("servicePackageId") REFERENCES "servicePackage"("servicePackageId") ON DELETE CASCADE,
    FOREIGN KEY ("technicianId") REFERENCES "technician"("technicianId") ON DELETE SET NULL,
    FOREIGN KEY ("timeSlotId") REFERENCES "timeSlot"("timeSlotId") ON DELETE SET NULL,
    CHECK (("serviceId" IS NOT NULL AND "servicePackageId" IS NULL) OR ("serviceId" IS NULL AND "servicePackageId" IS NOT NULL))
);

CREATE TABLE "serviceTracking" (
    "serviceTrackingId" SERIAL PRIMARY KEY,
    "serviceTrackingStatus" VARCHAR(50) NOT NULL,
    "bookingId" INTEGER NOT NULL,
    "serviceTrackingCreatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("bookingId") REFERENCES "booking"("bookingId") ON DELETE CASCADE
);

CREATE TABLE "bookingHistory" (
    "bookingHistoryId" SERIAL PRIMARY KEY,
    "bookingHistoryAction" VARCHAR(100) NOT NULL,
    "bookingId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "bookingHistoryCreatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("bookingId") REFERENCES "booking"("bookingId") ON DELETE CASCADE,
    FOREIGN KEY ("userId") REFERENCES "user"("userId") ON DELETE CASCADE
);

-- ============================================================
-- CHAPTER 5: QUALITY ASSURANCE & FEEDBACK
-- ============================================================

CREATE TABLE "feedback" (
    "feedbackId" SERIAL PRIMARY KEY,
    "feedbackRating" INTEGER NOT NULL CHECK ("feedbackRating" >= 1 AND "feedbackRating" <= 5),
    "feedbackComment" TEXT,
    "customerId" INTEGER NOT NULL,
    "bookingId" INTEGER UNIQUE NOT NULL,
    "technicianId" INTEGER,
    "feedbackCreatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("customerId") REFERENCES "customer"("customerId") ON DELETE CASCADE,
    FOREIGN KEY ("bookingId") REFERENCES "booking"("bookingId") ON DELETE CASCADE,
    FOREIGN KEY ("technicianId") REFERENCES "technician"("technicianId") ON DELETE SET NULL
);

-- ============================================================
-- CHAPTER 6: MARKETING & ADVERTISEMENT SYSTEM
-- ============================================================

CREATE TABLE "advertisementPlacement" (
    "advertisementPlacementId" SERIAL PRIMARY KEY,
    "advertisementPlacementSlug" VARCHAR(100) UNIQUE NOT NULL,
    "advertisementPlacementName" VARCHAR(150) UNIQUE NOT NULL,
    "advertisementPlacementPage" VARCHAR(50) NOT NULL,
    "advertisementPlacementPosition" VARCHAR(50) NOT NULL,
    "advertisementPlacementDescription" TEXT,
    "advertisementPlacementWidth" INTEGER,
    "advertisementPlacementHeight" INTEGER,
    "advertisementPlacementPrice" DECIMAL(10, 2) NOT NULL,
    "advertisementPlacementIsFixed" BOOLEAN DEFAULT TRUE,
    "advertisementPlacementCreatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "advertisementCampaign" (
    "advertisementCampaignId" SERIAL PRIMARY KEY,
    "advertisementCampaignName" VARCHAR(255) NOT NULL,
    "advertisementCampaignStartDate" DATE NOT NULL,
    "advertisementCampaignEndDate" DATE NOT NULL,
    "advertisementCampaignStatus" VARCHAR(50) DEFAULT 'pending' CHECK ("advertisementCampaignStatus" IN ('pending', 'active', 'paused', 'completed', 'cancelled')),
    "advertiserId" INTEGER NOT NULL,
    "advertisementCampaignCreatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("advertiserId") REFERENCES "advertiser"("advertiserId") ON DELETE CASCADE,
    CHECK ("advertisementCampaignEndDate" > "advertisementCampaignStartDate")
);

CREATE TABLE "advertisement" (
    "advertisementId" SERIAL PRIMARY KEY,
    "advertisementTitle" VARCHAR(255) NOT NULL,
    "advertisementImageUrl" TEXT,
    "advertisementStartDate" DATE NOT NULL,
    "advertisementEndDate" DATE NOT NULL,
    "advertisementStatus" VARCHAR(50) DEFAULT 'pending' CHECK ("advertisementStatus" IN ('pending', 'active', 'expired', 'rejected')),
    "advertiserId" INTEGER NOT NULL,
    "advertisementPlacementId" INTEGER,
    "advertisementCampaignId" INTEGER,
    "advertisementCreatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("advertiserId") REFERENCES "advertiser"("advertiserId") ON DELETE CASCADE,
    FOREIGN KEY ("advertisementPlacementId") REFERENCES "advertisementPlacement"("advertisementPlacementId") ON DELETE SET NULL,
    FOREIGN KEY ("advertisementCampaignId") REFERENCES "advertisementCampaign"("advertisementCampaignId") ON DELETE SET NULL,
    CHECK ("advertisementEndDate" > "advertisementStartDate")
);

CREATE TABLE "advertisementImpression" (
    "advertisementImpressionId" SERIAL PRIMARY KEY,
    "advertisementId" INTEGER NOT NULL,
    "advertisementImpressionCreatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("advertisementId") REFERENCES "advertisement"("advertisementId") ON DELETE CASCADE
);

CREATE TABLE "advertisementClick" (
    "advertisementClickId" SERIAL PRIMARY KEY,
    "advertisementId" INTEGER NOT NULL,
    "advertisementClickCreatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("advertisementId") REFERENCES "advertisement"("advertisementId") ON DELETE CASCADE
);

-- ============================================================
-- CHAPTER 7: FINANCIAL BILLING & ACCOUNTING
-- ============================================================

CREATE TABLE "invoice" (
    "invoiceId" SERIAL PRIMARY KEY,
    "invoiceNumber" VARCHAR(50) UNIQUE NOT NULL,
    "invoiceAmount" DECIMAL(10, 2) NOT NULL,
    "invoiceStatus" VARCHAR(50) DEFAULT 'pending' CHECK ("invoiceStatus" IN ('pending', 'paid', 'cancelled', 'refunded')),
    "bookingId" INTEGER,
    "advertisementId" INTEGER,
    "invoiceCreatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("bookingId") REFERENCES "booking"("bookingId") ON DELETE SET NULL,
    FOREIGN KEY ("advertisementId") REFERENCES "advertisement"("advertisementId") ON DELETE SET NULL,
    CONSTRAINT chk_invoice_target CHECK ("bookingId" IS NOT NULL OR "advertisementId" IS NOT NULL)
);

CREATE TABLE "payment" (
    "paymentId" SERIAL PRIMARY KEY,
    "paymentAmount" DECIMAL(10, 2) NOT NULL,
    "paymentMethod" VARCHAR(50),
    "paymentStatus" VARCHAR(50) DEFAULT 'pending' CHECK ("paymentStatus" IN ('pending', 'completed', 'failed')),
    "paymentDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "paymentReference" VARCHAR(100),
    "invoiceId" INTEGER NOT NULL,
    "paymentCreatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("invoiceId") REFERENCES "invoice"("invoiceId") ON DELETE CASCADE
);

CREATE TABLE "refund" (
    "refundId" SERIAL PRIMARY KEY,
    "refundAmount" DECIMAL(10, 2) NOT NULL,
    "refundReason" TEXT,
    "refundStatus" VARCHAR(50) DEFAULT 'pending' CHECK ("refundStatus" IN ('pending', 'completed', 'rejected')),
    "refundDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "invoiceId" INTEGER,
    "refundCreatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("invoiceId") REFERENCES "invoice"("invoiceId") ON DELETE SET NULL
);

-- ============================================================
-- CHAPTER 8: INTERNAL OPERATIONS & ANALYTICS
-- ============================================================

CREATE TABLE "systemSettings" (
    "settingId" SERIAL PRIMARY KEY,
    "settingKey" VARCHAR(100) UNIQUE NOT NULL,
    "settingValue" TEXT NOT NULL,
    "settingUpdatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "report" (
    "reportId" SERIAL PRIMARY KEY,
    "reportType" VARCHAR(50) NOT NULL,
    "reportStartDate" DATE,
    "reportEndDate" DATE,
    "reportData" JSONB NOT NULL,
    "userId" INTEGER NOT NULL,
    "reportCreatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("userId") REFERENCES "user"("userId") ON DELETE CASCADE
);

-- ============================================================
-- CHAPTER 9: COMMUNICATION & SUPPORT
-- ============================================================

CREATE TABLE "notification" (
    "notificationId" SERIAL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    "notificationTitle" VARCHAR(255),
    "notificationMessage" TEXT NOT NULL,
    "notificationType" VARCHAR(50) DEFAULT 'info' CHECK ("notificationType" IN ('info', 'success', 'warning', 'error')),
    "notificationChannel" VARCHAR(50) DEFAULT 'in_app' CHECK ("notificationChannel" IN ('in_app', 'sms', 'whatsapp')),
    "notificationIsRead" BOOLEAN DEFAULT FALSE,
    "notificationCreatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("userId") REFERENCES "user"("userId") ON DELETE CASCADE
);

CREATE TABLE "complaint" (
    "complaintId" SERIAL PRIMARY KEY,
    "complaintTitle" VARCHAR(255) NOT NULL,
    "complaintDescription" TEXT NOT NULL,
    "complaintPriority" VARCHAR(50) DEFAULT 'medium' CHECK ("complaintPriority" IN ('low', 'medium', 'high')),
    "complaintStatus" VARCHAR(50) DEFAULT 'open' CHECK ("complaintStatus" IN ('open', 'in_progress', 'resolved', 'closed')),
    "complaintManagerResponse" TEXT,
    "customerId" INTEGER NOT NULL,
    "bookingId" INTEGER,
    "complaintCreatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "complaintResolvedAt" TIMESTAMP,
    FOREIGN KEY ("customerId") REFERENCES "customer"("customerId") ON DELETE CASCADE,
    FOREIGN KEY ("bookingId") REFERENCES "booking"("bookingId") ON DELETE SET NULL
);

CREATE TABLE "enquiry" (
    "enquiryId" SERIAL PRIMARY KEY,
    "enquiryName" VARCHAR(255) NOT NULL,
    "enquiryEmail" VARCHAR(255) NOT NULL,
    "enquiryPhone" VARCHAR(20),
    "enquirySubject" VARCHAR(255),
    "enquiryMessage" TEXT NOT NULL,
    "enquiryStatus" VARCHAR(50) DEFAULT 'new' CHECK ("enquiryStatus" IN ('new', 'read', 'replied')),
    "enquiryCreatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_user_email ON "user"("userEmail");
CREATE INDEX idx_booking_date ON "booking"("bookingDate");
CREATE INDEX idx_booking_status ON "booking"("bookingStatus");
CREATE INDEX idx_ad_status ON "advertisement"("advertisementStatus");

-- ============================================================
-- DUMMY DATA (SEED)
-- ============================================================

-- 1. System Settings
INSERT INTO "systemSettings" ("settingKey", "settingValue") VALUES
('contact_address', '123 Automotive Way, Colombo 07, Sri Lanka'),
('contact_phone', '+94 11 234 5678'),
('contact_email', 'contact@seatslabs.com'),
('contact_opening_hours', 'Mon - Sat: 8:00 AM - 6:00 PM'),
('tax_rate', '0.08'),
('currency', 'LKR');

-- 2. Users (Passwords are 'password123' hashed)
-- Admin
INSERT INTO "user" ("userEmail", "userPassword", "userRole") VALUES
('admin@seatslabs.com', '$2b$10$UrfFR8KQXvqgzGIjRrceROXyurKEpTkELikFjauEe6yGg63itTi5ky', 'admin'),
('manager@seatslabs.com', '$2b$10$UrfFR8KQXvqgzGIjRrceROXyurKEpTkELikFjauEe6yGg63itTi5ky', 'manager'),
('tech1@seatslabs.com', '$2b$10$UrfFR8KQXvqgzGIjRrceROXyurKEpTkELikFjauEe6yGg63itTi5ky', 'technician'),
('tech2@seatslabs.com', '$2b$10$UrfFR8KQXvqgzGIjRrceROXyurKEpTkELikFjauEe6yGg63itTi5ky', 'technician'),
('saman@example.lk', '$2b$10$UrfFR8KQXvqgzGIjRrceROXyurKEpTkELikFjauEe6yGg63itTi5ky', 'customer'),
('kamal@example.lk', '$2b$10$UrfFR8KQXvqgzGIjRrceROXyurKEpTkELikFjauEe6yGg63itTi5ky', 'customer'),
('nimal@example.lk', '$2b$10$UrfFR8KQXvqgzGIjRrceROXyurKEpTkELikFjauEe6yGg63itTi5ky', 'customer'),
('toyota@advertiser.com', '$2b$10$UrfFR8KQXvqgzGIjRrceROXyurKEpTkELikFjauEe6yGg63itTi5ky', 'advertiser'),
('dialog@advertiser.com', '$2b$10$UrfFR8KQXvqgzGIjRrceROXyurKEpTkELikFjauEe6yGg63itTi5ky', 'advertiser');

-- 3. Profile Data
INSERT INTO "manager" ("managerFirstName", "managerLastName", "managerPhone", "userId") VALUES 
('Main', 'Manager', '0771112223', 2);

INSERT INTO "technician" ("technicianFirstName", "technicianLastName", "technicianPhone", "technicianSpecialization", "userId") VALUES
('Suresh', 'Gamage', '0774445556', 'Hybrid Battery Systems', 3),
('Dhammika', 'Perera', '0777778889', 'Engine Diagnostics', 4);

INSERT INTO "customer" ("customerFirstName", "customerLastName", "customerPhone", "customerAddress", "userId") VALUES
('Saman', 'Perera', '0770001112', '45 Galle Road, Colombo 03', 5),
('Kamal', 'Silva', '0772223334', '12 Kandy Road, Kiribathgoda', 6),
('Nimal', 'Sirisena', '0714445556', '78 Negombo Road, Ja-Ela', 7);

INSERT INTO "advertiser" ("advertiserBusinessName", "advertiserContactPerson", "advertiserPhone", "advertiserAddress", "userId") VALUES
('Toyota Lanka', 'Kasun Abey', '0112344556', 'Wattala, Sri Lanka', 8),
('Dialog Axiata', 'Sarah Fernando', '0117778889', 'Union Place, Colombo 02', 9);

-- 4. Service Metadata
INSERT INTO "serviceCategory" ("serviceCategoryName", "serviceCategoryDescription") VALUES
('Maintenance', 'Periodic preventive maintenance'),
('Repair', 'Mechanical and electrical repairs'),
('Diagnostics', 'Advanced scanning and issue detection'),
('Cosmetic', 'Painting and detailing');

INSERT INTO "service" ("serviceName", "serviceDescription", "serviceDuration", "servicePrice", "serviceCategoryId") VALUES
('Full Lubrication Service', 'Oil, filter, and 25-point check', 60, 18500.00, 1),
('Hybrid Battery Health Check', 'Cell balancing and health report', 90, 12500.00, 3),
('Brake Pad Replacement', 'Front/Rear brake pad fitting', 60, 15500.00, 2),
('AC Full Service', 'Gas charging and evaporator cleaning', 120, 22000.00, 2),
('Computerized Scanning', 'Full system fault detection', 30, 4500.00, 3);

INSERT INTO "servicePackage" ("servicePackageName", "servicePackageDescription", "servicePackagePrice") VALUES
('Premium Care Plus', 'Full Service + Scanning + AC Check', 42000.00),
('Safety Check Bundle', 'Brake Check + Tire Rotation', 12000.00);

INSERT INTO "servicePackageItem" ("servicePackageId", "serviceId") VALUES
(1, 1), (1, 5), (1, 4), -- Premium Care
(2, 3); -- Safety Bundle

-- 5. Vehicles
INSERT INTO "vehicle" ("vehicleMake", "vehicleModel", "vehicleRegNumber", "customerId") VALUES
('Toyota', 'Prius', 'KY-1234', 1),
('Honda', 'Vezel', 'CAS-5678', 2),
('Nissan', 'Leaf', 'KP-9012', 3),
('Toyota', 'Aqua', 'CAH-3344', 1);

-- 6. Time Slots (08:00 AM to 04:00 PM)
INSERT INTO "timeSlot" ("timeSlotStartTime", "timeSlotEndTime", "timeSlotMaxCapacity") VALUES
('08:00:00', '09:00:00', 3),
('09:00:00', '10:00:00', 3),
('10:00:00', '11:00:00', 3),
('11:00:00', '12:00:00', 3),
('13:00:00', '14:00:00', 3),
('14:00:00', '15:00:00', 3),
('15:00:00', '16:00:00', 3);

-- 7. Bookings
-- Completed Booking
INSERT INTO "booking" ("bookingDate", "bookingStartTime", "bookingEndTime", "bookingStatus", "bookingRefNumber", "customerId", "vehicleId", "serviceId", "technicianId", "timeSlotId") VALUES
(CURRENT_DATE - INTERVAL '5 days', '09:00:00', '10:00:00', 'completed', 'REF-0001', 1, 1, 1, 1, 2);

-- In Progress
INSERT INTO "booking" ("bookingDate", "bookingStartTime", "bookingEndTime", "bookingStatus", "bookingRefNumber", "customerId", "vehicleId", "serviceId", "technicianId", "timeSlotId") VALUES
(CURRENT_DATE, '10:00:00', '11:00:00', 'in_progress', 'REF-0002', 2, 2, 2, 1, 3);

-- Future Pending
INSERT INTO "booking" ("bookingDate", "bookingStartTime", "bookingEndTime", "bookingStatus", "bookingRefNumber", "customerId", "vehicleId", "serviceId", "timeSlotId") VALUES
(CURRENT_DATE + INTERVAL '2 days', '13:00:00', '14:00:00', 'pending', 'REF-0003', 3, 3, 3, 5);

-- 8. Tracking & Feedback
INSERT INTO "serviceTracking" ("serviceTrackingStatus", "bookingId") VALUES
('started', 1), ('completed', 1),
('started', 2);

INSERT INTO "feedback" ("feedbackRating", "feedbackComment", "customerId", "bookingId", "technicianId") VALUES
(5, 'Excellent service on my Prius!', 1, 1, 1);

-- 9. Advertisements
INSERT INTO "advertisementPlacement" ("advertisementPlacementSlug", "advertisementPlacementName", "advertisementPlacementPage", "advertisementPlacementPosition", "advertisementPlacementDescription", "advertisementPlacementWidth", "advertisementPlacementHeight", "advertisementPlacementPrice") VALUES
('home_top', 'Home Hero Banner', 'home', 'top', 'Top display', 1200, 400, 15000.00),
('services_side', 'Service Sidebar', 'services', 'right', 'Lateral ad', 300, 600, 8000.00);

INSERT INTO "advertisementCampaign" ("advertisementCampaignName", "advertisementCampaignStartDate", "advertisementCampaignEndDate", "advertisementCampaignStatus", "advertiserId") VALUES
('Toyota Spring Sale', CURRENT_DATE - INTERVAL '10 days', CURRENT_DATE + INTERVAL '20 days', 'active', 1);

INSERT INTO "advertisement" ("advertisementTitle", "advertisementImageUrl", "advertisementStartDate", "advertisementEndDate", "advertisementStatus", "advertiserId", "advertisementPlacementId", "advertisementCampaignId") VALUES
('New GR Sport Parts', 'https://example.com/ad1.jpg', CURRENT_DATE - INTERVAL '5 days', CURRENT_DATE + INTERVAL '10 days', 'active', 1, 1, 1);

INSERT INTO "advertisementImpression" ("advertisementId") VALUES (1), (1), (1);
INSERT INTO "advertisementClick" ("advertisementId") VALUES (1);

-- 10. Financials
INSERT INTO "invoice" ("invoiceNumber", "invoiceAmount", "invoiceStatus", "bookingId", "advertisementId") VALUES
('INV-1001', 18500.00, 'paid', 1, NULL),
('INV-1002', 12500.00, 'pending', 2, NULL),
('INV-AD-2001', 15000.00, 'paid', NULL, 1);

INSERT INTO "payment" ("paymentAmount", "paymentMethod", "paymentStatus", "invoiceId") VALUES
(18500.00, 'Card', 'completed', 1),
(15000.00, 'Bank Transfer', 'completed', 3);

-- 11. Maintenance & Support
INSERT INTO "complaint" ("complaintTitle", "complaintDescription", "complaintPriority", "complaintStatus", "customerId", "bookingId") VALUES
('Oil Leak Detected', 'Seeing small oil spots after service', 'high', 'open', 1, 1);

INSERT INTO "enquiry" ("enquiryName", "enquiryEmail", "enquiryPhone", "enquirySubject", "enquiryMessage") VALUES
('Kasun Jay', 'kasun@web.com', '0771239988', 'Spare Parts', 'Do you have Vezel hybrid filters in stock?');

INSERT INTO "notification" ("userId", "notificationTitle", "notificationMessage", "notificationType") VALUES
(1, 'System Ready', 'SeatsLabs database migration successful.', 'success'),
(5, 'Booking Confirmed', 'Your booking REF-0001 is ready for service.', 'info');

-- ============================================================
-- END OF SQL
-- ============================================================
