const Reels = require('../models/Reels');
const cloudinary = require('../config/config').cloudinary;
const fs = require('fs');


exports.createReel = async (req, res) => {
    try {
      const { name, description, userId } = req.body;
      const videoFile = req.files?.video?.[0];
      const coverPhotoFile = req.files?.coverPhoto?.[0];
  
      if (!videoFile || !coverPhotoFile) {
        return res.status(400).json({ error: 'Both video and cover photo are required' });
      }
  
      // Upload video to Cloudinary
      const videoUpload = await cloudinary.uploader.upload(videoFile.path, {
        resource_type: 'video',
        folder: 'reels/videos',
      });
  
      // Upload cover photo to Cloudinary
      const imageUpload = await cloudinary.uploader.upload(coverPhotoFile.path, {
        resource_type: 'image',
        folder: 'reels/images',
      });
  
      // Delete local temp files
      fs.unlinkSync(videoFile.path);
      fs.unlinkSync(coverPhotoFile.path);
  
      // Save to DB
      const newReel = new Reels({
        name,
        description,
        trailerVideo: videoUpload.secure_url,
        coverPhoto: imageUpload.secure_url,
        userId,
      });
  
      const savedReel = await newReel.save();
      res.status(201).json(savedReel);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  };
  

exports.getAllReels = async (req, res) => {
  try {
    const reels = await Reels.find().populate('userId');
    res.json(reels);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getReelById = async (req, res) => {
  try {
    const reel = await Reels.findById(req.params.id);
    if (!reel) return res.status(404).json({ error: 'Reel not found' });
    res.json(reel);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateReel = async (req, res) => {
  try {
    const updatedReel = await Reels.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedReel);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteReel = async (req, res) => {
  try {
    await Reels.findByIdAndDelete(req.params.id);
    res.json({ message: 'Reel deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
