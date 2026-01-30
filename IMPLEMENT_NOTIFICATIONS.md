# How to Implement Notifications - Simple Guide

## 🎯 Goal
Send notifications to distributors when you upload a file to the B2B Portal.

---

## 📋 Prerequisites

1. **API Key** - Get from portal admin
2. **Portal URL** - e.g., `https://your-portal.com`
3. **Distributor IDs** - IDs of users to notify

---

## 🚀 Implementation Steps

### Step 1: Store Your API Key

**Add to your `.env` file:**
```env
PORTAL_URL=https://your-portal.com
PORTAL_API_KEY=your-api-key-here
```

**Never hardcode the API key in your code!**

---

### Step 2: Create Notification Function

Choose your language:

#### **JavaScript/Node.js**

```javascript
// notification.js

async function sendNotification(distributorIds, pdfId) {
    const response = await fetch(`${process.env.PORTAL_URL}/api/notifications/send`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            distributorIds: distributorIds,
            pdfId: pdfId,
            apiKey: process.env.PORTAL_API_KEY
        })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
    }

    return await response.json();
}

// Export for use
module.exports = { sendNotification };
```

#### **Python**

```python
# notification.py

import os
import requests

def send_notification(distributor_ids, pdf_id):
    url = f"{os.getenv('PORTAL_URL')}/api/notifications/send"
    
    payload = {
        "distributorIds": distributor_ids,
        "pdfId": pdf_id,
        "apiKey": os.getenv('PORTAL_API_KEY')
    }
    
    response = requests.post(url, json=payload)
    response.raise_for_status()
    
    return response.json()
```

#### **PHP**

```php
<?php
// notification.php

function sendNotification($distributorIds, $pdfId) {
    $url = getenv('PORTAL_URL') . '/api/notifications/send';
    
    $data = [
        'distributorIds' => $distributorIds,
        'pdfId' => $pdfId,
        'apiKey' => getenv('PORTAL_API_KEY')
    ];
    
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpCode !== 200) {
        throw new Exception('Notification failed');
    }
    
    return json_decode($response, true);
}
?>
```

---

### Step 3: Use in Your Upload Flow

#### **JavaScript Example**

```javascript
// upload-handler.js

const { sendNotification } = require('./notification');

async function uploadFile(file, distributorIds) {
    try {
        // 1. Upload the file to portal
        const uploadResult = await uploadPDF(file);
        const pdfId = uploadResult.data.id;
        
        console.log('✅ File uploaded:', pdfId);
        
        // 2. Send notification to distributors
        const notificationResult = await sendNotification(distributorIds, pdfId);
        
        console.log('✅ Notification sent to', notificationResult.data.notificationCount, 'distributors');
        
        return {
            success: true,
            pdfId: pdfId,
            notificationsSent: notificationResult.data.notificationCount
        };
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        throw error;
    }
}

// Usage
const distributorIds = ['dist_abc123', 'dist_def456'];
const file = 'path/to/file.pdf';

uploadFile(file, distributorIds);
```

#### **Python Example**

```python
# upload_handler.py

from notification import send_notification

def upload_file(file_path, distributor_ids):
    try:
        # 1. Upload the file to portal
        upload_result = upload_pdf(file_path)
        pdf_id = upload_result['data']['id']
        
        print(f"✅ File uploaded: {pdf_id}")
        
        # 2. Send notification to distributors
        notification_result = send_notification(distributor_ids, pdf_id)
        
        print(f"✅ Notification sent to {notification_result['data']['notificationCount']} distributors")
        
        return {
            'success': True,
            'pdf_id': pdf_id,
            'notifications_sent': notification_result['data']['notificationCount']
        }
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        raise

# Usage
distributor_ids = ['dist_abc123', 'dist_def456']
file_path = 'path/to/file.pdf'

upload_file(file_path, distributor_ids)
```

---

## 📝 Complete Example

### Full Working Example (JavaScript)

```javascript
// complete-example.js

require('dotenv').config();

// Configuration
const PORTAL_URL = process.env.PORTAL_URL;
const API_KEY = process.env.PORTAL_API_KEY;

// Function to send notification
async function sendNotification(distributorIds, pdfId) {
    const response = await fetch(`${PORTAL_URL}/api/notifications/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            distributorIds,
            pdfId,
            apiKey: API_KEY
        })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Notification failed');
    }

    return await response.json();
}

// Main function
async function main() {
    // Your distributor IDs (get these from portal admin)
    const distributorIds = [
        'dist_abc123',
        'dist_def456'
    ];
    
    // Your PDF ID (from upload response)
    const pdfId = 'pdf_xyz789';
    
    try {
        console.log('📤 Sending notification...');
        
        const result = await sendNotification(distributorIds, pdfId);
        
        console.log('✅ Success!');
        console.log(`   Notified: ${result.data.notificationCount} distributors`);
        console.log(`   File: ${result.data.pdfFileName}`);
        
    } catch (error) {
        console.error('❌ Failed:', error.message);
    }
}

// Run
main();
```

**Run it:**
```bash
node complete-example.js
```

---

## 🧪 Testing

### Test with cURL

```bash
# Replace with your actual values
curl -X POST https://your-portal.com/api/notifications/send \
  -H "Content-Type: application/json" \
  -d '{
    "distributorIds": ["dist_abc123"],
    "pdfId": "pdf_xyz789",
    "apiKey": "your-api-key"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Notifications sent to 1 distributor(s)",
  "data": {
    "notificationCount": 1,
    "pdfId": "pdf_xyz789",
    "pdfFileName": "document.pdf"
  }
}
```

---

## ⚠️ Error Handling

### Handle Common Errors

```javascript
async function sendNotificationSafely(distributorIds, pdfId) {
    try {
        return await sendNotification(distributorIds, pdfId);
    } catch (error) {
        // Check error type
        if (error.message.includes('Invalid API key')) {
            console.error('❌ API key is wrong - check your .env file');
        } else if (error.message.includes('PDF not found')) {
            console.error('❌ PDF ID is invalid - check the ID');
        } else if (error.message.includes('distributor')) {
            console.error('❌ Distributor ID is invalid - check the IDs');
        } else {
            console.error('❌ Unknown error:', error.message);
        }
        
        // Don't throw - just log and continue
        return null;
    }
}
```

---

## ✅ Checklist

Before going live, verify:

- [ ] API key is stored in environment variable
- [ ] Portal URL is correct
- [ ] Distributor IDs are valid
- [ ] Notification is sent AFTER successful upload
- [ ] Errors are handled gracefully
- [ ] Tested with real data
- [ ] Logs are in place for debugging

---

## 🎓 What Happens Next?

1. **You call the API** → Notification created in database
2. **Distributor logs in** → Sees notification in bell icon
3. **Distributor clicks bell** → Sees your file upload
4. **Distributor clicks notification** → Marked as read

---

## 📊 Request/Response Format

### Request Format
```json
{
  "distributorIds": ["string", "string"],  // Array of IDs
  "pdfId": "string",                       // Single PDF ID
  "apiKey": "string"                       // Your API key
}
```

### Success Response
```json
{
  "success": true,
  "message": "Notifications sent to N distributor(s)",
  "data": {
    "notificationCount": 2,
    "pdfId": "pdf_xyz789",
    "pdfFileName": "document.pdf",
    "distributors": [
      { "id": "dist_123", "name": "ABC Corp" }
    ]
  }
}
```

### Error Response
```json
{
  "error": "Error message here"
}
```

---

## 🔑 Getting Your API Key

Contact the portal administrator with:
- Your application name
- Purpose of integration
- Expected usage volume

They will provide your unique API key.

---

## 💡 Tips

1. **Always use HTTPS** - Never send API keys over HTTP
2. **Don't retry too fast** - Wait 1-2 seconds between retries
3. **Log everything** - Makes debugging easier
4. **Test in staging first** - Before production
5. **Monitor failures** - Set up alerts for errors

---

## 🆘 Troubleshooting

### Problem: "Invalid API key"
**Fix:** Check your `.env` file has the correct key

### Problem: "PDF not found"
**Fix:** Verify the PDF was uploaded successfully first

### Problem: "Distributor not found"
**Fix:** Ask admin for correct distributor IDs

### Problem: Network timeout
**Fix:** Check internet connection and portal URL

---

## 📞 Need Help?

- **Email:** support@portal.example.com
- **Full API Guide:** `API_CONSUMER_GUIDE.md`
- **Quick Reference:** `API_QUICK_REFERENCE.md`

---

## 🎉 You're Done!

Your application can now send notifications to distributors when files are uploaded!

**Next Steps:**
1. Test with real data
2. Monitor for errors
3. Deploy to production
4. Celebrate! 🎊
