-- CarRental Supabase Schema
-- Run this in your Supabase SQL Editor

-- Admin table
CREATE TABLE IF NOT EXISTS admin (
  id SERIAL PRIMARY KEY,
  "UserName" VARCHAR(100) NOT NULL,
  "Password" VARCHAR(255) NOT NULL,
  "updationDate" TIMESTAMPTZ DEFAULT NOW()
);

-- Users table
CREATE TABLE IF NOT EXISTS tblusers (
  id SERIAL PRIMARY KEY,
  "FullName" VARCHAR(120),
  "EmailId" VARCHAR(100) UNIQUE,
  "Password" VARCHAR(255),
  "ContactNo" VARCHAR(11),
  dob VARCHAR(100),
  "Address" VARCHAR(255),
  "City" VARCHAR(100),
  "Country" VARCHAR(100),
  "RegDate" TIMESTAMPTZ DEFAULT NOW(),
  "UpdationDate" TIMESTAMPTZ
);

-- Brands table
CREATE TABLE IF NOT EXISTS tblbrands (
  id SERIAL PRIMARY KEY,
  "BrandName" VARCHAR(120) NOT NULL,
  "CreationDate" TIMESTAMPTZ DEFAULT NOW(),
  "UpdationDate" TIMESTAMPTZ
);

-- Vehicles table
CREATE TABLE IF NOT EXISTS tblvehicles (
  id SERIAL PRIMARY KEY,
  "VehiclesTitle" VARCHAR(150),
  "VehiclesBrand" INT REFERENCES tblbrands(id),
  "VehiclesOverview" TEXT,
  "PricePerDay" INT,
  "FuelType" VARCHAR(100),
  "ModelYear" INT,
  "SeatingCapacity" INT,
  "Vimage1" VARCHAR(255),
  "Vimage2" VARCHAR(255),
  "Vimage3" VARCHAR(255),
  "Vimage4" VARCHAR(255),
  "Vimage5" VARCHAR(255),
  "AirConditioner" INT,
  "PowerDoorLocks" INT,
  "AntiLockBrakingSystem" INT,
  "BrakeAssist" INT,
  "PowerSteering" INT,
  "DriverAirbag" INT,
  "PassengerAirbag" INT,
  "PowerWindows" INT,
  "CDPlayer" INT,
  "CentralLocking" INT,
  "CrashSensor" INT,
  "LeatherSeats" INT,
  "RegDate" TIMESTAMPTZ DEFAULT NOW(),
  "UpdationDate" TIMESTAMPTZ
);

-- Bookings table
CREATE TABLE IF NOT EXISTS tblbooking (
  id SERIAL PRIMARY KEY,
  "BookingNumber" BIGINT,
  "userEmail" VARCHAR(100),
  "VehicleId" INT REFERENCES tblvehicles(id),
  "FromDate" VARCHAR(20),
  "ToDate" VARCHAR(20),
  message VARCHAR(255),
  "Status" INT DEFAULT 0,
  "PostingDate" TIMESTAMPTZ DEFAULT NOW(),
  "LastUpdationDate" TIMESTAMPTZ
);

-- Testimonials table
CREATE TABLE IF NOT EXISTS tbltestimonial (
  id SERIAL PRIMARY KEY,
  "UserEmail" VARCHAR(100),
  "Testimonial" TEXT NOT NULL,
  "PostingDate" TIMESTAMPTZ DEFAULT NOW(),
  status INT DEFAULT 0
);

-- Contact info table
CREATE TABLE IF NOT EXISTS tblcontactusinfo (
  id SERIAL PRIMARY KEY,
  "Address" TEXT,
  "EmailId" VARCHAR(255),
  "ContactNo" VARCHAR(11)
);

-- Contact queries table
CREATE TABLE IF NOT EXISTS tblcontactusquery (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100),
  "EmailId" VARCHAR(120),
  "ContactNumber" VARCHAR(11),
  "Message" TEXT,
  "PostingDate" TIMESTAMPTZ DEFAULT NOW(),
  status INT DEFAULT 0
);

-- Pages table
CREATE TABLE IF NOT EXISTS tblpages (
  id SERIAL PRIMARY KEY,
  "PageName" VARCHAR(255),
  type VARCHAR(255) NOT NULL DEFAULT '',
  detail TEXT NOT NULL
);

-- Subscribers table
CREATE TABLE IF NOT EXISTS tblsubscribers (
  id SERIAL PRIMARY KEY,
  "SubscriberEmail" VARCHAR(120),
  "PostingDate" TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- SEED DATA
-- =====================

-- Admin (password: Test@12345 hashed with bcrypt)
-- Run this after seeding: UPDATE admin SET "Password" = '$2a$10$YourBcryptHashHere'
-- For now insert placeholder, then use the /api/auth/admin/login to test
-- You must manually update the password hash. Use: https://bcrypt-generator.com/
-- Hash of "Test@12345" => $2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi
INSERT INTO admin ("UserName", "Password") VALUES ('admin', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi')
ON CONFLICT DO NOTHING;

-- Contact info
INSERT INTO tblcontactusinfo ("Address", "EmailId", "ContactNo") VALUES ('J&K Block, Laxmi Nagar', 'info@carrental.com', '8974561236')
ON CONFLICT DO NOTHING;

-- Brands
INSERT INTO tblbrands ("BrandName") VALUES ('Maruti'), ('BMW'), ('Audi'), ('Nissan'), ('Toyota'), ('Volkswagen')
ON CONFLICT DO NOTHING;

-- Pages
INSERT INTO tblpages ("PageName", type, detail) VALUES
('About Us', 'aboutus', '<p>We offer a varied fleet of cars, ranging from compact to luxury. All our vehicles have air conditioning, power steering, and electric windows.</p>'),
('Terms and Conditions', 'terms', '<p>By using our service, you agree to our terms and conditions. Please read carefully before booking.</p>'),
('Privacy Policy', 'privacy', '<p>We respect your privacy and are committed to protecting your personal data.</p>'),
('FAQs', 'faqs', '<p><strong>Q: How do I book a car?</strong><br>A: Browse our fleet, select a car, choose your dates and submit the booking form.</p>')
ON CONFLICT DO NOTHING;

-- Disable RLS for all tables (for development - enable and configure for production)
ALTER TABLE admin DISABLE ROW LEVEL SECURITY;
ALTER TABLE tblusers DISABLE ROW LEVEL SECURITY;
ALTER TABLE tblbrands DISABLE ROW LEVEL SECURITY;
ALTER TABLE tblvehicles DISABLE ROW LEVEL SECURITY;
ALTER TABLE tblbooking DISABLE ROW LEVEL SECURITY;
ALTER TABLE tbltestimonial DISABLE ROW LEVEL SECURITY;
ALTER TABLE tblcontactusinfo DISABLE ROW LEVEL SECURITY;
ALTER TABLE tblcontactusquery DISABLE ROW LEVEL SECURITY;
ALTER TABLE tblpages DISABLE ROW LEVEL SECURITY;
ALTER TABLE tblsubscribers DISABLE ROW LEVEL SECURITY;
