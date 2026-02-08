import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkCategories() {
    try {
        const categories = await prisma.pdfCategory.findMany({
            orderBy: { name: 'asc' }
        });

        console.log(`Found ${categories.length} categories:`);
        categories.forEach(cat => {
            console.log(`  - ${cat.name}: ${cat.description}`);
        });

    } catch (error: any) {
        console.error('Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

checkCategories();
