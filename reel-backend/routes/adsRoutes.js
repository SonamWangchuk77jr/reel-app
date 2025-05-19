const express = require('express');
const router = express.Router();
const adsController = require('../controllers/adsController');
const { videoUpload } = require('../utils/upload');


const { authenticate, authorize } = require('../middlewares/authMiddleware');


router.get('/', authenticate, adsController.getAds);
router.post('/', videoUpload.single('adsVideoUrl'),authenticate, authorize('Admin'), adsController.createAds);
router.delete('/:id', authenticate,authorize('Admin'), adsController.deleteAds);
router.get('/random/:point', authenticate, adsController.getRandomShuffledAdsByPoint);
router.get('/total', authenticate, authorize('Admin'), adsController.totalAds);


module.exports = router;


// swagger
/**
 * @swagger
 * tags:
 *   name: Ads
 *   description: Ads management
 */

/**
 * @swagger
 * /ads:
 *   get:
 *     summary: Get all ads
 *     tags: [Ads]
 *     responses:
 *       200:
 *         description: A list of ads
 */

/**
 * @swagger
 * /ads:
 *   post:
 *     summary: Create a new ad
 *     tags: [Ads]
 *     description: 
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the ad
 *               point:
 *                 type: number
 *                 description: Points associated with the ad
 *               adsVideoUrl:
 *                 type: string
 *                 format: binary
 *                 description: Video file for the ad (upload as file)
 *             required:
 *               - name
 *               - point
 *               - adsVideoUrl
 *     responses:
 *       201:
 *         description: Ad created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /ads/{id}:
 *   delete:
 *     summary: Delete an ad
 *     tags: [Ads]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the ad to delete
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Ad deleted successfully
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /ads/random/{point}:
 *   get:
 *     summary: Get a random ad by point
 *     tags: [Ads]
 *     parameters:
 *       - name: point
 *         in: path
 *         required: true
 *         description: The point of the ad
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A random ad by point
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: No ads found for this point
 */


/**
 * @swagger
 * /ads/total:
 *   get:
 *     summary: Get total number of ads
 *     tags: [Ads]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Total number of ads
 */
