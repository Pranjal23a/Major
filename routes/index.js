const express = require("express");
const router = express.Router();
const homeController = require('../controllers/home_controller');

console.log("Router loaded");
router.get('/', homeController.home);
router.use('/admin', require('./admins'));
router.use('/staff', require('./staffs'));
router.use('/inventory', require('./inventorys'));


module.exports = router;