# Akıllı Filtreleme (Smart Filtering) Dokümantasyonu

Bu belge, **Blue Operation AI Model** projesi içerisindeki **Akıllı Filtreleme (Smart Filtering & Intent Analysis)** modülünün mimarisini, kullanılan algoritmaları, veri akışını ve dosya sorumluluklarını detaylıca açıklar.

---

## 1. Genel Bakış ve Amaç

Akıllı Filtreleme; kullanıcıların doğal dilde (Türkçe) yazdıkları arama ifadelerini (örn: *"A bloktaki tamamlanan mekanik arızaları getir"*, *"skoru 80 üzeri olan talepler"*, *"son 7 günlük biletler"*) anında analiz ederek, bunları sistem parametrelerine ve süzgeçlere dönüştüren kural tabanlı bir NLP (Doğal Dil İşleme) alt sistemidir.

Bu modül sayesinde kullanıcılar karmaşık arama formlarını doldurmak yerine tek bir arama çubuğundan doğrudan hedef verilerine ulaşırlar.

---

## 2. Mimari ve Dosya Rolleri

```
[ Arama Çubuğu (React Arayüzü) ]
   ├── RequestsView.jsx (Talepler Ekranı)
   └── PerformanceView.jsx (Performans Ekranı)
            │
            │ HTTP POST /api/rag/analyze-intent
            ▼
[ Express Backend (routes/smartFilterRoutes.js) ]
            │
            ├── Kök Çıkarımı (Stemming) & Stop-Word Süzgeci
            │      └── routes/keyword_index.js (extractStems)
            │
            └── Regex & Desen Eşleştirme Kuralları
                   ├── Niyet (Intent) Sınıflandırıcı
                   ├── Bina (Building) Filtresi
                   ├── Durum (Status) Filtresi
                   ├── Kategori (Category) Filtresi
                   ├── Tarih Aralığı (Date Range) Filtresi
                   └── Kod / Skor Çıkarıcı (WorkOrder / MinScore)
            │
            ▼
[ Filtrelenmiş JSON Yanıtı (Intent + Mapped Parameters + Latency) ]
```

### İlgili Dosyalar ve Sorumlulukları

1. **[routes/smartFilterRoutes.js](./routes/smartFilterRoutes.js)**
   - API Endpoint: `POST /api/rag/analyze-intent`
   - Girdi cümlesini analiz eder, regex ve dilbilgisi kurallarını uygular, performans süresini ölçer (`performance.now()`) ve süzgeç parametrelerini döndürür.

2. **[routes/keyword_index.js](./routes/keyword_index.js)**
   - Türkçe ek temizleme algoritması (`extractStems`) içerir.
   - İsim ve fiil eklerini (örn: `-leri`, `-daki`, `-miş`, `-lar`) temizleyerek kelimelerin yalın köklerini çıkarır.

3. **[ui_frontend/src/components/RequestsView.jsx](./ui_frontend/src/components/RequestsView.jsx)**
   - Talepler ekranındaki arama girdisini `POST /api/rag/analyze-intent` uç noktasına gönderir.
   - Gelen `mapped_parameters` yanıtına göre arayüzdeki bina, durum, kategori ve kelime süzgeçlerini otomatik olarak aktifleştirir.

4. **[ui_frontend/src/components/PerformanceView.jsx](./ui_frontend/src/components/PerformanceView.jsx)**
   - Performans analizi ekranında kullanıcı cümlesinden skor eşikleri (`minScore`) ve tarih aralıkları (`date_range`) çıkararak verileri anlık filtreler.

---

## 3. Kullanılan Algoritmalar ve Analiz Mantığı

### 3.1 Niyet (Intent) Sınıflandırma
Kullanıcı metni küçük harflere dönüştürüldükten sonra düzenli ifadeler (Regex) ile kategorize edilir:
- **Performans Analizi:** `/(performans|skor|metrik|süre|analiz|rapor|verimlilik|başarı)/i`
- **Talep Sorgulama:** `/(talep|iş emri|bilet|ticket|kayıt|arıza kaydı)/i`
- **Arama / Filtreleme:** Varsayılan niyet.

### 3.2 Varlık (Entity) ve Parametre Çıkarımı

| Parametre | Çıkarım Mantığı / Regex Deseni | Örnek Eşleşme |
|---|---|---|
| **building** | `/(bina\s*a\|a\s*blok\|a\s*bina\|a\s*bloğ\|\ba\b\s*(?:blok\|bina))/i` | "A Blok", "bina a", "A bloğu" -> `A Blok` |
| **status** | `/(tamamlan\|tamamlandı\|bitti\|çözüldü\|kapatıl)/i` | "tamamlanan" -> `completed`, "aktif/açık" -> `active` |
| **category** | `/\bmekanik\b/i`, `/\belektrik\b/i`, `/\byazılım\b/i` | "mekanik arıza" -> `Mekanik` |
| **date_range**| `/bugün/`, `/dün/`, `/son\s*7\s*gün/`, `/son\s*30\s*gün/` | "son 7 gün" -> `last_7_days` |
| **workOrderNo**| `/\b([e\|m\|y\|z])\s*-?\s*(\d{1,4})\b/i` | "e-2", "m 001" -> `E-002`, `M-001` |
| **minScore** | `/skor[u\s]*([0-9]{2,3})/i` | "skoru 85 üzeri" -> `85` |

### 3.3 Türkçe Kök Çıkarımı (Stemming) ve Stop-Word Temizliği
Sistem, arama sorgusunu `extractStems` fonksiyonu ile analiz eder:
1. Metin harf dışı karakterlerden arındırılır.
2. Çekim ve yapım ekleri temizlenir: `-leri, -ları, -deki, -daki, -in, -un, -den, -dan, -si, -su`.
3. **Stop-Word Süzgeci (`filterStopWords`):** 80'den fazla genel dolgu sözcüğü (`bina`, `blok`, `arıza`, `rapor`, `analiz`, `getir`, `listele`, `ve`, `ile`, `için`, `olan`) elenir.
4. Geriye kalan sadece konuyla doğrudan ilgili olan kelimeler (`keywords`) arama filtresine verilir.

---

## 4. API İstek ve Yanıt Formatı

### İstek (Request)
```http
POST /api/rag/analyze-intent
Content-Type: application/json

{
  "text": "A bloktaki skoru 80 üzeri olan tamamlanmış elektrik arızaları"
}
```

### Yanıt (Response)
```json
{
  "intent": "Performans Analizi",
  "latency_ms": 2,
  "mapped_parameters": {
    "building": "A Blok",
    "status": "completed",
    "category": "Elektrik",
    "action": "all",
    "date_range": "all",
    "workOrderNo": "all",
    "zone": "all",
    "minScore": 80,
    "keywords": [
      "elektrik"
    ]
  }
}
```

---

## 5. Performans ve Güvenilirlik
- Kural tabanlı ve in-memory çalıştığı için yanıt süresi **1 - 5 milisaniye** arasındadır.
- Servis çökmesini önlemek için tüm analiz `try/catch` bloğu içerisindedir ve beklenmeyen bir hatada varsayılan nötr değerler döndürür.
