import './config/environment';
import { createApp } from './app';
import { PORT } from './config/constants';

const app = createApp();

app.listen(PORT, () => {
  console.log('\n========================================');
  console.log('🚀 Mobile Programming Backend Server');
  console.log('========================================');
  console.log(`✅ Server is running on http://localhost:${PORT}`);
  console.log(`✅ API Base URL: http://localhost:${PORT}/api`);
  console.log('\n📌 Available endpoints:');
  console.log('  - GET  /api/health');
  console.log('  - POST /api/auth/send-otp');
  console.log('  - POST /api/auth/verify-otp');
  console.log('  - POST /api/auth/register');
  console.log('  - POST /api/auth/register-simple');
  console.log('  - POST /api/auth/login');
  console.log('  - POST /api/auth/reset-password');
  console.log('  - GET  /api/user/profile (protected)');
  console.log('========================================\n');
});
