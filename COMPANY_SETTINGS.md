# Company Settings Module

## Overview
The Company Settings module allows administrators to manage company and distributor information, including contact details, address, tax registration ID, and company logo.

## Features

### ✅ Access Control
- **Admin Only**: Only users with ADMIN role can create, update, or delete company settings
- **View Access**: All authenticated users can view company settings
- **Role-based Authorization**: Enforced at both API and UI levels

### ✅ Company Information Management
- Company Name (required)
- Distributor Name (optional)
- Email Address (required, validated)
- Phone Number (required)
- Physical Address (required)
- Tax/Registration ID (optional)

### ✅ Logo Upload
- **Cloudinary Integration**: Company logos are uploaded to Cloudinary for optimized storage and delivery
- **File Validation**: 
  - Accepted formats: PNG, JPG, JPEG, WEBP
  - Maximum file size: 5MB
  - Client-side and server-side validation
- **Image Optimization**: Automatic resizing (max 500x500px) and format optimization
- **Preview**: Real-time logo preview before and after upload
- **Auto-cleanup**: Old logos are automatically deleted from Cloudinary when replaced

### ✅ Database Storage
- **Neon DB (PostgreSQL)**: All company data stored in `company_settings` table
- **Cloudinary URL Storage**: Only the secure image URL is stored in the database
- **Audit Trail**: Tracks creation and update timestamps, plus user who made changes
- **Activity Logging**: All create, update, and delete operations are logged

### ✅ UI/UX Features
- Clean, modern, responsive design
- Form pre-population with existing data
- Real-time validation feedback
- Success and error notifications
- Loading states during operations
- Confirmation dialogs for destructive actions
- Accessible from sidebar navigation (Admin only)

## File Structure

```
app/
├── api/
│   └── company-settings/
│       └── route.ts              # API endpoints (GET, POST, DELETE)
└── dashboard/
    └── company-settings/
        └── page.tsx              # Company Settings UI page

components/
└── layout/
    └── Sidebar.tsx               # Updated with Company Settings link

lib/
├── cloudinary.ts                 # Cloudinary upload/delete utilities
└── db.ts                         # Prisma client (existing)

prisma/
└── schema.prisma                 # Updated with CompanySettings model
```

## API Endpoints

### GET `/api/company-settings`
Fetch the latest company settings.

**Authentication**: Required (any authenticated user)

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "clx...",
    "companyName": "Spenti Cachemicals",
    "distributorName": "Global Distributors Inc.",
    "email": "contact@spenticachemicals.com",
    "phone": "+1 (555) 123-4567",
    "address": "123 Chemical Lane, Science City, SC 12345",
    "taxRegistrationId": "TAX-123456789",
    "logoUrl": "https://res.cloudinary.com/...",
    "createdAt": "2026-01-30T10:00:00.000Z",
    "updatedAt": "2026-01-30T10:00:00.000Z",
    "createdBy": "user_id"
  }
}
```

### POST `/api/company-settings`
Create or update company settings.

**Authentication**: Required (ADMIN only)

**Content-Type**: `multipart/form-data`

**Request Body**:
- `companyName` (string, required)
- `distributorName` (string, optional)
- `email` (string, required)
- `phone` (string, required)
- `address` (string, required)
- `taxRegistrationId` (string, optional)
- `logo` (File, optional) - Image file (PNG, JPG, JPEG, WEBP)

**Response**:
```json
{
  "success": true,
  "message": "Company settings saved successfully",
  "data": { /* company settings object */ }
}
```

### DELETE `/api/company-settings?id={id}`
Delete company settings.

**Authentication**: Required (ADMIN only)

**Query Parameters**:
- `id` (string, required) - Company settings ID

**Response**:
```json
{
  "success": true,
  "message": "Company settings deleted successfully"
}
```

## Database Schema

```prisma
model CompanySettings {
  id                String   @id @default(cuid())
  companyName       String
  distributorName   String?
  email             String
  phone             String
  address           String
  taxRegistrationId String?
  logoUrl           String?  // Cloudinary URL
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  createdBy         String   // User ID who created/last updated

  @@map("company_settings")
}
```

## Environment Variables

Ensure these are set in your `.env` file:

```env
# Database
DATABASE_URL="postgresql://..."

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"
```

## Usage

### For Administrators

1. **Access Company Settings**:
   - Navigate to the dashboard
   - Click "Company Settings" in the sidebar (under SETTINGS section)

2. **Create/Update Settings**:
   - Fill in the required fields (marked with *)
   - Optionally upload a company logo
   - Click "Save Settings"
   - Success notification will appear

3. **Upload Logo**:
   - Click "Upload Logo" button
   - Select an image file (PNG, JPG, JPEG, or WEBP, max 5MB)
   - Preview will appear immediately
   - Logo is uploaded to Cloudinary when you save

4. **Delete Settings**:
   - Click "Delete Settings" button
   - Confirm the deletion
   - Logo will be removed from Cloudinary automatically

### For Developers

#### Fetch Company Settings in Your Code

```typescript
const response = await fetch('/api/company-settings');
const { data } = await response.json();
console.log(data.companyName, data.logoUrl);
```

#### Upload Logo Programmatically

```typescript
const formData = new FormData();
formData.append('companyName', 'My Company');
formData.append('email', 'contact@company.com');
formData.append('phone', '+1234567890');
formData.append('address', '123 Main St');
formData.append('logo', logoFile); // File object

const response = await fetch('/api/company-settings', {
  method: 'POST',
  body: formData,
});
```

## Validation Rules

### Client-Side Validation
- All required fields must be filled
- Email must be in valid format
- Logo file must be PNG, JPG, JPEG, or WEBP
- Logo file size must not exceed 5MB

### Server-Side Validation
- Same as client-side, plus:
- Email format validation using regex
- File type validation
- File size validation
- Role-based access control

## Error Handling

The module includes comprehensive error handling:

- **401 Unauthorized**: User not authenticated
- **403 Forbidden**: User doesn't have admin privileges
- **400 Bad Request**: Invalid input or validation errors
- **404 Not Found**: Company settings don't exist
- **500 Internal Server Error**: Database or Cloudinary errors

All errors are logged and user-friendly messages are displayed.

## Security Features

1. **Authentication Required**: All endpoints require valid JWT token
2. **Role-Based Access**: Only admins can modify settings
3. **Input Validation**: Both client and server-side validation
4. **File Type Validation**: Only image files accepted
5. **File Size Limits**: Prevents large file uploads
6. **SQL Injection Prevention**: Prisma ORM with parameterized queries
7. **XSS Prevention**: React automatically escapes output
8. **CSRF Protection**: Built into Next.js API routes

## Performance Optimizations

1. **Cloudinary CDN**: Fast image delivery worldwide
2. **Image Optimization**: Automatic resizing and format conversion
3. **Lazy Loading**: Logo preview loads on demand
4. **Database Indexing**: Fast queries on company_settings table
5. **Caching**: Cloudinary provides automatic caching

## Testing

### Manual Testing Checklist

- [ ] Admin can access Company Settings page
- [ ] Non-admin users cannot access (or see limited view)
- [ ] Form validation works for all fields
- [ ] Logo upload works with valid files
- [ ] Logo upload rejects invalid files
- [ ] Logo preview displays correctly
- [ ] Settings save successfully
- [ ] Settings update existing data
- [ ] Old logo is deleted when new one is uploaded
- [ ] Delete functionality works
- [ ] Success/error messages display correctly
- [ ] Activity is logged in database

## Troubleshooting

### Logo Upload Fails
- Check Cloudinary credentials in `.env`
- Verify file size is under 5MB
- Ensure file format is PNG, JPG, JPEG, or WEBP
- Check browser console for errors

### Database Errors
- Verify `DATABASE_URL` is correct
- Run `npx prisma db push` to sync schema
- Check database connection

### Access Denied
- Verify user has ADMIN role
- Check JWT token is valid
- Ensure middleware is not blocking requests

## Future Enhancements

Potential improvements for future versions:

- [ ] Multiple logo variants (favicon, mobile, etc.)
- [ ] Social media links
- [ ] Business hours configuration
- [ ] Multi-language support
- [ ] Theme customization (colors, fonts)
- [ ] Email template branding
- [ ] API key management
- [ ] Webhook configuration

## Support

For issues or questions:
1. Check the error message in the UI
2. Review browser console for detailed errors
3. Check server logs for API errors
4. Verify environment variables are set correctly
5. Ensure database schema is up to date

---

**Last Updated**: January 30, 2026  
**Version**: 1.0.0  
**Module Status**: ✅ Production Ready
