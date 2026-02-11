const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAlerts() {
    try {
        const alerts = await prisma.alert.findMany();
        console.log('\n=== ALL ALERTS ===');
        console.log('Total alerts:', alerts.length);
        
        alerts.forEach(alert => {
            console.log('\nAlert ID:', alert.alertId);
            console.log('Title:', alert.title);
            console.log('Status:', alert.status);
            console.log('Start Date:', alert.startDate);
            console.log('End Date:', alert.endDate);
        });

        const now = new Date();
        const activeAlerts = await prisma.alert.findMany({
            where: {
                status: 'ACTIVE',
                startDate: { lte: now },
                OR: [
                    { endDate: null },
                    { endDate: { gte: now } }
                ]
            }
        });

        console.log('\n=== ACTIVE ALERTS (should show) ===');
        console.log('Active alerts count:', activeAlerts.length);
        activeAlerts.forEach(alert => {
            console.log('- ', alert.title);
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkAlerts();
