const User = require('../models/UserModel');
const {hash} = require('../utils/hashUnhash');

module.exports = async (req, res) => {
    const { email, password, username } = req.body;
    if (!email || !password || !username) {
        return res.status(400).json({ message: 'Email, password, and username are required' });
    }

    try {
        const user = await User.findOne({ email });
        if (user) {
            return res.status(409).json({ message: 'User already exists' });
        }

        const hashedPassword = hash(password);
        const newUser = new User({
            email,
            password: hashedPassword,
            username
        });

        await newUser.save();
        
        const token = hash(newUser._id.toString());

        const userData = {
            id: newUser._id,
            username: newUser.username,
            email: newUser.email,
            token: token
        };

        return res.status(200).json({
            message: 'Sign-up successful',
            user: userData
        });
        
    } catch (error) {
        console.error('Error during sign-up:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}