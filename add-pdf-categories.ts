import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addPdfCategories() {
    console.log('📁 Adding PDF Categories...');
    console.log('⏳ Connecting to database (may take a moment if database is sleeping)...\n');

    try {
        // Try to wake up the database with a simple query
        await prisma.$queryRaw`SELECT 1`;
        console.log('✅ Database connection established\n');

        // Create categories if they don't exist
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
        let existing = 0;

        for (const category of categories) {
            const existingCategory = await prisma.pdfCategory.findUnique({
                where: { name: category.name },
            });

            if (!existingCategory) {
                await prisma.pdfCategory.create({
                    data: category,
                });
                created++;
                console.log(`✅ Created: ${category.name}`);
            } else {
                existing++;
                console.log(`⏭️  Already exists: ${category.name}`);
            }
        }

        console.log(`\n✨ Summary:`);
        console.log(`   Created: ${created} categories`);
        console.log(`   Already existing: ${existing} categories`);
        console.log(`   Total categories: ${created + existing}`);
        console.log('\n🎉 PDF Categories setup completed successfully!\n');
    } catch (error) {
        console.error('❌ Error adding PDF categories:', error);
        throw error;
    }
}

addPdfCategories()
    .catch((e) => {
        console.error('❌ Failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
