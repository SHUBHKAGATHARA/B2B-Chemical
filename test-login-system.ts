// Quick test to verify login functionality
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function testLogin() {
    console.log('🔐 Testing Login System...\n');

    try {
        // Check if JWT_SECRET exists
        console.log('1. Checking environment variables...');
        console.log('   JWT_SECRET:', process.env.JWT_SECRET ? '✅ Configured' : '❌ Missing');
        console.log('   DATABASE_URL:', process.env.DATABASE_URL ? '✅ Configured' : '❌ Missing');

        // Check database connection
        console.log('\n2. Testing database connection...');
        await prisma.$connect();
        console.log('   ✅ Database connected');

        // Check if users exist
        console.log('\n3. Checking users in database...');
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                role: true,
                status: true,
                fullName: true,
            },
        });
        console.log(`   Found ${users.length} users:`);
        users.forEach(user => {
            console.log(`   - ${user.email} (${user.role}, ${user.status})`);
        });

        if (users.length === 0) {
            console.log('\n   ⚠️  No users found! You need to seed the database.');
            console.log('   Run: npm run db:seed');
            return;
        }

        // Try to authenticate with admin credentials
        console.log('\n4. Testing password verification...');
        const adminEmail = 'admin@system.com';
        const adminPassword = 'Admin@123';
        
        const admin = await prisma.user.findUnique({
            where: { email: adminEmail },
        });

        if (!admin) {
            console.log(`   ❌ Admin user not found (${adminEmail})`);
            console.log('   Run: npm run db:seed');
            return;
        }

        console.log(`   Admin user found: ${admin.email}`);
        
        const passwordMatch = await bcrypt.compare(adminPassword, admin.passwordHash);
        console.log(`   Password verification: ${passwordMatch ? '✅ Correct' : '❌ Incorrect'}`);

        if (!passwordMatch) {
            console.log('\n   ⚠️  Password does not match. Expected: Admin@123');
            return;
        }

        // Test JWT generation
        console.log('\n5. Testing JWT generation...');
        const jwt = require('jsonwebtoken');
        const jwtSecret = process.env.JWT_SECRET;
        
        if (!jwtSecret) {
            console.log('   ❌ JWT_SECRET not configured');
            return;
        }

        const token = jwt.sign(
            {
                userId: admin.id,
                email: admin.email,
                role: admin.role,
                fullName: admin.fullName,
            },
            jwtSecret,
            { expiresIn: '15m' }
        );

        console.log('   ✅ JWT token generated successfully');
        console.log('   Token snippet:', token.substring(0, 50) + '...');

        // Verify token
        const decoded = jwt.verify(token, jwtSecret);
        console.log('   ✅ JWT token verified successfully');
        console.log('   Decoded user:', decoded.email);

        console.log('\n✅ All login system checks passed!');
        console.log('\nTest Credentials:');
        console.log('==================');
        console.log('Email:', adminEmail);
        console.log('Password:', adminPassword);
        console.log('\nYou should now be able to login successfully.');

    } catch (error) {
        console.error('\n❌ Error during testing:', error);
        console.error('Error details:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

testLogin();
