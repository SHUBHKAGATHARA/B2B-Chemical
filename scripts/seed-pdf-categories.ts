/**
 * Seed script for PDF categories
 * Run with: npx ts-node scripts/seed-pdf-categories.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const PDF_CATEGORIES = [
    {
        name: 'Invoice',
        description: 'Invoices and billing documents',
    },
    {
        name: 'Quotation',
        description: 'Price quotations and estimates',
    },
    {
        name: 'Purchase Order',
        description: 'Purchase orders and procurement documents',
    },
    {
        name: 'Delivery Note',
        description: 'Delivery notes and shipping documents',
    },
    {
        name: 'Product Catalog',
        description: 'Product catalogs and specifications',
    },
    {
        name: 'Safety Data Sheet',
        description: 'Material Safety Data Sheets (MSDS)',
    },
    {
        name: 'Certificate',
        description: 'Certificates and quality documents',
    },
    {
        name: 'Alerts',
        description: 'Important alerts and notifications',
    },
    {
        name: 'Compliance',
        description: 'Compliance and regulatory documents',
    },
    {
        name: 'Reports',
        description: 'Various reports and analytics',
    },
    {
        name: 'Contracts',
        description: 'Contracts and agreements',
    },
    {
        name: 'Marketing',
        description: 'Marketing materials and promotions',
    },
    {
        name: 'General',
        description: 'General documents',
    },
];

async function seedPdfCategories() {
    console.log('🌱 Starting PDF categories seeding...');

    for (const category of PDF_CATEGORIES) {
        try {
            const existingCategory = await prisma.pdfCategory.findUnique({
                where: { name: category.name },
            });

            if (existingCategory) {
                console.log(`⏭️  Category "${category.name}" already exists, skipping...`);
                continue;
            }

            await prisma.pdfCategory.create({
                data: category,
            });

            console.log(`✅ Created category: ${category.name}`);
        } catch (error: any) {
            console.error(`❌ Error creating category "${category.name}":`, error.message);
        }
    }

    console.log('✨ PDF categories seeding completed!');
}

async function main() {
    try {
        await seedPdfCategories();
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
