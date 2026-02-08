// Quick login test
async function testLogin() {
    console.log('🔐 Testing Login...\n');

    const credentials = {
        email: 'kagatharashubham9@gmail.com',
        password: 'Shubhu007@#'
    };

    try {
        const response = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
        });

        const data = await response.json();

        console.log('Status:', response.status);
        console.log('Response:', JSON.stringify(data, null, 2));

        if (response.ok && data.success) {
            console.log('\n✅ LOGIN SUCCESSFUL!');
        } else {
            console.log('\n❌ LOGIN FAILED!');
            console.log('Error:', data.error?.message || data.message || 'Unknown error');
        }
    } catch (error: any) {
        console.log('\n❌ REQUEST ERROR:', error.message);
    }
}

testLogin().catch(console.error);
