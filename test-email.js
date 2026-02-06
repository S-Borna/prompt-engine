// ═══════════════════════════════════════════════════════════════════════════
// EMAIL VERIFICATION TEST — Test SendGrid integration
// Run: node test-email.js
// ═══════════════════════════════════════════════════════════════════════════

import { sendVerificationEmail, sendWelcomeEmail } from './src/lib/email.ts';

const TEST_EMAIL = 'said@saidborna.com'; // Use your email
const TEST_TOKEN = 'test-token-' + Date.now();

console.log('🧪 Testing PRAXIS Email System...\n');

// Test 1: Verification Email
console.log('📧 Sending verification email...');
const verifyResult = await sendVerificationEmail(TEST_EMAIL, TEST_TOKEN);

if (verifyResult) {
    console.log('✅ Verification email sent successfully');
    console.log(`   Check ${TEST_EMAIL} for the email\n`);
} else {
    console.log('❌ Failed to send verification email\n');
}

// Test 2: Welcome Email
console.log('📧 Sending welcome email...');
const welcomeResult = await sendWelcomeEmail(TEST_EMAIL, 'Said');

if (welcomeResult) {
    console.log('✅ Welcome email sent successfully');
    console.log(`   Check ${TEST_EMAIL} for the email\n`);
} else {
    console.log('❌ Failed to send welcome email\n');
}

console.log('🎉 Email test complete!');
console.log('\nNext steps:');
console.log('1. Check your inbox for both emails');
console.log('2. Click the verification link to test the flow');
console.log('3. Sign up with a new account to test the full flow');
