import type { Request, Response } from 'express';
import { BadRequestError } from '../errors/AppError';
import { SOCKET_EVENTS } from '../realtime/events';
import type { IRealtimePublisher } from '../realtime/publisher';
import type { PhotoBody } from '../schemas/photo.schema';
import type { PhotoService } from '../services/photo.service';
import { asyncHandler } from '../utils/asyncHandler';

export class PhotoController {
  constructor(
    private readonly photos: PhotoService,
    private readonly realtime: IRealtimePublisher,
  ) {}

  list = asyncHandler(async (req: Request, res: Response) => {
    const data = await this.photos.list(req.user!.sub);
    res.json({ data });
  });

  upload = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.sub;
    const file = req.file;
    if (!file) {
      throw new BadRequestError('Foto wajib diunggah');
    }
    const body = req.body as PhotoBody;
    const photo = await this.photos.upload(userId, {
      buffer: file.buffer,
      itemId: body.itemId ?? null,
      itemName: body.itemName,
      quantity: body.quantity,
      worker: body.worker,
    });
    this.realtime.emitToUser(userId, SOCKET_EVENTS.photoCreated, { photo });
    this.realtime.emitToUser(userId, SOCKET_EVENTS.dashboardRefresh, {});
    res.status(201).json({ data: photo });
  });

  remove = asyncHandler(async (req: Request, res: Response) => {
    await this.photos.remove(req.user!.sub, req.params.id as string);
    res.status(204).send();
  });
}
