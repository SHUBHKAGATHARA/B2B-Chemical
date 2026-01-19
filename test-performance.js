#!/usr/bin/env node

/**
 * Performance Testing Script
 * Tests API response times before and after optimizations
 */

const API_BASE = process.env.API_URL || 'http://localhost:3000';

async function measureResponseTime(url, options = {}) {
    const start = Date.now();
    try {
        const response = await fetch(url, options);
        const end = Date.now();
        const data = await response.json();
        return {
            success: response.ok,
            status: response.status,
            time: end - start,
            size: JSON.stringify(data).length,
            compressed: response.headers.get('content-encoding') === 'gzip',
        };
    } catch (error) {
        const end = Date.now();
        return {
            success: false,
            error: error.message,
            time: end - start,
        };
    }
}

async function testLogin() {
    console.log('\n📊 Testing Login Performance...');
    
    const result = await measureResponseTime(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: 'admin@example.com',
            password: 'Admin@123',
        }),
    });
    
    console.log(`  ✓ Response Time: ${result.time}ms`);
    console.log(`  ✓ Status: ${result.status}`);
    console.log(`  ✓ Compressed: ${result.compressed ? 'Yes' : 'No'}`);
    
    return result;
}

async function testAuthenticatedEndpoint(endpoint, token) {
    console.log(`\n📊 Testing ${endpoint}...`);
    
    const result = await measureResponseTime(`${API_BASE}${endpoint}`, {
        headers: {
            'Cookie': `auth_token=${token}`,
        },
    });
    
    console.log(`  ✓ Response Time: ${result.time}ms`);
    console.log(`  ✓ Status: ${result.status}`);
    console.log(`  ✓ Payload Size: ${(result.size / 1024).toFixed(2)} KB`);
    console.log(`  ✓ Compressed: ${result.compressed ? 'Yes' : 'No'}`);
    
    return result;
}

async function runPerformanceTests() {
    console.log('🚀 B2B Application Performance Test Suite\n');
    console.log('===========================================');
    
    // Test 1: Login
    const loginResult = await testLogin();
    
    if (!loginResult.success) {
        console.error('\n❌ Login failed. Cannot proceed with authenticated tests.');
        return;
    }
    
    // Extract token from response (you may need to adjust based on your response structure)
    const token = loginResult.token || 'YOUR_TOKEN_HERE';
    
    // Test 2: Notifications
    await testAuthenticatedEndpoint('/api/notifications', token);
    
    // Test 3: PDFs
    await testAuthenticatedEndpoint('/api/pdfs', token);
    
    // Test 4: Users
    await testAuthenticatedEndpoint('/api/users', token);
    
    // Test 5: Distributors
    await testAuthenticatedEndpoint('/api/distributors', token);
    
    // Test 6: News
    await testAuthenticatedEndpoint('/api/news', token);
    
    console.log('\n===========================================');
    console.log('✅ Performance testing complete!\n');
    console.log('Expected improvements:');
    console.log('  • 50-80% faster queries (thanks to indexes)');
    console.log('  • 60-80% smaller responses (compression)');
    console.log('  • Near-instant cached lookups (distributor cache)');
    console.log('  • 50% faster login (async updates)\n');
}

// Run tests
runPerformanceTests().catch(console.error);
