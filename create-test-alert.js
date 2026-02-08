const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createTestAlert() {
    console.log('Creating test alert...\n');

    try {
        const alert = await prisma.alert.create({
            data: {
                title: 'Welcome to B2B Chemical Platform!',
                message: 'This is a test alert to verify the alert system is working correctly. Alerts can include important announcements, promotions, or system updates.',
                status: 'ACTIVE',
                startDate: new Date(),
                endDate: null, // No end date - will show indefinitely
                // imageUrl: null, // Optional: add image URL if needed
                // buttonText: 'Learn More',
                // buttonAction: '/dashboard',
            }
        });

        console.log('✅ Test alert created successfully!\n');
        console.log('Alert Details:');
        console.log(`   Alert ID: ${alert.alertId}`);
        console.log(`   Title: ${alert.title}`);
        console.log(`   Status: ${alert.status}`);
        console.log(`   Created: ${alert.createdAt.toLocaleString()}\n`);

        console.log('🎉 Alert should now appear in your application!');
        console.log('   - Check the dashboard page for AlertBanner');
        console.log('   - Popup may appear on page load\n');

    } catch (error) {
        console.error('❌ Error creating test alert:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createTestAlert();
