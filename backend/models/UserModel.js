const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    username: {
        type: String,
        required: true,
        trim: true
    },
    quizIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quiz'
    }],
    password: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

module.exports = User;