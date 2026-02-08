import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function wakeUpDatabase() {
    console.log('🚀 Waking up database and initializing categories...\n');

    try {
        console.log('1️⃣  Pinging database...');
        const startTime = Date.now();
        
        // Wake up the database with a simple query
        await prisma.$queryRaw`SELECT 1`;
        
        const pingTime = Date.now() - startTime;
        console.log(`   ✅ Database responded in ${pingTime}ms\n`);

        console.log('2️⃣  Checking existing categories...');
        const existingCategories = await prisma.pdfCategory.findMany();
        console.log(`   Found ${existingCategories.length} existing categories\n`);

        if (existingCategories.length > 0) {
            console.log('   Existing categories:');
            existingCategories.forEach((cat, i) => {
                console.log(`   ${i + 1}. ${cat.name}`);
            });
            console.log('\n   ✅ Categories already initialized!');
            return;
        }

        console.log('3️⃣  Creating default categories...');
        const categories = [
            {
                name: 'Technical Documentation',
                description: 'Technical specifications, manuals, and documentation',
            },
            {
                name: 'Reports & Analysis',
                description: 'Business reports, analytics, and performance reviews',
            },
            {
                name: 'Product Catalogs',
                description: 'Product catalogs, brochures, and marketing materials',
            },
            {
                name: 'Contracts & Legal',
                description: 'Contracts, agreements, and legal documents',
            },
            {
                name: 'Invoices & Billing',
                description: 'Invoices, receipts, and billing statements',
            },
            {
                name: 'Training Materials',
                description: 'Training guides, tutorials, and educational content',
            },
            {
                name: 'Safety & Compliance',
                description: 'Safety data sheets, compliance documents, and certifications',
            },
            {
                name: 'Marketing & Promotional',
                description: 'Marketing materials, promotional content, and advertisements',
            },
        ];

        let created = 0;
        for (const category of categories) {
            await prisma.pdfCategory.create({
                data: category,
            });
            created++;
            console.log(`   ✅ Created: ${category.name}`);
        }

        console.log(`\n✨ Successfully created ${created} categories!`);
        console.log('\n🎉 Database is ready! You can now:');
        console.log('   1. Refresh your browser');
        console.log('   2. Upload PDFs with category selection');
        console.log('   3. Categories will appear in the dropdown\n');

    } catch (error: any) {
        console.error('\n❌ Error:', error.message);
        
        if (error.code === 'P1001' || error.message?.includes('connect')) {
            console.error('\n💡 Database Connection Issue:');
            console.error('   - The database server may be unavailable');
            console.error('   - Check your internet connection');
            console.error('   - Verify DATABASE_URL in .env file');
            console.error('   - Wait a moment and try again (database may be waking up)\n');
        }
        
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

wakeUpDatabase();
