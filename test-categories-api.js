const http = require('http');

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/pdf-categories',
    method: 'GET',
};

const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        console.log('Status:', res.statusCode);
        console.log('Response:', data);
        try {
            const json = JSON.parse(data);
            console.log('\nParsed:');
            console.log('Success:', json.success);
            console.log('Categories count:', json.data?.length);
            if (json.data && json.data.length > 0) {
                console.log('First 3 categories:');
                json.data.slice(0, 3).forEach(cat => {
                    console.log(`  - ${cat.name}`);
                });
            }
        } catch (e) {
            console.log('Parse error:', e.message);
        }
    });
});

req.on('error', (error) => {
    console.error('Request error:', error);
});

req.end();
