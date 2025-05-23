const express = require('express');
const router = express.Router();
const userControllers = require('../controllers/users.controllers');
const authValidator = require("../validators/authValidator");
const authMiddleware = require("../middlewares/authMiddleware");

router.post('/register', authValidator.registerValidator, userControllers.register);

router.post('/login', authValidator.loginValidator, userControllers.login);

router.get('/logout', authMiddleware.protect, userControllers.logout)

module.exports = router;