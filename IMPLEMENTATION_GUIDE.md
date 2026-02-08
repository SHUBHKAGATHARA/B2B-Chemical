# B2B Application - Major Enhancements Implementation Guide

## 🎯 Overview

This document outlines the major enhancements implemented in the B2B application including user management upgrades, PDF categorization, alerts system, and persistent authentication.

---

## ✅ Completed Implementations

### 1. User Management Enhancement

#### Database Changes
Added new fields to the `User` model:
- `accountName` - Business account name (required)
- `phoneNumber` - Contact phone number (required)
- `address` - Physical address (required)
- `website` - Company website URL (optional)
- `location` - Geographic location (optional)
- `updatedAt` - Auto-updated timestamp

#### API Changes
**Endpoints Modified:**
- `POST /api/users` - Now accepts additional user fields
- `PATCH /api/users/[id]` - Update user with new fields

**Validation:**
- Phone number: Must be 10-20 digits, accepts + prefix
- Website: Must be valid URL format
- All text fields are trimmed for whitespace

#### Usage Example
```typescript
// Create user with new fields
const response = await fetch('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        fullName: 'John Doe',
        email: 'john@example.com',
        password: 'secure123',
        role: 'DISTRIBUTOR',
        accountName: 'John Doe Trading Co',
        phoneNumber: '+1234567890',
        address: '123 Main St, City, State 12345',
        website: 'https://example.com',
        location: 'New York, NY'
    })
});
```

---

### 2. PDF Categories System

#### Database Schema
Created `PdfCategory` model with:
- `id` - Unique identifier
- `name` - Category name (unique)
- `description` - Category description
- `pdfUploads` - Relation to PDFs

Updated `PdfUpload` model:
- Added `categoryId` - Foreign key to PdfCategory
- Added `description` - PDF description text

#### API Endpoints

**PDF Categories:**
- `GET /api/pdf-categories` - List all categories with PDF counts
- `POST /api/pdf-categories` - Create new category
- `GET /api/pdf-categories/[id]` - Get single category
- `PATCH /api/pdf-categories/[id]` - Update category
- `DELETE /api/pdf-categories/[id]` - Delete (prevents if PDFs exist)

#### Default Categories
Run the seed script to create default categories:
```bash
npx ts-node scripts/seed-pdf-categories.ts
```

Default categories:
- Invoice
- Alerts
- Compliance
- Reports
- Contracts
- Marketing
- General

#### Usage Example
```typescript
// Create PDF category
const categoryResponse = await fetch('/api/pdf-categories', {
    method: 'POST',
    body: JSON.stringify({
        name: 'Custom Reports',
        description: 'Monthly and quarterly reports'
    })
});

// Upload PDF with category
const pdfResponse = await fetch('/api/pdfs', {
    method: 'POST',
    body: formData, // includes categoryId and description
});
```

---

### 3. Dynamic Alerts System

#### Database Schema
Created `Alert` model with:
- `id` - Primary key
- `alertId` - UUID for tracking
- `title` - Alert title (max 200 chars)
- `message` - Alert content
- `imageUrl` - Cloudinary image URL (optional)
- `buttonText` - CTA button text (optional)
- `buttonAction` - Button URL/action (optional)
- `status` - ACTIVE, INACTIVE, or EXPIRED
- `startDate` - When alert becomes active
- `endDate` - When alert expires (optional)

#### API Endpoints

**Admin Management:**
- `GET /api/alerts` - List all alerts (paginated, filterable)
- `POST /api/alerts` - Create new alert
- `GET /api/alerts/[id]` - Get single alert
- `PATCH /api/alerts/[id]` - Update alert
- `DELETE /api/alerts/[id]` - Delete alert

**Distributor Access:**
- `GET /api/alerts/active` - Fetch active alerts for popup

#### Active Alert Logic
Alerts are shown when:
- `status = 'ACTIVE'`
- `startDate <= NOW()`
- `endDate IS NULL` OR `endDate >= NOW()`

#### Usage Example
```typescript
// Create alert
const alertResponse = await fetch('/api/alerts', {
    method: 'POST',
    body: JSON.stringify({
        title: 'System Maintenance Notice',
        message: 'We will be performing scheduled maintenance...',
        imageUrl: 'https://res.cloudinary.com/.../alert.jpg',
        buttonText: 'Learn More',
        buttonAction: 'https://example.com/maintenance',
        status: 'ACTIVE',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
    })
});
```

---

### 4. Alert Popup Component

#### Component: `AlertPopup`
Location: `components/alerts/AlertPopup.tsx`

**Features:**
- Fetches active alerts on mount
- Shows alerts one at a time
- Tracks seen alerts in localStorage (`alert_seen_{alertId}`)
- Never shows the same alert twice
- Supports image display
- Handles button actions (URL navigation)
- Shows alert counter (e.g., "Alert 1 of 3")

#### Integration Example
```typescript
// In your dashboard layout
'use client';

import { useAlertPopup } from '@/components/alerts/AlertPopup';
import { AlertPopup } from '@/components/alerts/AlertPopup';

export default function DashboardLayout({ children }) {
    const { showAlerts, setShowAlerts } = useAlertPopup();

    return (
        <div>
            {showAlerts && (
                <AlertPopup onClose={() => setShowAlerts(false)} />
            )}
            {children}
        </div>
    );
}
```

---

### 5. Persistent Login (15 Days)

#### Token Strategy
- **Access Token**: 15 minutes, stored in `auth-token` cookie
- **Refresh Token**: 15 days, stored in `refreshToken` cookie

#### Security Features
- HttpOnly cookies (prevents XSS)
- Secure flag in production (HTTPS only)
- SameSite=Strict for refresh token
- SameSite=Lax for access token
- Refresh tokens stored in database with active flag

#### API Endpoints

**Authentication:**
- `POST /api/auth/login` - Login (returns both tokens)
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout (invalidates refresh token)

#### Token Refresh Flow
```typescript
// Auto-refresh access token
async function refreshAccessToken() {
    const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include' // Important!
    });
    
    if (response.ok) {
        const data = await response.json();
        return data.data.token;
    }
    
    // Redirect to login if refresh fails
    window.location.href = '/login';
}

// Call every 14 minutes or when API returns 401
setInterval(refreshAccessToken, 14 * 60 * 1000);
```

#### Database Schema
Created `RefreshToken` model:
- `id` - Primary key
- `userId` - Foreign key to User
- `token` - JWT refresh token
- `expiresAt` - Expiration timestamp
- `isActive` - Token validity flag
- `createdAt` - Creation timestamp

---

## 📋 Database Migration

### Running Migrations

**When database is accessible:**
```bash
# Generate migration
npx prisma migrate dev --name add_user_pdf_alert_enhancements

# Generate Prisma client
npx prisma generate

# Seed PDF categories
npx ts-node scripts/seed-pdf-categories.ts
```

### Migration Includes:
1. User table updates (new fields)
2. PdfCategory table creation
3. PdfUpload table updates (categoryId, description)
4. Alert table creation
5. RefreshToken table creation
6. Performance indexes on all new fields

---

## 🔒 Security Checklist

✅ **Implemented:**
- [x] HttpOnly cookies for auth tokens
- [x] Secure flag in production
- [x] SameSite cookie protection
- [x] Phone number validation
- [x] URL validation for websites
- [x] SQL injection protection (Prisma ORM)
- [x] XSS protection (HttpOnly cookies)
- [x] Input sanitization (trim whitespace)
- [x] Role-based authorization
- [x] Token expiration tracking
- [x] Refresh token invalidation on logout

⚠️ **TODO (Manual Implementation):**
- [ ] Rate limiting on login endpoint
- [ ] File type validation for PDF uploads
- [ ] Max upload size limits
- [ ] CORS configuration for production
- [ ] CSP headers
- [ ] Cloudinary upload signed URLs

---

## 🚀 Deployment Checklist

### Pre-Deployment
- [x] TypeScript compilation successful
- [x] Prisma schema validated
- [x] API routes created
- [x] Validation schemas updated
- [ ] Run: `npm run build` (when DB available)
- [ ] Run migrations on production DB
- [ ] Seed PDF categories

### Environment Variables Required
```env
DATABASE_URL="postgresql://..."
JWT_SECRET="your-super-secret-jwt-key-change-this"
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
NODE_ENV="production"
```

### Post-Deployment
1. Test login with 15-day persistence
2. Verify refresh token rotation
3. Create test alert and verify popup
4. Create PDF categories via API
5. Upload PDF with category
6. Create user with new fields
7. Verify all API endpoints return 200

---

## 📊 Performance Optimizations

### Indexes Added
```sql
-- Alerts
CREATE INDEX idx_alert_status ON alerts(status);
CREATE INDEX idx_alert_dates ON alerts(start_date, end_date);
CREATE INDEX idx_alert_combined ON alerts(status, start_date, end_date);

-- PDF Categories
CREATE INDEX idx_pdf_category ON pdf_uploads(category_id);
CREATE INDEX idx_category_name ON pdf_categories(name);

-- Refresh Tokens
CREATE INDEX idx_refresh_token ON refresh_tokens(token);
CREATE INDEX idx_refresh_expiry ON refresh_tokens(expires_at);
```

---

## 🧪 Testing Guide

### Test User Creation
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "email": "test@example.com",
    "password": "test123",
    "role": "DISTRIBUTOR",
    "accountName": "Test Trading Co",
    "phoneNumber": "+1234567890",
    "address": "123 Test St",
    "website": "https://test.com",
    "location": "Test City"
  }'
```

### Test Alert Creation
```bash
curl -X POST http://localhost:3000/api/alerts \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Welcome Alert",
    "message": "Welcome to our platform!",
    "status": "ACTIVE"
  }'
```

### Test PDF Category Creation
```bash
curl -X POST http://localhost:3000/api/pdf-categories \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Category",
    "description": "Test description"
  }'
```

---

## 🎨 UI Components Status

### ✅ Completed
- Alert popup component
- Alert popup hook

### ⏳ TODO (Requires Manual UI Work)
- User creation form updates (add new fields)
- User edit form updates
- PDF upload form (category dropdown)
- Alerts management dashboard
- PDF category management page
- User profile page updates

---

## 📝 API Reference

### User Management
```
POST   /api/users              # Create user (with new fields)
GET    /api/users              # List users
GET    /api/users/[id]         # Get user
PATCH  /api/users/[id]         # Update user (with new fields)
DELETE /api/users/[id]         # Delete user
```

### PDF Categories
```
GET    /api/pdf-categories     # List categories
POST   /api/pdf-categories     # Create category
GET    /api/pdf-categories/[id] # Get category
PATCH  /api/pdf-categories/[id] # Update category
DELETE /api/pdf-categories/[id] # Delete category
```

### Alerts
```
GET    /api/alerts             # List alerts (admin)
POST   /api/alerts             # Create alert
GET    /api/alerts/[id]        # Get alert
PATCH  /api/alerts/[id]        # Update alert
DELETE /api/alerts/[id]        # Delete alert
GET    /api/alerts/active      # Get active alerts (distributor)
```

### Authentication
```
POST   /api/auth/login         # Login (returns access + refresh tokens)
POST   /api/auth/refresh       # Refresh access token
POST   /api/auth/logout        # Logout (invalidates refresh token)
```

---

## 🐛 Known Limitations

1. **Database Connection**: Migration requires active database connection
2. **UI Forms**: Need manual updates to include new user fields
3. **PDF Upload UI**: Category dropdown needs to be added
4. **Alert Management UI**: Admin interface needs to be built
5. **Token Rotation**: Auto-refresh logic needs client-side implementation

---

## 📚 Next Steps

### Immediate (Required for Production)
1. Run database migrations when DB is available
2. Update user forms to include new fields
3. Add category dropdown to PDF upload
4. Build alerts management admin interface
5. Implement client-side token refresh logic
6. Add rate limiting to auth endpoints

### Future Enhancements
1. Alert scheduling system
2. Alert analytics (views, clicks)
3. Multi-language alert support
4. Alert templates
5. Bulk PDF category assignment
6. User import/export functionality

---

## 📞 Support

For issues or questions:
1. Check TypeScript errors: `npm run type-check`
2. Review Prisma logs in development
3. Check browser console for client errors
4. Review API response status codes
5. Verify environment variables

---

**Last Updated:** February 6, 2026
**Version:** 2.0.0
**Status:** Backend Complete, UI Pending
