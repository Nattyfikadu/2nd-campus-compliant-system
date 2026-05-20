const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const isVideo = file.mimetype.startsWith('video');
    const isAudio = file.mimetype.startsWith('audio');
    // Cloudinary groups audio under 'video' resource type
    const resourceType = (isVideo || isAudio) ? 'video' : 'image';
    console.log('Uploading:', file.originalname, '| mimetype:', file.mimetype, '| resource_type:', resourceType);
    return {
      folder: 'campus-complaints',
      resource_type: resourceType,
      use_filename: false,
      unique_filename: true,
    };
  },
});

// Allowed MIME type prefixes — block executables and other dangerous files
const ALLOWED_MIME_PREFIXES = ['image/', 'video/', 'audio/'];
const ALLOWED_MIME_EXACT = ['application/pdf', 'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain'];

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed =
      ALLOWED_MIME_PREFIXES.some(p => file.mimetype.startsWith(p)) ||
      ALLOWED_MIME_EXACT.includes(file.mimetype);
    if (!allowed) {
      return cb(new Error(`File type not allowed: ${file.mimetype}`));
    }
    cb(null, true);
  },
});

module.exports = { cloudinary, upload };
