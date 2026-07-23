import express from 'express';
import Customer from '../models/Customer.js';

const router = express.Router();

// Yeni müşteri ekle
router.post('/', async (req, res) => {
  try {
    const newCustomer = new Customer(req.body);
    const savedCustomer = await newCustomer.save();
    res.status(201).json(savedCustomer);
  } catch (error) {
    res.status(400).json({ message: 'Müşteri eklenirken hata oluştu', error: error.message });
  }
});

// Tüm müşterileri getir
router.get('/', async (req, res) => {
  try {
    const customers = await Customer.find();
    res.status(200).json(customers);
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
});

export default router;
