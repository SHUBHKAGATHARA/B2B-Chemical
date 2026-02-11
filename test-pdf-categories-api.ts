import fs from 'fs';

async function testPdfCategoriesAPI() {
    try {
        console.log('🧪 Testing PDF Categories API...\n');
        
        // Read token from login.json
        const loginData = JSON.parse(fs.readFileSync('login.json', 'utf-8'));
        const token = loginData.token;
        
        console.log('📌 Token found:', token ? `${token.substring(0, 20)}...` : 'NONE');
        
        // Test the API
        console.log('\n🌐 Calling http://localhost:3001/api/pdf-categories...');
        
        const response = await fetch('http://localhost:3001/api/pdf-categories', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
        
        console.log('\n📊 Response Status:', response.status);
        console.log('📊 Response Status Text:', response.statusText);
        
        const data = await response.json();
        
        console.log('\n📦 Response Data:');
        console.log(JSON.stringify(data, null, 2));
        
        if (data.success && data.data) {
            console.log(`\n✅ SUCCESS: Found ${data.data.length} categories`);
            console.log('\n📚 Categories:');
            data.data.slice(0, 5).forEach((cat: any, i: number) => {
                console.log(`   ${i + 1}. ${cat.name} (ID: ${cat.id})`);
            });
            if (data.data.length > 5) {
                console.log(`   ... and ${data.data.length - 5} more`);
            }
        } else {
            console.log('\n❌ ERROR:', data.error || 'Unknown error');
        }
        
    } catch (error) {
        console.error('\n💥 Test failed:', error);
    }
}

testPdfCategoriesAPI();
