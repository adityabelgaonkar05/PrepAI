const User = require('../models/UserModel');
const Quiz = require('../models/QuizModel');
const resolveTokens = require('../utils/resolveTokens');

module.exports = async (req, res) => {
    const { token, quizCode } = req.body;
    if (!token || !quizCode) {
        return res.status(400).json({ message: 'Token and quiz code are required' });
    }
    
    try {
        const { objectId, expiryDate } = resolveTokens(token);
        if (!objectId || !expiryDate) {
            return res.status(401).json({ message: 'Invalid token' });
        }

        const currentDate = new Date();

        if (currentDate > expiryDate) {
            return res.status(401).json({ message: 'Token has expired' });
        }

        const user = await User.findById(objectId);
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        const quiz = await Quiz.findOne({ link_code: quizCode }).populate('author', 'username email');
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }

        return res.status(200).json({
            message: 'Quiz retrieved successfully',
            quiz: {
                title: quiz.Title,
                quizContent: quiz.quizContent,
                textQuestions: quiz.textQuestions,
                PdfContentId: quiz.pdfContentId,
            }});
    } catch (error) {
        console.error('Error during quiz retrieval:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}