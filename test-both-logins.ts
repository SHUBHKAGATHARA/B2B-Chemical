// Test both admin accounts
async function testBothLogins() {
    console.log('🔐 Testing Login with Both Accounts...\n');

    const accounts = [
        {
            name: 'Default Admin',
            email: 'admin@system.com',
            password: 'Admin@123'
        },
        {
            name: 'Custom Admin',
            email: 'kagatharashubham9@gmail.com',
            password: 'Shubhu007@#'
        }
    ];

    for (const account of accounts) {
        console.log(`\n📝 Testing: ${account.name}`);
        console.log(`   Email: ${account.email}`);

        try {
            const response = await fetch('http://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: account.email,
                    password: account.password
                }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                console.log('   ✅ LOGIN SUCCESSFUL');
                console.log(`   User: ${data.data.user.fullName}`);
                console.log(`   Role: ${data.data.user.role}`);
            } else {
                console.log('   ❌ LOGIN FAILED');
                console.log(`   Status: ${response.status}`);
                console.log(`   Error: ${data.error?.message || 'Unknown'}`);
            }
        } catch (error: any) {
            console.log('   ❌ ERROR:', error.message);
        }
    }

    console.log('\n✨ Test Complete');
}

testBothLogins().catch(console.error);
