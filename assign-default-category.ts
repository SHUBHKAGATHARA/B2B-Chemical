import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function assignDefaultCategory() {
    console.log('🔄 Assigning default category to PDFs without categories...');

    try {
        // Get the "Others" category
        const othersCategory = await prisma.pdfCategory.findFirst({
            where: {
                name: 'Others'
            }
        });

        if (!othersCategory) {
            console.error('❌ "Others" category not found. Please run the category migration first.');
            return;
        }

        console.log(`📁 Found "Others" category with ID: ${othersCategory.id}`);

        // Find all PDFs without a category
        const pdfsWithoutCategory = await prisma.pdfUpload.findMany({
            where: {
                OR: [
                    { categoryId: null },
                    { categoryId: '' }
                ]
            },
            select: {
                id: true,
                fileName: true,
                categoryId: true
            }
        });

        console.log(`\n📄 Found ${pdfsWithoutCategory.length} PDFs without categories`);

        if (pdfsWithoutCategory.length === 0) {
            console.log('✅ All PDFs already have categories assigned!');
            return;
        }

        // Update all PDFs to have the "Others" category
        const updateResult = await prisma.pdfUpload.updateMany({
            where: {
                OR: [
                    { categoryId: null },
                    { categoryId: '' }
                ]
            },
            data: {
                categoryId: othersCategory.id
            }
        });

        console.log(`\n✅ Updated ${updateResult.count} PDFs to "Others" category`);

        // Verify the update
        const verifyPdfs = await prisma.pdfUpload.findMany({
            select: {
                id: true,
                fileName: true,
                categoryId: true,
                category: {
                    select: {
                        name: true
                    }
                }
            }
        });

        console.log('\n📊 Current PDF categories:');
        verifyPdfs.forEach((pdf, idx) => {
            console.log(`  ${idx + 1}. ${pdf.fileName}`);
            console.log(`     Category: ${pdf.category?.name || 'No category'} (ID: ${pdf.categoryId})`);
        });

        console.log('\n✨ Category assignment completed successfully!');
    } catch (error) {
        console.error('❌ Error assigning categories:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

assignDefaultCategory()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
