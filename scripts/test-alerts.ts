/**
 * Test Alert System
 * 
 * This script checks:
 * 1. If there are active alerts in the database
 * 2. If the alert API is working correctly
 * 3. Provides sample data for testing
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testAlertSystem() {
    console.log('🔍 Testing Alert System...\n');

    try {
        // Check total alerts
        const totalAlerts = await prisma.alert.count();
        console.log(`📊 Total alerts in database: ${totalAlerts}`);

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
        });

        console.log(`✅ Active alerts: ${activeAlerts.length}`);

        if (activeAlerts.length > 0) {
            console.log('\n📋 Active Alert Details:');
            activeAlerts.forEach((alert, index) => {
                console.log(`\n${index + 1}. ${alert.title}`);
                console.log(`   ID: ${alert.alertId}`);
                console.log(`   Message: ${alert.message}`);
                console.log(`   Status: ${alert.status}`);
                console.log(`   Start: ${alert.startDate}`);
                console.log(`   End: ${alert.endDate || 'No end date'}`);
            });
        } else {
            console.log('\n⚠️  No active alerts found!');
            console.log('\n💡 Creating a test alert...');

            // Create a test alert
            const testAlert = await prisma.alert.create({
                data: {
                    alertId: `TEST-${Date.now()}`,
                    title: 'Test Alert',
                    message: 'This is a test alert to verify the popup system is working correctly.',
                    status: 'ACTIVE',
                    startDate: new Date(),
                    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
                },
            });

            console.log('✅ Test alert created successfully!');
            console.log(`   Alert ID: ${testAlert.alertId}`);
            console.log(`   Title: ${testAlert.title}`);
        }

        // Check inactive/expired alerts
        const inactiveAlerts = await prisma.alert.count({
            where: {
                OR: [
                    { status: { not: 'ACTIVE' } },
                    { endDate: { lt: now } },
                ],
            },
        });
        console.log(`\n📊 Inactive/Expired alerts: ${inactiveAlerts}`);

    } catch (error) {
        console.error('❌ Error testing alert system:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testAlertSystem();
