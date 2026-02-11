import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedCategories() {
    console.log('🌱 Seeding PDF categories...');

    const categories = [
        {
            name: 'Safety Data Sheets',
            description: 'Chemical safety information and hazard data'
        },
        {
            name: 'Technical Specifications',
            description: 'Detailed technical specifications and product data'
        },
        {
            name: 'Product Catalogs',
            description: 'Product catalogs and brochures'
        },
        {
            name: 'Compliance Documents',
            description: 'Regulatory compliance and certification documents'
        },
        {
            name: 'User Manuals',
            description: 'Operation and user instruction manuals'
        },
        {
            name: 'Installation Guides',
            description: 'Installation and setup instructions'
        },
        {
            name: 'Maintenance Reports',
            description: 'Maintenance schedules and service reports'
        },
        {
            name: 'Quality Certificates',
            description: 'Quality assurance and test certificates'
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
