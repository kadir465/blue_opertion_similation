import express from 'express';
import { extractStems } from './keyword_index.js';

const router = express.Router();

// ─── Akıllı Filtreleme ve Niyet Analizi Endpoint ─────────────────────────────
// Requests (Talepler) & Performance (Raporlama ve Analiz) ekranları tarafından kullanılır.
// Kullanıcı girdisini analiz ederek niyet (intent) ve haritalanmış parametreleri döndürür.
router.post('/analyze-intent', (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ message: 'text parametresi gereklidir.' });
    }

    const lowerText = text.toLowerCase();
    const startTime = performance.now();

    // ── 1. Niyet (Intent) Analizi ──────────────────────────────────────────
    let intent = 'Arama / Filtreleme';
    if (/(performans|skor|metrik|süre|analiz|rapor|verimlilik|başarı)/i.test(lowerText)) {
      intent = 'Performans Analizi';
    } else if (/(talep|iş emri|bilet|ticket|kayıt|arıza kaydı)/i.test(lowerText)) {
      intent = 'Talep Sorgulama';
    }

    // ── 2. Bina (Building) Analizi ─────────────────────────────────────────
    let building = 'all';
    if (/(bina\s*a|a\s*blok|a\s*bina|a\s*bloğ|a\.\s*blok|\ba\b\s*(?:blok|bina|bloğ))/i.test(lowerText)) building = 'A Blok';
    else if (/(bina\s*b|b\s*blok|b\s*bina|b\s*bloğ|b\.\s*blok|\bb\b\s*(?:blok|bina|bloğ))/i.test(lowerText)) building = 'B Blok';
    else if (/(bina\s*c|c\s*blok|c\s*bina|c\s*bloğ|c\.\s*blok|\bc\b\s*(?:blok|bina|bloğ))/i.test(lowerText)) building = 'C Blok';

    // ── 3. Durum (Status) Analizi ──────────────────────────────────────────
    let status = 'all';
    if (/(tamamlan|tamamlandı|bitti|çözüldü|kapatıl)/i.test(lowerText)) status = 'completed';
    else if (/(gönderildi|sevk\s*edildi)/i.test(lowerText)) status = 'dispatched';
    else if (/\baktif\b|\baçık\b|\bbekleyen\b/i.test(lowerText)) status = 'active';

    // ── 4. Kategori (Category) Analizi ─────────────────────────────────────
    let category = 'all';
    if (/\bmekanik\b/i.test(lowerText)) category = 'Mekanik';
    else if (/\belektrik\b/i.test(lowerText)) category = 'Elektrik';
    else if (/\byazılım\b|\byazilim\b/i.test(lowerText)) category = 'Yazılım';

    // ── 5. Tarih Aralığı (Date Range) Analizi ──────────────────────────────
    let date_range = 'all';
    if (/bugün|bugünkü/i.test(lowerText)) date_range = 'today';
    else if (/dün|dünkü/i.test(lowerText)) date_range = 'yesterday';
    else if (/son\s*7\s*gün/i.test(lowerText)) date_range = 'last_7_days';
    else if (/son\s*30\s*gün/i.test(lowerText)) date_range = 'last_30_days';
    else if (/geçen\s*ay/i.test(lowerText)) date_range = 'last_month';

    // ── 6. İş Emri / Bölge Code Analizi (örn: E-002, M-001, Y-003, Z-001, E002, M1) ───
    const codeMatch = lowerText.match(/\b([e|m|y|z])\s*-?\s*(\d{1,4})\b/i);
    const workOrderNo = codeMatch ? `${codeMatch[1].toUpperCase()}-${codeMatch[2].padStart(3, '0')}` : 'all';
    const zone = workOrderNo;

    // ── 7. Minimum Skor Analizi (Performans ve Talepler için) ─────────────
    let minScore = null;
    const scoreMatch = lowerText.match(/skor[u\s]*([0-9]{2,3})/i);
    if (scoreMatch) {
      minScore = parseInt(scoreMatch[1], 10);
    }

    // ── 8. Anahtar Kelime (Keywords) Kök Çıkarımı ─────────────────────────
    // Sert filtreye eşleşen kelimeleri ve dolgu sözcüklerini süzerek sadece gerçek konu kelimelerini bırakır
    const filterStopWords = new Set([
      // Bina sözcükleri
      'a', 'b', 'c', 'bina', 'binası', 'binadaki', 'binada', 'blok', 'bloğu', 'bloktaki', 'blokta',
      // Durum sözcükleri
      'tamamlanan', 'tamamlandı', 'tamamlanmış', 'bitti', 'çözüldü', 'kapatıldı', 'kapatılan',
      'aktif', 'açık', 'bekleyen', 'gönderildi', 'sevk', 'edildi', 'arıza', 'arızas', 'arızası', 'arızaları', 'arızalı', 'sorun', 'sorunu', 'sorunları', 'bakım', 'bakımı', 'bakımları',
      // Kategori sözcükleri
      'mekanik', 'elektrik', 'yazılım', 'yazilim', 'kategorisi', 'kategorisindeki', 'kategorisindekiler',
      // Rapor / Bilgi / Meta sorgu sözcükleri (Aramayı kilitlenmekten korur)
      'rapor', 'raporlama', 'raporlam', 'raporlar', 'raporları', 'raporlarını', 'bilgi', 'bilgisi', 'bilgileri', 'bilgilerini', 'bilgiler',
      'veri', 'verisi', 'verileri', 'verilerini', 'veriler', 'detay', 'detayı', 'detayları', 'detaylarını',
      'analiz', 'analizi', 'analizleri', 'sonuç', 'sonucu', 'sonuçları', 'metrik', 'metrikleri', 'özet', 'özeti', 'liste', 'listesi', 'tablo',
      // Eylem, bölge ve dolgu sözcükleri
      'bölge', 'bölgesi', 'bölgesinde', 'bölgesindeki', 'iş', 'emri', 'emrini', 'emrindeki',
      'durum', 'durumu', 'durumları', 'durumlarını', 'durumunu', 'durumunda',
      'getir', 'göster', 'listele', 'bul', 'ver', 'ara', 'sorgula', 'olan', 'olanlar', 'olanları',
      'tüm', 'bütün', 'hepsi', 'kayıt', 'kayıtları', 've', 'veya', 'ile', 'için', 'ait', 'hakkında', 'bir', 'bu', 'şu'
    ]);

    const rawStems = Array.from(extractStems(text));
    const keywords = rawStems.filter(s => {
      const low = s.toLowerCase();
      if (filterStopWords.has(low)) return false;
      if (/^(bina|blok|bloğ)/i.test(low)) return false;
      return s.length >= 3;
    });

    const latencyMs = Math.round(performance.now() - startTime);

    return res.status(200).json({
      intent,
      latency_ms: Math.max(1, latencyMs),
      mapped_parameters: {
        building,
        status,
        category,
        action: 'all',
        date_range,
        workOrderNo,
        zone,
        minScore,
        keywords: keywords.length > 0 ? keywords : (rawStems.length > 0 ? rawStems : [lowerText])
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'İç niyet analizi hatası.', error: error.message });
  }
});

export default router;
