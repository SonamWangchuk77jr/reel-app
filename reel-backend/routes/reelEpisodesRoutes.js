const express = require('express');
const router = express.Router();
const { videoUpload } = require('../utils/upload');
const episodesController = require('../controllers/reelEpisodesController');
const { authenticate } = require('../middlewares/authMiddleware');

// Get all episodes list
router.get('/', episodesController.getAllEpisodes);

// Episode management routes
router.post('/:reelId/episodes', videoUpload.single('video'), authenticate, episodesController.createEpisode);
router.get('/:reelId/episodes', episodesController.getReelEpisodes);

// Saved episodes route (must come before /:episodeId routes)
router.get('/saved', authenticate, episodesController.getUserSavedEpisodes);

// Episode CRUD routes
router.patch('/:episodeId/status', authenticate, episodesController.updateEpisodeStatus);
router.get('/:episodeId', episodesController.getEpisode);
router.put('/:episodeId', authenticate, episodesController.updateEpisode);
router.delete('/:episodeId', authenticate, episodesController.deleteEpisode);

// Like and save routes
router.post('/:episodeId/like', authenticate, episodesController.toggleLike);
router.post('/:episodeId/save', authenticate, episodesController.toggleSave);

module.exports = router;
