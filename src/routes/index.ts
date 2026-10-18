import { Router } from 'express';
import type { AppContainer } from '../container';
import { createAuthRouter } from './auth.routes';
import { createItemRouter } from './item.routes';
import { createNoteRouter } from './note.routes';
import { createPhotoRouter } from './photo.routes';
import { createProductionRouter } from './production.routes';

export function createDashboardRouter(container: AppContainer): Router {
  const router = Router();
  router.get('/', container.controllers.dashboard.snapshot);
  return router;
}

export function createApiRouter(container: AppContainer): Router {
  const router = Router();
  const { requireAuth } = container;

  router.get('/health', (_req, res) => {
    res.json({ data: { status: 'ok', uptime: process.uptime() } });
  });

  router.use('/auth', createAuthRouter(container.controllers.auth, requireAuth));
  router.use('/items', requireAuth, createItemRouter(container.controllers.items));
  router.use('/productions', requireAuth, createProductionRouter(container.controllers.productions));
  router.use('/photos', requireAuth, createPhotoRouter(container.controllers.photos));
  router.use('/notes', requireAuth, createNoteRouter(container.controllers.notes));
  router.use('/dashboard', requireAuth, createDashboardRouter(container));

  return router;
}
