import { prisma } from './lib/db';

async function checkAlerts() {
    try {
        console.log('Checking alerts in database...\n');
        
        const allAlerts = await prisma.alert.findMany({
            orderBy: { createdAt: 'desc' },
        });
        
        console.log(`Total alerts: ${allAlerts.length}`);
        
        if (allAlerts.length > 0) {
            console.log('\nAll Alerts:');
            allAlerts.forEach((alert, index) => {
                console.log(`\n${index + 1}. ${alert.title}`);
                console.log(`   Status: ${alert.status}`);
                console.log(`   Start Date: ${alert.startDate}`);
                console.log(`   End Date: ${alert.endDate || 'No end date'}`);
                console.log(`   Message: ${alert.message.substring(0, 50)}...`);
            });
        }
        
        // Check active alerts
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
            orderBy: {
                createdAt: 'desc',
            },
        });
        
        console.log(`\n\nActive alerts (should show to users): ${activeAlerts.length}`);
        
        if (activeAlerts.length > 0) {
            console.log('\nActive Alerts:');
            activeAlerts.forEach((alert, index) => {
                console.log(`\n${index + 1}. ${alert.title}`);
                console.log(`   Alert ID: ${alert.alertId}`);
                console.log(`   Status: ${alert.status}`);
                console.log(`   Start: ${alert.startDate}`);
                console.log(`   End: ${alert.endDate || 'No end date'}`);
            });
        } else {
            console.log('\n⚠️  No active alerts found! Create an alert from /dashboard/alerts');
        }
        
    } catch (error) {
        console.error('Error checking alerts:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkAlerts();
