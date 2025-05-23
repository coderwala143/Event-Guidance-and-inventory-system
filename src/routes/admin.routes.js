const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middlewares/authMiddleware');
const adminControllers = require("../controllers/admin.controlllers")

router.put('/set-role', protect, adminOnly, adminControllers.setRole);
router.put('/update-to-admin', adminControllers.makeAdmin);
router.get("/all/users", protect, adminOnly, adminControllers.AllUsers);
router.get('/approve-or-reject/:id', protect, adminOnly, adminControllers.approveOrRejectEvent)


module.exports = router