const SignUp = require('../controllers/SignUp');
const router = require('express').Router();

router.post('/signup', SignUp);

module.exports = router;