const SignIn = require('../controllers/SignIn');
const router = require('express').Router();

router.post('/signin', SignIn);

module.exports = router;