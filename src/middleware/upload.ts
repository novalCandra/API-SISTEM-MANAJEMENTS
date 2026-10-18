import type { NextFunction, Request, RequestHandler, Response } from 'express';
import multer from 'multer';
import { BadRequestError, PayloadTooLargeError } from '../errors/AppError';

export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES,
    files: 1,
    fields: 10,
    fieldSize: 1024 * 1024,
  },
  fileFilter: (_req, file, cb) => {
    if (!/^image\/(jpeg|png|webp)$/.test(file.mimetype)) {
      cb(new BadRequestError('Format gambar tidak didukung (hanya JPG, PNG, WEBP)'));
      return;
    }
    cb(null, true);
  },
});

export const singlePhoto: RequestHandler = (req: Request, res: Response, next: NextFunction): void => {
  upload.single('photo')(req, res, (err: unknown) => {
    if (!err) {
      next();
      return;
    }
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        next(new PayloadTooLargeError('Ukuran foto maksimal 5MB'));
        return;
      }
      next(new BadRequestError('Unggahan tidak valid', { multer: err.code }));
      return;
    }
    next(err instanceof Error ? err : new BadRequestError('Unggahan tidak valid'));
  });
};
