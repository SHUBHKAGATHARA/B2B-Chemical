import { prisma } from '../lib/db';
import { hashPassword } from '../lib/auth/jwt';

async function setupAdmin() {
    try {
        const email = 'admin@system.com';
        const password = 'Admin@123';

        console.log(`🔧 Setting up admin user: ${email}\n`);

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        const hashedPassword = await hashPassword(password);

        if (existingUser) {
            console.log('✅ User exists, updating...');
            await prisma.user.update({
                where: { id: existingUser.id },
                data: {
                    passwordHash: hashedPassword,
                    status: 'ACTIVE',
                    role: 'ADMIN',
                    fullName: 'System Administrator',
                },
            });
            console.log('✅ User updated successfully!');
        } else {
            console.log('📝 Creating new user...');
            await prisma.user.create({
                data: {
                    email,
                    passwordHash: hashedPassword,
                    role: 'ADMIN',
                    status: 'ACTIVE',
                    fullName: 'System Administrator',
                },
            });
            console.log('✅ User created successfully!');
        }

        console.log('\n✅ Setup complete!');
        console.log('\n📝 Login credentials:');
        console.log(`   Email: ${email}`);
        console.log(`   Password: ${password}`);


    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

setupAdmin();
