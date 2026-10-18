import { Router } from 'express';
import type { ProductionController } from '../controllers/production.controller';
import { validate } from '../middleware/validate';
import { productionBodySchema, productionQuerySchema } from '../schemas/production.schema';

export function createProductionRouter(controller: ProductionController): Router {
  const router = Router();

  router.get('/', validate({ query: productionQuerySchema }), controller.list);
  router.post('/', validate({ body: productionBodySchema }), controller.create);

  return router;
}
