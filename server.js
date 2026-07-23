import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

// Route dosyalarımızı içeri aktarıyoruz
import requestRoutes from './routes/requestRoutes.js';
import performanceRoutes from './routes/performanceRoutes.js';
import experienceRoutes from './routes/experienceRoutes.js';
import toolRoutes from './routes/toolRoutes.js';
import smartFilterRoutes from './routes/smartFilterRoutes.js';
import ragRoutes from './routes/ragRoutes.js';
import workflowRoutes from './routes/workflowRoutes.js';

// Gizli değişkenleri (.env) yükle
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware (Ara Katmanlar)
app.use(cors());
app.use(express.json()); 

// API Yollarını Sisteme Tanıtma
app.use('/api/requests', requestRoutes);
app.use('/api/performances', performanceRoutes);
app.use('/api/experiences', experienceRoutes);
app.use('/api/tools', toolRoutes);
app.use('/api/rag', smartFilterRoutes);
app.use('/api/rag', ragRoutes);
app.use('/api/workflows', workflowRoutes);

// Veritabanı Bağlantısı
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB bağlantısı başarıyla kuruldu.'))
  .catch((err) => console.error('Veritabanı bağlantı hatası:', err));

// Test Uç Noktası
app.get('/', (req, res) => {
  res.send('BlueBot Copilot Backend Sunucusu Tüm Modülleriyle Çalışıyor.');
});

// Sunucuyu Başlatma
app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda yayında.`);
});
