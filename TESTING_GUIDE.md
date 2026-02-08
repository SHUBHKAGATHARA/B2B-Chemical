# Quick Test Guide - Alert & PDF Features

## Test 1: Create Alert with Image Upload

### Steps:
1. Login as Admin: `kagatharashubham9@gmail.com` / `Shubhu007@#`
2. Navigate to **Alert Management** from sidebar
3. Click **"Create Alert"** button
4. Fill in the form:
   - **Title**: "Important Update"
   - **Message**: "New chemical safety guidelines are now available"
   - **Image**: Click upload button and select an image (PNG/JPG, max 5MB)
   - **Start Date**: Today's date
   - **End Date**: (Optional) One week from now
   - **Button Text**: "View Guidelines"
   - **Button Action**: "https://example.com/guidelines"
   - **Status**: Active
5. Click **"Create Alert"**
6. Verify alert appears in the list

### Expected Result:
✅ Image uploads automatically to Cloudinary
✅ Preview shows immediately after upload
✅ Alert is created successfully
✅ Alert appears in the alerts list with image icon

---

## Test 2: View Alert as Distributor

### Steps:
1. Logout from admin account
2. Login as Distributor: `dist1@company.com` / `Dist@123`
3. Dashboard should load

### Expected Result:
✅ Alert banner appears at the top of the dashboard
✅ Alert shows title, message, and uploaded image
✅ Action button is visible with "View Guidelines" text
✅ Clicking action button opens the URL in new tab
✅ Close button (X) dismisses the alert
✅ Dismissed alert doesn't reappear on refresh

---

## Test 3: PDF Category Filtering

### Steps:
1. Login as Admin
2. Navigate to **PDF Transfer** from sidebar
3. Look at the "PDF Category" dropdown in upload form
4. Look at the "All Categories" filter dropdown above PDF list

### Expected Result:
✅ Both dropdowns show categories: Invoice, Bills, Notice, Announcement, etc.
✅ Selecting a category in filter shows only PDFs of that category
✅ "All Categories" shows all PDFs

---

## Test 4: Upload PDF with Category

### Steps:
1. As Admin, go to PDF Transfer page
2. Click "Browse Files" and select a PDF
3. Select distributor type (e.g., "All Distributors")
4. Select a category from "PDF Category" dropdown (e.g., "Invoice")
5. Add description (optional)
6. Click "Submit"

### Expected Result:
✅ PDF uploads successfully
✅ PDF appears in the list with selected category
✅ Category filter works to show/hide this PDF

---

## Test 5: Multiple Alerts Navigation

### Steps:
1. As Admin, create 2-3 different alerts
2. Logout and login as Distributor
3. Dashboard should show alert banner

### Expected Result:
✅ Alert shows "Alert 1 of 3" indicator
✅ Dots at bottom allow navigation between alerts
✅ Each alert shows its own content
✅ Dismissing one alert shows the next

---

## Test 6: Image Upload Error Handling

### Steps:
1. As Admin, try to create alert
2. Try uploading:
   - A non-image file (e.g., PDF, TXT)
   - An image larger than 5MB
   - No file at all

### Expected Result:
✅ Non-image file: Shows "Please select an image file"
✅ Large file: Shows "Image size should be less than 5MB"
✅ No file: Form can still be submitted (image is optional)

---

## Test 7: Alert Date Filtering

### Steps:
1. As Admin, create an alert with:
   - Start Date: Tomorrow
   - End Date: Next week
2. Login as Distributor

### Expected Result:
✅ Alert does NOT appear (start date is in future)

### Steps (Part 2):
1. As Admin, edit the alert
2. Change Start Date to today
3. Login as Distributor again

### Expected Result:
✅ Alert now appears

---

## Test 8: Login Error Messages

### Steps:
1. Go to login page
2. Try logging in with wrong password
3. Try logging in with non-existent email

### Expected Result:
✅ Shows specific error: "Invalid email or password"
✅ In development mode, shows additional error details
✅ Error message is user-friendly and actionable

---

## Quick Credentials

### Admin:
- Email: `kagatharashubham9@gmail.com`
- Password: `Shubhu007@#`

### Distributor:
- Email: `dist1@company.com`
- Password: `Dist@123`

---

## Common Issues & Solutions

### Issue: Image upload fails
**Solution**: 
1. Check `.env` file has Cloudinary credentials
2. Verify file is under 5MB
3. Check browser console for errors

### Issue: Categories not showing
**Solution**:
1. Run: `npx prisma db seed`
2. Check API: `http://localhost:3000/api/pdf-categories`

### Issue: Alerts not appearing for distributor
**Solution**:
1. Verify alert status is ACTIVE
2. Check start/end dates
3. Clear browser localStorage
4. Check browser console

### Issue: "An error occurred during login"
**Solution**:
1. Check database connection
2. Verify JWT_SECRET in `.env`
3. Check browser console for detailed error
4. Review server logs

---

## API Testing (Optional)

### Test Upload API:
```bash
curl -X POST http://localhost:3000/api/upload \
  -F "file=@/path/to/image.jpg" \
  -F "folder=alerts"
```

### Test Active Alerts API:
```bash
curl http://localhost:3000/api/alerts/active
```

### Test PDF Categories API:
```bash
curl http://localhost:3000/api/pdf-categories
```

---

## Checklist

- [ ] Alert creation with image upload works
- [ ] Alert appears for distributors on login
- [ ] Alert image displays correctly
- [ ] Alert action button works
- [ ] Alert dismissal works and persists
- [ ] Multiple alerts navigation works
- [ ] PDF category dropdown shows categories
- [ ] PDF category filtering works
- [ ] PDF upload with category works
- [ ] Login error messages are helpful
- [ ] All environment variables are set
- [ ] Cloudinary uploads work

---

**All tests passing? ✅ You're ready to go!**
