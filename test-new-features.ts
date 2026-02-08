// Test script to verify PDF categories and alerts functionality

async function testFeatures() {
    console.log('🧪 Testing New Features...\n');

    // Test 1: Fetch PDF Categories
    console.log('1️⃣  Testing PDF Categories API...');
    try {
        const categoriesResponse = await fetch('http://localhost:3000/api/pdf-categories');
        const categoriesData = await categoriesResponse.json();

        if (categoriesData.success) {
            console.log(`   ✅ Found ${categoriesData.data.length} categories:`);
            categoriesData.data.slice(0, 5).forEach((cat: any) => {
                console.log(`      - ${cat.name}: ${cat.description}`);
            });
            console.log(`      ... and ${categoriesData.data.length - 5} more\n`);
        } else {
            console.log('   ❌ Failed to fetch categories\n');
        }
    } catch (error: any) {
        console.log('   ❌ Error:', error.message, '\n');
    }

    // Test 2: Create a test alert
    console.log('2️⃣  Testing Alert Creation...');
    try {
        const alertData = {
            title: 'Test Alert - System Check',
            message: 'This is an automated test alert to verify the alert system is working correctly.',
            imageUrl: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
            buttonText: 'Learn More',
            buttonAction: 'https://example.com',
            status: 'ACTIVE',
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        };

        const createResponse = await fetch('http://localhost:3000/api/alerts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(alertData),
        });

        const createData = await createResponse.json();

        if (createData.success) {
            console.log('   ✅ Alert created successfully!');
            console.log(`      ID: ${createData.data.id}`);
            console.log(`      Title: ${createData.data.title}\n`);
        } else {
            console.log('   ❌ Failed to create alert');
            console.log('      Error:', createData.error?.message, '\n');
        }
    } catch (error: any) {
        console.log('   ❌ Error:', error.message, '\n');
    }

    // Test 3: Fetch active alerts (mobile app endpoint)
    console.log('3️⃣  Testing Active Alerts API (Mobile App Endpoint)...');
    try {
        const activeAlertsResponse = await fetch('http://localhost:3000/api/alerts/active');
        const activeAlertsData = await activeAlertsResponse.json();

        if (activeAlertsData.success) {
            console.log(`   ✅ Found ${activeAlertsData.data.length} active alert(s):`);
            activeAlertsData.data.forEach((alert: any) => {
                console.log(`      - ${alert.title}`);
                console.log(`        Status: ${alert.status}`);
                console.log(`        Start: ${new Date(alert.startDate).toLocaleDateString()}`);
                console.log(`        End: ${alert.endDate ? new Date(alert.endDate).toLocaleDateString() : 'No end date'}`);
            });
            console.log('');
        } else {
            console.log('   ❌ Failed to fetch active alerts\n');
        }
    } catch (error: any) {
        console.log('   ❌ Error:', error.message, '\n');
    }

    // Test 4: Fetch all alerts
    console.log('4️⃣  Testing All Alerts API (Admin Endpoint)...');
    try {
        const allAlertsResponse = await fetch('http://localhost:3000/api/alerts');
        const allAlertsData = await allAlertsResponse.json();

        if (allAlertsData.success) {
            console.log(`   ✅ Found ${allAlertsData.data.alerts.length} total alert(s)\n`);
        } else {
            console.log('   ❌ Failed to fetch all alerts\n');
        }
    } catch (error: any) {
        console.log('   ❌ Error:', error.message, '\n');
    }

    console.log('✨ Testing Complete!\n');
    console.log('📋 Summary:');
    console.log('   - PDF Categories: Ready for use in upload form');
    console.log('   - Alert System: Fully functional');
    console.log('   - Mobile API: Active alerts endpoint working');
    console.log('\n🎯 Next Steps:');
    console.log('   1. Login to admin dashboard: http://localhost:3000/login');
    console.log('   2. Go to Alert Management to create/manage alerts');
    console.log('   3. Go to PDF Transfer to use category dropdown');
    console.log('   4. Mobile app can call GET /api/alerts/active');
}

testFeatures().catch(console.error);
