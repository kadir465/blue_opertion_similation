import express from 'express';
import Experience from '../models/Experience.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const newExperience = new Experience(req.body);
    const savedExperience = await newExperience.save();
    res.status(201).json(savedExperience);
  } catch (error) {
    res.status(400).json({ message: 'Deneyim eklenirken hata', error: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const experiences = await Experience.find();
    res.status(200).json(experiences);
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
});

export default router;
