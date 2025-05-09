const express = require('express');
const router = express.Router();
const { monthlyReport, totalUsersVideosAdsCategories } = require('../controllers/reportController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

router.get('/monthly-report', authenticate, authorize('Admin'), monthlyReport);
router.get('/total-users-videos-ads-categories', authenticate,authorize('Admin'), totalUsersVideosAdsCategories);

module.exports = router;

// Swagger
/**
 * @swagger
 * tags:
 *   name: Report
 *   description: Report management
 */

/**
 * @swagger
 * /monthly-report:
 *   get:
 *     summary: Get monthly report
 *     tags: [Report]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Monthly report
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 month:
 *                   type: string
 *                 totalNumberOfUser:
 *                   type: number
 *                 totalNumberOfVideos:
 *                   type: number
 *                 totalNumberOfAds:
 *                   type: number
 */

/**
 * @swagger
 * /total-users-videos-ads-categories:
 *   get:
 *     summary: Get total users, videos, ads, and categories
 *     tags: [Report]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Total users, videos, ads, and categories
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalUsers:
 *                   type: number
 *                 totalVideos:
 *                   type: number
 *                 totalAds:
 *                   type: number
 *                 totalCategories:
 *                   type: number
 */
