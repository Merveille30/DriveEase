-- Run this in your Supabase SQL Editor
CREATE TABLE IF NOT EXISTS tblnotifications (
  id SERIAL PRIMARY KEY,
  "userEmail" VARCHAR(100),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'info',
  "isRead" BOOLEAN DEFAULT false,
  "bookingId" INT,
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE tblnotifications DISABLE ROW LEVEL SECURITY;
