import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDatabase() {
    console.log('\n🔍 DATABASE VERIFICATION\n');
    console.log('='.repeat(80));

    // Check Users
    const users = await prisma.user.findMany({
        select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
            status: true,
            createdAt: true,
        },
    });
    console.log(`\n✅ USERS TABLE: ${users.length} records`);
    users.forEach((user, index) => {
        console.log(`  ${index + 1}. ${user.fullName} (${user.email}) - ${user.role} - ${user.status}`);
    });

    // Check Distributors
    const distributors = await prisma.distributor.findMany();
    console.log(`\n✅ DISTRIBUTORS TABLE: ${distributors.length} records`);
    distributors.forEach((dist, index) => {
        console.log(`  ${index + 1}. ${dist.companyName} (${dist.email}) - ${dist.status}`);
    });

    // Check PDFs
    const pdfs = await prisma.pdfUpload.findMany({
        include: {
            uploadedBy: { select: { fullName: true } },
        },
    });
    console.log(`\n✅ PDF_UPLOADS TABLE: ${pdfs.length} records`);
    pdfs.forEach((pdf, index) => {
        console.log(`  ${index + 1}. ${pdf.fileName} (${pdf.assignedGroup}) - ${pdf.status}`);
    });

    // Check Notifications
    const notifications = await prisma.notification.findMany();
    console.log(`\n✅ NOTIFICATIONS TABLE: ${notifications.length} records`);
    notifications.forEach((notif, index) => {
        console.log(`  ${index + 1}. Type: ${(notif as any).type || 'PDF'} | PDF: ${notif.pdfId ? notif.pdfId.substring(0, 8) + '...' : 'N/A'} - Read: ${notif.readFlag}`);
    });

    // Check Logs
    const logs = await prisma.log.findMany({
        include: { user: { select: { fullName: true } } },
        take: 5,
        orderBy: { createdAt: 'desc' },
    });
    console.log(`\n✅ LOGS TABLE: ${logs.length} latest records`);
    logs.forEach((log, index) => {
        console.log(`  ${index + 1}. ${log.action} by ${log.user.fullName}`);
    });

    console.log('\n' + '='.repeat(80));
    console.log('\n✅ DATABASE VERIFICATION COMPLETE!\n');

    await prisma.$disconnect();
}

checkDatabase().catch(console.error);
