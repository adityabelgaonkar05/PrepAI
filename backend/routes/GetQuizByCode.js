const GetQuizByCode = require('../controllers/GetQuizByCode');
const router = require('express').Router();

router.post('/get-quiz-by-code', GetQuizByCode);

module.exports = router;