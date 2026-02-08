const http = require('http');

function testLogin(email, password, name) {
    return new Promise((resolve) => {
        const data = JSON.stringify({ email, password });

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
            res.on('data', (chunk) => { responseData += chunk; });
            res.on('end', () => {
                console.log(`\n${name}:`);
                console.log(`  Email: ${email}`);
                try {
                    const json = JSON.parse(responseData);
                    if (json.success) {
                        console.log(`  ✅ SUCCESS - ${json.data.user.fullName} (${json.data.user.role})`);
                    } else {
                        console.log(`  ❌ FAILED - ${json.error?.message}`);
                    }
                } catch (e) {
                    console.log(`  ❌ ERROR - Status ${res.statusCode}`);
                }
                resolve();
            });
        });

        req.on('error', (error) => {
            console.log(`  ❌ ERROR - ${error.message}`);
            resolve();
        });

        req.write(data);
        req.end();
    });
}

async function main() {
    console.log('🔐 Testing All Login Accounts...');

    await testLogin('admin@system.com', 'Admin@123', 'Default Admin');
    await testLogin('kagatharashubham9@gmail.com', 'Shubhu007@#', 'Custom Admin');
    await testLogin('dist1@company.com', 'Dist@123', 'Distributor 1');

    console.log('\n✨ All tests complete!\n');
}

main();
