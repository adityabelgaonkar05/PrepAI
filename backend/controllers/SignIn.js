const User = require('../models/UserModel');
const {hash} = require('../utils/hashUnhash');
const resolveTokens = require('../utils/resolveTokens');

module.exports = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const {objectId, expiryDate} = resolveTokens(user.password);
        if (objectId !== password) {
            console.log(objectId, password);
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        
        const token = hash(user._id.toString());

        const userData = {
            id: user._id,
            usernamename: user.username,
            email: user.email,
            token: token
        };

        return res.status(200).json({
            message: 'Sign-in successful',
            user: userData
        });
        
    } catch (error) {
        console.error('Error during sign-in:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
