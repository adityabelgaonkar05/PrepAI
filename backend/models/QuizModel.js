const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
    pdfContentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PdfContent',
        required: true
    },
    Title: {
        type: String,
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    quizContent: [{
        question: {
            type: String,
            required: true
        },
        options: [{
            type: String,
            required: true
        }],
        answer: {
            type: String,
            required: true
        }
    }],
    textQuestions: [{
        type: String
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    link_code: {
        type: String,
        required: true,
        unique: true
    },
}, { timestamps: true });

const Quiz = mongoose.model('Quiz', quizSchema);

module.exports = Quiz;