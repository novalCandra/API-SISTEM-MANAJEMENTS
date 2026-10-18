"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSocketServer = createSocketServer;
const socket_io_1 = require("socket.io");
const env_1 = require("../config/env");
const logger_1 = require("../config/logger");
const gateway_1 = require("./gateway");
function createSocketServer(httpServer, tokens, gateway, bridge) {
    const io = new socket_io_1.Server(httpServer, {
        cors: {
            origin: env_1.config.clientOrigins,
            credentials: true,
        },
    });
    io.use((socket, next) => {
        const auth = socket.handshake.auth;
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
        }
        catch {
            logger_1.logger.warn({ socketId: socket.id }, 'socket handshake rejected');
            next(new Error('unauthorized'));
        }
    });
    io.on('connection', (socket) => {
        const userId = socket.data.userId;
        if (!userId) {
            socket.disconnect(true);
            return;
        }
        socket.join((0, gateway_1.userRoom)(userId));
        bridge.onSocketConnected(userId);
        logger_1.logger.info({ userId, socketId: socket.id }, 'socket connected');
        socket.on('disconnect', (reason) => {
            bridge.onSocketDisconnected(userId);
            logger_1.logger.debug({ userId, socketId: socket.id, reason }, 'socket disconnected');
        });
    });
    gateway.attach(io);
    bridge.setServer(io);
    return io;
}
//# sourceMappingURL=socket.js.map