#!/usr/bin/env node
/**
 * Production Database Seeding Script
 * 
 * This script seeds the production database with an admin user.
 * Run this ONCE after deploying to production.
 * 
 * Usage:
 *   1. Set your production DATABASE_URL in .env
 *   2. Run: npx tsx scripts/seed-production.ts
 */

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🚀 Starting production database seed...');
    console.log('⚠️  WARNING: This will create/update the admin user');
    
    const adminEmail = 'kagatharashubham9@gmail.com';
    const adminPassword = 'Shubham07@';
    
    try {
        // Check if admin already exists
        const existingAdmin = await prisma.user.findUnique({
            where: { email: adminEmail }
        });

        const adminPasswordHash = await bcrypt.hash(adminPassword, 10);

        if (existingAdmin) {
            console.log('📝 Admin user already exists. Updating...');
            await prisma.user.update({
                where: { email: adminEmail },
                data: {
                    fullName: 'Shubham Kagathara',
                    passwordHash: adminPasswordHash,
                    role: 'ADMIN',
                    status: 'ACTIVE',
                },
            });
            console.log('✅ Admin user updated successfully!');
        } else {
            console.log('➕ Creating new admin user...');
            await prisma.user.create({
                data: {
                    fullName: 'Shubham Kagathara',
                    email: adminEmail,
                    passwordHash: adminPasswordHash,
                    role: 'ADMIN',
                    status: 'ACTIVE',
                },
            });
            console.log('✅ Admin user created successfully!');
        }

        console.log('\n🎉 Production seeding completed!');
        console.log('\nLogin Credentials:');
        console.log('==================');
        console.log(`Email: ${adminEmail}`);
        console.log(`Password: ${adminPassword}`);
        console.log('==================\n');
    } catch (error) {
        console.error('❌ Error seeding production database:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
