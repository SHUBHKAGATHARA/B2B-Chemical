/**
 * Test Alert with Image
 * Creates a test alert with an image to verify popup functionality
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testAlertWithImage() {
    console.log('🔍 Testing Alert with Image...\n');

    try {
        // Check existing alerts with images
        const alertsWithImages = await prisma.alert.findMany({
            where: {
                status: 'ACTIVE',
                imageUrl: {
                    not: null
                }
            }
        });

        console.log(`📊 Active alerts with images: ${alertsWithImages.length}`);

        if (alertsWithImages.length > 0) {
            console.log('\n📋 Alerts with Images:');
            alertsWithImages.forEach((alert, index) => {
                console.log(`\n${index + 1}. ${alert.title}`);
                console.log(`   Image URL: ${alert.imageUrl}`);
                console.log(`   Alert ID: ${alert.alertId}`);
            });
        }

        // Create a test alert with a sample image
        console.log('\n💡 Creating test alert with image...');

        const testAlert = await prisma.alert.create({
            data: {
                alertId: `TEST-IMG-${Date.now()}`,
                title: 'Test Alert with Image',
                message: 'This is a test alert with an image. If you can see this popup with the image above, the system is working correctly!',
                imageUrl: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=800&h=400&fit=crop', // Sample image from Unsplash
                status: 'ACTIVE',
                startDate: new Date(),
                endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
            },
        });

        console.log('✅ Test alert with image created successfully!');
        console.log(`   Alert ID: ${testAlert.alertId}`);
        console.log(`   Title: ${testAlert.title}`);
        console.log(`   Image URL: ${testAlert.imageUrl}`);
        console.log('\n📱 To test:');
        console.log('   1. Clear localStorage: localStorage.removeItem("seenAlertPopups")');
        console.log('   2. Refresh the page');
        console.log('   3. The popup should appear with the image');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testAlertWithImage();
