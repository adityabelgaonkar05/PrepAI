const User = require('../models/UserModel');
const resolveTokens = require('../utils/resolveTokens');

module.exports = async (req, res) => {
    const { token } = req.body;
    if (!token) {
        return res.status(400).json({ message: 'Token is required' });
    }

    try {
        const {objectId, expiryDate} = resolveTokens(token);
        if(!objectId || !expiryDate) {
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

        return res.status(200).json({
            message: 'Token is valid',
            user: {
                username: user.username,
                email: user.email
            }
        });

    } catch (error) {
        console.error('Error during token validation:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}