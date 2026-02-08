import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function testLogin() {
    console.log('🔍 Testing Login Debug...\n');

    const testEmail = 'admin@system.com';
    const testPassword = 'Admin@123';

    console.log('1. Checking if user exists in database...');
    const user = await prisma.user.findUnique({
        where: { email: testEmail }
    });

    if (!user) {
        console.log('❌ User not found in database!');
        console.log('   Please run: npx prisma db seed');
        return;
    }

    console.log('✅ User found:', {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        status: user.status,
    });

    console.log('\n2. Testing password hash...');
    console.log('   Stored hash:', user.passwordHash);
    console.log('   Testing password:', testPassword);

    const isPasswordValid = await bcrypt.compare(testPassword, user.passwordHash);
    console.log('   Password valid:', isPasswordValid ? '✅ YES' : '❌ NO');

    if (!isPasswordValid) {
        console.log('\n3. Generating new hash for comparison...');
        const newHash = await bcrypt.hash(testPassword, 10);
        console.log('   New hash:', newHash);
        const testNewHash = await bcrypt.compare(testPassword, newHash);
        console.log('   New hash works:', testNewHash ? '✅ YES' : '❌ NO');
    }

    console.log('\n4. Checking all users in database...');
    const allUsers = await prisma.user.findMany({
        select: {
            email: true,
            role: true,
            status: true,
        }
    });
    console.log('   Total users:', allUsers.length);
    allUsers.forEach(u => {
        console.log(`   - ${u.email} (${u.role}, ${u.status})`);
    });
}

testLogin()
    .catch((e) => {
        console.error('❌ Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
