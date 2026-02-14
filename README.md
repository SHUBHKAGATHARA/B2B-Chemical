# B2B Chemical Management System - Comprehensive Documentation

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Database Schema](#database-schema)
4. [Deployment Guide](#deployment-guide)
5. [Authentication & Security](#authentication--security)
6. [User Management & Company Settings](#user-management--company-settings)
7. [Distributor Management](#distributor-management)
8. [Document Management (PDFs)](#document-management-pdfs)
9. [Notification System](#notification-system)
10. [Alert System](#alert-system)
11. [News & Announcements](#news--announcements)
12. [Troubleshooting & FAQ](#troubleshooting--faq)

---

## 1. Project Overview

A comprehensive B2B Chemical Management System built with Next.js 14, featuring role-based access control, document management, and real-time notifications.

### Key Features
- **Role-Based Access Control**: Admin and Distributor roles
- **Document Management**: PDF upload, assignment, and tracking
- **News & Announcements**: Content management system
- **Notifications**: Real-time updates for distributors, plus external API support
- **Mobile Support**: Push notifications and device token management
- **Activity Logging**: Complete audit trail
- **Alert System**: Global alerts for all users

---

## 2. Technology Stack

### Frontend
- **Framework**: Next.js 14.2.35 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Custom CSS
- **UI Components**: Lucide React Icons
- **State Management**: React Hooks

### Backend
- **Runtime**: Node.js
- **API**: Next.js API Routes (Server Actions)
- **Authentication**: JWT (JSON Web Tokens)
- **Database ORM**: Prisma
- **Database**: PostgreSQL (Neon)

---

## 3. Database Schema

### Models Overview

#### User
```prisma
model User {
  id                      String    @id @default(cuid())
  fullName                String
  email                   String    @unique
  passwordHash            String
  role                    Role      @default(DISTRIBUTOR)
  status                  Status    @default(ACTIVE)
  notificationPreferences Json?
  createdAt               DateTime  @default(now())
  lastLogin               DateTime?
}
```

#### Distributor
```prisma
model Distributor {
  id          String   @id @default(cuid())
  companyName String
  email       String   @unique
  status      Status   @default(ACTIVE)
  logoUrl     String?
  createdAt   DateTime @default(now())
}
```

#### PdfUpload
```prisma
model PdfUpload {
  id                    String     @id @default(cuid())
  fileName              String
  fileUrl               String
  uploadedByAdminId     String
  assignedDistributorId String?
  assignedGroup         AssignType @default(SINGLE)
  status                PdfStatus  @default(PENDING)
  createdAt             DateTime   @default(now())
}
```

#### Notification
```prisma
model Notification {
  id        String   @id @default(cuid())
  pdfId     String
  distId    String
  readFlag  Boolean  @default(false)
  createdAt DateTime @default(now())
}
```

#### Alert
```prisma
model Alert {
  id        String   @id @default(cuid())
  title     String
  message   String
  status    Status   @default(ACTIVE)
  startDate DateTime @default(now())
  endDate   DateTime?
  imageUrl  String?
  createdAt DateTime @default(now())
}
```

---

## 4. Deployment Guide

### Prerequisites
- A Vercel account
- A PostgreSQL database (Neon, Supabase, etc.)
- Git repository

### Step 1: Environment Variables
Configure these in your Vercel project settings:
```env
DATABASE_URL="postgresql://username:password@host:5432/database?sslmode=require"
JWT_SECRET="your-secure-random-jwt-secret-key"
CSRF_SECRET="your-secure-random-csrf-secret-key"
NEXT_PUBLIC_APP_URL="https://your-vercel-domain.vercel.app"
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"
```

### Step 2: Database Setup
After deployment, run migrations:
```bash
# Option A: Local CLI
npx prisma db push

# Option B: Vercel Command (if configured in build settings)
# "build": "prisma generate && next build"
```

### Step 3: Seed Initial Data
```bash
npx ts-node scripts/seed-database.ts
```

For detailed deployment steps including CLI usage and troubleshooting, refer to your deployment logs.

---

## 5. Authentication & Security

### Web Implementation
Standard JWT flow via `httpOnly` cookies for web sessions.

### 📱 Mobile Consumption Guide

The mobile app must use token-based authentication. The token and user data should be stored securely on the device (e.g., `AsyncStorage` or `SecureStore`).

#### 1. Login Logic
**Endpoint:** `POST /api/auth/login`

```typescript
// React Native / Expo Example
import AsyncStorage from '@react-native-async-storage/async-storage';

const login = async (email, password) => {
  try {
    const response = await fetch('https://your-domain.com/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const result = await response.json();
    
    if (result.success) {
      // Store token and user data
      await AsyncStorage.setItem('auth_token', result.data.token);
      await AsyncStorage.setItem('user_data', JSON.stringify(result.data.user));
      return result.data.user;
    } else {
      throw new Error(result.message || 'Login failed');
    }
  } catch (error) {
    console.error('Login Error:', error);
    throw error;
  }
};
```

#### 2. Logout Logic
**Endpoint:** `POST /api/auth/logout`

```typescript
const logout = async () => {
  const token = await AsyncStorage.getItem('auth_token');
  await fetch('https://your-domain.com/api/auth/logout', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  await AsyncStorage.removeItem('auth_token');
  await AsyncStorage.removeItem('user_data');
};
```

#### 3. Interceptor Implementation
Always include the token in headers for protected routes:

```typescript
// Add this to your API client configuration
const getHeaders = async () => {
  const token = await AsyncStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};
```

---

## 6. User Management & Company Settings

Manage company profiles, contact details, and logos.

### Features
- **Logo Upload**: Integrated with Cloudinary. Supports PNG, JPG, WEBP (Max 5MB).
- **Validation**: Server-side checks for file type and size.
- **Auto-Cleanup**: Old logos are deleted from Cloudinary when replaced.

### 📱 Mobile Consumption Guide

#### 1. Fetch Company Settings
**Endpoint:** `GET /api/company-settings`

```typescript
const fetchSettings = async () => {
  const headers = await getHeaders();
  const response = await fetch('https://your-domain.com/api/company-settings', { headers });
  return await response.json();
};
```

#### 2. Update Settings & Upload Logo (Multipart/Form-Data)
**Endpoint:** `POST /api/company-settings` (Admin Only) or `PUT /api/distributors/[id]` (For specific distributor updates)

**Critical:** When uploading images from mobile, you must use `FormData` and valid file URIs.

```typescript
const updateProfileIncludingLogo = async (companyName, email, imageUri) => {
  const token = await AsyncStorage.getItem('auth_token');
  const formData = new FormData();
  
  formData.append('companyName', companyName);
  formData.append('email', email);
  
  if (imageUri) {
    // React Native specific file object structure
    const filename = imageUri.split('/').pop();
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';
    
    formData.append('logo', {
      uri: imageUri,
      name: filename,
      type: type,
    } as any); // Cast as any because RN's FormData types are loose
  }

  const response = await fetch('https://your-domain.com/api/company-settings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'multipart/form-data', // Often let the browser/engine set this, but required here for context
    },
    body: formData,
  });

  return await response.json();
};
```

---

## 7. Distributor Management

Admin functionality to manage distributor accounts.

### 📱 Mobile Consumption Guide (Admin App)

#### 1. List Distributors
**Endpoint:** `GET /api/distributors?limit=20&offset=0`

```typescript
const getDistributors = async (page = 1) => {
  const headers = await getHeaders();
  const offset = (page - 1) * 20;
  const response = await fetch(
    `https://your-domain.com/api/distributors?limit=20&offset=${offset}`,
    { headers }
  );
  return await response.json();
};
```

---

## 8. Document Management (PDFs)

Core feature for distributing documents to users.

### 📱 Mobile Consumption Guide

#### 1. Fetch PDF List
**Endpoint:** `GET /api/pdfs?limit=20&offset=0`

```typescript
const getMyPDFs = async () => {
  const headers = await getHeaders();
  const response = await fetch('https://your-domain.com/api/pdfs', { headers });
  const result = await response.json();
  // result.data contains the array of PDFs
  return result.data;
};
```

#### 2. Download Attributes
When rendering the list, use these fields:
- `fileName`: Display name
- `createdAt`: Date uploaded
- `uploadedBy.fullName`: Admin who uploaded it

#### 3. Downloading the File
**Endpoint:** `GET /api/pdfs/[id]/download`

Calls to this endpoint automatically mark the file as "viewed/downloaded" in the database.

```typescript
import * as FileSystem from 'expo-file-system'; // Use expo-file-system or rn-fetch-blob

const downloadPDF = async (pdfId, fileName) => {
  const token = await AsyncStorage.getItem('auth_token');
  const fileUri = FileSystem.documentDirectory + fileName;

  const downloadRes = await FileSystem.downloadAsync(
    `https://your-domain.com/api/pdfs/${pdfId}/download`,
    fileUri,
    {
      headers: { 'Authorization': `Bearer ${token}` }
    }
  );
  
  if (downloadRes.status === 200) {
    console.log('File downloaded to:', downloadRes.uri);
    return downloadRes.uri;
  }
};
```

---

## 9. Notification System

Real-time notifications for distributors when files are uploaded.

### Features
- **In-App**: Bell icon with unread count.
- **External API**: Send notifications from 3rd party apps.

### External API Usage (For Backend Integration)
Send a notification when you upload a file via script/external tool.

**Endpoint:** `POST /api/notifications/send`
**Headers:** `Content-Type: application/json`

**Payload:**
```json
{
  "distributorIds": ["dist_123", "dist_456"],
  "pdfId": "pdf_789",
  "apiKey": "YOUR_API_KEY_FROM_ENV"
}
```

### 📱 Mobile Consumption Guide

#### 1. Register Device for Push Notifications
**Endpoint:** `POST /api/devices`

```typescript
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

const registerPushToken = async () => {
  // 1. Get Expo Push Token
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') return;
  const tokenData = await Notifications.getExpoPushTokenAsync();
  
  // 2. Send to Backend
  const headers = await getHeaders();
  await fetch('https://your-domain.com/api/devices', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      token: tokenData.data,
      platform: Platform.OS === 'ios' ? 'IOS' : 'ANDROID',
      deviceInfo: {
        model: Device.modelName,
        osVersion: Device.osVersion
      }
    })
  });
};
```

#### 2. Fetch Notifications
**Endpoint:** `GET /api/notifications`

```typescript
const getNotifications = async () => {
  const headers = await getHeaders();
  const response = await fetch('https://your-domain.com/api/notifications', { headers });
  return await response.json(); // Returns { data: [...], pagination: {...} }
};
```

#### 3. Mark as Read
**Endpoint:** `PATCH /api/notifications/[id]/read`

```typescript
const markRead = async (notificationId) => {
  const headers = await getHeaders();
  await fetch(`https://your-domain.com/api/notifications/${notificationId}/read`, {
    method: 'PATCH',
    headers
  });
};
```

---

## 10. Alert System

System-wide alerts (e.g., "System Maintenance") shown to all users.

### 📱 Mobile Consumption Guide

#### 1. Fetch Active Alerts
**Endpoint:** `GET /api/alerts/active`

Mobile apps should call this on startup or dashboard load to show a banner or modal.

```typescript
const checkAlerts = async () => {
  // This endpoint might be public or protected depending on config.
  // Assuming protected:
  const headers = await getHeaders();
  const response = await fetch('https://your-domain.com/api/alerts/active', { headers });
  const result = await response.json();
  
  if (result.success && result.data.length > 0) {
    const activeAlert = result.data[0];
    // Show Alert Banner/Modal Logic:
    // Alert.alert(activeAlert.title, activeAlert.message);
    return activeAlert;
  }
};
```

---

## 11. News & Announcements

News feed for distributors.

### 📱 Mobile Consumption Guide

#### 1. Fetch News Feed
**Endpoint:** `GET /api/news?limit=10`

```typescript
const getNews = async () => {
  const headers = await getHeaders();
  const response = await fetch('https://your-domain.com/api/news?limit=10', { headers });
  const result = await response.json();
  return result.data;
};
```

---

## 12. Troubleshooting & FAQ

### Common Issues

**1. "Invalid API Key" when sending notifications**
- Check `.env` file for `PORTAL_API_KEY`.
- Ensure you are sending it in the body payload correctly.

**2. Image Upload Fails**
- Check file size (Max 5MB).
- Check format (PNG, JPG, WEBP).
- Verify `CLOUDINARY_*` env vars are set.

**3. Mobile: Network Request Failed**
- Authenticate first; check if `auth_token` is present in `AsyncStorage`.
- Ensure `Content-Type` is set to `multipart/form-data` ONLY for uploads (and let the engine handle boundary), and `application/json` for others.

**4. PDF Download Issues**
- Ensure you are passing the Authorization header in the download request.
- On Android, ensure you have file system permissions.
