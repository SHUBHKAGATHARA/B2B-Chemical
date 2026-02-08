-- SQL to create test alert directly in database
-- Run this in Prisma Studio or your database client

INSERT INTO alerts (id, "alertId", title, message, status, "startDate", "createdAt")
VALUES (
  gen_random_uuid(),
  gen_random_uuid(),
  'Test Alert - System Working!',
  'This is a test alert to verify the alert system is functioning correctly. You should see this banner on your dashboard.',
  'ACTIVE',
  NOW(),
  NOW()
);
