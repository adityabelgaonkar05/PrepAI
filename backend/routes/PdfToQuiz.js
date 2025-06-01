const express = require('express');
const multer = require('multer');
const { processPdf } = require('../controllers/PdfToQuiz');

const router = express.Router();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') return cb(null, true);
        cb(new Error('Only PDF files are allowed'));
    }
});

router.post('/pdf-to-quiz', upload.single('pdf'), processPdf);

module.exports = router;
