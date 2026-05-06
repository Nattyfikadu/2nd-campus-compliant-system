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
    console.log('Uploading to Cloudinary:', file.originalname, '| type:', file.mimetype, '| resource_type:', isVideo ? 'video' : 'image');
    return {
      folder: 'campus-complaints',
      resource_type: 'auto', // let Cloudinary detect automatically
      use_filename: false,
      unique_filename: true,
    };
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
});

module.exports = { cloudinary, upload };
