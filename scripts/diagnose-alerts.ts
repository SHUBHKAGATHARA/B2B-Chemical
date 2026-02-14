/**
 * Diagnostic: Check Alert Data Structure
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function diagnoseAlerts() {
    console.log('🔍 Diagnosing Alert System...\n');

    try {
        const now = new Date();

        // Get all active alerts
        const alerts = await prisma.alert.findMany({
            where: {
                status: 'ACTIVE',
                startDate: {
                    lte: now,
                },
                OR: [
                    { endDate: null },
                    { endDate: { gte: now } },
                ],
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        console.log(`📊 Total Active Alerts: ${alerts.length}\n`);

        if (alerts.length === 0) {
            console.log('⚠️  No active alerts found!\n');
            console.log('Creating a test alert with image...\n');

            const testAlert = await prisma.alert.create({
                data: {
                    alertId: `DIAG-${Date.now()}`,
                    title: 'Diagnostic Test Alert',
                    message: 'This alert was created by the diagnostic script to test image functionality.',
                    imageUrl: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=800&h=400&fit=crop',
                    status: 'ACTIVE',
                    startDate: new Date(),
                    endDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
                },
            });

            console.log('✅ Test alert created!');
            console.log(`   ID: ${testAlert.alertId}`);
            console.log(`   Title: ${testAlert.title}`);
            console.log(`   Has Image: ${!!testAlert.imageUrl}`);
            console.log(`   Image URL: ${testAlert.imageUrl}\n`);
        } else {
            console.log('📋 Alert Details:\n');

            alerts.forEach((alert, index) => {
                console.log(`${index + 1}. ${alert.title}`);
                console.log(`   Alert ID: ${alert.alertId}`);
                console.log(`   Status: ${alert.status}`);
                console.log(`   Has Image: ${!!alert.imageUrl}`);
                if (alert.imageUrl) {
                    console.log(`   Image URL: ${alert.imageUrl}`);
                    console.log(`   Image URL Length: ${alert.imageUrl.length} chars`);
                    console.log(`   Image URL Valid: ${alert.imageUrl.startsWith('http')}`);
                }
                console.log(`   Start Date: ${alert.startDate}`);
                console.log(`   End Date: ${alert.endDate || 'No end date'}`);
                console.log(`   Message: ${alert.message.substring(0, 100)}${alert.message.length > 100 ? '...' : ''}`);
                console.log('');
            });
        }

        // Test API endpoint
        console.log('\n🌐 Testing API Endpoint...\n');
        console.log('API would return:');
        console.log(JSON.stringify({
            success: true,
            data: alerts.map(a => ({
                id: a.id,
                alertId: a.alertId,
                title: a.title,
                message: a.message,
                imageUrl: a.imageUrl,
                status: a.status,
                startDate: a.startDate,
                endDate: a.endDate,
            }))
        }, null, 2));

        console.log('\n📱 Next Steps:');
        console.log('1. Visit http://localhost:3001/test-alert to test popup');
        console.log('2. Open browser console and run: localStorage.removeItem("seenAlertPopups")');
        console.log('3. Refresh any page to see the popup');
        console.log('4. Check console for [AlertPopup] logs');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

diagnoseAlerts();
