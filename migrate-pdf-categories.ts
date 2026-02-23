import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateCategories() {
    console.log('🔄 Migrating PDF categories...');

    const newCategories = [
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
        // Get all existing categories
        const existingCategories = await prisma.pdfCategory.findMany();
        console.log(`📋 Found ${existingCategories.length} existing categories`);

        if (existingCategories.length > 0) {
            console.log('📝 Existing categories:');
            existingCategories.forEach((cat, index) => {
                console.log(`   ${index + 1}. ${cat.name} (ID: ${cat.id})`);
            });
        }

        // Get PDFs with old category IDs
        const pdfsWithCategories = await prisma.pdfUpload.findMany({
            where: {
                categoryId: { not: null }
            },
            select: {
                id: true,
                categoryId: true,
                category: {
                    select: {
                        name: true
                    }
                }
            }
        });

        console.log(`\n📄 Found ${pdfsWithCategories.length} PDFs with categories assigned`);

        // Create a mapping from old category names to new category names
        const categoryMapping: { [key: string]: string } = {
            'Technical Documentation': 'Others',
            'Reports & Analysis': 'Others',
            'Product Catalogs': 'Others',
            'Contracts & Legal': 'MOU',
            'Invoices & Billing': 'Invoice',
            'Invoice & Billing': 'Invoice',
            'Invoices': 'Invoice',
            'Training Materials': 'Others',
            'Safety & Compliance': 'Others',
            'Marketing & Promotional': 'Others',
            'Safety Data Sheets': 'Others',
            'Technical Specifications': 'Others',
            'Compliance Documents': 'Others',
            'User Manuals': 'Others',
            'Installation Guides': 'Others',
            'Maintenance Reports': 'Others',
            'Quality Certificates': 'Others',
        };

        // Start transaction
        await prisma.$transaction(async (tx) => {
            // Step 1: Create new categories
            console.log('\n✨ Creating new categories...');
            const createdCategories: { [key: string]: string } = {};

            for (const category of newCategories) {
                // Check if category already exists
                const existing = existingCategories.find(
                    cat => cat.name.toLowerCase() === category.name.toLowerCase()
                );

                if (existing) {
                    console.log(`   ⏭️  ${category.name} already exists (ID: ${existing.id})`);
                    createdCategories[category.name] = existing.id;
                } else {
                    const newCat = await tx.pdfCategory.create({
                        data: category
                    });
                    console.log(`   ✅ Created: ${category.name} (ID: ${newCat.id})`);
                    createdCategories[category.name] = newCat.id;
                }
            }

            // Step 2: Update PDFs to use new categories
            if (pdfsWithCategories.length > 0) {
                console.log('\n📝 Updating PDF category assignments...');
                let updatedCount = 0;

                for (const pdf of pdfsWithCategories) {
                    if (!pdf.category) continue;

                    const oldCategoryName = pdf.category.name;
                    const newCategoryName = categoryMapping[oldCategoryName] || 'Others';
                    const newCategoryId = createdCategories[newCategoryName];

                    if (newCategoryId && newCategoryId !== pdf.categoryId) {
                        await tx.pdfUpload.update({
                            where: { id: pdf.id },
                            data: { categoryId: newCategoryId }
                        });
                        updatedCount++;
                    }
                }

                console.log(`   ✅ Updated ${updatedCount} PDF category assignments`);
            }

            // Step 3: Delete old categories that are not in the new list
            const categoriesToDelete = existingCategories.filter(
                cat => !newCategories.some(newCat => newCat.name.toLowerCase() === cat.name.toLowerCase())
            );

            if (categoriesToDelete.length > 0) {
                console.log('\n🗑️  Removing old categories...');
                const idsToDelete = categoriesToDelete.map(cat => cat.id);
                
                await tx.pdfCategory.deleteMany({
                    where: {
                        id: { in: idsToDelete }
                    }
                });
                
                console.log(`   ✅ Deleted ${categoriesToDelete.length} old categories`);
                categoriesToDelete.forEach(cat => {
                    console.log(`      - ${cat.name}`);
                });
            }
        });

        // Show final count
        const finalCategories = await prisma.pdfCategory.findMany({
            orderBy: { name: 'asc' },
            include: {
                _count: {
                    select: {
                        pdfUploads: true
                    }
                }
            }
        });

        console.log('\n📊 Migration Summary:');
        console.log(`   - Total categories: ${finalCategories.length}`);
        console.log('\n📚 Final categories:');
        finalCategories.forEach((cat, index) => {
            console.log(`   ${index + 1}. ${cat.name} (${cat._count.pdfUploads} PDFs)`);
        });

        console.log('\n✨ PDF categories migrated successfully!');
    } catch (error) {
        console.error('❌ Error migrating categories:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

migrateCategories()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
