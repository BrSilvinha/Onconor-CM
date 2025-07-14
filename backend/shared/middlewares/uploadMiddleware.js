const multer = require('multer');
const path = require('path');

let upload;

if (process.env.NODE_ENV === 'qas') {
    // Configuración para QAS: almacenamiento local
    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'uploads/');
        },
        filename: function (req, file, cb) {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
        }
    });

    upload = multer({
        storage: storage,
        fileFilter: (req, file, cb) => {
            if (file.mimetype.startsWith('image/')) {
                cb(null, true);
            } else {
                cb(new Error('No es una imagen válida'), false);
            }
        },
        limits: {
            fileSize: 5 * 1024 * 1024 // 5 MB
        }
    });
} else {
    // Configuración para desarrollo local y producción: AWS S3
    const multerS3 = require('multer-s3');
    const { S3Client } = require("@aws-sdk/client-s3");

    const s3Client = new S3Client({
        region: process.env.AWS_REGION,
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        }
    });

    upload = multer({
        storage: multerS3({
            s3: s3Client,
            bucket: process.env.AWS_S3_BUCKET,
            metadata: function (req, file, cb) {
                cb(null, { fieldName: file.fieldname });
            },
            key: function (req, file, cb) {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                cb(null, `images/logos/${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
            }
        }),
        fileFilter: (req, file, cb) => {
            if (file.mimetype.startsWith('image/')) {
                cb(null, true);
            } else {
                cb(new Error('No es una imagen válida'), false);
            }
        },
        limits: {
            fileSize: 5 * 1024 * 1024 // 5 MB
        }
    });
}

module.exports = { upload };