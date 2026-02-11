# Alert System - Testing Guide

## The alert system is now fixed and enhanced!

### What was fixed:
1. ✅ Added auto-refresh every 30 seconds
2. ✅ Added refresh on window focus (when you come back to the tab)
3. ✅ Better localStorage handling
4. ✅ Enhanced console logging for debugging

### How to test alerts:

#### Method 1: Clear localStorage (Recommended)
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for the red "Clear Alerts" button at bottom-right of screen
4. Click it to clear all alert cache
5. Page will reload automatically
6. Alerts should now appear!

#### Method 2: Manual localStorage Clear
1. Open browser DevTools (F12)
2. Go to Application tab → Local Storage
3. Delete these keys:
   - `seenAlertPopups`
   - `dismissedAlerts`
4. Refresh the page (F5)

#### Method 3: Use Test Page
1. Navigate to: `http://localhost:3000/test-alerts`
2. Click "Clear LocalStorage & Reload" button
3. Go back to dashboard

### Check Console Logs:
Open browser console (F12 → Console) and look for:
- `[AlertBanner] Fetching active alerts...`
- `[AlertBanner] Loaded alerts: X`
- `[AlertPopup] Total active alerts: X`
- `[AlertPopup] Unseen alerts: X`
- `[AlertPopup] Opening popup with X alerts`

### Current Active Alerts in Database:
Based on the check, there is **1 active alert**:
- Title: "Welcome to B2B Chemical Platform!"
- Alert ID: ALERT-1770818611907-cv61va9sp
- Status: ACTIVE (no end date - shows indefinitely)

### If alerts still don't show:
1. Check browser console for errors
2. Verify the alert hasn't been seen (check localStorage)
3. Wait 30 seconds for auto-refresh
4. Switch to another tab and back (triggers focus refresh)
5. Use the "Clear Alerts" button at bottom-right

### Creating New Test Alerts:
Run: `node create-test-alert.js`

This will create a new alert that should appear immediately.
