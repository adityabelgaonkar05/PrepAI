const User = require('../models/UserModel');
const Quiz = require('../models/QuizModel');
const resolveTokens = require('../utils/resolveTokens');

module.exports = async (req, res) => {
    const { token } = req.body;
    if (!token) {
        return res.status(401).json({ error: 'Token is required' });
    }

    const { objectId, expiryDate } = resolveTokens(token);
    if (!objectId || !expiryDate) {
        return res.status(401).json({ error: 'Invalid token' });
    }

    const currentDate = new Date();

    if (currentDate > expiryDate) {
        return res.status(401).json({ error: 'Token has expired' });
    }

    const user = await User.findById(objectId);
    if (!user) {
        return res.status(401).json({ error: 'User not found' });
    }

    try {
        const quizzes = await Quiz.find({ author: user._id });
        let quizList = quizzes.map(quiz => ({
            link_code: quiz.link_code,
            title: quiz.Title,
            createdAt: quiz.createdAt
        }));

        return res.status(200).json({ quizList });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
    }
}