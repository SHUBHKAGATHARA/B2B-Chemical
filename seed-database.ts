import { PrismaClient } from '@prisma/client';
import { hashPassword } from './lib/auth/jwt';

const prisma = new PrismaClient();

async function seed() {
    console.log('🌱 SEEDING DATABASE\n');
    console.log('='.repeat(60));

    try {
        // Check if users already exist
        const existingUsers = await prisma.user.count();

        if (existingUsers > 0) {
            console.log(`\n⚠️  Database already has ${existingUsers} users.`);
            console.log('   Do you want to reset and seed? (Ctrl+C to cancel)\n');
        }

        // Clear existing data
        console.log('\n1️⃣ Clearing existing data...');
        await prisma.notification.deleteMany({});
        await prisma.pdfUpload.deleteMany({});
        await prisma.log.deleteMany({});
        await prisma.distributor.deleteMany({});
        await prisma.user.deleteMany({});
        console.log('   ✅ Cleared all tables');

        // Create admin user (matching demo credentials on login page)
        console.log('\n2️⃣ Creating admin user...');
        const adminPassword = await hashPassword('Admin@123');
        const admin = await prisma.user.create({
            data: {
                fullName: 'Admin User',
                email: 'admin@system.com',
                passwordHash: adminPassword,
                role: 'ADMIN',
                status: 'ACTIVE',
            },
        });
        console.log(`   ✅ Created: ${admin.email} (Admin@123)`);

        // Create test admin with simple password
        const admin2Password = await hashPassword('admin123');
        const admin2 = await prisma.user.create({
            data: {
                fullName: 'Test Admin',
                email: 'admin@example.com',
                passwordHash: admin2Password,
                role: 'ADMIN',
                status: 'ACTIVE',
            },
        });
        console.log(`   ✅ Created: ${admin2.email} (admin123)`);

        // Create distributors
        console.log('\n3️⃣ Creating distributors...');

        const dist1Password = await hashPassword('Dist@123');
        const dist1 = await prisma.distributor.create({
            data: {
                companyName: 'ABC Distribution Co.',
                email: 'dist1@company.com',
                status: 'ACTIVE',
            },
        });

        // Create corresponding user account for distributor
        await prisma.user.create({
            data: {
                fullName: 'ABC Distribution Co.',
                email: 'dist1@company.com',
                passwordHash: dist1Password,
                role: 'DISTRIBUTOR',
                status: 'ACTIVE',
            },
        });
        console.log(`   ✅ Created: ${dist1.email} (Dist@123)`);

        const dist2Password = await hashPassword('Dist@123');
        const dist2 = await prisma.distributor.create({
            data: {
                companyName: 'XYZ Logistics Ltd.',
                email: 'dist2@company.com',
                status: 'ACTIVE',
            },
        });

        await prisma.user.create({
            data: {
                fullName: 'XYZ Logistics Ltd.',
                email: 'dist2@company.com',
                passwordHash: dist2Password,
                role: 'DISTRIBUTOR',
                status: 'ACTIVE',
            },
        });
        console.log(`   ✅ Created: ${dist2.email} (Dist@123)`);

        // Create some sample PDFs
        console.log('\n4️⃣ Creating sample PDFs...');
        const pdf1 = await prisma.pdfUpload.create({
            data: {
                fileName: 'product-catalog-2026.pdf',
                fileUrl: '/uploads/product-catalog-2026.pdf',
                uploadedByAdminId: admin.id,
                assignedDistributorId: dist1.id,
                assignedGroup: 'SINGLE',
                status: 'PENDING',
            },
        });
        console.log(`   ✅ Created: ${pdf1.fileName}`);

        const pdf2 = await prisma.pdfUpload.create({
            data: {
                fileName: 'safety-guidelines.pdf',
                fileUrl: '/uploads/safety-guidelines.pdf',
                uploadedByAdminId: admin.id,
                assignedGroup: 'ALL',
                status: 'PENDING',
            },
        });
        console.log(`   ✅ Created: ${pdf2.fileName}`);

        // Create notifications
        console.log('\n5️⃣ Creating notifications...');
        await prisma.notification.create({
            data: {
                pdfId: pdf1.id,
                distId: dist1.id,
                readFlag: false,
            },
        });

        await prisma.notification.create({
            data: {
                pdfId: pdf2.id,
                distId: dist1.id,
                readFlag: false,
            },
        });

        await prisma.notification.create({
            data: {
                pdfId: pdf2.id,
                distId: dist2.id,
                readFlag: false,
            },
        });
        console.log('   ✅ Created 3 notifications');

        // Create some logs
        console.log('\n6️⃣ Creating activity logs...');
        await prisma.log.create({
            data: {
                action: 'System initialized and seeded',
                userId: admin.id,
            },
        });
        console.log('   ✅ Created activity logs');

        // Summary
        console.log('\n' + '='.repeat(60));
        console.log('✅ DATABASE SEEDED SUCCESSFULLY!\n');
        console.log('👥 Users created:');
        console.log('   • admin@system.com (Admin@123) - ADMIN');
        console.log('   • admin@example.com (admin123) - ADMIN');
        console.log('   • dist1@company.com (Dist@123) - DISTRIBUTOR');
        console.log('   • dist2@company.com (Dist@123) - DISTRIBUTOR');
        console.log('\n📊 Data created:');
        console.log('   • 4 Users');
        console.log('   • 2 Distributors');
        console.log('   • 2 PDFs');
        console.log('   • 3 Notifications');
        console.log('   • 1 Activity Log');

    } catch (error) {
        console.error('\n❌ ERROR:', error);
    } finally {
        await prisma.$disconnect();
    }
}

seed();
