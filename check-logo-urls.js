const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkLogos() {
    console.log('=== Checking Distributor Logo URLs ===\n');
    
    try {
        const distributors = await prisma.distributor.findMany({
            select: {
                id: true,
                companyName: true,
                email: true,
                logoUrl: true,
                createdAt: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        
        console.log(`Total Distributors: ${distributors.length}\n`);
        
        const withLogos = distributors.filter(d => d.logoUrl);
        const withoutLogos = distributors.filter(d => !d.logoUrl);
        
        console.log(`✅ With Logos: ${withLogos.length}`);
        console.log(`❌ Without Logos: ${withoutLogos.length}\n`);
        
        console.log('--- All Distributors ---');
        distributors.forEach((d, index) => {
            console.log(`\n${index + 1}. ${d.companyName}`);
            console.log(`   Email: ${d.email}`);
            console.log(`   Logo: ${d.logoUrl ? '✓ ' + d.logoUrl : '✗ No logo'}`);
            console.log(`   Created: ${d.createdAt.toLocaleString()}`);
        });
        
        // Check for RRR specifically
        console.log('\n--- RRR Distributor Details ---');
        const rrr = distributors.find(d => d.companyName === 'RRR');
        if (rrr) {
            console.log('Found RRR:');
            console.log(JSON.stringify(rrr, null, 2));
        } else {
            console.log('RRR distributor not found');
        }
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkLogos();
