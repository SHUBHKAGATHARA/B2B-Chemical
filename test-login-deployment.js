/**
 * Test Login Functionality
 * 
 * This script helps test login on both localhost and production (Vercel)
 * 
 * Usage:
 * - For localhost: node test-login-deployment.js http://localhost:3000
 * - For production: node test-login-deployment.js https://your-app.vercel.app
 */

const BASE_URL = process.argv[2] || 'http://localhost:3000';

async function testLogin() {
    console.log('🧪 Testing Login Endpoint...');
    console.log('📍 URL:', BASE_URL);
    console.log('');

    try {
        // Test 1: Check if login endpoint is accessible
        console.log('Test 1: Checking if /api/auth/login is accessible...');
        const response = await fetch(`${BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: 'test@example.com', // Replace with actual test credentials
                password: 'wrongpassword',
            }),
        });

        console.log('✓ Endpoint is accessible');
        console.log('  Status:', response.status);
        console.log('  Status Text:', response.statusText);

        const data = await response.json();
        console.log('  Response:', JSON.stringify(data, null, 2));

        // Test 2: Check cookies
        const cookies = response.headers.get('set-cookie');
        if (cookies) {
            console.log('✓ Cookies are being set');
            console.log('  Cookies:', cookies);
        } else {
            console.log('⚠ No cookies in response (expected for failed login)');
        }

        console.log('');

        // Test 3: Try with correct credentials (if you have them)
        console.log('Test 2: Testing with credentials...');
        console.log('ℹ️  Update the email/password in this script to test actual login');
        console.log('');

        // Check environment
        console.log('Environment Checks:');
        console.log('  NODE_ENV:', process.env.NODE_ENV || 'not set');
        console.log('  VERCEL:', process.env.VERCEL || 'not set');
        console.log('  JWT_SECRET:', process.env.JWT_SECRET ? '✓ Set' : '❌ Not set');
        console.log('  DATABASE_URL:', process.env.DATABASE_URL ? '✓ Set' : '❌ Not set');
        console.log('');

        console.log('✅ Test completed!');
        console.log('');
        console.log('Next Steps:');
        console.log('1. Update test credentials in this script');
        console.log('2. Ensure JWT_SECRET is set in Vercel environment variables');
        console.log('3. Ensure DATABASE_URL is set in Vercel environment variables');
        console.log('4. Check Vercel function logs for any errors');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error('');
        console.error('Common issues:');
        console.error('- Server is not running');
        console.error('- Network connectivity issues');
        console.error('- CORS restrictions');
        console.error('- Database connection problems');
    }
}

// Run the test
testLogin();
