const http = require('http');

const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/pdf-categories',
    method: 'GET',
    headers: {
        'Content-Type': 'application/json'
    }
};

console.log('🧪 Testing PDF Categories API on port 3001...\n');

const req = http.request(options, (res) => {
    console.log(`Status Code: ${res.statusCode}`);
    console.log(`Headers:`, JSON.stringify(res.headers, null, 2));
    
    let data = '';
    
    res.on('data', (chunk) => {
        data += chunk;
    });
    
    res.on('end', () => {
        console.log('\nRaw Response:');
        console.log(data);
        
        try {
            const parsed = JSON.parse(data);
            console.log('\nParsed Response:');
            console.log(JSON.stringify(parsed, null, 2));
            
            if (parsed.success && parsed.data) {
                console.log(`\n✅ Success! Found ${parsed.data.length} categories`);
                console.log('\nFirst 5 categories:');
                parsed.data.slice(0, 5).forEach((cat, i) => {
                    console.log(`  ${i + 1}. ${cat.name} (${cat._count?.pdfUploads || 0} PDFs)`);
                });
            } else {
                console.log('\n❌ Unexpected response format');
            }
        } catch (error) {
            console.error('\n❌ Failed to parse JSON:', error.message);
        }
    });
});

req.on('error', (error) => {
    console.error('❌ Request error:', error.message);
});

req.end();
