import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import ApiError from '../utils/ApiError';

const storage = multer.memoryStorage();

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedExtensions = ['.pdf', '.docx'];
  const allowedMimeTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  const ext = path.extname(file.originalname).toLowerCase();
  const isAllowedExt = allowedExtensions.includes(ext);
  const isAllowedMime = allowedMimeTypes.includes(file.mimetype);

  if (isAllowedExt && isAllowedMime) {
    cb(null, true);
  } else {
    cb(new ApiError(400, 'Invalid file type. Only PDF and DOCX files are allowed.'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
}).single('file');

/**
 * Validates file uploads (size limits, file extensions, and mime-type headers)
 * and appends structured metadata.
 */
export function uploadMiddleware(req: Request, res: Response, next: NextFunction) {
  upload(req, res, (err: any) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(new ApiError(400, 'File size exceeds the maximum limit of 5MB.'));
      }
      return next(new ApiError(400, err.message));
    } else if (err) {
      return next(err);
    }

    if (!req.file) {
      return next(new ApiError(400, 'No file was uploaded.'));
    }

    (req as any).uploadMetadata = {
      filename: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      extension: path.extname(req.file.originalname).toLowerCase(),
      uploadedAt: new Date(),
    };

    next();
  });
}

export default uploadMiddleware;
