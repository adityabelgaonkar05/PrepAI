const mongoose = require('mongoose');

const pdfContentSchema = new mongoose.Schema({
    hashedKey: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    content: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const PdfContent = mongoose.model('PdfContent', pdfContentSchema);

module.exports = PdfContent;