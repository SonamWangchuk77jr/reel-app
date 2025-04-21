const express = require('express');
const router = express.Router();
const episodesController = require('../controllers/reelEpisodesController');

router.post('/', episodesController.createEpisode);
router.get('/', episodesController.getAllEpisodes);
router.get('/:id', episodesController.getEpisodeById);
router.put('/:id', episodesController.updateEpisode);
router.delete('/:id', episodesController.deleteEpisode);

module.exports = router;
