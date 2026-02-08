import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkCategories() {
    try {
        const categories = await prisma.pdfCategory.findMany({
            orderBy: { name: 'asc' },
        });

        console.log(`Found ${categories.length} categories:`);
        categories.forEach((cat, i) => {
            console.log(`  ${i + 1}. ${cat.name}`);
        });

        if (categories.length === 0) {
            console.log('\n⚠️  No categories found in database!');
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkCategories();
