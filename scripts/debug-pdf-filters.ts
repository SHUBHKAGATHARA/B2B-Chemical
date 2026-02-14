/**
 * Debug PDF Categories and Filters
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient();

async function debugPdfFilters() {
    const output: string[] = [];
    output.push('🔍 Debugging PDF Filters...\n');

    try {
        // Get all categories
        const categories = await prisma.pdfCategory.findMany({
            orderBy: { name: 'asc' },
        });

        output.push(`📁 Total Categories: ${categories.length}`);
        categories.forEach((cat, index) => {
            output.push(`${index + 1}. ${cat.name} (ID: ${cat.id})`);
        });

        // Get all PDFs with their categories
        const pdfs = await prisma.pdfUpload.findMany({
            include: {
                category: true,
                uploadedBy: {
                    select: {
                        fullName: true,
                        email: true,
                    },
                },
                distributor: {
                    select: {
                        companyName: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
            take: 10,
        });

        const totalPdfs = await prisma.pdfUpload.count();
        output.push(`\n📄 Total PDFs: ${totalPdfs}`);
        output.push(`\n📋 Recent PDFs (showing first 10):`);

        pdfs.forEach((pdf, index) => {
            output.push(`\n${index + 1}. ${pdf.fileName}`);
            output.push(`   Category: ${pdf.category?.name || 'None'} (ID: ${pdf.categoryId || 'null'})`);
            output.push(`   Uploaded By: ${pdf.uploadedBy?.fullName || 'Unknown'}`);
            output.push(`   Assignment: ${pdf.assignedGroup}`);
            output.push(`   Distributor: ${pdf.distributor?.companyName || 'N/A'}`);
        });

        // Check for PDFs without categories
        const pdfsWithoutCategory = await prisma.pdfUpload.count({
            where: {
                categoryId: null,
            },
        });
        output.push(`\n⚠️  PDFs without category: ${pdfsWithoutCategory}`);

        // Write to file
        const outputText = output.join('\n');
        fs.writeFileSync('debug-output.txt', outputText);
        console.log('✅ Debug output written to debug-output.txt');
        console.log(outputText);

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

debugPdfFilters();
