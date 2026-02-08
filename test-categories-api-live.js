// Test the PDF categories API endpoint
async function testCategoriesAPI() {
    console.log('🧪 Testing PDF Categories API Endpoint...\n');

    try {
        const response = await fetch('http://localhost:3000/api/pdf-categories', {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        console.log('Response Status:', response.status);
        console.log('Response OK:', response.ok);

        const data = await response.json();
        console.log('\nResponse Data:', JSON.stringify(data, null, 2));

        if (data.success && data.data) {
            console.log(`\n✅ API Working! Found ${data.data.length} categories:`);
            data.data.slice(0, 10).forEach((cat, i) => {
                console.log(`   ${i + 1}. ${cat.name}`);
            });
            if (data.data.length > 10) {
                console.log(`   ... and ${data.data.length - 10} more`);
            }
        } else {
            console.log('\n❌ Unexpected API response format');
        }
    } catch (error) {
        console.error('\n❌ Error testing API:', error.message);
        console.error('\n💡 Make sure the dev server is running:');
        console.error('   npm run dev\n');
    }
}

testCategoriesAPI();
