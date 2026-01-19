import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDatabase() {
    console.log('📊 DATABASE STATUS CHECK\n');
    console.log('='.repeat(60));

    try {
        // Test connection
        console.log('\n1️⃣ Testing Database Connection...');
        await prisma.$connect();
        console.log('✅ Database connected successfully');

        // Count users
        console.log('\n2️⃣ Checking Users...');
        const userCount = await prisma.user.count();
        console.log(`   Total users: ${userCount}`);

        if (userCount > 0) {
            const users = await prisma.user.findMany({
                select: {
                    id: true,
                    email: true,
                    fullName: true,
                    role: true,
                    status: true,
                    createdAt: true,
                },
            });

            console.log('\n   User List:');
            users.forEach((user, i) => {
                console.log(`   ${i + 1}. ${user.fullName}`);
                console.log(`      Email: ${user.email}`);
                console.log(`      Role: ${user.role}`);
                console.log(`      Status: ${user.status}`);
                console.log(`      Created: ${user.createdAt.toISOString()}`);
                console.log('');
            });
        } else {
            console.log('⚠️  No users found in database!');
            console.log('\n   Creating default admin user...');

            const { hashPassword } = await import('./lib/auth/jwt');
            const hashedPassword = await hashPassword('admin123');

            const admin = await prisma.user.create({
                data: {
                    fullName: 'Admin User',
                    email: 'admin@example.com',
                    passwordHash: hashedPassword,
                    role: 'ADMIN',
                    status: 'ACTIVE',
                },
            });

            console.log('✅ Created admin user:');
            console.log(`   Email: ${admin.email}`);
            console.log(`   Password: admin123`);
            console.log(`   Role: ${admin.role}`);
        }

        // Count distributors
        console.log('\n3️⃣ Checking Distributors...');
        const distCount = await prisma.distributor.count();
        console.log(`   Total distributors: ${distCount}`);

        // Count PDFs
        console.log('\n4️⃣ Checking PDFs...');
        const pdfCount = await prisma.pdfUpload.count();
        console.log(`   Total PDFs: ${pdfCount}`);

        // Count notifications
        console.log('\n5️⃣ Checking Notifications...');
        const notifCount = await prisma.notification.count();
        console.log(`   Total notifications: ${notifCount}`);

        console.log('\n' + '='.repeat(60));
        console.log('✅ DATABASE CHECK COMPLETE\n');

    } catch (error) {
        console.error('\n❌ ERROR:', error.message);
        console.error('\nFull error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkDatabase();
