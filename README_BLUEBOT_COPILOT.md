# BlueBot Copilot & RAG İş Akışı Motoru Dokümantasyonu

Bu belge, **Blue Operation AI Model** projesi içerisindeki **BlueBot Copilot ve RAG Tabanlı İş Akışı Editörü (Workflow Copilot Engine)** alt sisteminin mimarisini, veri kaynaklarını, algoritmalarını ve dosya sorumluluklarını detaylıca açıklar.

---

## 1. Genel Bakış ve Amaç

BlueBot Copilot; kullanıcıların doğal dilde ilettikleri otomasyon ve kural taleplerini (örn: *"Bölge 1'deki insan sayısı 50'den büyükse ve gün hafta içi ise BlueBot kuralı tetikle"*) analiz ederek, görsel canvas üzerinde adım adım otomatik iş akışı (DAG - Directed Acyclic Graph) oluşturan ve yöneten akıllı bir AI asistanıdır.

### Öne Çıkan Yetenekleri
- **Doğal Dilden İş Akışı Üretimi:** Karmaşık koşul, mantık kapısı (AND/OR) ve eylem düğümlerini sırasıyla planlar.
- **RAG Tabanlı Araç Arama:** Sistemde tanımlı yüzlerce düğüm (sensor, operatör, eylem) arasından en uygun olanları anında bulur.
- **Canlı Canvas Senkronizasyonu:** Kullanıcının canvas üzerindeki hareketlerini gerçek zamanlı izler ve planı `[TAMAMLANDI]`, `[AKTİF]`, `[BEKLİYOR]` olarak günceller.
- **Güvenlik Çiti (Guardrails):** Yanılsamaları (hallucination) önlemek için yalnızca kütüphanede kayıtlı geçerli araçların ve doğru veri tipi bağlantılarının kurulmasını zorunlu kılar.

---

## 2. Mimari ve Dosya Yapısı

```
[ Kullanıcı Doğal Dil İfadesi / Canvas Hareketleri ]
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ React Frontend (WorkflowEditor.jsx & WorkflowCanvas.jsx)    │
└──────────────────────────┬──────────────────────────────────┘
                           │
             HTTP POST /api/rag/copilot
             HTTP POST /api/rag/search-tools
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ Express Backend Engine (routes/ragRoutes.js)                 │
├─────────────────────────────────────────────────────────────┤
│ 1. Veri Kaynağı: blue_bot_tools.json (Araç Veritabanı)       │
│ 2. Dil/Kök Çıkarıcı: routes/keyword_index.js               │
│ 3. Graf & Yol Bulucu: routes/graphBuilder.js (findPath)     │
│ 4. Plan Senkronizörü: syncPlanWithCanvas()                  │
│ 5. Çıktı Doğrulayıcı: validateLLMOutput() (Guardrail)       │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
[ Adım Adım İş Akışı Planı + Otomatik Düğüm ve Bağlantı Önerileri ]
```

### İlgili Dosyalar ve Sorumlulukları

1. **[blue_bot_tools.json](file:///c:/Users/kadir/OneDrive/Masa%C3%BCst%C3%BC/blue_bot_copilot_fixed%20%281%29/blue_bot_tools.json)**
   - Sistemde yer alan tüm düğüm (tool) tanımlarını barındıran JSON veritabanıdır.
   - Her düğüm; `id`, `name`, `category`, `description`, `inputs` (giriş veri tipleri), `outputs` (çıkış veri tipleri), `params` (ayarlanabilir parametreler) bilgilerini içerir.

2. **[routes/ragRoutes.js](file:///c:/Users/kadir/OneDrive/Masa%C3%BCst%C3%BC/blue_bot_copilot_fixed%20%281%29/routes/ragRoutes.js)**
   - Copilot ve RAG sisteminin ana backend motorudur.
   - `/api/rag/search-tools`: RAG arama algoritmasını çalıştırır.
   - `/api/rag/copilot`: Kullanıcı niyetini analiz eder, çok adımlı plan oluşturur ve canvas durumu ile planı senkronize eder.

3. **[routes/graphBuilder.js](file:///c:/Users/kadir/OneDrive/Masa%C3%BCst%C3%BC/blue_bot_copilot_fixed%20%281%29/routes/graphBuilder.js)**
   - Düğümler arası tip uyumluluğunu (`areTypesCompatible`) denetler.
   - İki düğüm arasında yönlü graf arama algoritması (`findPath`) çalıştırarak otomatik bağlantı hatlarını hesaplar.

4. **[routes/keyword_index.js](file:///c:/Users/kadir/OneDrive/Masa%C3%BCst%C3%BC/blue_bot_copilot_fixed%20%281%29/routes/keyword_index.js)**
   - RAG indekslemesi için metinlerden kelime köklerini (`extractStems`) çıkarır.

5. **[ui_frontend/src/components/WorkflowEditor.jsx](file:///c:/Users/kadir/OneDrive/Masa%C3%BCst%C3%BC/blue_bot_copilot_fixed%20%281%29/ui_frontend/src/components/WorkflowEditor.jsx)**
   - Copilot sohbet arayüzünü, adım adım kontrol listesini ve hızlı ekleme butonunu sunan ana React bileşenidir.

6. **[ui_frontend/src/components/WorkflowCanvas.jsx](file:///c:/Users/kadir/OneDrive/Masa%C3%BCst%C3%BC/blue_bot_copilot_fixed%20%281%29/ui_frontend/src/components/WorkflowCanvas.jsx)**
   - Sürükle-bırak düğüm kartlarını, canlı parametre formlarını ve SVG bağlantı çizgilerini çizen etkileşimli çalışma alanıdır.

---

## 3. Temel Algoritmalar ve Çalışma Mantığı

### 3.1 RAG Araç Arama Algoritması (`search-tools`)
Kullanıcı bir anahtar kelime veya açıklama yazdığında:
1. Girdi cümlesi `extractStems` ile Türkçe köklerine ayrıştırılır.
2. `blue_bot_tools.json` içerisindeki tüm araçların adı, açıklaması, parametreleri ve veri tipleri in-memory indeks ile taranır.
3. **Jaccard Benzerliği & Terim Frekansı:** Eşleşen terim sayısına göre puanlama yapılır ve en yüksek puanlı araçlar frontend'e döndürülür.

### 3.2 Graf Yolu Oluşturma Algoritması (`graphBuilder.js`)
Düğümlerin birbirine bağlanabilmesi için:
1. **Tip Uyumluluk Kontrolü (`areTypesCompatible`):**
   - `number` -> `number` (Uyumlu)
   - `trigger` -> `trigger` (Uyumlu)
   - `any` tipi her türle eşleşir.
2. **Genişlik Öncelikli Arama (BFS - Breadth First Search):**
   - Başlangıç düğümünün çıkışı ile hedef düğümün girişi arasında doğrudan bağlantı kurulamıyorsa, aradaki dönüştürücü düğümleri `findPath` algoritması otomatik olarak tespit eder.

### 3.3 Adım Adım Plan ve Canvas Senkronizasyon Algoritması (`syncPlanWithCanvas`)
Copilot bir plan oluşturduğunda, canvas üzerindeki düğüm (`nodes`) ve bağlantıları (`connections`) anlık olarak izler:
- Eğer plandaki araç canvas'ta mevcutsa ve parametreleri girilmişse adımı **`[TAMAMLANDI]`** yapar.
- Bir sonraki bekleyen ilk adımı **`[AKTİF]`** durumuna getirir.
- **Sonsuz Döngü Koruması (Deduplication Guard):** Eğer kullanıcı arayüzü aynı takılı adımı üst üste 3 kereden fazla arka plana gönderirse, sistem adımı otomatik tamamlayarak kullanıcının kilitlenmesini önler.

### 3.4 Güvenlik Çiti (Guardrail Validation - `validateLLMOutput`)
LLM veya AI motorunun uydurma düğüm üretmesini engellemek için:
- Üretilen her `tool_name` ve bağlantı `blue_bot_tools.json` veritabanındaki isimlerle birebir karşılaştırılır.
- Kütüphanede karşılığı bulunmayan düğüm veya hatalı bağlantılar plana dahil edilmeden süzülür.

---

## 4. API Endpoint Kontratları

### 4.1 Copilot Plan ve Sohbet Endpoint'i
```http
POST /api/rag/copilot
Content-Type: application/json

{
  "query": "Bölge 1'deki insan sayısı 50'den büyükse BlueBot çalıştır",
  "nodes": [],
  "connections": [],
  "session_id": "session_123"
}
```

#### Yanıt (Response)
```json
{
  "intent": "workflow_creation",
  "message": "### İş Akışı İlerleme Planı (0/6 Adım Tamamlandı)\n\n1. **[AKTİF]** Şimdi 'RTLS Bölge İnsan Sayısı' aracını Canvas'a ekleyin.\n...",
  "is_workflow_complete": false,
  "is_full_checklist": true,
  "suggested_tool": {
    "id": "rtls_zone_people_count",
    "name": "RTLS Bölge İnsan Sayısı",
    "category": "Koşul"
  }
}
```

### 4.2 Oturum Sıfırlama Endpoint'i
```http
POST /api/rag/reset
Content-Type: application/json

{
  "session_id": "session_123"
}
```

---

## 5. Güvenilirlik ve Performans
- `blue_bot_tools.json` dosyası sunucu başlarken belleğe bir kez yüklenir, her istekte disk okuması yapılmaz.
- Canvas güncellemeleri client tarafındaki React state'i üzerinden anlık tetiklenir ve Copilot paneline yansır.
