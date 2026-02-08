const http = require('http');

const data = JSON.stringify({
    email: 'admin@system.com',
    password: 'Admin@123'
});

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = http.request(options, (res) => {
    let responseData = '';

    res.on('data', (chunk) => {
        responseData += chunk;
    });

    res.on('end', () => {
        console.log('Status:', res.statusCode);
        console.log('Response:', responseData);

        try {
            const json = JSON.parse(responseData);
            if (json.success) {
                console.log('\n✅ LOGIN SUCCESSFUL!');
            } else {
                console.log('\n❌ LOGIN FAILED');
                console.log('Error:', json.error?.message);
            }
        } catch (e) {
            console.log('Failed to parse response');
        }
    });
});

req.on('error', (error) => {
    console.error('Request error:', error);
});

req.write(data);
req.end();
