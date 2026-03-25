const express = require('express');
const router = express.Router();
const controller = require('../controllers/reportController');
const { verifyToken } = require('../middleware/authJwt');

// Save a report
router.post('/save', [verifyToken], controller.saveReport);

// Get all reports for current user (with optional role filter)
router.get('/', [verifyToken], controller.getUserReports);

// Get statistics for reports
router.get('/stats', [verifyToken], controller.getReportStats);

// Cleanup old reports (keep only last 100)
router.post('/cleanup', [verifyToken], controller.cleanupReports);

module.exports = router;
