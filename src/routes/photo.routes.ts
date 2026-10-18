import { Router } from 'express';
import type { PhotoController } from '../controllers/photo.controller';
import { uploadLimiter } from '../middleware/rateLimit';
import { singlePhoto } from '../middleware/upload';
import { validate } from '../middleware/validate';
import { idParamSchema } from '../schemas/auth.schema';
import { photoBodySchema } from '../schemas/photo.schema';

export function createPhotoRouter(controller: PhotoController): Router {
  const router = Router();

  router.get('/', controller.list);
  router.post(
    '/',
    uploadLimiter,
    singlePhoto,
    validate({ body: photoBodySchema }),
    controller.upload,
  );
  router.delete('/:id', validate({ params: idParamSchema }), controller.remove);

  return router;
}
