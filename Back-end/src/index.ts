
import http from 'http';
import { Server } from 'socket.io';
import { connectDb } from './config/db';
import { env } from './config/env';
import { createApp } from './app';
import { seedAdminIfNeeded } from './seed/seedAdmin';

async function bootstrap() {
  await connectDb();
  await seedAdminIfNeeded();

  const app = createApp();
  const server = http.createServer(app);
  const io = new Server(server, {
    cors: {
      origin: '*', // Allow all origins for simplicity in dev, restrict in prod
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
    },
  });

  app.set('io', io);

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  server.listen(env.PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Backend listening on http://localhost:${env.PORT}`);
  });
}

bootstrap().catch(err => {
  // eslint-disable-next-line no-console
  console.error('Failed to start server', err);
  process.exit(1);
});

