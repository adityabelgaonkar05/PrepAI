const AuthCheck = require("../controllers/AuthCheck");
const router = require("express").Router();

router.post("/authcheck", AuthCheck);

module.exports = router;