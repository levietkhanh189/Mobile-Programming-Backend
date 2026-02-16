export async function sendOTP(
  email: string,
  otp: string,
  purpose: 'register' | 'forgot-password'
): Promise<void> {
  // Simulate email sending by logging to console
  console.log('\n========================================');
  console.log('📧 OTP EMAIL (Development Mode)');
  console.log('========================================');
  console.log(`To: ${email}`);
  console.log(`Purpose: ${purpose}`);
  console.log(`OTP Code: ${otp}`);
  console.log(`Valid for: 5 minutes`);
  console.log('========================================\n');
}
