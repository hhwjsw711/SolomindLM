import multer from 'multer';
import { Request } from 'express';

/**
 * Allowed MIME types for file upload
 * Only documents and images are permitted
 */
const ALLOWED_MIME_TYPES = [
  // Documents
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.ms-excel',
  'text/plain',
  'text/csv',
  'application/rtf',
  'application/vnd.oasis.opendocument.text',
  'application/vnd.oasis.opendocument.presentation',
  'application/vnd.oasis.opendocument.spreadsheet',
  'application/json',

  // Images
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
  'image/bmp',
  'image/svg+xml',
  'image/avif',

  // Markdown
  'text/markdown',
];

/**
 * Maximum file sizes by type
 */
const MAX_FILE_SIZES = {
  'application/pdf': 20 * 1024 * 1024, // 20MB
  'application/msword': 10 * 1024 * 1024, // 10MB
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 10 * 1024 * 1024,
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 50 * 1024 * 1024, // 50MB
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 5 * 1024 * 1024, // 5MB
  'image/png': 10 * 1024 * 1024, // 10MB
  'image/jpeg': 10 * 1024 * 1024,
  'image/gif': 10 * 1024 * 1024,
  'image/webp': 10 * 1024 * 1024,
  'image/bmp': 10 * 1024 * 1024,
  'image/avif': 10 * 1024 * 1024,
  'text/plain': 1 * 1024 * 1024, // 1MB
  'text/markdown': 1 * 1024 * 1024,
  'application/json': 1 * 1024 * 1024, // 1MB
};

const DEFAULT_MAX_SIZE = 10 * 1024 * 1024; // 10MB default

/**
 * Extension to MIME type mapping
 * Used when browser reports application/octet-stream
 */
const extToMime: Record<string, string> = {
  'pdf': 'application/pdf',
  'doc': 'application/msword',
  'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'ppt': 'application/vnd.ms-powerpoint',
  'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'xls': 'application/vnd.ms-excel',
  'png': 'image/png',
  'jpg': 'image/jpeg',
  'jpeg': 'image/jpeg',
  'gif': 'image/gif',
  'webp': 'image/webp',
  'bmp': 'image/bmp',
  'svg': 'image/svg+xml',
  'txt': 'text/plain',
  'csv': 'text/csv',
  'md': 'text/markdown',
  'markdown': 'text/markdown',
  'rtf': 'application/rtf',
  'odt': 'application/vnd.oasis.opendocument.text',
  'odp': 'application/vnd.oasis.opendocument.presentation',
  'ods': 'application/vnd.oasis.opendocument.spreadsheet',
  'json': 'application/json',
  'avif': 'image/avif',
};

/**
 * MIME type to allowed extensions mapping
 */
const mimeToExt: Record<string, string[]> = {
  'application/pdf': ['pdf'],
  'application/msword': ['doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['docx'],
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['pptx'],
  'application/vnd.ms-powerpoint': ['ppt'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['xlsx'],
  'application/vnd.ms-excel': ['xls'],
  'image/png': ['png'],
  'image/jpeg': ['jpg', 'jpeg'],
  'image/gif': ['gif'],
  'image/webp': ['webp'],
  'image/bmp': ['bmp'],
  'image/svg+xml': ['svg'],
  'image/avif': ['avif'],
  'text/plain': ['txt'],
  'text/csv': ['csv'],
  'text/markdown': ['md', 'markdown'],
  'application/rtf': ['rtf'],
  'application/vnd.oasis.opendocument.text': ['odt'],
  'application/vnd.oasis.opendocument.presentation': ['odp'],
  'application/vnd.oasis.opendocument.spreadsheet': ['ods'],
  'application/json': ['json'],
};

/**
 * File filter function to validate file types
 */
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  callback: multer.FileFilterCallback
) => {
  // Check if file has a MIME type
  if (!file.mimetype) {
    return callback(new Error('File must have a valid MIME type'));
  }

  // Get file extension
  const ext = file.originalname.toLowerCase().split('.').pop() || '';
  
  // Handle application/octet-stream by checking file extension
  let mimetype = file.mimetype;
  if (mimetype === 'application/octet-stream' || mimetype === 'application/x-msdownload') {
    const detectedMime = extToMime[ext];
    if (!detectedMime) {
      return callback(new Error(
        `File type could not be determined from extension .${ext}. ` +
        `Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`
      ));
    }
    // Update the mimetype for validation
    mimetype = detectedMime;
    // Update the file object's mimetype so it's correct downstream
    (file as any).mimetype = mimetype;
  }

  // Check if MIME type is allowed
  if (!ALLOWED_MIME_TYPES.includes(mimetype)) {
    return callback(new Error(
      `File type ${mimetype} is not allowed. ` +
      `Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`
    ));
  }

  // Check file extension matches MIME type (basic validation)
  const allowedExtensions = mimeToExt[mimetype];
  if (allowedExtensions && ext && !allowedExtensions.includes(ext)) {
    return callback(new Error(
      `File extension .${ext} does not match declared MIME type ${mimetype}`
    ));
  }

  callback(null, true);
};

/**
 * Dynamic limits based on file type
 */
const limits = {
  fileSize: 50 * 1024 * 1024, // Max 50MB overall (reduced from unlimited)
  files: 1, // Only allow one file at a time
  fieldSize: 100 * 1024, // Limit field size to 100KB
};

/**
 * Configure multer with security constraints
 */
export const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits,
});

/**
 * Middleware to validate file size after upload based on MIME type
 * This provides more granular control than multer's built-in fileSize limit
 */
export function validateFileSize(
  req: Request,
  res: any,
  next: () => void
) {
  if (!req.file) {
    return next();
  }

  const maxSize = MAX_FILE_SIZES[req.file.mimetype as keyof typeof MAX_FILE_SIZES] || DEFAULT_MAX_SIZE;

  if (req.file.size > maxSize) {
    return res.status(413).json({
      error: `File too large. Maximum size for ${req.file.mimetype} is ${Math.round(maxSize / 1024 / 1024)}MB`,
    });
  }

  next();
}

/**
 * Sanitize filename to prevent path traversal and other attacks
 */
export function sanitizeFilename(filename: string): string {
  // Remove path separators
  let sanitized = filename.replace(/[\/\\]/g, '_');

  // Remove parent directory references
  sanitized = sanitized.replace(/\.\./g, '');

  // Remove invalid Windows characters
  sanitized = sanitized.replace(/[<>:"|?*]/g, '_');

  // Remove control characters
  sanitized = sanitized.replace(/[\x00-\x1f\x80-\x9f]/g, '');

  // Remove leading dots
  sanitized = sanitized.replace(/^\.+/, '');

  // Limit length
  sanitized = sanitized.substring(0, 255);

  return sanitized || 'unnamed_file';
}

/**
 * Get file extension from MIME type
 */
export function getExtensionFromMimeType(mimeType: string): string {
  const extMap: Record<string, string> = {
    'application/pdf': '.pdf',
    'application/msword': '.doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': '.pptx',
    'application/vnd.ms-powerpoint': '.ppt',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
    'application/vnd.ms-excel': '.xls',
    'image/png': '.png',
    'image/jpeg': '.jpg',
    'image/gif': '.gif',
    'image/webp': '.webp',
    'image/bmp': '.bmp',
    'image/avif': '.avif',
    'image/svg+xml': '.svg',
    'text/plain': '.txt',
    'text/csv': '.csv',
    'text/markdown': '.md',
    'application/rtf': '.rtf',
    'application/vnd.oasis.opendocument.text': '.odt',
    'application/vnd.oasis.opendocument.presentation': '.odp',
    'application/vnd.oasis.opendocument.spreadsheet': '.ods',
    'application/json': '.json',
  };

  return extMap[mimeType] || '';
}
