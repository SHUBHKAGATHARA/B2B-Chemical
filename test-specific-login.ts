/**
 * Test login for specific user credentials
 */

async function testSpecificLogin() {
    console.log('🧪 Testing Login with Specific Credentials...\n');

    const testEmail = 'kagatharashubham9@gmail.com';
    const testPassword = 'Shubhu007@#';

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
        console.log('\n3. Full Response:');
        console.log(JSON.stringify(data, null, 2));

        if (data.success) {
            console.log('\n✅ LOGIN SUCCESSFUL!');
            console.log('\nUser Details:');
            console.log(`   ID: ${data.data.user.id}`);
            console.log(`   Email: ${data.data.user.email}`);
            console.log(`   Name: ${data.data.user.fullName}`);
            console.log(`   Role: ${data.data.user.role}`);
            console.log(`   Status: ${data.data.user.status}`);
        } else {
            console.log('\n❌ LOGIN FAILED!');
            console.log('\nError Details:');
            console.log(`   Code: ${data.error?.code}`);
            console.log(`   Message: ${data.error?.message}`);
            if (data.error?.details) {
                console.log(`   Details: ${data.error.details}`);
            }
            if (data.error?.field) {
                console.log(`   Field: ${data.error.field}`);
            }
        }
    } catch (error: any) {
        console.log('\n❌ REQUEST FAILED!');
        console.log('\nError:');
        console.log(`   Message: ${error.message}`);
        if (error.code) {
            console.log(`   Code: ${error.code}`);
        }
    }
}

// Run the test
testSpecificLogin().catch(console.error);
