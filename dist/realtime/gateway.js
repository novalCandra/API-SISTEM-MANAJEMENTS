"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRoom = exports.RealtimeGateway = void 0;
class RealtimeGateway {
    driver;
    events;
    logger;
    server = null;
    constructor(driver, events, logger) {
        this.driver = driver;
        this.events = events;
        this.logger = logger;
    }
    attach(server) {
        this.server = server;
    }
    emitToUser(userId, event, payload) {
        if (this.driver !== 'rtdb') {
            this.emitDirect(userId, event, payload);
            return;
        }
        this.events.publish(userId, event, payload).catch((error) => {
            this.logger.error({ err: error, userId, event }, 'realtime publish failed, using socket');
            this.emitDirect(userId, event, payload);
        });
    }
    emitDirect(userId, event, payload) {
        if (!this.server)
            return;
        this.server.to((0, exports.userRoom)(userId)).emit(event, payload ?? {});
    }
}
exports.RealtimeGateway = RealtimeGateway;
const userRoom = (userId) => `user:${userId}`;
exports.userRoom = userRoom;
//# sourceMappingURL=gateway.js.map