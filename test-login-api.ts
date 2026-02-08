// Test login API endpoint directly
async function testLoginAPI() {
    console.log('🧪 Testing Login API Endpoint...\n');

    const testCases = [
        {
            name: 'Admin Login',
            email: 'admin@system.com',
            password: 'Admin@123'
        },
        {
            name: 'Distributor Login',
            email: 'dist1@company.com',
            password: 'Dist@123'
        },
        {
            name: 'Wrong Password',
            email: 'admin@system.com',
            password: 'WrongPassword'
        }
    ];

    for (const testCase of testCases) {
        console.log(`\n📝 Test: ${testCase.name}`);
        console.log(`   Email: ${testCase.email}`);
        console.log(`   Password: ${testCase.password}`);

        try {
            const response = await fetch('http://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: testCase.email,
                    password: testCase.password
                }),
            });

            const data = await response.json();

            console.log(`   Status: ${response.status}`);
            console.log(`   Response:`, JSON.stringify(data, null, 2));

            if (response.ok) {
                console.log('   ✅ SUCCESS');
            } else {
                console.log('   ❌ FAILED');
            }
        } catch (error: any) {
            console.log('   ❌ ERROR:', error.message);
        }
    }
}

testLoginAPI().catch(console.error);
