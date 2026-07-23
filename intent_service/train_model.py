import json
import pickle
import os
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline

def train_and_save():
    # 1. Define Training Data
    training_data = [
        # list_work_orders
        ("tamamlanan iş emirlerini göster", "list_work_orders"),
        ("iş emirlerini listele", "list_work_orders"),
        ("bana açık iş emirlerini getir", "list_work_orders"),
        ("dünkü iş emirlerini sorgula", "list_work_orders"),
        ("yapılan görevlerin listesi", "list_work_orders"),
        ("iş emri geçmişini ver", "list_work_orders"),
        ("güncel iş emirleri listesi", "list_work_orders"),
        ("hata raporu olan iş emirlerini listele", "list_work_orders"),
        ("bütün talepleri göster", "list_work_orders"),
        ("neler yapılmış dök", "list_work_orders"),
        ("biten işler neler", "list_work_orders"),
        ("kapanan talepleri listele", "list_work_orders"),
        ("iş emri raporu alabilir miyim", "list_work_orders"),
        
        # device_failure
        ("arızalı cihazları bul", "device_failure"),
        ("hangi cihazlarda arıza var", "device_failure"),
        ("arıza kaydı oluşturan cihazlar", "device_failure"),
        ("bozuk cihazların listesi", "device_failure"),
        ("arızalanan cihazları göster", "device_failure"),
        ("arızası devam eden sistemleri listele", "device_failure"),
        ("arıza durumu aktif olan modüller", "device_failure"),
        ("çalışmayan aletler neler", "device_failure"),
        ("arıza nerede", "device_failure"),
        ("sistem çöktü", "device_failure"),
        ("hatalı ekipmanları listele", "device_failure"),
        
        # people_count
        ("binadaki insan sayısını ver", "people_count"),
        ("bölgede kaç kişi var", "people_count"),
        ("insan sayım sonucu nedir", "people_count"),
        ("odalardaki doluluk oranı", "people_count"),
        ("bina doluluğunu sorgula", "people_count"),
        ("içeride kaç insan bulunuyor", "people_count"),
        ("odada kaç kişi bulunuyor", "people_count"),
        ("toplam ziyaretçi sayısı", "people_count"),
        ("kaç kişi girdi", "people_count"),
        
        # send_notification
        ("mail olarak bildir", "send_notification"),
        ("telegramdan mesaj gönder", "send_notification"),
        ("kullanıcılara bildirim yolla", "send_notification"),
        ("discord uyarısı gönder", "send_notification"),
        ("telefon mesajı at", "send_notification"),
        ("sms gönder", "send_notification"),
        ("acil durum bildirimi yap", "send_notification"),
        ("herkese duyur", "send_notification"),
        ("haber ver", "send_notification"),
        
        # workflow_creation
        ("Sıcaklık 30 dereceyi geçerse bana alarm ver.", "workflow_creation"),
        ("Birisi yangın kapısını açarsa güvenlik ekibine mail at.", "workflow_creation"),
        ("Bina 5'teki insan sayısı 100'ü geçerse uyarı oluştur.", "workflow_creation"),
        ("Yeni bir otomasyon kuralı yazmak istiyorum.", "workflow_creation"),
        ("açık iş emirlerini kontrol et, eğer fazlaysa alarm çal", "workflow_creation"),
        ("bir iş akışı oluştur", "workflow_creation"),
        ("şartlı bir kural ekleyelim", "workflow_creation"),
        # ── Yeni örnekler (karışık ifade kalıpları) ──
        ("sıcaklık 30 üstü olursa telegram bildiri gönder akış yapalım", "workflow_creation"),
        ("nem oranı yüzde 70'i geçerse mail at", "workflow_creation"),
        ("her sabah saat 9'da telegramdan durum raporu gönder", "workflow_creation"),
        ("yangın dedektörü tetiklendiğinde acil durum prosedürü başlat", "workflow_creation"),
        ("enerji tüketimi belirli limitin üzerine çıkarsa uyarı ver", "workflow_creation"),
        ("kapı açıldığında kameradan görüntü al ve discord'a gönder", "workflow_creation"),
        ("basınç sensörü düşerse pompa motorunu otomatik kapat", "workflow_creation"),
        ("hareket algılandığında ışıkları aç ve bildirim gönder", "workflow_creation"),
        ("eğer cihaz arızalanırsa iş emri oluştur ve ekibe haber ver", "workflow_creation"),
        ("CO2 seviyesi yükselince havalandırmayı devreye al", "workflow_creation"),
        ("belirli saatlerde otomatik rapor oluşturan bir senaryo kur", "workflow_creation"),
        ("voltaj düşerse jeneratörü devreye alan bir akış oluştur", "workflow_creation"),
        ("su sızıntısı algılanırsa vanayı kapat ve telegram'dan bildir", "workflow_creation"),
        
        # general_chat
        ("Merhaba, nasılsın?", "general_chat"),
        ("Bana sistem hakkında bilgi ver.", "general_chat"),
        ("Bugün hava nasıl?", "general_chat"),
        ("Sisteme nasıl giriş yapabilirim?", "general_chat"),
        ("şifremi unuttum ne yapmalıyım", "general_chat"),
        ("selam", "general_chat")
    ]

    X = [item[0] for item in training_data]
    y = [item[1] for item in training_data]

    print("Training intent classification model...")
    # 2. Build Pipeline (TF-IDF Vectorizer + Logistic Regression Classifier)
    # Using 'char_wb' analyzer ensures robustness against typos and out-of-vocabulary variations in local Turkish
    pipeline = Pipeline([
        ('vectorizer', TfidfVectorizer(lowercase=True, analyzer='char_wb', ngram_range=(2, 4))),
        ('clf', LogisticRegression(C=1.5, max_iter=200))
    ])

    # 3. Train
    pipeline.fit(X, y)

    # 4. Serialize Model to needle_model.pkl
    model_path = os.path.join(os.path.dirname(__file__), "needle_model.pkl")
    with open(model_path, "wb") as f:
        pickle.dump(pipeline, f)

    print(f"Saved model successfully to: {model_path}")

    intent_mapping = {
        "list_work_orders": {
            "category": "unknown",
            "status": "completed",
            "date_range": "yesterday"
        },
        "device_failure": {
            "category": "unknown",
            "status": "active",
            "date_range": "last_7_days"
        },
        "people_count": {
            "category": "Yazılım",
            "status": "all",
            "date_range": "current"
        },
        "send_notification": {
            "category": "Yazılım",
            "status": "dispatched",
            "date_range": "today"
        },
        "workflow_creation": {
            "category": "System",
            "status": "routing",
            "date_range": "none"
        },
        "general_chat": {
            "category": "System",
            "status": "routing",
            "date_range": "none"
        },
        "unhandled": {
            "category": "unknown",
            "status": "unknown",
            "date_range": "unknown"
        }
    }

    mapping_path = os.path.join(os.path.dirname(__file__), "intent_mapping.json")
    with open(mapping_path, "w", encoding="utf-8") as f:
        json.dump(intent_mapping, f, ensure_ascii=False, indent=2)

    print(f"Saved intent mapping config successfully to: {mapping_path}")

if __name__ == "__main__":
    train_and_save()
