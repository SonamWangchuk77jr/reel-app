const express = require('express');
const router = express.Router();

const { authenticate, authorize } = require('../middlewares/authMiddleware');
const karmaPointsController = require('../controllers/karmaPointsController.js');

router.post('/add', authenticate, karmaPointsController.addKarmaPoints);
router.get('/get', authenticate, karmaPointsController.getKarmaPoints);
router.patch('/deduct', authenticate, karmaPointsController.deductKarmaPoints);
router.post('/claim-daily', authenticate, karmaPointsController.getDailyKarmaPoints);
router.delete('/delete',authenticate,karmaPointsController.deleteRewardPoint);

module.exports = router;

// Swagger Documentation
/**
 * @swagger
 * tags:
 *   name: Karma Points
 *   description: Karma Points management
 */
/**
 * @swagger
 * /karma-points/add:
 *   post:
 *     summary: Add karma points to a user
 *     tags: [Karma Points]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               points:
 *                 type: number
 *                 description: The number of karma points to add
 *     responses:
 *       201:
 *         description: Karma points added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *       500:
 *         description: Failed to add karma points
 */
/**
 * @swagger
 * /karma-points/get:
 *   get:
 *     summary: Get karma points for the authenticated user
 *     tags: [Karma Points]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Karma points retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 points:
 *                   type: number
 *                   description: The number of karma points the user has
 *       404:
 *         description: Karma points not found
 *       500:
 *         description: Failed to get karma points
 */
/**
 * @swagger
 * /karma-points/deduct:
 *   patch:
 *     summary: Deduct karma points from a user
 *     tags: [Karma Points]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               points:
 *                 type: number
 *                 description: The number of karma points to deduct
 *     responses:
 *       200:
 *         description: Karma points deducted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *       500:
 *         description: Failed to deduct karma points
 */
/**
 * @swagger
 * /karma-points/claim-daily:
 *   post:
 *     summary: Claim daily karma points for the authenticated user
 *     tags: [Karma Points]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Daily karma points claimed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 points:
 *                   type: number
 *                   description: The number of karma points the user has
 *       404:
 *         description: Karma points not found
 *       500:
 *         description: Failed to claim daily karma points
 */
/**
 * @swagger
 * /karma-points/delete:
 *   delete:
 *     summary: Delete the authenticated user's karma points record
 *     tags: [Karma Points]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Karma points deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *       404:
 *         description: Karma points not found for user
 *       500:
 *         description: Failed to delete karma points
 */
