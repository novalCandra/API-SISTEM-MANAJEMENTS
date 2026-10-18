import { Router } from 'express';
import type { NoteController } from '../controllers/note.controller';
import { validate } from '../middleware/validate';
import { idParamSchema } from '../schemas/auth.schema';
import { noteBodySchema, noteUpdateSchema } from '../schemas/note.schema';

export function createNoteRouter(controller: NoteController): Router {
  const router = Router();

  router.get('/', controller.list);
  router.post('/', validate({ body: noteBodySchema }), controller.create);
  router.patch(
    '/:id',
    validate({ params: idParamSchema, body: noteUpdateSchema }),
    controller.update,
  );
  router.delete('/:id', validate({ params: idParamSchema }), controller.remove);

  return router;
}
