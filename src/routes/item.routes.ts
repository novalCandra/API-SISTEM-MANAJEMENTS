import { Router } from 'express';
import type { ItemController } from '../controllers/item.controller';
import { validate } from '../middleware/validate';
import { idParamSchema } from '../schemas/auth.schema';
import { itemBodySchema, itemListQuerySchema, itemUpdateSchema } from '../schemas/item.schema';

export function createItemRouter(controller: ItemController): Router {
  const router = Router();

  router.get('/', validate({ query: itemListQuerySchema }), controller.list);
  router.post('/', validate({ body: itemBodySchema }), controller.create);
  router.get('/:id', validate({ params: idParamSchema }), controller.get);
  router.patch(
    '/:id',
    validate({ params: idParamSchema, body: itemUpdateSchema }),
    controller.update,
  );
  router.delete('/:id', validate({ params: idParamSchema }), controller.remove);

  return router;
}
