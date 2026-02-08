import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function diagnoseLogin() {
    console.log('🔍 Diagnosing Login Issue...\n');

    const email = 'kagatharashubham9@gmail.com';
    const password = 'Shubhu007@#';

    try {
        // Step 1: Check database connection
        console.log('1️⃣  Testing database connection...');
        await prisma.$connect();
        console.log('   ✅ Database connected\n');

        // Step 2: Find user
        console.log('2️⃣  Looking for user...');
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            console.log('   ❌ User not found!');
            console.log('   Creating user...\n');

            const passwordHash = await bcrypt.hash(password, 10);
            const newUser = await prisma.user.create({
                data: {
                    fullName: 'Shubham Kagathara',
                    email: email,
                    passwordHash: passwordHash,
                    role: 'ADMIN',
                    status: 'ACTIVE',
                    accountName: 'Shubham',
                    phoneNumber: '',
                    address: '',
                },
            });
            console.log('   ✅ User created:', newUser.email);
        } else {
            console.log('   ✅ User found:', user.email);
            console.log('   Role:', user.role);
            console.log('   Status:', user.status);
        }

        // Step 3: Test password
        console.log('\n3️⃣  Testing password...');
        const currentUser = await prisma.user.findUnique({
            where: { email }
        });

        if (currentUser) {
            const isValid = await bcrypt.compare(password, currentUser.passwordHash);
            console.log('   Password valid:', isValid ? '✅ YES' : '❌ NO');

            if (!isValid) {
                console.log('\n   Updating password...');
                const newHash = await bcrypt.hash(password, 10);
                await prisma.user.update({
                    where: { email },
                    data: { passwordHash: newHash }
                });
                console.log('   ✅ Password updated');
            }
        }

        // Step 4: Test JWT
        console.log('\n4️⃣  Testing JWT generation...');
        const jwt = await import('jsonwebtoken');
        const secret = process.env.JWT_SECRET || 'fallback-secret';
        const token = jwt.sign(
            { userId: 'test', email: 'test@test.com', role: 'ADMIN' },
            secret,
            { expiresIn: '15m' }
        );
        console.log('   ✅ JWT generation works');
        console.log('   JWT_SECRET configured:', !!process.env.JWT_SECRET);

        console.log('\n✅ All diagnostics passed!');
        console.log('\n📝 Try logging in now with:');
        console.log('   Email:', email);
        console.log('   Password:', password);

    } catch (error: any) {
        console.error('\n❌ Error:', error.message);
        console.error('   Stack:', error.stack);
    } finally {
        await prisma.$disconnect();
    }
}

diagnoseLogin();
