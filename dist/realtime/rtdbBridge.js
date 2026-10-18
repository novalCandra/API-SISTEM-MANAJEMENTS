"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RtdbSocketBridge = exports.NoopSocketBridge = void 0;
const firebase_1 = require("../config/firebase");
const gateway_1 = require("./gateway");
const rtdbEventStore_1 = require("./rtdbEventStore");
class NoopSocketBridge {
    setServer() { }
    onSocketConnected() { }
    onSocketDisconnected() { }
    dispose() { }
}
exports.NoopSocketBridge = NoopSocketBridge;
const DEFAULT_EVENT_WINDOW_MS = 30_000;
class RtdbSocketBridge {
    logger;
    windowMs;
    path;
    server = null;
    subscriptions = new Map();
    constructor(logger, windowMs = DEFAULT_EVENT_WINDOW_MS, path = 'realtime') {
        this.logger = logger;
        this.windowMs = windowMs;
        this.path = path;
    }
    setServer(server) {
        this.server = server;
    }
    onSocketConnected(userId) {
        const existing = this.subscriptions.get(userId);
        if (existing) {
            existing.count += 1;
            return;
        }
        try {
            const query = (0, firebase_1.getRealtimeDatabase)().ref(`${this.path}/${userId}`).limitToLast(50);
            const handler = (snapshot) => this.handle(userId, snapshot);
            query.on('child_added', handler);
            this.subscriptions.set(userId, { query, handler, count: 1 });
            this.logger.debug({ userId }, 'realtime bridge subscribed');
        }
        catch (error) {
            this.logger.error({ err: error, userId }, 'realtime bridge subscribe failed');
        }
    }
    onSocketDisconnected(userId) {
        const subscription = this.subscriptions.get(userId);
        if (!subscription)
            return;
        subscription.count -= 1;
        if (subscription.count > 0)
            return;
        subscription.query.off('child_added', subscription.handler);
        this.subscriptions.delete(userId);
        this.logger.debug({ userId }, 'realtime bridge unsubscribed');
    }
    dispose() {
        for (const [userId, subscription] of this.subscriptions) {
            subscription.query.off('child_added', subscription.handler);
            this.subscriptions.delete(userId);
        }
    }
    handle(userId, snapshot) {
        try {
            const value = snapshot.val();
            if (!(0, rtdbEventStore_1.isFreshEvent)(value, Date.now(), this.windowMs))
                return;
            this.server?.to((0, gateway_1.userRoom)(userId)).emit(value.event, value.payload ?? {});
        }
        catch (error) {
            this.logger.error({ err: error, userId }, 'realtime bridge handle failed');
        }
    }
}
exports.RtdbSocketBridge = RtdbSocketBridge;
//# sourceMappingURL=rtdbBridge.js.map