import FileType from 'file-type';
import sharp from 'sharp';
import { UnprocessableEntityError } from '../errors/AppError';

const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_DIMENSION = 1600;

export interface ProcessedImage {
  buffer: Buffer;
  extension: string;
  contentType: string;
}

export class ImageProcessor {
  async process(input: Buffer): Promise<ProcessedImage> {
    const detected = await FileType.fromBuffer(input);
    if (!detected || !ALLOWED_MIME.has(detected.mime)) {
      throw new UnprocessableEntityError('Format gambar tidak didukung (hanya JPG, PNG, WEBP)');
    }

    const buffer = await sharp(input, { failOn: 'error', limitInputPixels: 40_000_000 })
      .rotate()
      .resize({
        width: MAX_DIMENSION,
        height: MAX_DIMENSION,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({ quality: 82, mozjpeg: true })
      .toBuffer();

    return { buffer, extension: 'jpg', contentType: 'image/jpeg' };
  }
}
