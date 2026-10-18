import type { Request, Response } from 'express';
import type { NoteBody, NoteUpdateBody } from '../schemas/note.schema';
import type { NoteService } from '../services/note.service';
import { asyncHandler } from '../utils/asyncHandler';

export class NoteController {
  constructor(private readonly notes: NoteService) {}

  list = asyncHandler(async (req: Request, res: Response) => {
    const data = await this.notes.list(req.user!.sub);
    res.json({ data });
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const note = await this.notes.create(req.user!.sub, req.body as NoteBody);
    res.status(201).json({ data: note });
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const note = await this.notes.update(
      req.user!.sub,
      req.params.id as string,
      req.body as NoteUpdateBody,
    );
    res.json({ data: note });
  });

  remove = asyncHandler(async (req: Request, res: Response) => {
    await this.notes.remove(req.user!.sub, req.params.id as string);
    res.status(204).send();
  });
}
