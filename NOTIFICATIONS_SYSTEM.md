# File Upload Notifications System

## Overview
A comprehensive notification system that allows external applications to send file upload notifications to distributors when they consume your web app's API.

## Features

✅ **External API Integration** - Third-party apps can send notifications  
✅ **Real-time Notifications** - Auto-refresh every 30 seconds  
✅ **Unread Count Badge** - Shows number of unread notifications  
✅ **Mark as Read** - Individual or bulk mark as read  
✅ **Beautiful UI** - Dropdown panel in header with smooth animations  
✅ **Role-Based** - Works for both Distributors and Admins  
✅ **Secure** - API key authentication for external access  

---

## Components Created

### 1. **NotificationsPanel Component**
**Location**: `components/notifications/NotificationsPanel.tsx`

A dropdown panel that displays in the header showing:
- Unread notification count badge
- List of recent notifications (last 10)
- File upload details (who uploaded, file name, time ago)
- Mark individual notifications as read
- Mark all as read
- Auto-refresh every 30 seconds

### 2. **API Endpoints**

#### **GET /api/notifications**
Fetch notifications for the current user
- **Auth**: Required (JWT token)
- **Role**: Distributor or Admin
- **Query Params**:
  - `limit` - Number of notifications (default: 20, max: 50)
  - `page` - Page number for pagination
  - `readFlag` - Filter by read status (true/false)
- **Response**:
```json
{
  "data": [
    {
      "id": "notif_123",
      "pdfId": "pdf_456",
      "readFlag": false,
      "createdAt": "2026-01-30T10:30:00Z",
      "pdf": {
        "id": "pdf_456",
        "fileName": "document.pdf",
        "uploadedBy": {
          "fullName": "John Doe"
        }
      }
    }
  ],
  "pagination": {
    "total": 25,
    "unreadCount": 5,
    "page": 1,
    "limit": 20
  }
}
```

#### **POST /api/notifications/mark-read**
Mark notification(s) as read
- **Auth**: Required (JWT token)
- **Request Body**:
```json
{
  "notificationIds": ["notif_123", "notif_456"],  // Array of IDs
  "markAll": false                                 // Or true to mark all as read
}
```
- **Response**:
```json
{
  "success": true,
  "message": "2 notification(s) marked as read"
}
```

#### **POST /api/notifications/send** ⭐ (For External Apps)
Send file upload notifications to distributors
- **Auth**: API Key (in request body)
- **Request Body**:
```json
{
  "distributorIds": ["dist_123", "dist_456"],  // Array of distributor IDs
  "pdfId": "pdf_789",                          // PDF upload ID
  "apiKey": "your-secret-api-key"              // Your API key
}
```
- **Response**:
```json
{
  "success": true,
  "message": "Notifications sent to 2 distributor(s)",
  "data": {
    "notificationCount": 2,
    "pdfId": "pdf_789",
    "pdfFileName": "document.pdf",
    "distributors": [
      { "id": "dist_123", "name": "Distributor A" },
      { "id": "dist_456", "name": "Distributor B" }
    ]
  }
}
```

#### **GET /api/notifications/send**
Get API documentation for the send endpoint

---

## Setup Instructions

### 1. Environment Variables

Add to your `.env` file:
```env
API_KEY=your-secret-api-key-here
```

**Generate a secure API key:**
```bash
# On Linux/Mac
openssl rand -hex 32

# On Windows PowerShell
-join ((48..57) + (97..102) | Get-Random -Count 32 | % {[char]$_})

# Or use any secure random string generator
```

### 2. Database Schema

The notification system uses the existing `Notification` model:
```prisma
model Notification {
  id        String   @id @default(cuid())
  pdfId     String
  distId    String
  readFlag  Boolean  @default(false)
  createdAt DateTime @default(now())

  pdf         PdfUpload   @relation(fields: [pdfId], references: [id])
  distributor Distributor @relation(fields: [distId], references: [id])

  @@map("notifications")
}
```

### 3. Integration in Header

The `NotificationsPanel` component is already integrated in the Header component and will show for all authenticated users.

---

## Usage Guide

### For End Users (Distributors/Admins)

1. **View Notifications**:
   - Click the bell icon in the top-right corner
   - See unread count badge
   - Dropdown shows recent notifications

2. **Mark as Read**:
   - Click on any notification to mark it as read
   - Or click "Mark all read" to clear all

3. **Auto-Refresh**:
   - Notifications auto-refresh every 30 seconds
   - No need to manually refresh

### For External Applications

When your external app uploads a file via the API, send a notification:

**Example cURL Request:**
```bash
curl -X POST https://your-domain.com/api/notifications/send \
  -H "Content-Type: application/json" \
  -d '{
    "distributorIds": ["dist_123", "dist_456"],
    "pdfId": "pdf_789",
    "apiKey": "your-secret-api-key"
  }'
```

**Example JavaScript/Node.js:**
```javascript
const response = await fetch('https://your-domain.com/api/notifications/send', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    distributorIds: ['dist_123', 'dist_456'],
    pdfId: 'pdf_789',
    apiKey: process.env.API_KEY,
  }),
});

const data = await response.json();
console.log(data);
```

**Example Python:**
```python
import requests

response = requests.post(
    'https://your-domain.com/api/notifications/send',
    json={
        'distributorIds': ['dist_123', 'dist_456'],
        'pdfId': 'pdf_789',
        'apiKey': 'your-secret-api-key'
    }
)

print(response.json())
```

---

## How It Works

### Flow Diagram

```
External App → POST /api/notifications/send → Validates API Key
                                            → Verifies PDF exists
                                            → Verifies Distributors exist
                                            → Creates Notifications
                                            → Returns Success

User Opens App → NotificationsPanel loads → Fetches notifications
                                          → Shows unread count
                                          → Auto-refreshes every 30s

User Clicks Notification → Marks as read → Updates UI
                                        → Decrements unread count
```

### Security

1. **API Key Authentication**: External apps must provide valid API key
2. **JWT Authentication**: Internal endpoints require user login
3. **Role-Based Access**: Distributors only see their notifications
4. **Validation**: All inputs validated before processing
5. **SQL Injection Prevention**: Prisma ORM handles queries safely

---

## Testing

### Test the Notification System

1. **Create a test notification** (as external app):
```bash
curl -X POST http://localhost:3000/api/notifications/send \
  -H "Content-Type: application/json" \
  -d '{
    "distributorIds": ["YOUR_DISTRIBUTOR_ID"],
    "pdfId": "YOUR_PDF_ID",
    "apiKey": "your-secret-api-key"
  }'
```

2. **Login as distributor** and check the bell icon
3. **Click the bell** to see the notification
4. **Click the notification** to mark it as read
5. **Verify** the unread count decreases

### Get Distributor and PDF IDs

**Find Distributor ID:**
```bash
# Query your database or use the API
curl http://localhost:3000/api/distributors \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Find PDF ID:**
```bash
# Query your database or use the API
curl http://localhost:3000/api/pdfs \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Troubleshooting

### Issue: "Invalid API key"
**Solution**: Check that your `.env` file has `API_KEY` set and matches the key in your request.

### Issue: "Distributor not found"
**Solution**: Verify the distributor IDs exist in your database.

### Issue: "PDF not found"
**Solution**: Ensure the PDF has been uploaded and the ID is correct.

### Issue: Notifications not showing
**Solution**: 
- Check browser console for errors
- Verify user is logged in
- Check that notifications exist in database

### Issue: Unread count not updating
**Solution**:
- Clear browser cache
- Check that mark-read API is being called
- Verify database updates are working

---

## Future Enhancements

Potential improvements:
- 📧 Email notifications
- 📱 Push notifications (mobile)
- 🔔 Sound alerts
- 🎨 Notification categories/types
- 📊 Notification analytics
- ⏰ Scheduled notifications
- 🔍 Search/filter notifications

---

## Files Modified/Created

### Created:
1. `components/notifications/NotificationsPanel.tsx` - UI component
2. `app/api/notifications/send/route.ts` - External API endpoint
3. `app/api/notifications/mark-read/route.ts` - Mark as read endpoint
4. `NOTIFICATIONS_SYSTEM.md` - This documentation

### Modified:
1. `components/layout/Header.tsx` - Added NotificationsPanel
2. `package.json` - Added date-fns dependency

---

## Summary

✅ **Notification system is fully functional**  
✅ **External apps can send notifications via API**  
✅ **Users see real-time notifications in header**  
✅ **Secure with API key authentication**  
✅ **Beautiful, responsive UI**  
✅ **Auto-refresh every 30 seconds**  

**Status: Production Ready** 🎉

Your external applications can now send file upload notifications to distributors, and users will see them in real-time in the application header!
