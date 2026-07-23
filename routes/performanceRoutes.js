import express from 'express';
import Performance from '../models/Performance.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const newPerformance = new Performance(req.body);
    const savedPerformance = await newPerformance.save();
    res.status(201).json(savedPerformance);
  } catch (error) {
    res.status(400).json({ message: 'Performans eklenirken hata', error: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const performances = await Performance.find();
    res.status(200).json(performances);
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
});

export default router;
