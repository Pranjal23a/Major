const express = require('express');
const router = express.Router();
const passport = require('passport');

const inventoryController = require('../controllers/inventory_controller');

router.post('/add', passport.checkAuthentication, inventoryController.addInventory);
router.post('/drop', inventoryController.removeinventory);

module.exports = router;