import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUser() {
    try {
        console.log('🔍 Checking user in database...\n');

        const user = await prisma.user.findUnique({
            where: { email: 'kagatharashubham9@gmail.com' }
        });

        if (user) {
            console.log('✅ User found:');
            console.log('   Email:', user.email);
            console.log('   Role:', user.role);
            console.log('   Status:', user.status);
            console.log('   Full Name:', user.fullName);
        } else {
            console.log('❌ User not found in database!');
            console.log('   Run: npx ts-node create-custom-user.ts');
        }

        // Check database connection
        await prisma.$queryRaw`SELECT 1`;
        console.log('\n✅ Database connection is working');

    } catch (error: any) {
        console.error('❌ Error:', error.message);
        if (error.message.includes('connect')) {
            console.log('\n⚠️  Database connection failed!');
            console.log('   Check your DATABASE_URL in .env');
        }
    } finally {
        await prisma.$disconnect();
    }
}

checkUser();
