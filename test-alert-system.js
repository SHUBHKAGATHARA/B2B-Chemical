const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testAlertSystem() {
    console.log('=== TESTING ALERT SYSTEM ===\n');

    try {
        // 1. Check if Alert table exists and get count
        console.log('1. Checking Alert table...');
        const totalAlerts = await prisma.alert.count();
        console.log(`   ✓ Total alerts in database: ${totalAlerts}\n`);

        // 2. Get all alerts with their status
        console.log('2. Alert Status Breakdown:');
        const alerts = await prisma.alert.findMany({
            select: {
                id: true,
                alertId: true,
                title: true,
                status: true,
                startDate: true,
                endDate: true,
                createdAt: true,
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        if (alerts.length === 0) {
            console.log('   ⚠ No alerts found in database\n');
        } else {
            const statusCounts = alerts.reduce((acc, alert) => {
                acc[alert.status] = (acc[alert.status] || 0) + 1;
                return acc;
            }, {});

            Object.entries(statusCounts).forEach(([status, count]) => {
                console.log(`   - ${status}: ${count}`);
            });
            console.log('');
        }

        // 3. Check active alerts (current date/time)
        console.log('3. Checking Active Alerts (currently displayable):');
        const now = new Date();
        const activeAlerts = await prisma.alert.findMany({
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
            select: {
                id: true,
                alertId: true,
                title: true,
                message: true,
                imageUrl: true,
                startDate: true,
                endDate: true,
            },
        });

        console.log(`   ✓ Active alerts that should display: ${activeAlerts.length}\n`);

        if (activeAlerts.length > 0) {
            console.log('   Active Alerts Details:');
            activeAlerts.forEach((alert, index) => {
                console.log(`\n   ${index + 1}. ${alert.title}`);
                console.log(`      Alert ID: ${alert.alertId}`);
                console.log(`      Message: ${alert.message.substring(0, 50)}${alert.message.length > 50 ? '...' : ''}`);
                console.log(`      Has Image: ${alert.imageUrl ? '✓ Yes' : '✗ No'}`);
                console.log(`      Start Date: ${alert.startDate.toLocaleString()}`);
                console.log(`      End Date: ${alert.endDate ? alert.endDate.toLocaleString() : 'No end date (永久)'}`);
            });
            console.log('');
        }

        // 4. Check for expired alerts
        console.log('4. Checking Expired Alerts:');
        const expiredAlerts = await prisma.alert.findMany({
            where: {
                status: 'ACTIVE',
                endDate: {
                    lt: now,
                },
            },
            select: {
                id: true,
                title: true,
                endDate: true,
            },
        });

        if (expiredAlerts.length > 0) {
            console.log(`   ⚠ Found ${expiredAlerts.length} ACTIVE alerts that have expired:`);
            expiredAlerts.forEach(alert => {
                console.log(`      - ${alert.title} (ended: ${alert.endDate?.toLocaleString()})`);
            });
            console.log('   💡 These should be set to EXPIRED status\n');
        } else {
            console.log(`   ✓ No expired alerts found\n`);
        }

        // 5. Test API endpoint simulation
        console.log('5. Testing Alert Query Logic:');
        const apiResult = await prisma.alert.findMany({
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
        console.log(`   ✓ API would return ${apiResult.length} alert(s)\n`);

        // 6. Summary
        console.log('=== SUMMARY ===');
        console.log(`Total Alerts: ${totalAlerts}`);
        console.log(`Active & Displayable: ${activeAlerts.length}`);
        console.log(`Expired (needs cleanup): ${expiredAlerts.length}`);
        
        if (totalAlerts === 0) {
            console.log('\n⚠ WARNING: No alerts in database!');
            console.log('   Create test alert? Run: npm run seed or create manually in admin panel\n');
        } else if (activeAlerts.length === 0) {
            console.log('\n⚠ WARNING: No active alerts to display!');
            console.log('   - All alerts may be INACTIVE, EXPIRED, or scheduled for future\n');
        } else {
            console.log('\n✅ Alert system has displayable alerts!\n');
        }

        // 7. Test notification system
        console.log('=== TESTING NOTIFICATION SYSTEM ===\n');
        const notificationCount = await prisma.notification.count();
        console.log(`Total Notifications: ${notificationCount}`);
        
        if (notificationCount > 0) {
            const unreadCount = await prisma.notification.count({
                where: { readFlag: false }
            });
            console.log(`Unread Notifications: ${unreadCount}`);
            
            const recentNotifications = await prisma.notification.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    readFlag: true,
                    createdAt: true,
                    distributor: {
                        select: {
                            companyName: true
                        }
                    }
                }
            });
            
            console.log('\nRecent Notifications:');
            recentNotifications.forEach((notif, i) => {
                console.log(`${i + 1}. ${notif.distributor.companyName} - ${notif.readFlag ? 'Read' : 'Unread'} - ${notif.createdAt.toLocaleString()}`);
            });
        }

    } catch (error) {
        console.error('❌ Error testing alert system:', error);
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

testAlertSystem();
