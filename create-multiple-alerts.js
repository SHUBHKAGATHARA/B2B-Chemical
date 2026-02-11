const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createMultipleAlerts() {
    console.log('Creating multiple test alerts...\n');

    try {
        // Delete old test alerts first
        await prisma.alert.deleteMany({
            where: {
                title: {
                    contains: 'Test Alert'
                }
            }
        });

        const alerts = [
            {
                alertId: `ALERT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                title: 'Test Alert #1 - Urgent Update',
                message: 'This is the FIRST test alert. You should see this popup first, then when you close it, Alert #2 should appear automatically!',
                status: 'ACTIVE',
                startDate: new Date(),
                endDate: null,
            },
            {
                alertId: `ALERT-${Date.now() + 1}-${Math.random().toString(36).substr(2, 9)}`,
                title: 'Test Alert #2 - Important Notice',
                message: 'This is the SECOND test alert. This should appear AFTER you close Alert #1. If you see this, the multi-alert system is working correctly!',
                status: 'ACTIVE',
                startDate: new Date(),
                endDate: null,
            },
            {
                alertId: `ALERT-${Date.now() + 2}-${Math.random().toString(36).substr(2, 9)}`,
                title: 'Test Alert #3 - Final Message',
                message: 'This is the THIRD and final test alert. Great job making it this far! The alert system is working perfectly.',
                status: 'ACTIVE',
                startDate: new Date(),
                endDate: null,
            }
        ];

        for (const alertData of alerts) {
            const alert = await prisma.alert.create({ data: alertData });
            console.log(`✅ Created: ${alert.title}`);
            console.log(`   Alert ID: ${alert.alertId}\n`);
        }

        console.log('🎉 All test alerts created successfully!');
        console.log('\n📋 To test the multi-alert popup:');
        console.log('   1. Clear localStorage (use the "Clear Alerts" button)');
        console.log('   2. Refresh the dashboard');
        console.log('   3. Alert #1 popup should appear');
        console.log('   4. Click "Next" or Close button');
        console.log('   5. Alert #2 should appear immediately');
        console.log('   6. Click "Next" or Close button');
        console.log('   7. Alert #3 should appear immediately');
        console.log('   8. Close Alert #3 - popup should close completely\n');

    } catch (error) {
        console.error('❌ Error creating alerts:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createMultipleAlerts();
