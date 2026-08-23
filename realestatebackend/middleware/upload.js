const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { GridFSBucket } = require('mongodb');
const { getDBConnection } = require('../config/db');

// ─── Ensure upload directories exist ────────────────────────────────────────
const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

const gridFsStorage = {
  _handleFile: (req, file, cb) => {
    const connection = getDBConnection();
    if (!connection?.db) {
      return cb(new Error('Database is not ready for file storage.'));
    }

    const folder = file.fieldname === 'documents' ? 'documents'
      : file.fieldname === 'avatar' ? 'avatars' : 'properties';
    const filename = `${folder.slice(0, -1)}_${Date.now()}_${Math.round(Math.random() * 1e6)}${path.extname(file.originalname)}`;
    const bucket = new GridFSBucket(connection.db, { bucketName: 'uploads' });
    const uploadStream = bucket.openUploadStream(filename, {
      contentType: file.mimetype,
      metadata: { folder, originalName: file.originalname },
    });

    uploadStream.on('error', cb);
    uploadStream.on('finish', () => cb(null, {
      filename,
      key: filename,
      path: `/uploads/${folder}/${filename}`,
      size: uploadStream.length,
    }));
    file.stream.pipe(uploadStream);
  },
  _removeFile: (req, file, cb) => cb(null),
};

const storage = process.env.UPLOAD_STORAGE === 'local' ? null : gridFsStorage;

// ─── Storage: Property Images ────────────────────────────────────────────────
const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dest = path.join(__dirname, '../uploads/properties');
    ensureDir(dest);
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const uniqueName = `prop_${Date.now()}_${Math.round(Math.random() * 1e6)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

// ─── Storage: Property Documents ─────────────────────────────────────────────
const documentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dest = path.join(__dirname, '../uploads/documents');
    ensureDir(dest);
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const uniqueName = `doc_${Date.now()}_${Math.round(Math.random() * 1e6)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const propertyFileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = file.fieldname === 'documents' ? 'documents' : 'properties';
    const dest = path.join(__dirname, `../uploads/${folder}`);
    ensureDir(dest);
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const prefix = file.fieldname === 'documents' ? 'doc' : 'prop';
    const uniqueName = `${prefix}_${Date.now()}_${Math.round(Math.random() * 1e6)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

// ─── File Filters ─────────────────────────────────────────────────────────────
const imageFileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (jpeg, jpg, png, webp) are allowed!'), false);
  }
};

const documentFileFilter = (req, file, cb) => {
  const allowedTypes = /pdf|doc|docx/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  if (extname) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF and Word documents are allowed!'), false);
  }
};

const propertyFileFilter = (req, file, cb) => {
  if (file.fieldname === 'documents') return documentFileFilter(req, file, cb);
  return imageFileFilter(req, file, cb);
};

// ─── Avatar Storage ──────────────────────────────────────────────────────────
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dest = path.join(__dirname, '../uploads/avatars');
    ensureDir(dest);
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const uniqueName = `avatar_${req.user.id}_${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

// ─── Export multer instances ──────────────────────────────────────────────────
const uploadImages = multer({
  storage: storage || imageStorage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 10 }, // 5MB per image, max 10
});

const uploadDocuments = multer({
  storage: storage || documentStorage,
  fileFilter: documentFileFilter,
  limits: { fileSize: 10 * 1024 * 1024, files: 5 }, // 10MB per doc, max 5
});

const uploadAvatar = multer({
  storage: storage || avatarStorage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 2 * 1024 * 1024, files: 1 }, // 2MB
});

const uploadPropertyMultipart = multer({
  storage: storage || propertyFileStorage,
  fileFilter: propertyFileFilter,
  limits: { files: 15, fileSize: 10 * 1024 * 1024 },
}).fields([
  { name: 'images', maxCount: 10 },
  { name: 'documents', maxCount: 5 },
]);

const uploadPropertyFiles = (req, res, next) => {
  uploadPropertyMultipart(req, res, next);
};

module.exports = { uploadImages, uploadDocuments, uploadAvatar, uploadPropertyFiles };
