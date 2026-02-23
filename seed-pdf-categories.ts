import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedCategories() {
    console.log('🌱 Seeding PDF categories...');

    const categories = [
        {
            name: 'MOU',
            description: 'Memorandum of Understanding documents'
        },
        {
            name: 'Invoice',
            description: 'Invoice and billing documents'
        },
        {
            name: 'Manifest',
            description: 'Shipping manifests and delivery documents'
        },
        {
            name: 'Others',
            description: 'Other miscellaneous documents'
        }
    ];

    try {
        // Check existing categories
        const existingCategories = await prisma.pdfCategory.findMany();
        console.log(`📋 Found ${existingCategories.length} existing categories`);

        // Add new categories
        let addedCount = 0;
        for (const category of categories) {
            const existing = existingCategories.find(
                cat => cat.name.toLowerCase() === category.name.toLowerCase()
            );

            if (!existing) {
                await prisma.pdfCategory.create({
                    data: category
                });
                console.log(`✅ Added: ${category.name}`);
                addedCount++;
            } else {
                console.log(`⏭️  Skipped (already exists): ${category.name}`);
            }
        }

        // Show final count
        const finalCategories = await prisma.pdfCategory.findMany({
            orderBy: { name: 'asc' }
        });
        
        console.log('\n📊 Summary:');
        console.log(`   - Total categories: ${finalCategories.length}`);
        console.log(`   - Added in this run: ${addedCount}`);
        console.log('\n📚 All categories:');
        finalCategories.forEach((cat, index) => {
            console.log(`   ${index + 1}. ${cat.name}`);
        });

        console.log('\n✨ PDF categories seeded successfully!');
    } catch (error) {
        console.error('❌ Error seeding categories:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

seedCategories()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
