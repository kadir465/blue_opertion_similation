import express from 'express';
import Tool from '../models/Tool.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const newTool = new Tool(req.body);
    const savedTool = await newTool.save();
    res.status(201).json(savedTool);
  } catch (error) {
    res.status(400).json({ message: 'Araç eklenirken hata', error: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const tools = await Tool.find();
    res.status(200).json(tools);
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
});

export default router;
