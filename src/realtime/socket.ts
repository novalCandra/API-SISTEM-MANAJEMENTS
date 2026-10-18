import type { Server as HttpServer } from 'node:http';
import { Server } from 'socket.io';
import { config } from '../config/env';
import { logger } from '../config/logger';
import type { TokenService } from '../services/token.service';
import { RealtimeGateway, userRoom } from './gateway';
import type { ISocketBridge } from './rtdbBridge';

export function createSocketServer(
  httpServer: HttpServer,
  tokens: TokenService,
  gateway: RealtimeGateway,
  bridge: ISocketBridge,
): Server {
  const io = new Server(httpServer, {
    cors: {
      origin: config.clientOrigins,
      credentials: true,
    },
  });

  io.use((socket, next) => {
    const auth = socket.handshake.auth as { token?: string } | undefined;
    const headerToken = socket.handshake.headers.authorization?.replace('Bearer ', '');
    const token = auth?.token ?? headerToken;

    if (!token) {
      next(new Error('unauthorized'));
      return;
    }

    try {
      const payload = tokens.verifyAccessToken(token);
      socket.data.userId = payload.sub;
      next();
    } catch {
      logger.warn({ socketId: socket.id }, 'socket handshake rejected');
      next(new Error('unauthorized'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.data.userId as string | undefined;
    if (!userId) {
      socket.disconnect(true);
      return;
    }
    socket.join(userRoom(userId));
    bridge.onSocketConnected(userId);
    logger.info({ userId, socketId: socket.id }, 'socket connected');

    socket.on('disconnect', (reason) => {
      bridge.onSocketDisconnected(userId);
      logger.debug({ userId, socketId: socket.id, reason }, 'socket disconnected');
    });
  });

  gateway.attach(io);
  bridge.setServer(io);
  return io;
}
