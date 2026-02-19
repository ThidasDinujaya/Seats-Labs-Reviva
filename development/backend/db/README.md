# SeatsLabs Database Setup Guide

## 📊 Database Information

- **Database Name:** `seatslabs`
- **Database Type:** PostgreSQL
- **Schema File:** `seatslabs_db.sql`
- **Total Tables:** 28 tables
- **Seed Data:** Included (services, categories, admin user, dummy data)

---

## 🚀 Quick Setup

### **Option 1: Using psql Command Line**

```bash
# 1. Create the database
psql -U postgres -c "CREATE DATABASE seatslabs;"

# 2. Run the schema file
psql -U postgres -d seatslabs -f seatslabs_db.sql

# 3. Verify tables were created
psql -U postgres -d seatslabs -c "\dt"
```

### **Option 2: Using pgAdmin**

1. Open pgAdmin
2. Right-click on "Databases" → Create → Database
3. Name: `seatslabs`
4. Right-click on `seatslabs` → Query Tool
5. Open `seatslabs_db.sql` file
6. Click Execute (F5)

### **Option 3: Using DBeaver/DataGrip**

1. Create new database connection to PostgreSQL
2. Create database named `seatslabs`
3. Open SQL Editor
4. Load `seatslabs_db.sql` file
5. Execute the script

---

## 📋 Database Schema Overview

### **Core Tables**

| Table        | Purpose                      | Records      |
| ------------ | ---------------------------- | ------------ |
| `user`       | Authentication for all users | Base table   |
| `customer`   | Customer profiles            | Extends user |
| `advertiser` | Business advertisers         | Extends user |
| `technician` | Workshop staff               | Extends user |

### **Service Management**

| Table             | Purpose                                        |
| ----------------- | ---------------------------------------------- |
| `serviceCategory` | Service categories (Maintenance, Repair, etc.) |
| `service`         | Available services with pricing                |
| `vehicle`         | Customer vehicles                              |
| `booking`         | Service bookings                               |
| `serviceTracking` | Booking progress tracking                      |
| `bookingHistory`  | Audit trail for bookings                       |

### **Feedback System**

| Table      | Purpose                      |
| ---------- | ---------------------------- |
| `feedback` | Customer ratings and reviews |

### **Advertisement System**

| Table                     | Purpose                |
| ------------------------- | ---------------------- |
| `advertisementPlacement`  | Ad placement locations |
| `advertisement`           | Advertiser campaigns   |
| `advertisementImpression` | Ad view tracking       |
| `advertisementClick`      | Ad click tracking      |

### **Financial**

| Table     | Purpose                 |
| --------- | ----------------------- |
| `invoice` | Service and ad invoices |
| `payment` | Payment records         |

### **Reporting**

| Table    | Purpose                                   |
| -------- | ----------------------------------------- |
| `report` | Generated business reports (JSON storage) |

---

## 🔑 Relationships

```
user (1) ──→ (1) customer
user (1) ──→ (1) advertiser
user (1) ──→ (1) technician

customer (1) ──→ (many) vehicle
customer (1) ──→ (many) booking
customer (1) ──→ (many) feedback

service (1) ──→ (many) booking
vehicle (1) ──→ (many) booking
technician (1) ──→ (many) booking

booking (1) ──→ (1) feedback
booking (1) ──→ (many) serviceTracking
booking (1) ──→ (many) bookingHistory

advertiser (1) ──→ (many) advertisement
advertisement (1) ──→ (many) advertisementImpression
advertisement (1) ──→ (many) advertisementClick
```

---

## 🌱 Seed Data Included

### **Service Categories (4)**

- Maintenance
- Repair
- Inspection
- Detailing

### **Services (10)**

- Oil Change - LKR 2,500
- Brake Inspection - LKR 3,500
- Tire Rotation - LKR 1,500
- Engine Diagnostic - LKR 4,500
- Battery Replacement - LKR 8,000
- Air Filter Replacement - LKR 1,200
- Wheel Alignment - LKR 5,000
- Full Service - LKR 12,000
- AC Service - LKR 6,500
- Car Wash & Wax - LKR 2,000

### **Advertisement Placements (4)**

- Homepage Banner - LKR 5,000
- Sidebar - LKR 2,500
- Footer - LKR 1,500
- Booking Page - LKR 3,500

### **Admin User**

- **Email:** `admin@seatslabs.com`
- **Password:** `admin123`
- **Role:** admin

---

## 🔍 Verify Installation

### **Check All Tables**

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

### **Check Seed Data**

```sql
-- Check services
SELECT * FROM "service";

-- Check service categories
SELECT * FROM "serviceCategory";

-- Check admin user
SELECT "userId", "userEmail", "userRole" FROM "user";
```

### **Check Table Counts**

```sql
SELECT
    'serviceCategory' as table_name, COUNT(*) as count FROM "serviceCategory"
UNION ALL
SELECT 'service', COUNT(*) FROM "service"
UNION ALL
SELECT 'advertisementPlacement', COUNT(*) FROM "advertisementPlacement"
UNION ALL
SELECT 'user', COUNT(*) FROM "user";
```

Expected output:

```
table_name              | count
------------------------+-------
serviceCategory         |     4
service                 |    10
advertisementPlacement  |     4
user                    |     1
```

---

## 🛠️ Database Features

### **Indexes**

- Optimized for common queries
- Email lookups (user login)
- Booking date searches
- Status filtering
- Foreign key relationships

### **Constraints**

- Primary keys on all tables
- Foreign key relationships
- Check constraints for enums
- Unique constraints where needed
- Date validation (end > start)

### **Triggers**

- Auto-update `updatedAt` timestamps
- Maintains data consistency

### **Views**

- `vw_booking_details` - Complete booking information with joins

---

## 📝 Common Queries

### **Get All Active Services**

```sql
SELECT * FROM "service"
WHERE "serviceIsActive" = true
ORDER BY "serviceName";
```

### **Get Today's Bookings**

```sql
SELECT * FROM "vw_booking_details"
WHERE "bookingDate" = CURRENT_DATE
ORDER BY "bookingStartTime";
```

### **Get Customer with Vehicles**

```sql
SELECT
    c.*,
    json_agg(v.*) as vehicles
FROM "customer" c
LEFT JOIN "vehicle" v ON c."customerId" = v."vehicleCustomerId"
WHERE c."customerId" = 1
GROUP BY c."customerId";
```

### **Get Service Statistics**

```sql
SELECT
    s."serviceName",
    COUNT(b."bookingId") as total_bookings,
    SUM(s."servicePrice") as total_revenue
FROM "service" s
LEFT JOIN "booking" b ON s."serviceId" = b."bookingServiceId"
WHERE b."bookingStatus" = 'completed'
GROUP BY s."serviceId", s."serviceName"
ORDER BY total_revenue DESC;
```

---

## 🔄 Update Database

If you need to update the schema:

```bash
# Backup existing data
pg_dump -U postgres seatslabs > backup.sql

# Drop and recreate
psql -U postgres -c "DROP DATABASE seatslabs;"
psql -U postgres -c "CREATE DATABASE seatslabs;"
psql -U postgres -d seatslabs -f seatslabs_db.sql

# Restore data if needed
psql -U postgres -d seatslabs -f backup.sql
```

---

## 🧪 Test Data Creation

### **Create Test Customer**

```sql
-- 1. Create user
INSERT INTO "user" ("userEmail", "userPassword", "userRole")
VALUES ('john@example.com', '$2b$10$hashedpassword', 'customer')
RETURNING "userId";

-- 2. Create customer (use userId from above)
INSERT INTO "customer" ("customerFirstName", "customerLastName", "customerPhone", "customerAddress", "customerUserId")
VALUES ('John', 'Doe', '0771234567', '123 Main St, Colombo', 1);

-- 3. Create vehicle
INSERT INTO "vehicle" ("vehicleMake", "vehicleModel", "vehicleYear", "vehicleRegNumber", "vehicleCustomerId")
VALUES ('Toyota', 'Corolla', 2020, 'ABC-1234', 1);
```

### **Create Test Booking**

```sql
INSERT INTO "booking" (
    "bookingDate",
    "bookingStartTime",
    "bookingEndTime",
    "bookingRefNumber",
    "bookingCustomerId",
    "bookingVehicleId",
    "bookingServiceId"
) VALUES (
    '2025-03-15',
    '09:00',
    '09:30',
    'SL-20250315-1234',
    1,
    1,
    1
);
```

---

## 🔐 Security Notes

1. **Admin Password:** Change the default admin password immediately after setup
2. **User Passwords:** All passwords should be hashed with bcrypt (salt rounds: 10)
3. **Database User:** Create a dedicated database user for the application (don't use postgres)

### **Create Application Database User**

```sql
CREATE USER seatslabs_app WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE seatslabs TO seatslabs_app;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO seatslabs_app;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO seatslabs_app;
```

Then update `.env`:

```
DB_USER=seatslabs_app
DB_PASSWORD=your_secure_password
```

---

## 📊 Database Size Estimates

| Component        | Estimated Size |
| ---------------- | -------------- |
| Empty Schema     | ~100 KB        |
| With Seed Data   | ~150 KB        |
| 1,000 Bookings   | ~500 KB        |
| 10,000 Bookings  | ~5 MB          |
| 100,000 Bookings | ~50 MB         |

---

## 🐛 Troubleshooting

### **Error: Database already exists**

```bash
psql -U postgres -c "DROP DATABASE seatslabs;"
psql -U postgres -c "CREATE DATABASE seatslabs;"
```

### **Error: Permission denied**

```bash
# Grant permissions
psql -U postgres -d seatslabs -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_user;"
```

### **Error: Connection refused**

```bash
# Check if PostgreSQL is running
sudo service postgresql status

# Start PostgreSQL
sudo service postgresql start
```

---

## ✅ Checklist

- [ ] PostgreSQL installed and running
- [ ] Database `seatslabs` created
- [ ] Schema file executed successfully
- [ ] All 28 tables created
- [ ] Seed data loaded (Categories, services, admin, dummy data)
- [ ] `.env` file configured with correct database credentials
- [ ] Backend server can connect to database
- [ ] Test API endpoints work

---

## 📞 Support

If you encounter issues:

1. Check PostgreSQL is running: `pg_isready`
2. Verify database exists: `psql -U postgres -l | grep seatslabs`
3. Check table count: Should be 18 tables
4. Review error logs in terminal

---

**🎉 Database setup complete! Your SeatsLabs backend is ready to use!**
