const express = require("express");
const router = express.Router();

const userConroller = require('../controllers/user_controller');

router.get('/profile', userConroller.profile);
module.exports = router;