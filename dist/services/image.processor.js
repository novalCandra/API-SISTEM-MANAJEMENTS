"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageProcessor = void 0;
const file_type_1 = __importDefault(require("file-type"));
const sharp_1 = __importDefault(require("sharp"));
const AppError_1 = require("../errors/AppError");
const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_DIMENSION = 1600;
class ImageProcessor {
    async process(input) {
        const detected = await file_type_1.default.fromBuffer(input);
        if (!detected || !ALLOWED_MIME.has(detected.mime)) {
            throw new AppError_1.UnprocessableEntityError('Format gambar tidak didukung (hanya JPG, PNG, WEBP)');
        }
        const buffer = await (0, sharp_1.default)(input, { failOn: 'error', limitInputPixels: 40_000_000 })
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
exports.ImageProcessor = ImageProcessor;
//# sourceMappingURL=image.processor.js.map