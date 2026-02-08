/**
 * Simple Login Test Script
 * Tests the login functionality by making a direct API call
 * Run with: npx ts-node test-login-simple.ts
 */

async function testLogin() {
    console.log('🧪 Testing Login API...\n');

    const testEmail = 'admin@system.com';
    const testPassword = 'Admin@123';

    try {
        console.log('1. Making login request...');
        console.log(`   Email: ${testEmail}`);
        console.log(`   Password: ${testPassword}\n`);

        const response = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: testEmail,
                password: testPassword,
            }),
        });

        const data = await response.json();

        console.log('2. Response received:');
        console.log(`   Status: ${response.status}`);
        console.log(`   Success: ${data.success}`);

        if (data.success) {
            console.log('\n✅ LOGIN SUCCESSFUL!');
            console.log('\nUser Details:');
            console.log(`   ID: ${data.data.user.id}`);
            console.log(`   Email: ${data.data.user.email}`);
            console.log(`   Name: ${data.data.user.fullName}`);
            console.log(`   Role: ${data.data.user.role}`);
            console.log(`   Status: ${data.data.user.status}`);
            console.log(`\nToken: ${data.data.token.substring(0, 50)}...`);
        } else {
            console.log('\n❌ LOGIN FAILED!');
            console.log('\nError Details:');
            console.log(`   Code: ${data.error?.code}`);
            console.log(`   Message: ${data.error?.message}`);
            if (data.error?.details) {
                console.log(`   Details: ${data.error.details}`);
            }
        }
    } catch (error: any) {
        console.log('\n❌ REQUEST FAILED!');
        console.log('\nError:');
        console.log(`   Message: ${error.message}`);
        console.log(`   Stack: ${error.stack}`);
    }
}

// Run the test
testLogin().catch(console.error);
