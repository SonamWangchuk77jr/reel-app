const ReelEpisodes = require('../models/ReelEpisodes');

exports.createEpisode = async (req, res) => {
  try {
    const episode = new ReelEpisodes(req.body);
    const savedEpisode = await episode.save();
    res.status(201).json(savedEpisode);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getAllEpisodes = async (req, res) => {
  try {
    const episodes = await ReelEpisodes.find().populate('reelId');
    res.json(episodes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getEpisodeById = async (req, res) => {
  try {
    const episode = await ReelEpisodes.findById(req.params.id).populate('reelId');
    if (!episode) return res.status(404).json({ error: 'Episode not found' });
    res.json(episode);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateEpisode = async (req, res) => {
  try {
    const updated = await ReelEpisodes.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteEpisode = async (req, res) => {
  try {
    await ReelEpisodes.findByIdAndDelete(req.params.id);
    res.json({ message: 'Episode deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
