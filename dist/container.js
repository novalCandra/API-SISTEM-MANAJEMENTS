"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildContainer = buildContainer;
const env_1 = require("./config/env");
const logger_1 = require("./config/logger");
const auth_controller_1 = require("./controllers/auth.controller");
const dashboard_controller_1 = require("./controllers/dashboard.controller");
const item_controller_1 = require("./controllers/item.controller");
const note_controller_1 = require("./controllers/note.controller");
const photo_controller_1 = require("./controllers/photo.controller");
const production_controller_1 = require("./controllers/production.controller");
const auth_1 = require("./middleware/auth");
const gateway_1 = require("./realtime/gateway");
const rtdbBridge_1 = require("./realtime/rtdbBridge");
const rtdbEventStore_1 = require("./realtime/rtdbEventStore");
const repositories_1 = require("./repositories");
const auth_service_1 = require("./services/auth.service");
const dashboard_service_1 = require("./services/dashboard.service");
const image_processor_1 = require("./services/image.processor");
const item_service_1 = require("./services/item.service");
const note_service_1 = require("./services/note.service");
const photo_service_1 = require("./services/photo.service");
const production_service_1 = require("./services/production.service");
const token_service_1 = require("./services/token.service");
const storage_1 = require("./storage");
function buildContainer() {
    const repos = (0, repositories_1.createRepositories)();
    const storage = (0, storage_1.createStorageProvider)();
    const tokens = new token_service_1.TokenService();
    const realtimeDriver = env_1.config.REALTIME_DRIVER;
    const realtimeEvents = new rtdbEventStore_1.RtdbEventStore(logger_1.logger, `stokku-${process.pid}`);
    const realtime = new gateway_1.RealtimeGateway(realtimeDriver, realtimeEvents, logger_1.logger);
    const socketBridge = realtimeDriver === 'rtdb' ? new rtdbBridge_1.RtdbSocketBridge(logger_1.logger) : new rtdbBridge_1.NoopSocketBridge();
    const authService = new auth_service_1.AuthService(repos.users, repos.refreshTokens, tokens, logger_1.logger);
    const itemService = new item_service_1.ItemService(repos.items);
    const productionService = new production_service_1.ProductionService(repos.items, repos.productions);
    const photoService = new photo_service_1.PhotoService(repos.photos, repos.items, storage, new image_processor_1.ImageProcessor());
    const noteService = new note_service_1.NoteService(repos.notes);
    const dashboardService = new dashboard_service_1.DashboardService(repos.items, repos.productions, repos.users);
    return {
        config: env_1.config,
        repos,
        storage,
        tokens,
        realtime,
        realtimeDriver,
        realtimeEvents,
        socketBridge,
        requireAuth: (0, auth_1.createAuthMiddleware)(tokens, logger_1.logger),
        services: {
            auth: authService,
            items: itemService,
            productions: productionService,
            photos: photoService,
            notes: noteService,
            dashboard: dashboardService,
        },
        controllers: {
            auth: new auth_controller_1.AuthController(authService),
            items: new item_controller_1.ItemController(itemService, realtime),
            productions: new production_controller_1.ProductionController(productionService, realtime),
            photos: new photo_controller_1.PhotoController(photoService, realtime),
            notes: new note_controller_1.NoteController(noteService),
            dashboard: new dashboard_controller_1.DashboardController(dashboardService),
        },
    };
}
//# sourceMappingURL=container.js.map