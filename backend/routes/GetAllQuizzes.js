const GetAllQuizzes = require('../controllers/GetAllQuizzes');
const router = require('express').Router();

router.post('/get-all-quizzes', GetAllQuizzes);

module.exports = router;