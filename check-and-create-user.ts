import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function checkAndCreateUser() {
    console.log('🔍 Checking for user: kagatharashubham9@gmail.com\n');

    const email = 'kagatharashubham9@gmail.com';
    const password = 'Shubhu007@#';

    // Check if user exists
    let user = await prisma.user.findUnique({
        where: { email }
    });

    if (user) {
        console.log('✅ User already exists:');
        console.log('   ID:', user.id);
        console.log('   Email:', user.email);
        console.log('   Full Name:', user.fullName);
        console.log('   Role:', user.role);
        console.log('   Status:', user.status);

        // Test password
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        console.log('   Password matches:', isPasswordValid ? '✅ YES' : '❌ NO');

        if (!isPasswordValid) {
            console.log('\n⚠️  Password does not match. Updating password...');
            const newHash = await bcrypt.hash(password, 10);
            await prisma.user.update({
                where: { id: user.id },
                data: { passwordHash: newHash }
            });
            console.log('✅ Password updated successfully!');
        }
    } else {
        console.log('❌ User does not exist. Creating new admin user...\n');

        const passwordHash = await bcrypt.hash(password, 10);
        user = await prisma.user.create({
            data: {
                fullName: 'Shubham Kagathara',
                email: email,
                passwordHash: passwordHash,
                role: 'ADMIN',
                status: 'ACTIVE',
            },
        });

        console.log('✅ User created successfully:');
        console.log('   ID:', user.id);
        console.log('   Email:', user.email);
        console.log('   Full Name:', user.fullName);
        console.log('   Role:', user.role);
        console.log('   Status:', user.status);
    }

    console.log('\n🎉 You can now login with:');
    console.log('   Email:', email);
    console.log('   Password:', password);
}

checkAndCreateUser()
    .catch((e) => {
        console.error('❌ Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
