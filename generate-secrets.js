/**
 * Generate Secure Secrets for Production
 * 
 * Run this script to generate secure JWT_SECRET and CSRF_SECRET
 * 
 * Usage: node generate-secrets.js
 */

const crypto = require('crypto');

console.log('\n🔐 SECURE SECRETS FOR PRODUCTION\n');
console.log('Copy these to your Vercel Environment Variables:\n');
console.log('═══════════════════════════════════════════════════════════════\n');

const jwtSecret = crypto.randomBytes(32).toString('hex');
const csrfSecret = crypto.randomBytes(32).toString('hex');

console.log('JWT_SECRET:');
console.log(jwtSecret);
console.log('\n');

console.log('CSRF_SECRET:');
console.log(csrfSecret);
console.log('\n');

console.log('═══════════════════════════════════════════════════════════════\n');
console.log('📝 Steps to add these to Vercel:\n');
console.log('1. Go to: https://vercel.com/dashboard');
console.log('2. Select your project');
console.log('3. Go to Settings → Environment Variables');
console.log('4. Add JWT_SECRET with the value above');
console.log('5. Add CSRF_SECRET with the value above');
console.log('6. Select: Production, Preview, and Development');
console.log('7. Save and Redeploy your project');
console.log('\n✅ Done!\n');
