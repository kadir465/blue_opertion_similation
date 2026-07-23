NP# Blue Operation AI Model / BlueBot Projesi

Bu repository, Blue Operation ekosistemine ait bir operasyonel yönetim, raporlama ve AI destekli iş akışı editörü prototipini kapsar. Proje üç ana katmandan oluşur:

- Bir Express + MongoDB tabanlı backend API
- React + Vite tabanlı bir frontend arayüzü
- FastAPI tabanlı bir NLP/intent service ile AI destekli iş akışı yorumlama mekanizması

Amaç, müşteri taleplerini, performans verilerini, deneyim raporlarını ve BlueBot benzeri iş akışı kurallarını tek bir platform üzerinden yönetmektir.

---

## 1. Proje Genel Bakışı

Bu proje, özellikle aşağıdaki alanlarda kullanılabilecek bir mimari sunar:

- Müşteri yönetimi ve kayıt işlemleri
- Müşteri talepleri / iş emirleri yönetimi
- Performans ve operasyonel raporların saklanması
- Müşteri deneyim verilerinin işlenmesi
- BlueBot benzeri akış grafiklerinin görsel olarak oluşturulması
- Doğal dil komutlarıyla düğüm ekleme gibi AI destekli işlemler

Bu yapı, bir “operasyonel kontrol merkezi” ve “AI copilot tabanlı workflow editörü” konseptinin erken aşama bir uygulamasıdır.

---

## 2. Temel Özellikler

### 2.1 Backend API

- Express.js kullanılarak hazırlanmış REST API
- MongoDB üzerinde veritabanı işlemleri
- Mongoose ile şema tabanlı veri modeli yönetimi
- CRUD tabanlı endpoint yapısı
- CORS desteği ile frontend’den erişime uygun yapı

### 2.2 Frontend Arayüzü

- React 19 tabanlı kullanıcı arayüzü
- Vite ile hızlı geliştirme ve build süreci
- Dashboard, raporlar, talepler, performans görünümü, BlueBot ekranı ve workflow editörü gibi ekranlar
- İş akışı editöründe sürükle-bırak tabanlı düğüm düzenleme
- AI Copilot paneli üzerinden doğal dil komutlarıyla düğüm ekleme

### 2.3 Intent Service

- FastAPI ile çalışan bir servis
- Türkçe metinlerden intent (amaç) ve entity (varlık) çıkarımı yapar
- TF-IDF + Logistic Regression tabanlı bir sınıflandırıcı kullanır
- Kullanıcı cümlesini analiz edip, building/status/category/action gibi parametreler çıkarır
- Sonuç, frontend tarafındaki workflow editörüne yönlendirilir

---

## 3. Proje Mimarisinin Genel Yapısı

Proje mantıksal olarak aşağıdaki katmanlara ayrılmıştır:

1. Sunucu katmanı (Express backend)
2. Veri katmanı (MongoDB + Mongoose)
3. UI katmanı (React/Vite SPA)
4. AI/Intent katmanı (FastAPI + scikit-learn)
5. Görsel workflow editörü katmanı (React state tabanlı canvas)

Bu mimari, mikroservisçi bir yaklaşım yerine “monolith + sidecar-style AI service” yaklaşımını benimser. Yani:

- Ana uygulama iş mantığını yürütür
- AI servisi ayrı bir hizmet olarak çalışır
- Frontend ise iki hizmete de bağımlı biçimde veri ve komut akışı sağlar

---

## 4. Teknoloji Yığını

### 4.1 Ana Backend

- Node.js
- Express.js
- Mongoose
- MongoDB
- dotenv
- CORS

### 4.2 Frontend

- React
- Vite
- CSS/JSX tabanlı komponent yapısı

### 4.3 AI Servisi

- Python
- FastAPI
- Uvicorn
- scikit-learn
- numpy
- pickle tabanlı model yükleme

---

## 5. Klasör Yapısı ve Her Klasörün Amacı

### 5.1 Kök Dizin

Bu dizin, projenin genel koordinasyon noktasıdır. Aşağıdaki işlevleri üstlenir:

- Ana backend sunucusunun başlangıç noktasıdır
- Root package.json üzerinden bağımlılık yönetimi yapılır
- Frontend ve backend için ortak çalışma komutları tanımlanır
- Proje genel dokümantasyon dosyaları burada yer alır

### 5.2 models/

Bu klasör MongoDB veritabanı şemalarını içerir. Her dosya, ilgili veri kümesi için Mongoose modeli tanımlar.

- Customer.js: müşteri bilgilerini saklar
- Request.js: müşteri taleplerini saklar
- Performance.js: operasyonel/performans kayıtlarını saklar
- Experience.js: müşteri deneyimi verilerini saklar
- Tool.js: BlueBot araç/komponent kayıtlarını saklar

Bu dosyalar, veri bütünlüğünü sağlamak, alan tiplerini tanımlamak ve veri erişimini standartlaştırmak için kullanılır.

### 5.3 routes/

Express router yapısında API endpoint’lerini tanımlar.

- customerRoutes.js: müşteri ekleme/listeleme işlemleri
- requestRoutes.js: talepler için CRUD tabanlı işlemler
- performanceRoutes.js: performans kayıtları için işlem akışı
- experienceRoutes.js: müşteri deneyimi kayıtları
- toolRoutes.js: araç/komponent kayıtları

Bu katman, HTTP isteklerini doğrudan modellerle eşleştirir ve business logic’in çoğunu sade tutar.

### 5.4 intent_service/

Bu klasör, AI tabanlı intent analysis servisini içerir.

- app.py: FastAPI uygulaması, endpoint tanımı, model yükleme, entity extraction ve inference mantığı
- train_model.py: sınıflandırıcı modelin eğitildiği ve pickle dosyasına yazıldığı betik
- test_inference.py: servis testleri için örnek istek ve doğrulama mantığı
- intent_mapping.json: intent etiketleri ve varsayılan parametre eşlemeleri
- needle_model.pkl: eğitilmiş ML modeli
- requirements.txt: Python bağımlılık listesi

Bu katman, kullanıcı cümlesini “anlamlandırmak” için kullanılır ve frontend’in AI Copilot deneyimini destekler.

### 5.5 ui_frontend/

React tabanlı kullanıcı arayüzünü içerir.

- src/App.jsx: ana ekran yönlendirme mantığı
- src/components/: ekran ve UI bileşenleri
- src/data/toolsData.js: workflow editor’de kullanılacak araç/komponent katalogu
- public/: statik dosyalar
- vite.config.js: Vite yapılandırması

Bu klasör, kullanıcı deneyimini oluşturur ve backend ile intent service’e bağlanır.

### 5.6 blue_bot_tool_list.md

BlueBot/Workflow editöründe kullanılabilecek araçların liste halinde anlatıldığı dokümantasyon dosyasıdır. Bu dosya, frontend tarafındaki tool katalogunu destekler ve iş akışı bileşenleri hakkında referans sağlar.

---

## 6. Uygulama Akışı

### 6.1 Backend Akışı

1. Sunucu başlatılır
2. Express app oluşturulur
3. CORS ve JSON middleware’leri yüklenir
4. Route’lar bağlanır
5. MongoDB’ye bağlantı kurulmaya çalışılır
6. İstekler ilgili route üzerinden işlenir
7. Mongoose modelleri üzerinden veritabanına yazma/okuma yapılır

### 6.2 Frontend Akışı

1. Kullanıcı bir ekran üzerinden sistemle etkileşime girer
2. React state yapısı değişiklikleri yönetir
3. API çağrıları yapılır
4. Gelen veriler UI üzerinde görselleştirilir
5. BlueBot ekranında kullanıcı AI Copilot ile workflow düzenleyebilir

### 6.3 AI Copilot Akışı

1. Kullanıcı metin komutu girer
2. Frontend, intent service’e POST isteği gönderir
3. FastAPI servisi cümleyi analiz eder
4. Model tarafından tahmin edilen intent ve entity extraction çıktısı dönülür
5. Frontend bu çıktıyı yorumlayıp uygun eylemi başlatır
6. Workflow canvas üzerinde düğüm eklenir veya kullanıcıya yanıt üretilir

---

## 7. Veri Modelleri

### 7.1 Customer

Müşteri bilgilerini temsil eder.

Özellikler:
- companyName
- contactEmail
- createdAt

### 7.2 Request

Müşteri taleplerini temsil eder.

Özellikler:
- customer (Customer referansı)
- subject
- category
- building
- workOrderNo
- duration
- score

### 7.3 Performance

Operasyonel performans verilerini temsil eder.

Özellikler:
- customer
- subject
- category
- building
- zone
- duration

### 7.4 Experience

Müşteri deneyimi verilerini temsil eder.

Özellikler:
- customer
- ratingScore
- feedbackText
- submittedAt

### 7.5 Tool

BlueBot/Workflow sistemi içindeki araçları temsil eder.

Özellikler:
- toolName
- description
- isActive
- createdAt

---

## 8. API Endpointleri

### 8.1 Backend API

Ana backend, aşağıdaki endpoint’leri sunar:

- GET /api/customers
- POST /api/customers
- GET /api/requests
- POST /api/requests
- GET /api/performances
- POST /api/performances
- GET /api/experiences
- POST /api/experiences
- GET /api/tools
- POST /api/tools

### 8.2 Intent Service

- POST /analyze-intent

İstek gövdesi örneği:

```json
{
  "text": "a blokta açık iş emirlerini listele"
}
```

Yanıt örneği:

```json
{
  "intent": "list_work_orders",
  "mapped_parameters": {
    "building": "A Blok",
    "status": "active",
    "category": "all",
    "action": "list"
  },
  "confidence": 0.82,
  "latency_ms": 13.4
}
```

---

## 9. Frontend Bileşenleri

### 9.1 App

Ana uygulama bileşenidir. Sol taraftaki sidebar yapısı ve aktif ekran yönetimini sağlar.

### 9.2 Sidebar

Navigasyon menüsü sunar. Dashboard, raporlar, requests, performance ve BlueBot ekranına erişim sağlar.

### 9.3 DashboardView

Backend üzerinden müşteri listesini çeker ve kullanıcıya gösterir.

### 9.4 RequestsView / PerformanceView / ReportView

İlgili alanlara ait ekran bileşenleridir ve mevcut yapıda veri görselleştirmesi ile desteklenir.

### 9.5 BlueBotView

BlueBot kurallarının listelendiği ekranı temsil eder. Kullanıcı “Oluştur” butonuna basarak workflow editörüne geçebilir.

### 9.6 WorkflowEditor

Ana AI destekli workflow düzenleyici bileşenidir. Kullanıcının doğal dil ile iş akışı oluşturmaya çalıştığı alan olarak görev yapar.

### 9.7 WorkflowCanvas

Canvas tabanlı iş akışı görünümünü sağlar.

Özellikleri:
- Düğüm sürükleme
- Düğüm silme
- Bağlantı çizme
- Pan/zoom
- Node selection

### 9.8 NodeLibrarySidebar

Sol taraftaki araç kütüphanesini temsil eder. Sürükle-bırak ile canvas’a düğüm eklenmesini sağlar.

---

## 10. Kurulum ve Çalıştırma

### 10.1 Gereksinimler

- Node.js 18+ (önerilir)
- Python 3.10+
- MongoDB sunucusu

### 10.2 Ana Proje Bağımlılıkları

Kök dizinde çalıştırın:

```bash
npm install
```

Frontend bağımlılıklarını da yüklemek için:

```bash
npm run install-all
```

### 10.3 Ortam Değişkenleri

Projenin kök dizininde bir .env dosyası oluşturun:

```env
MONGO_URI=mongodb://127.0.0.1:27017/blue_operation
PORT=5000
```

### 10.4 Backend Sunucusunu Başlatma

```bash
npm run server
```

Veya:

```bash
npm start
```

### 10.5 Frontend’i Başlatma

```bash
npm run client
```

Bu komut Vite geliştirme sunucusunu başlatır.

### 10.6 Intent Service’i Başlatma

```bash
cd intent_service
pip install -r requirements.txt
uvicorn app:app --reload --port 8000
```

### 10.7 Model Eğitme (İsterseniz)

Eğer model dosyası güncellenmek veya yeniden oluşturulmak isteniyorsa:

```bash
cd intent_service
python train_model.py
```

---

## 11. Build Süreci

Frontend build almak için:

```bash
npm run build-client
```

---

## 12. Teknik Notlar ve Mevcut Durum

Bu proje, henüz “tam üretim seviyesinde” bir sistemden ziyade, fonksiyonel bir prototip / MVP yapısıdır. Aşağıdaki alanlar gelecekte daha da güçlendirilebilir:

- Gerçek veri tabanı şeması ve ilişkileri daha derinleştirilebilir
- Workflow editörü backend’e bağlanıp verilerin kalıcı hale gelmesi sağlanabilir
- AI Copilot akışı daha gelişmiş bir rule engine veya LLM tabanlı bir sisteme taşınabilir
- Node/connection serialization ve workflow save/load mekanizması eklenebilir
- Authentication / authorization katmanı eklenebilir
- Hata yönetimi ve validation katmanları genişletilebilir
- Endpoint’ler için OpenAPI / Swagger dokümantasyonu eklenebilir

---

## 13. Mimari Özeti (Kısa)

Bu proje temel olarak aşağıdaki mantıkla çalışır:

- React frontend kullanıcı etkileşimini yönetir
- Express backend veri işlemlerini yönetir
- MongoDB verileri depolar
- FastAPI service kullanıcı metinlerini anlamlandırır
- Workflow editor bu çıktıları görsel düğüm ekleme eylemlerine dönüştürür

Bu nedenle proje, “full-stack operasyonel kontrol platformu” ve “AI destekli workflow copilot” kavramlarının birleşiminden oluşan bir prototiptir.

---

## 14. Kısaca Projenin Amacı

Bu projede amaç;

- Müşteri ve operasyonel verileri merkezi bir yapıda yönetmek,
- İş süreçlerini görsel olarak modellemek,
- Doğal dil ile bu iş akışlarını yönlendirebilmek,
- AI tabanlı bir asistan üzerinden kullanıcı deneyimini zenginleştirmektir.

---

## 15. Son Söz

Bu repository, hem backend hem frontend hem de AI servis katmanlarını bir arada barındıran, eğitim/uygulama amaçlı güçlü bir prototip yapıdır. Özellikle iş akışları, operasyonel raporlama, müşteri verisi yönetimi ve AI destekli komut işleme alanlarında genişletilebilir bir temel sağlar.
