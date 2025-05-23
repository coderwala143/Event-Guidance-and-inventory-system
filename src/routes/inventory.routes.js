const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventory.controllers');
const authMiddleware = require("../middlewares/authMiddleware") 

router.post('/create-inventory', authMiddleware.protect, authMiddleware.adminOnly, inventoryController.createInventory);

router.get('/get-all-inventory', authMiddleware.protect, authMiddleware.adminOrOrganizerOnly, inventoryController.getAllInventory);

module.exports = router;