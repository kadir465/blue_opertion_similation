import re

EXPANSION_DICT = {
    # Sensörler & Cihazlar
    "sıcaklık": "sıcaklık sensörü derece celsius fahrenheit kelvin teknik sayı değeri float",
    "yangın": "yangın dedektörü duman alarmı acil durum acil alarmı device_uuid_array",
    "kapı": "kapı sensörü dijital giriş kapı açık kapalı boolean durum",
    "kamera": "kamera görüntüsü kamera alarmı hata video kayıt novif recorder device_uuid_array",
    "arıza": "cihaz arızası hata bozuk arızalı çalışmıyor arıza seti",
    "sensör": "dijital giriş draco input sayaç ölçüm cihaz nokta",
    
    # RTLS & Sayaç
    "insan": "insan sayısı bölge bina insan sayaç dedektörü people_count rtls doluluk kapasite",
    "kişi": "insan sayısı kişi sayısı people_count doluluk kapasite rtls",
    "envanter": "envanter sayısı takip edilebilir obje rtls ekipman malzeme",
    "sayaç": "draco sayacı dijital input sayaç değeri kümülatif enerji darbe",
    
    # Aksiyonlar
    "mesaj": "slack mesajı discord telegram bildirim gönder mail e-posta",
    "haber": "bildirim gönder mail e-posta telegram discord slack mesaj uyarı",
    "mail": "mail gönder e-posta smtp alıcı konu içerik string_array",
    "bildirim": "bildirim gönder kullanıcı listesi mesaj string_array",
    
    # İş Emirleri
    "iş emri": "açık iş emirleri iş emri oluştur kapat süreci workorder_enum uuid",
    "görev": "iş emri oluştur görev atama süreci kapat workorder_enum",
    
    # Matematik & Operatörler
    "topla": "toplam iki sayısal değer toplama işlemi input_1 input_2 output",
    "çıkar": "çıkarma iki sayısal değer fark input_1 input_2 output",
    "çarp": "çarpma çarpım input_1 input_2 output",
    "böl": "bölme bölünen bölen input_1 input_2 output",
    "karşılaştır": "karşılaştırıcı büyüktür küçüktür eşittir operatör input_1 input_2 output",
    "limit": "menzil yüzde limit oran min_deger max_deger input output",
    "ve": "and gate mantıksal ve kapısı input_1 input_2 output",
    "veya": "or gate mantıksal veya kapısı input_1 input_2 output",
    "değil": "not gate mantıksal değil kapısı input output",
    "zaman": "tarih zaman epoch_integer datetime_object datetime_string saat saniye dakika gün ay yıl",
    "tarih": "tarih zaman epoch_integer datetime_object datetime_string saat saniye dakika gün ay yıl"
}

def expand_query(query: str) -> str:
    query_lower = query.lower()
    expanded_terms = []
    
    for key, value in EXPANSION_DICT.items():
        if key in query_lower:
            expanded_terms.append(value)
            
    if expanded_terms:
        enriched_query = f"{query} {' '.join(expanded_terms)}"
        enriched_query = re.sub(r'\s+', ' ', enriched_query).strip()
        return enriched_query
    return query
