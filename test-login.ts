/**
 * Test script to verify login functionality
 * Run with: tsx test-login.ts
 */

import { authenticateLogin } from './lib/auth/login-service';

async function testLogin() {
    console.log('🧪 Testing Login Functionality\n');

    // Test 1: Valid admin login
    console.log('Test 1: Valid Admin Login');
    try {
        const result = await authenticateLogin({
            email: 'admin@system.com',
            password: 'Admin@123',
        });
        console.log('✅ Admin login successful');
        console.log(`   User: ${result.user.fullName} (${result.user.email})`);
        console.log(`   Role: ${result.user.role}`);
        console.log(`   Token generated: ${result.token.substring(0, 20)}...`);
    } catch (error: any) {
        console.error('❌ Admin login failed:', error.message);
    }

    console.log('\nTest 2: Valid Distributor Login');
    try {
        const result = await authenticateLogin({
            email: 'dist1@company.com',
            password: 'Dist@123',
        });
        console.log('✅ Distributor login successful');
        console.log(`   User: ${result.user.fullName} (${result.user.email})`);
        console.log(`   Role: ${result.user.role}`);
    } catch (error: any) {
        console.error('❌ Distributor login failed:', error.message);
    }

    console.log('\nTest 3: Invalid Password');
    try {
        await authenticateLogin({
            email: 'admin@system.com',
            password: 'wrongpassword',
        });
        console.error('❌ Should have failed with invalid password');
    } catch (error: any) {
        console.log('✅ Correctly rejected invalid password');
        console.log(`   Error: ${error.message}`);
    }

    console.log('\nTest 4: Invalid Email');
    try {
        await authenticateLogin({
            email: 'nonexistent@example.com',
            password: 'Admin@123',
        });
        console.error('❌ Should have failed with invalid email');
    } catch (error: any) {
        console.log('✅ Correctly rejected invalid email');
        console.log(`   Error: ${error.message}`);
    }

    console.log('\nTest 5: Short Password (Validation Error)');
    try {
        await authenticateLogin({
            email: 'admin@system.com',
            password: '123',
        });
        console.error('❌ Should have failed with short password');
    } catch (error: any) {
        console.log('✅ Correctly rejected short password');
        console.log(`   Error: ${error.message}`);
    }

    console.log('\nTest 6: Email with Whitespace');
    try {
        const result = await authenticateLogin({
            email: '  admin@system.com  ',
            password: 'Admin@123',
        });
        console.log('✅ Correctly handled email with whitespace');
    } catch (error: any) {
        console.error('❌ Failed to handle whitespace:', error.message);
    }

    console.log('\n✅ All login tests completed!');
}

testLogin().catch(console.error);
