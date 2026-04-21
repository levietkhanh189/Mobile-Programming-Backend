import './config/environment';
import http from 'http';
import { createApp } from './app';
import { PORT } from './config/constants';
import { initSocket } from './config/socket';

const app = createApp();
const httpServer = http.createServer(app);
initSocket(httpServer);

httpServer.listen(PORT, () => {
  console.log('\n========================================');
  console.log('Mobile Programming Backend Server');
  console.log('========================================');
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`API Base URL: http://localhost:${PORT}/api`);
  console.log(`WebSocket: ws://localhost:${PORT}`);
  console.log('========================================\n');
});
