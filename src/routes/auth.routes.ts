import { Router, type RequestHandler } from 'express';
import type { AuthController } from '../controllers/auth.controller';
import { loginLimiter } from '../middleware/rateLimit';
import { validate } from '../middleware/validate';
import { loginSchema, registerSchema } from '../schemas/auth.schema';

export function createAuthRouter(
  controller: AuthController,
  requireAuth: RequestHandler,
): Router {
  const router = Router();

  router.post('/register', loginLimiter, validate({ body: registerSchema }), controller.register);
  router.post('/login', loginLimiter, validate({ body: loginSchema }), controller.login);
  router.post('/refresh', controller.refresh);
  router.post('/logout', controller.logout);
  router.get('/me', requireAuth, controller.me);

  return router;
}
