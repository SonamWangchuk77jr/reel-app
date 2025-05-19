const express = require('express');
const { videoUpload } = require('../utils/upload');
const router = express.Router();
const reelsController = require('../controllers/reelsController'); 
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const validateReel = require('../middlewares/reelValidationMiddleware');


router.post('/create',videoUpload.single('video'),authenticate,reelsController.createReel);
router.get('/', reelsController.getAllReels);
router.get('/user',authenticate, reelsController.getAllReelsByUserId);
router.get('/total', authenticate, reelsController.totalReels);
router.get('/approved', reelsController.getAllReelsWithStatusApproved);
router.get('/saved', authenticate, reelsController.getUserSavedReels);
router.get('/:id', validateReel, reelsController.getReelById);
router.put('/:id',validateReel,authenticate,authorize('User'),reelsController.updateReel);
router.patch('/:id/status',validateReel,authenticate,reelsController.updateReelStatus);
router.post('/:id/like',validateReel,authenticate,reelsController.toggleLike);
router.post('/:id/save',validateReel,authenticate,reelsController.toggleSave);
router.get('/:id/liked-check',validateReel,authenticate,reelsController.hasLiked);
router.get('/:id/saved-check',validateReel,authenticate,reelsController.hasSaved);
router.delete('/:id',validateReel,authenticate,reelsController.deleteReel);

module.exports = router;


// Swagger

/**
 * @swagger
 * tags:
 *   name: Reels
 *   description: Reels management
 */

/**
 * @swagger
 * /reels/create:
 *   post:
 *     summary: Create a new reel
 *     tags: [Reels]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *                 enum: [food, travel, fashion, lifestyle, beauty, fitness, technology, other]
 *               video:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Reel created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /reels:
 *   get:
 *     summary: Get all reels
 *     tags: [Reels]
 *     responses:
 *       200:
 *         description: List of reels
 *       500:
 *         description: Server error
 */
/**
 * @swagger
 * /reels/user:
 *   get:
 *     summary: Get all reels by user ID
 *     tags: [Reels]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of reels
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /reels/total:
 *   get:
 *     summary: Get total number of reels
 *     tags: [Reels]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Total number of reels
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /reels/approved:
 *   get:
 *     summary: Get all reels with status approved
 *     tags: [Reels]
 *     responses:
 *       200:
 *         description: List of reels
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /reels/saved:
 *   get:
 *     summary: Get all saved reels
 *     tags: [Reels]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of reels
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /reels/{id}:
 *   get:
 *     summary: Get reel by ID
 *     tags: [Reels]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Reel ID
 *     responses:
 *       200:
 *         description: Reel details
 *       400:
 *         description: Invalid reel ID
 *       404:
 *         description: Reel not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /reels/{id}:
 *   put:
 *     summary: Update a reel
 *     tags: [Reels]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Reel ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *                 enum: [food, travel, fashion, lifestyle, beauty, fitness, technology, other]
 *     responses:
 *       200:
 *         description: Reel updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Reel not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /reels/{id}/status:
 *   patch:
 *     summary: Update reel status
 *     tags: [Reels]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Reel ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [approved, pending, rejected]
 *     responses:
 *       200:
 *         description: Reel status updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Reel not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /reels/{id}/like:
 *   post:
 *     summary: Toggle like on a reel
 *     tags: [Reels]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Reel ID
 *     responses:
 *       200:
 *         description: Like toggled successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Reel not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /reels/{id}/save:
 *   post:
 *     summary: Toggle save on a reel
 *     tags: [Reels]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Reel ID
 *     responses:
 *       200:
 *         description: Save toggled successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Reel not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /reels/{id}/liked-check:
 *   get:
 *     summary: Check if user has liked a reel
 *     tags: [Reels]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Reel ID
 *     responses:
 *       200:
 *         description: Like check successful
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Reel not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /reels/{id}/saved-check:
 *   get:
 *     summary: Check if user has saved a reel
 *     tags: [Reels]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Reel ID
 *     responses:
 *       200:
 *         description: Save check successful
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Reel not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /reels/{id}:
 *   delete:
 *     summary: Delete a reel
 *     tags: [Reels]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Reel ID
 *     responses:
 *       200:
 *         description: Reel deleted successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Reel not found
 *       500:
 *         description: Server error
 */

