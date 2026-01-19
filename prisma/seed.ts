import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seed...');

    // Clear existing data
    await prisma.notification.deleteMany();
    await prisma.log.deleteMany();
    await prisma.pdfUpload.deleteMany();
    await prisma.distributor.deleteMany();
    await prisma.user.deleteMany();

    // Create Super Admin
    const adminPassword = await bcrypt.hash('Admin@123', 10);
    const admin = await prisma.user.create({
        data: {
            fullName: 'Super Admin',
            email: 'admin@system.com',
            passwordHash: adminPassword,
            role: 'ADMIN',
            status: 'ACTIVE',
        },
    });
    console.log('✅ Created Super Admin:', admin.email);

    // Create 3 Distributors
    const distPassword = await bcrypt.hash('Dist@123', 10);

    const dist1 = await prisma.distributor.create({
        data: {
            companyName: 'Tech Solutions Inc',
            email: 'dist1@company.com',
            status: 'ACTIVE',
        },
    });

    // Also create distributor users
    await prisma.user.create({
        data: {
            fullName: 'John Distributor',
            email: 'dist1@company.com',
            passwordHash: distPassword,
            role: 'DISTRIBUTOR',
            status: 'ACTIVE',
        },
    });

    const dist2 = await prisma.distributor.create({
        data: {
            companyName: 'Global Traders Ltd',
            email: 'dist2@company.com',
            status: 'ACTIVE',
        },
    });

    await prisma.user.create({
        data: {
            fullName: 'Sarah Distributor',
            email: 'dist2@company.com',
            passwordHash: distPassword,
            role: 'DISTRIBUTOR',
            status: 'ACTIVE',
        },
    });

    const dist3 = await prisma.distributor.create({
        data: {
            companyName: 'Premium Supplies Co',
            email: 'dist3@company.com',
            status: 'ACTIVE',
        },
    });

    await prisma.user.create({
        data: {
            fullName: 'Mike Distributor',
            email: 'dist3@company.com',
            passwordHash: distPassword,
            role: 'DISTRIBUTOR',
            status: 'ACTIVE',
        },
    });

    console.log('✅ Created 3 Distributors');

    // Create 2 Sample PDF Uploads
    const pdf1 = await prisma.pdfUpload.create({
        data: {
            fileName: 'Product_Catalog_2024.pdf',
            fileUrl: '/uploads/pdfs/sample-catalog.pdf',
            uploadedByAdminId: admin.id,
            assignedDistributorId: dist1.id,
            assignedGroup: 'SINGLE',
            status: 'DONE',
        },
    });

    const pdf2 = await prisma.pdfUpload.create({
        data: {
            fileName: 'Monthly_Report_January.pdf',
            fileUrl: '/uploads/pdfs/sample-report.pdf',
            uploadedByAdminId: admin.id,
            assignedGroup: 'ALL',
            status: 'PENDING',
        },
    });

    console.log('✅ Created 2 Sample PDFs');

    // Create 3 Sample Notifications
    const notif1 = await prisma.notification.create({
        data: {
            pdfId: pdf1.id,
            distId: dist1.id,
            readFlag: false,
        },
    });

    const notif2 = await prisma.notification.create({
        data: {
            pdfId: pdf2.id,
            distId: dist2.id,
            readFlag: false,
        },
    });

    const notif3 = await prisma.notification.create({
        data: {
            pdfId: pdf2.id,
            distId: dist3.id,
            readFlag: true,
        },
    });

    console.log('✅ Created 3 Sample Notifications');

    // Create some logs
    await prisma.log.create({
        data: {
            action: 'Admin logged in',
            userId: admin.id,
        },
    });

    await prisma.log.create({
        data: {
            action: `Uploaded PDF: ${pdf1.fileName}`,
            userId: admin.id,
        },
    });

    console.log('✅ Created Sample Logs');

    console.log('\n🎉 Database seeding completed successfully!\n');
    console.log('Login Credentials:');
    console.log('==================');
    console.log('Admin:');
    console.log('  Email: admin@system.com');
    console.log('  Password: Admin@123\n');
    console.log('Distributors:');
    console.log('  Email: dist1@company.com');
    console.log('  Email: dist2@company.com');
    console.log('  Email: dist3@company.com');
    console.log('  Password: Dist@123 (for all)\n');
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
