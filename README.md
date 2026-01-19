# B2B Chemical Management System - Complete Documentation

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Database Schema](#database-schema)
4. [API Endpoints](#api-endpoints)
5. [Authentication Flow](#authentication-flow)
6. [Setup Instructions](#setup-instructions)
7. [API Consumption Guide](#api-consumption-guide)
8. [Mobile App Integration](#mobile-app-integration)
9. [Features & Workflows](#features--workflows)
10. [Environment Configuration](#environment-configuration)

---

## 🎯 Project Overview

A comprehensive B2B Chemical Management System built with Next.js 14, featuring role-based access control, document management, and real-time notifications.

### Key Features
- **Role-Based Access Control**: Admin and Distributor roles
- **Document Management**: PDF upload, assignment, and tracking
- **News & Announcements**: Content management system
- **Notifications**: Real-time updates for distributors
- **Mobile Support**: Push notifications and device token management
- **Activity Logging**: Complete audit trail

---

## 🛠 Technology Stack

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

### Security
- JWT-based authentication
- HTTP-only cookies
- CSRF protection
- Password hashing with bcrypt
- Role-based authorization

---

## 🗄 Database Schema

### Models Overview

#### 1. **User**
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

**Roles**: `ADMIN`, `DISTRIBUTOR`
**Status**: `ACTIVE`, `INACTIVE`

#### 2. **Distributor**
```prisma
model Distributor {
  id          String   @id @default(cuid())
  companyName String
  email       String   @unique
  status      Status   @default(ACTIVE)
  createdAt   DateTime @default(now())
}
```

#### 3. **PdfUpload**
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

**AssignType**: `SINGLE`, `MULTIPLE`, `ALL`
**PdfStatus**: `PENDING`, `DONE`

#### 4. **Notification**
```prisma
model Notification {
  id        String   @id @default(cuid())
  pdfId     String
  distId    String
  readFlag  Boolean  @default(false)
  createdAt DateTime @default(now())
}
```

#### 5. **News**
```prisma
model News {
  id          String   @id @default(cuid())
  title       String
  content     String
  category    String   @default("General")
  imageUrl    String?
  source      String?
  publishDate DateTime @default(now())
  authorId    String?
}
```

#### 6. **DeviceToken** (Mobile Support)
```prisma
model DeviceToken {
  id         String   @id @default(cuid())
  userId     String
  token      String   @unique
  platform   Platform
  isActive   Boolean  @default(true)
  deviceInfo Json?
}
```

**Platform**: `IOS`, `ANDROID`, `WEB`

#### 7. **Log** (Activity Tracking)
```prisma
model Log {
  id        String   @id @default(cuid())
  action    String
  userId    String
  createdAt DateTime @default(now())
}
```

---

## 🔌 API Endpoints

### Base URL
```
http://localhost:3000/api
```

### Authentication Endpoints

#### 1. Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@system.com",
  "password": "Admin@123"
}

Response:
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "...",
      "email": "admin@system.com",
      "fullName": "System Admin",
      "role": "ADMIN"
    }
  }
}
```

#### 2. Logout
```http
POST /api/auth/logout
Authorization: Bearer {token}

Response:
{
  "success": true,
  "message": "Logged out successfully"
}
```

#### 3. Get Current User
```http
GET /api/auth/me
Authorization: Bearer {token}

Response:
{
  "id": "...",
  "email": "admin@system.com",
  "fullName": "System Admin",
  "role": "ADMIN",
  "status": "ACTIVE"
}
```

---

### User Management (Admin Only)

#### 1. Get All Users
```http
GET /api/users?limit=50&offset=0&status=ACTIVE
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": [...],
  "pagination": {
    "total": 100,
    "limit": 50,
    "offset": 0,
    "hasMore": true
  }
}
```

#### 2. Create User
```http
POST /api/users
Authorization: Bearer {token}
Content-Type: application/json

{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass@123",
  "role": "DISTRIBUTOR",
  "status": "ACTIVE"
}

Response:
{
  "success": true,
  "data": {
    "id": "...",
    "fullName": "John Doe",
    "email": "john@example.com",
    "role": "DISTRIBUTOR"
  }
}
```

#### 3. Update User
```http
PUT /api/users/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "fullName": "John Updated",
  "status": "INACTIVE"
}
```

#### 4. Delete User
```http
DELETE /api/users/{id}
Authorization: Bearer {token}

Response:
{
  "success": true,
  "message": "User deleted successfully"
}
```

#### 5. Toggle User Status
```http
PATCH /api/users/{id}/toggle-status
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "id": "...",
    "status": "INACTIVE"
  }
}
```

---

### Distributor Management (Admin Only)

#### 1. Get All Distributors
```http
GET /api/distributors?limit=50&offset=0
Authorization: Bearer {token}
```

#### 2. Create Distributor
```http
POST /api/distributors
Authorization: Bearer {token}
Content-Type: application/json

{
  "companyName": "ABC Chemicals Ltd",
  "email": "contact@abcchemicals.com",
  "status": "ACTIVE"
}
```

#### 3. Update Distributor
```http
PUT /api/distributors/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "companyName": "ABC Chemicals Updated",
  "status": "ACTIVE"
}
```

#### 4. Delete Distributor
```http
DELETE /api/distributors/{id}
Authorization: Bearer {token}
```

---

### PDF Document Management

#### 1. Get All PDFs
```http
GET /api/pdfs?limit=50&offset=0&status=PENDING
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": [
    {
      "id": "...",
      "fileName": "Product_Catalog.pdf",
      "fileUrl": "/uploads/...",
      "status": "PENDING",
      "assignedGroup": "ALL",
      "createdAt": "2026-01-19T10:00:00Z",
      "uploadedBy": {
        "fullName": "Admin User"
      }
    }
  ]
}
```

#### 2. Upload PDF
```http
POST /api/pdfs/upload
Authorization: Bearer {token}
Content-Type: multipart/form-data

FormData:
- file: [PDF file]
- assignedDistributorId: "..." (optional)
- assignedGroup: "SINGLE" | "MULTIPLE" | "ALL"

Response:
{
  "success": true,
  "data": {
    "id": "...",
    "fileName": "document.pdf",
    "fileUrl": "/uploads/...",
    "status": "PENDING"
  }
}
```

#### 3. Download PDF
```http
GET /api/pdfs/{id}/download
Authorization: Bearer {token}

Response: PDF file (binary)
Content-Type: application/pdf
Content-Disposition: attachment; filename="document.pdf"

Note: Automatically marks PDF as DONE and notification as read
```

---

### News Management

#### 1. Get All News
```http
GET /api/news?limit=50&offset=0
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": [
    {
      "id": "...",
      "title": "New Product Launch",
      "content": "We are excited to announce...",
      "category": "Product Launch",
      "publishDate": "2026-01-19T10:00:00Z",
      "author": {
        "fullName": "Admin User"
      }
    }
  ]
}
```

#### 2. Create News
```http
POST /api/news
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Industry Update",
  "content": "Latest news in chemical industry...",
  "category": "Industry Update",
  "publishDate": "2026-01-19T10:00:00Z",
  "source": "Industry Magazine"
}
```

#### 3. Update News
```http
PUT /api/news/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Updated Title",
  "content": "Updated content..."
}
```

#### 4. Delete News
```http
DELETE /api/news/{id}
Authorization: Bearer {token}
```

---

### Notifications

#### 1. Get Notifications
```http
GET /api/notifications?limit=50&offset=0&unreadOnly=true
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": [
    {
      "id": "...",
      "readFlag": false,
      "createdAt": "2026-01-19T10:00:00Z",
      "pdf": {
        "fileName": "New_Document.pdf"
      }
    }
  ]
}
```

#### 2. Mark as Read
```http
PATCH /api/notifications/{id}/read
Authorization: Bearer {token}

Response:
{
  "success": true,
  "message": "Notification marked as read"
}
```

#### 3. Get Notification Preferences
```http
GET /api/notifications/preferences
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "inApp": true,
    "push": true,
    "email": false,
    "categories": ["Product Launch", "Regulatory"]
  }
}
```

#### 4. Update Notification Preferences
```http
PUT /api/notifications/preferences
Authorization: Bearer {token}
Content-Type: application/json

{
  "inApp": true,
  "push": true,
  "email": true,
  "categories": ["Product Launch", "Industry Update"]
}
```

---

### Device Token Management (Mobile Apps)

#### 1. Register Device
```http
POST /api/devices
Authorization: Bearer {token}
Content-Type: application/json

{
  "token": "ExponentPushToken[...]",
  "platform": "IOS",
  "deviceInfo": {
    "model": "iPhone 14",
    "osVersion": "17.0",
    "appVersion": "1.0.0"
  }
}
```

#### 2. Get Device Tokens
```http
GET /api/devices
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": [
    {
      "id": "...",
      "token": "ExponentPushToken[...]",
      "platform": "IOS",
      "isActive": true
    }
  ]
}
```

#### 3. Remove Device Token
```http
DELETE /api/devices?token=ExponentPushToken[...]
Authorization: Bearer {token}
```

---

### Activity Logs (Admin Only)

#### 1. Get Logs
```http
GET /api/logs?limit=100&offset=0
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": [
    {
      "id": "...",
      "action": "User login",
      "createdAt": "2026-01-19T10:00:00Z",
      "user": {
        "fullName": "Admin User"
      }
    }
  ]
}
```

---

## 🔐 Authentication Flow

### Web Application

1. **Login Request**
   ```javascript
   const response = await fetch('/api/auth/login', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ email, password })
   });
   const { data } = await response.json();
   localStorage.setItem('auth_token', data.token);
   ```

2. **Authenticated Requests**
   ```javascript
   const token = localStorage.getItem('auth_token');
   const response = await fetch('/api/users', {
     headers: {
       'Authorization': `Bearer ${token}`,
       'Content-Type': 'application/json'
     }
   });
   ```

3. **Logout**
   ```javascript
   await fetch('/api/auth/logout', {
     method: 'POST',
     headers: { 'Authorization': `Bearer ${token}` }
   });
   localStorage.removeItem('auth_token');
   ```

### Mobile Application

1. **Login & Store Token**
   ```javascript
   // React Native / Expo
   import AsyncStorage from '@react-native-async-storage/async-storage';
   
   const login = async (email, password) => {
     const response = await fetch('http://your-domain.com/api/auth/login', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ email, password })
     });
     const { data } = await response.json();
     await AsyncStorage.setItem('auth_token', data.token);
     await AsyncStorage.setItem('user', JSON.stringify(data.user));
   };
   ```

2. **Register Push Token**
   ```javascript
   import * as Notifications from 'expo-notifications';
   
   const registerForPushNotifications = async () => {
     const { status } = await Notifications.requestPermissionsAsync();
     if (status !== 'granted') return;
     
     const token = (await Notifications.getExpoPushTokenAsync()).data;
     const authToken = await AsyncStorage.getItem('auth_token');
     
     await fetch('http://your-domain.com/api/devices', {
       method: 'POST',
       headers: {
         'Authorization': `Bearer ${authToken}`,
         'Content-Type': 'application/json'
       },
       body: JSON.stringify({
         token,
         platform: Platform.OS === 'ios' ? 'IOS' : 'ANDROID',
         deviceInfo: {
           model: Device.modelName,
           osVersion: Device.osVersion,
           appVersion: '1.0.0'
         }
       })
     });
   };
   ```

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js 18+ installed
- PostgreSQL database (Neon recommended)
- Git

### Step 1: Clone Repository
```bash
git clone https://github.com/SHUBHKAGATHARA/B2B-Chemical.git
cd B2B-Chemical
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Environment Configuration
Create `.env` file in root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"

# JWT Secret (Change in production!)
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# CSRF Secret (Change in production!)
CSRF_SECRET="your-super-secret-csrf-key-change-this-in-production"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Step 4: Database Setup
```bash
# Generate Prisma Client
npx prisma generate

# Push schema to database
npx prisma db push

# Seed database with initial data
npx ts-node seed-database.ts
```

### Step 5: Run Development Server
```bash
npm run dev
```

Application will be available at: `http://localhost:3000`

### Step 6: Default Credentials

**Admin Account:**
- Email: `admin@system.com`
- Password: `Admin@123`

**Distributor Account:**
- Email: `dist1@example.com`
- Password: `Dist@123`

---

## 📱 API Consumption Guide

### For Web Applications

#### Using Fetch API
```javascript
// api-client.js
class ApiClient {
  constructor(baseUrl = '/api') {
    this.baseUrl = baseUrl;
  }

  async request(endpoint, options = {}) {
    const token = localStorage.getItem('auth_token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers
    };

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers
    });

    if (response.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
      throw new Error('Unauthorized');
    }

    return response.json();
  }

  // Auth
  login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  }

  // Users
  getUsers(params) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/users?${query}`);
  }

  createUser(data) {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // PDFs
  async uploadPdf(file, assignedGroup, distributorId) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('assignedGroup', assignedGroup);
    if (distributorId) formData.append('assignedDistributorId', distributorId);

    const token = localStorage.getItem('auth_token');
    const response = await fetch(`${this.baseUrl}/pdfs/upload`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });

    return response.json();
  }

  // News
  getNews(params) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/news?${query}`);
  }
}

export const apiClient = new ApiClient();
```

#### Usage Example
```javascript
// In your React component
import { apiClient } from './api-client';

const MyComponent = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await apiClient.getUsers({ limit: 50 });
        setUsers(response.data);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      }
    };
    fetchUsers();
  }, []);

  return <div>{/* Render users */}</div>;
};
```

---

### For Mobile Applications (React Native / Expo)

#### API Client Setup
```javascript
// services/api.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'https://your-domain.com/api';

class MobileApiClient {
  async request(endpoint, options = {}) {
    const token = await AsyncStorage.getItem('auth_token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers
    });

    if (response.status === 401) {
      await AsyncStorage.removeItem('auth_token');
      // Navigate to login screen
      throw new Error('Unauthorized');
    }

    return response.json();
  }

  // Authentication
  async login(email, password) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    
    if (response.success) {
      await AsyncStorage.setItem('auth_token', response.data.token);
      await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response;
  }

  // Get Assigned PDFs (Distributor)
  getAssignedPdfs() {
    return this.request('/pdfs?assignedToMe=true');
  }

  // Download PDF
  async downloadPdf(pdfId) {
    const token = await AsyncStorage.getItem('auth_token');
    const response = await fetch(`${API_URL}/pdfs/${pdfId}/download`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    return response.blob(); // For file download
  }

  // Get Notifications
  getNotifications(unreadOnly = false) {
    return this.request(`/notifications?unreadOnly=${unreadOnly}`);
  }

  // Mark Notification as Read
  markNotificationRead(notificationId) {
    return this.request(`/notifications/${notificationId}/read`, {
      method: 'PATCH'
    });
  }

  // Register Device Token
  registerDevice(pushToken, platform, deviceInfo) {
    return this.request('/devices', {
      method: 'POST',
      body: JSON.stringify({ token: pushToken, platform, deviceInfo })
    });
  }
}

export const mobileApi = new MobileApiClient();
```

#### Push Notifications Setup
```javascript
// services/notifications.js
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { mobileApi } from './api';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function registerForPushNotifications() {
  if (!Device.isDevice) {
    alert('Must use physical device for Push Notifications');
    return;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  if (finalStatus !== 'granted') {
    alert('Failed to get push token for push notification!');
    return;
  }

  const token = (await Notifications.getExpoPushTokenAsync()).data;
  
  // Register with backend
  await mobileApi.registerDevice(
    token,
    Platform.OS === 'ios' ? 'IOS' : 'ANDROID',
    {
      model: Device.modelName,
      osVersion: Device.osVersion,
      appVersion: '1.0.0'
    }
  );

  return token;
}

export function setupNotificationListeners(navigation) {
  // Handle notification when app is in foreground
  Notifications.addNotificationReceivedListener(notification => {
    console.log('Notification received:', notification);
  });

  // Handle notification tap
  Notifications.addNotificationResponseReceivedListener(response => {
    const data = response.notification.request.content.data;
    
    // Navigate based on notification type
    if (data.type === 'PDF_ASSIGNED') {
      navigation.navigate('Documents', { pdfId: data.pdfId });
    }
  });
}
```

#### Usage in React Native Component
```javascript
// screens/DocumentsScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { mobileApi } from '../services/api';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export default function DocumentsScreen() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      const response = await mobileApi.getAssignedPdfs();
      setDocuments(response.data);
    } catch (error) {
      console.error('Failed to load documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadDocument = async (pdfId, fileName) => {
    try {
      const fileUri = FileSystem.documentDirectory + fileName;
      const token = await AsyncStorage.getItem('auth_token');
      
      const downloadResumable = FileSystem.createDownloadResumable(
        `${API_URL}/pdfs/${pdfId}/download`,
        fileUri,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      const { uri } = await downloadResumable.downloadAsync();
      await Sharing.shareAsync(uri);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  return (
    <View>
      <FlatList
        data={documents}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => downloadDocument(item.id, item.fileName)}>
            <Text>{item.fileName}</Text>
            <Text>{item.status}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
```

---

## 🔄 Features & Workflows

### 1. Document Assignment Workflow

**Admin Side:**
1. Admin logs in
2. Navigates to PDF Management
3. Uploads PDF file
4. Selects assignment type:
   - **SINGLE**: Assign to one distributor
   - **MULTIPLE**: Assign to selected distributors
   - **ALL**: Assign to all distributors
5. System creates notifications for assigned distributors

**Distributor Side:**
1. Distributor logs in
2. Sees notification count on dashboard
3. Views assigned documents (status: PENDING)
4. Downloads document
5. Document automatically moves to COMPLETED
6. Notification marked as read

### 2. News Management Workflow

**Admin Side:**
1. Navigate to News & Announcements
2. Click "Add News"
3. Fill in details:
   - Title
   - Category (General, Industry Update, Product Launch, etc.)
   - Content
   - Publish Date
   - Source (optional)
4. Publish article

**Distributor Side:**
1. View news feed on dashboard
2. Filter by category
3. Read full articles

### 3. User Management Workflow

**Admin Only:**
1. Navigate to Users section
2. View all users with filters (status, role)
3. Create new user:
   - Set role (ADMIN/DISTRIBUTOR)
   - Set initial password
   - Set status (ACTIVE/INACTIVE)
4. Edit existing users
5. Toggle user status (activate/deactivate)
6. Delete users (with confirmation)

---

## 🌐 Environment Configuration

### Development (.env)
```env
DATABASE_URL="postgresql://user:pass@localhost:5432/b2b_dev?sslmode=require"
JWT_SECRET="dev-jwt-secret-change-in-production"
CSRF_SECRET="dev-csrf-secret-change-in-production"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Production (.env.production)
```env
DATABASE_URL="postgresql://user:pass@production-host:5432/b2b_prod?sslmode=require"
JWT_SECRET="super-secure-random-string-min-32-chars"
CSRF_SECRET="another-secure-random-string-min-32-chars"
NEXT_PUBLIC_APP_URL="https://your-domain.com"
```

### Neon Database Setup
1. Create account at https://neon.tech
2. Create new project
3. Copy connection string
4. Use **direct connection** (not pooled) for development:
   ```
   postgresql://user:pass@ep-xxx.region.aws.neon.tech/dbname?sslmode=require
   ```
5. For production, use pooled connection for better performance

---

## 🔧 Troubleshooting

### Database Connection Issues
**Problem**: `Can't reach database server`

**Solutions**:
1. Check if database is active (Neon free tier sleeps after 5 min)
2. Use direct connection instead of pooled
3. Verify connection string in `.env`
4. Restart dev server

### Static Files Not Loading (404)
**Problem**: CSS/JS files return 404

**Solutions**:
1. Delete `.next` folder: `Remove-Item -Recurse -Force .next`
2. Restart dev server: `npm run dev`
3. Clear browser cache

### Authentication Errors
**Problem**: Token expired or invalid

**Solutions**:
1. Check JWT_SECRET in `.env`
2. Verify token is being sent in Authorization header
3. Check token expiration (default: 7 days)

---

## 📊 API Response Format

### Success Response
```json
{
  "success": true,
  "data": { /* response data */ },
  "pagination": { /* if paginated */ }
}
```

### Error Response
```json
{
  "error": "Error message",
  "details": { /* optional error details */ }
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

---

## 🎨 UI Features

### Modern Design Elements
- **Gradient Buttons**: Smooth color transitions
- **Hover Effects**: Scale, shadow, and color changes
- **Animations**: Slide-up, fade-in, shimmer effects
- **Responsive Layout**: Mobile-first design
- **Premium Cards**: Shadows, borders, glassmorphism

### Mobile Responsiveness
- **Breakpoints**:
  - Mobile: < 640px
  - Tablet: 640px - 1024px
  - Desktop: > 1024px
- **Touch Targets**: Minimum 44x44px
- **Full-Width Buttons**: On mobile devices
- **Stacked Layouts**: Vertical on mobile, horizontal on desktop

---

## 📦 Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npx prisma generate
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

---

## 📞 Support & Contact

For issues or questions:
- GitHub: https://github.com/SHUBHKAGATHARA/B2B-Chemical
- Email: support@example.com

---

## 📄 License

This project is proprietary software. All rights reserved.

---

**Last Updated**: January 19, 2026
**Version**: 1.0.0
