"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.singlePhoto = exports.MAX_FILE_SIZE_BYTES = void 0;
const multer_1 = __importDefault(require("multer"));
const AppError_1 = require("../errors/AppError");
exports.MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: exports.MAX_FILE_SIZE_BYTES,
        files: 1,
        fields: 10,
        fieldSize: 1024 * 1024,
    },
    fileFilter: (_req, file, cb) => {
        if (!/^image\/(jpeg|png|webp)$/.test(file.mimetype)) {
            cb(new AppError_1.BadRequestError('Format gambar tidak didukung (hanya JPG, PNG, WEBP)'));
            return;
        }
        cb(null, true);
    },
});
const singlePhoto = (req, res, next) => {
    upload.single('photo')(req, res, (err) => {
        if (!err) {
            next();
            return;
        }
        if (err instanceof multer_1.default.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                next(new AppError_1.PayloadTooLargeError('Ukuran foto maksimal 5MB'));
                return;
            }
            next(new AppError_1.BadRequestError('Unggahan tidak valid', { multer: err.code }));
            return;
        }
        next(err instanceof Error ? err : new AppError_1.BadRequestError('Unggahan tidak valid'));
    });
};
exports.singlePhoto = singlePhoto;
//# sourceMappingURL=upload.js.map