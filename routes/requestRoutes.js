import express from 'express';
import Request from '../models/Request.js';

const router = express.Router();

// Yeni talep ekle
router.post('/', async (req, res) => {
  try {
    const newRequest = new Request(req.body);
    const savedRequest = await newRequest.save();
    res.status(201).json(savedRequest);
  } catch (error) {
    res.status(400).json({ message: 'Talep eklenirken hata oluştu', error: error.message });
  }
});

// Tüm talepleri getir
router.get('/', async (req, res) => {
  try {
    const requests = await Request.find();
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
});

export default router;
