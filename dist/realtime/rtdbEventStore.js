"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RtdbCleanupJob = exports.RtdbEventStore = exports.isFreshEvent = void 0;
const firebase_1 = require("../config/firebase");
const CLOCK_SKEW_MS = 5_000;
const isFreshEvent = (value, now, windowMs) => {
    if (typeof value !== 'object' || value === null)
        return false;
    const candidate = value;
    if (typeof candidate.event !== 'string' || candidate.event.length === 0)
        return false;
    if (typeof candidate.at !== 'number' || !Number.isFinite(candidate.at))
        return false;
    const age = now - candidate.at;
    return age >= -CLOCK_SKEW_MS && age <= windowMs;
};
exports.isFreshEvent = isFreshEvent;
const isRecord = (value) => typeof value === 'object' && value !== null && !Array.isArray(value);
class RtdbEventStore {
    logger;
    origin;
    path;
    constructor(logger, origin, path = 'realtime') {
        this.logger = logger;
        this.origin = origin;
        this.path = path;
    }
    async publish(userId, event, payload) {
        const value = {
            event,
            payload: payload ?? {},
            at: Date.now(),
            origin: this.origin,
        };
        await (0, firebase_1.getRealtimeDatabase)().ref(`${this.path}/${userId}`).push(value);
    }
    async cleanup(maxAgeMs) {
        const snapshot = await (0, firebase_1.getRealtimeDatabase)().ref(this.path).once('value');
        const users = snapshot.val();
        if (!isRecord(users))
            return 0;
        const now = Date.now();
        const updates = {};
        for (const [userId, events] of Object.entries(users)) {
            if (!isRecord(events))
                continue;
            for (const [eventId, event] of Object.entries(events)) {
                if (!isRecord(event))
                    continue;
                const at = Number(event.at);
                if (Number.isFinite(at) && now - at > maxAgeMs) {
                    updates[`${this.path}/${userId}/${eventId}`] = null;
                }
            }
        }
        if (Object.keys(updates).length > 0) {
            await (0, firebase_1.getRealtimeDatabase)().ref().update(updates);
            this.logger.debug({ removed: Object.keys(updates).length }, 'realtime events cleaned up');
        }
        return Object.keys(updates).length;
    }
}
exports.RtdbEventStore = RtdbEventStore;
class RtdbCleanupJob {
    store;
    logger;
    maxAgeMs;
    intervalMs;
    timer = null;
    constructor(store, logger, maxAgeMs, intervalMs) {
        this.store = store;
        this.logger = logger;
        this.maxAgeMs = maxAgeMs;
        this.intervalMs = intervalMs;
    }
    start() {
        if (this.timer)
            return;
        this.runOnce();
        this.timer = setInterval(() => this.runOnce(), this.intervalMs);
        this.timer.unref();
        this.logger.info({ intervalMs: this.intervalMs }, 'realtime cleanup job started');
    }
    stop() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }
    runOnce() {
        this.store.cleanup(this.maxAgeMs).catch((error) => {
            this.logger.warn({ err: error }, 'realtime cleanup failed');
        });
    }
}
exports.RtdbCleanupJob = RtdbCleanupJob;
//# sourceMappingURL=rtdbEventStore.js.map