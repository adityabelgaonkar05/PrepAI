const { validateAnswer } = require('../controllers/ValidateAnswer');
const router = require('express').Router();

router.post('/validate-answer', validateAnswer);

module.exports = router;
