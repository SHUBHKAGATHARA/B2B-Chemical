import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createUser() {
    try {
        console.log('🔍 Creating user: kagatharashubham9@gmail.com\n');

        const email = 'kagatharashubham9@gmail.com';
        const password = 'Shubhu007@#';

        // First check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            console.log('⚠️  User already exists. Updating password...');
            const passwordHash = await bcrypt.hash(password, 10);

            const updatedUser = await prisma.user.update({
                where: { email },
                data: {
                    passwordHash,
                    role: 'ADMIN',
                    status: 'ACTIVE'
                }
            });

            console.log('✅ User updated successfully:');
            console.log('   Email:', updatedUser.email);
            console.log('   Role:', updatedUser.role);
            console.log('   Status:', updatedUser.status);
        } else {
            console.log('Creating new user...');
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

            console.log('✅ User created successfully:');
            console.log('   ID:', newUser.id);
            console.log('   Email:', newUser.email);
            console.log('   Full Name:', newUser.fullName);
            console.log('   Role:', newUser.role);
            console.log('   Status:', newUser.status);
        }

        console.log('\n🎉 You can now login with:');
        console.log('   Email: kagatharashubham9@gmail.com');
        console.log('   Password: Shubhu007@#');

    } catch (error) {
        console.error('❌ Error:', error);
        throw error;
    }
}

createUser()
    .catch((e) => {
        console.error('Failed:', e.message);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
