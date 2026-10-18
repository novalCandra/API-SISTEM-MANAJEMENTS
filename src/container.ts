import type { RequestHandler } from 'express';
import { config } from './config/env';
import { logger } from './config/logger';
import { AuthController } from './controllers/auth.controller';
import { DashboardController } from './controllers/dashboard.controller';
import { ItemController } from './controllers/item.controller';
import { NoteController } from './controllers/note.controller';
import { PhotoController } from './controllers/photo.controller';
import { ProductionController } from './controllers/production.controller';
import { createAuthMiddleware } from './middleware/auth';
import { RealtimeGateway, type RealtimeDriver } from './realtime/gateway';
import {
  NoopSocketBridge,
  RtdbSocketBridge,
  type ISocketBridge,
} from './realtime/rtdbBridge';
import { RtdbEventStore } from './realtime/rtdbEventStore';
import { createRepositories, type RepositoryContainer } from './repositories';
import { AuthService } from './services/auth.service';
import { DashboardService } from './services/dashboard.service';
import { ImageProcessor } from './services/image.processor';
import { ItemService } from './services/item.service';
import { NoteService } from './services/note.service';
import { PhotoService } from './services/photo.service';
import { ProductionService } from './services/production.service';
import { TokenService } from './services/token.service';
import { createStorageProvider } from './storage';
import type { IStorageProvider } from './storage/interfaces';

export interface AppContainer {
  config: typeof config;
  repos: RepositoryContainer;
  storage: IStorageProvider;
  tokens: TokenService;
  realtime: RealtimeGateway;
  realtimeDriver: RealtimeDriver;
  realtimeEvents: RtdbEventStore;
  socketBridge: ISocketBridge;
  requireAuth: RequestHandler;
  services: {
    auth: AuthService;
    items: ItemService;
    productions: ProductionService;
    photos: PhotoService;
    notes: NoteService;
    dashboard: DashboardService;
  };
  controllers: {
    auth: AuthController;
    items: ItemController;
    productions: ProductionController;
    photos: PhotoController;
    notes: NoteController;
    dashboard: DashboardController;
  };
}

export function buildContainer(): AppContainer {
  const repos = createRepositories();
  const storage = createStorageProvider();
  const tokens = new TokenService();

  const realtimeDriver: RealtimeDriver = config.REALTIME_DRIVER;
  const realtimeEvents = new RtdbEventStore(logger, `stokku-${process.pid}`);
  const realtime = new RealtimeGateway(realtimeDriver, realtimeEvents, logger);
  const socketBridge: ISocketBridge =
    realtimeDriver === 'rtdb' ? new RtdbSocketBridge(logger) : new NoopSocketBridge();

  const authService = new AuthService(repos.users, repos.refreshTokens, tokens, logger);
  const itemService = new ItemService(repos.items);
  const productionService = new ProductionService(repos.items, repos.productions);
  const photoService = new PhotoService(repos.photos, repos.items, storage, new ImageProcessor());
  const noteService = new NoteService(repos.notes);
  const dashboardService = new DashboardService(repos.items, repos.productions, repos.users);

  return {
    config,
    repos,
    storage,
    tokens,
    realtime,
    realtimeDriver,
    realtimeEvents,
    socketBridge,
    requireAuth: createAuthMiddleware(tokens, logger),
    services: {
      auth: authService,
      items: itemService,
      productions: productionService,
      photos: photoService,
      notes: noteService,
      dashboard: dashboardService,
    },
    controllers: {
      auth: new AuthController(authService),
      items: new ItemController(itemService, realtime),
      productions: new ProductionController(productionService, realtime),
      photos: new PhotoController(photoService, realtime),
      notes: new NoteController(noteService),
      dashboard: new DashboardController(dashboardService),
    },
  };
}
