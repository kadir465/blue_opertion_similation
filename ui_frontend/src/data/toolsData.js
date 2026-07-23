// sol paneldeki araçlar listeleri ve açıklamaleı 
export const toolsData = [
  // Portal Nesneleri
  {
    id: "portal-1",
    category: "Portal Nesneleri",
    name: "Açık İş Emirleri",
    description: "Belirtilen kritelere göre iş emirlerini workorder enamuter tipinde döndürür"
  },
  {
    id: "portal-2",
    category: "Portal Nesneleri",
    name: "Bina/İnsan Sayısı",
    description: "Spesifik bir bina sayı verisini döndürür boş bırakılırsa binery döndürülür . çıktı tipi:people_count"
  },
  {
    id: "portal-3",
    category: "Portal Nesneleri",
    name: "Box Uç Nokta",
    description: "Başka bir BlueBox nokta değerini döndürür.Nokta değeri boş geçilirse geçerli nokta varsayılan olarak kabul edilir"
  },
  {
    id: "portal-4",
    category: "Portal Nesneleri",
    name: "Bölge Olay Tipi",
    description: "Portal Olay tipieşleşirse çıktı üretir"
  },
  {
    id: "portal-5",
    category: "Portal Nesneleri",
    name: "Cihaz Arızası",
    description: "Kuralı tetikleyen cihazda arza varsa çıkış üretir.(Not Alarm varsa çıkış üretmez , sadece arıza durumunda çıkış üretir)"
  },
  {
    id: "portal-6",
    category: "Portal Nesneleri",
    name: "Cihaz Nota Tipi",
    description: "Tetikleyici bir cihaz tipi ile eşleşiyorsa çıkış üretir"
  },
  {
    id: "portal-7",
    category: "Portal Nesneleri",
    name: "Cihaz Tipi",
    description: "Tetikleyici bir cihaz tipi ile eşleşiyorsa çıkış üretir"
  },
  {
    id: "portal-8",
    category: "Portal Nesneleri",
    name: "Dijital Giriş",
    description: "Boolean tipindeki girişler için kullanılır"
  },
  {
    id: "portal-9",
    category: "Portal Nesneleri",
    name: "Draco İnput",
    description: "Bir giriş / çıkış nokktasının değerini döndürür"
  },
  {
    id: "portal-10",
    category: "Portal Nesneleri",
    name: "Draco Sayacı",
    description: "Sayaç özelliği dijital inputların değerini döndürür"
  },
  {
    id: "portal-11",
    category: "Portal Nesneleri",
    name: "Geçerli Portal Objesi",
    description: "kuralı tetikleyen obje"
  },
  {
    id: "portal-12",
    category: "Portal Nesneleri",
    name: "Geçerli Sanal Bölge",
    description: "Kuralın tetiklendiği sanal bölge"
  },
  {
    id: "portal-13",
    category: "Portal Nesneleri",
    name: "HTTP Reguest Key",
    description: "HTTP Body üzerinden bir veriyi string türünde alabilriz"
  },
  {
    id: "portal-14",
    category: "Portal Nesneleri",
    name: "HTTP Response Key",
    description: "Rest api yanıtında bir obje değeri çekmeye yarar"
  },
  {
    id: "portal-15",
    category: "Portal Nesneleri",
    name: "kamera Alarmı",
    description: "Guruba eklediğiniz kameralardan birinde hata varsa çıkış üretir"
  },
  {
    id: "portal-16",
    category: "Portal Nesneleri",
    name: "Notlar",
    description: "Ekrana hatırlayıcı yorumlar ekleyebilriz"
  },
  {
    id: "portal-17",
    category: "Portal Nesneleri",
    name: "Obje/Bölge",
    description: "Belirttiğiniz objelerden herhangi bir seçili bölgede bulunuyorsa , bileşen çıkışı üretir"
  },
  {
    id: "portal-18",
    category: "Portal Nesneleri",
    name: "Olay Tipi",
    description: "Zaten tetiklenmiş olan programın hangi olay tipi ile tetiklendiğini gösterir"
  },
  {
    id: "portal-19",
    category: "Portal Nesneleri",
    name: "Portal Değişkeni",
    description: "Portalda anımlı bir sanal değişkenin değerini döndürür"
  },
  {
    id: "portal-20",
    category: "Portal Nesneleri",
    name: "Portal Metin Referansı",
    description: "Portalda bir cihazdan gelen metin referans noktalarının değerini getirir"
  },
  {
    id: "portal-21",
    category: "Portal Nesneleri",
    name: "RTLS Bölge Envanter Sayısı",
    description: "Bölgede bulunan insan harici envanter sayısı"
  },
  {
    id: "portal-22",
    category: "Portal Nesneleri",
    name: "RTLS Bölge Toplam Sayısı",
    description: "Bölgede bulunan tüm takip edilebilir objelerin sayısını verir"
  },
  {
    id: "portal-23",
    category: "Portal Nesneleri",
    name: "RTLS Bölge insan sayısı",
    description: "Bölgede Bulunan İnsan sayısı"
  },
  {
    id: "portal-24",
    category: "Portal Nesneleri",
    name: "RestAPi/Response",
    description: "Uzak bir sunucuya rest api sorgusu yapar ve http_rsponse tipinde çıktı üretir"
  },
  {
    id: "portal-25",
    category: "Portal Nesneleri",
    name: "Temizlik Anket Seçenek Değeri",
    description: "temizlik görevinde kulalnılan anket tabletinin seçenek değerini döndürür"
  },
  {
    id: "portal-26",
    category: "Portal Nesneleri",
    name: "Teknik Sayı Değeri",
    description: "Kuralı tetikleen noka sayısı bir değere saipse,ilgili değer döndürülür"
  },
  {
    id: "portal-27",
    category: "Portal Nesneleri",
    name: "Yangın Dedektörü Alarmı",
    description: "Gruba eklediiniz yangın dedktörlerinden birinde alarm varsa çıkış üretir"
  },
  {
    id: "portal-28",
    category: "Portal Nesneleri",
    name: "İnan Sayaç Dedktörü",
    description: "spesifik bir dedktör döndürür boş bırakılırsa tetikleyici dedktörü döndürür.çıktı tipi: people_count"
  },
  {
    id: "portal-29",
    category: "Portal Nesneleri",
    name: "İnsan/Sayaç (Bölge/Bina Sayısı)",
    description: "Belirli bi bölge veya inanın insan sayım sonucunun numeric olarakdöndürür.. geçersiz veriler -1 olarak döner"
  },
  {
    id: "portal-30",
    category: "Portal Nesneleri",
    name: "iş Emri(UUID)",
    description: "UUID değeri ile portalda bir iş emrini getirir"
  },

  // Operatörler
  {
    id: "op-1",
    category: "Operatörler",
    name: "And Gate",
    description: "Mantıksal ve kapısı"
  },
  {
    id: "op-2",
    category: "Operatörler",
    name: "Bool seçici",
    description: "Seçici girişin durumuna göre giriş çıkış yönlendirir"
  },
  {
    id: "op-3",
    category: "Operatörler",
    name: "Karşılaştırıcı",
    description: "İki Sayısal değeri birbiriyle karşılaştırır"
  },
  {
    id: "op-4",
    category: "Operatörler",
    name: "Nand Kapısı",
    description: "Mantıksal ve değil Kapısı"
  },
  {
    id: "op-5",
    category: "Operatörler",
    name: "Nor Kapısı",
    description: "Mantıksal veya değil kapısı"
  },
  {
    id: "op-6",
    category: "Operatörler",
    name: "Not Gate",
    description: "Mantıksal Değil Kapısı"
  },
  {
    id: "op-7",
    category: "Operatörler",
    name: "Numerik Seçici",
    description: "Seçici girişin durumuna göre giriş çıkışa yönlendirir"
  },
  {
    id: "op-8",
    category: "Operatörler",
    name: "Or Gate",
    description: "Mantıksal veya kapısı"
  },
  {
    id: "op-9",
    category: "Operatörler",
    name: "String Seçici",
    description: "Bir Bool değere göre birinci veya ikinci inputtdaki string çıkışa aktarır"
  },
  {
    id: "op-10",
    category: "Operatörler",
    name: "XNoR Gate",
    description: "Mantıksal özel veya değil kapısı"
  },
  {
    id: "op-11",
    category: "Operatörler",
    name: "XoR Gate",
    description: "Mantıksal Özel Veya kapısı"
  },

  // Matematik
  {
    id: "math-1",
    category: "Matematik",
    name: "Ark Kosinüs",
    description: "Girişteki numerik veriyi çıkışa ark kosünüs olarak çevirir"
  },
  {
    id: "math-2",
    category: "Matematik",
    name: "Ark Sinüs",
    description: "Girişteki numerik veriyi çıkışa ark sinüs olark çevirir"
  },
  {
    id: "math-3",
    category: "Matematik",
    name: "Ark Tanjant",
    description: "Girişteki numerik veriyi çıkışa ark tanjant olarak çevirir"
  },
  {
    id: "math-4",
    category: "Matematik",
    name: "Ay Numarası",
    description: "Hangi ayda olduğunuzu numeric olarak gönder"
  },
  {
    id: "math-5",
    category: "Matematik",
    name: "Açı Dönüştürücü",
    description: "Girişteki açı cinsini seçil açı cinsin çevirir"
  },
  {
    id: "math-6",
    category: "Matematik",
    name: "Bar/Yükseklik",
    description: "Girişteki bar tipindeki basıncı, metre tipinde sıvı yüksekliğine çevirir"
  },
  {
    id: "math-7",
    category: "Matematik",
    name: "Base64 Decoder/Encode",
    description: "Bir Stringi Base64' e çevirir veya çözer"
  },
  {
    id: "math-8",
    category: "Matematik",
    name: "Basınç Birim Çevirici",
    description: "Seçili giriş basınç birimini seçili basınç birimine çevirir"
  },
  {
    id: "math-9",
    category: "Matematik",
    name: "Binary Sitring /sayı",
    description: "Bir binary string sayısı dönüştürür"
  },
  {
    id: "math-10",
    category: "Matematik",
    name: "Bit",
    description: "Sabit bit değeri"
  },
  {
    id: "math-11",
    category: "Matematik",
    name: "Bits/Byte Dönüştürücü",
    description: "8- bitlik değeri 1 byte a dönüştürür"
  },
  {
    id: "math-12",
    category: "Matematik",
    name: "Bool/String",
    description: "Bool tipindeki veriyi stringe dönüştürür"
  },
  {
    id: "math-13",
    category: "Matematik",
    name: "Boolean/Sayı Dönüştürücü",
    description: "Girişteki binary değeri numerik değere dönüştürür"
  },
  {
    id: "math-14",
    category: "Matematik",
    name: "Byte/Bit Dönüştürücü",
    description: "Girişteki byte değerin binary sisteme çevirip, seçili bitin değerini döndürür"
  },
  {
    id: "math-15",
    category: "Matematik",
    name: "Bölme",
    description: "İki sayısal değeri bibirine böler"
  },
  {
    id: "math-16",
    category: "Matematik",
    name: "Ceil",
    description: "işlev her zaman yuvarlar ve belirli bir sayıdan büyük veya ona eşit olan daha küçük tamsayıyı döndürür"
  },
  {
    id: "math-17",
    category: "Matematik",
    name: "Dakika",
    description: "Sadece dakikayı numeric olarak döner"
  },
  {
    id: "math-18",
    category: "Matematik",
    name: "Epoch/Tarih",
    description: "Girdi olarak gelen UNIX zaman damgası objesini Taarih /Zaman opjesine döndürür"
  },
  {
    id: "math-19",
    category: "Matematik",
    name: "Exp",
    description: "e'nin üssünü hesaplar"
  },
  {
    id: "math-20",
    category: "Matematik",
    name: "Faktoriyel",
    description: "Girişteki sayının faktöriyelini alarak çıkışa gönderir"
  },
  {
    id: "math-21",
    category: "Matematik",
    name: "Gamma Fonksiyonu",
    description: "Gamma Fonksiyonu matematikte faktöriyel fonksiyonun karmaşık saylar ve tam sayı olmayan reel sayılar için genellemesi olan ir sonksiyondur .Г simgesiyle gösterilir"
  },
  {
    id: "math-22",
    category: "Matematik",
    name: "Gün Numarası",
    description: "Ayın hangi günü olduğunu numeric olarak döner"
  },
  {
    id: "math-23",
    category: "Matematik",
    name: "Gün?",
    description: "Şimdiki zamanı belirtiğiniz bir gün ile karşılaştırır"
  },
  {
    id: "math-24",
    category: "Matematik",
    name: "Haftasonu",
    description: "Şimdiki zaman eğer hafta sonu ise çıkış üretir"
  },
  {
    id: "math-25",
    category: "Matematik",
    name: "Hash Fonksiyonu",
    description: "Bir String belirttiğinz algoritma ie hashler"
  },
  {
    id: "math-26",
    category: "Matematik",
    name: "HexString/Sayı",
    description: "Hexadecimal String sayıya çevirir"
  },
  {
    id: "math-27",
    category: "Matematik",
    name: "Hiperbolik Sinüs",
    description: "Girişteki numerik veriyi çıkışa hiperbolik sinüs olarak çevirir"
  },
  {
    id: "math-28",
    category: "Matematik",
    name: "Kosinüs",
    description: "Girişteki numerik veriyi çıkışa kosünüs olarak çevirir"
  },
  {
    id: "math-29",
    category: "Matematik",
    name: "Kök",
    description: "Sayısal bir değerin n. dereceden kökünü alır"
  },
  {
    id: "math-30",
    category: "Matematik",
    name: "Logaritma",
    description: "Giriş değerinin beliritlen tabanda algoritmasını alır"
  },
  {
    id: "math-31",
    category: "Matematik",
    name: "Menzil/Yüzde",
    description: "Limitleri belli bir değer aralığı için, giriş değerini yüzdesel olarak çıkışa aktarır"
  },
  {
    id: "math-32",
    category: "Matematik",
    name: "Min/max",
    description: "Seçtiğiniz davranış onksiyonuna göre iki değer karşılaştıraarak minimum veya maksimum olanı çıkışa aktarır"
  },
  {
    id: "math-33",
    category: "Matematik",
    name: "Mod",
    description: "Girişteki değeri Mod Değerine alır"
  },
  {
    id: "math-34",
    category: "Matematik",
    name: "Mutlak Değer",
    description: "Girişteki numeric verinin mutlak değerini alır"
  },
  {
    id: "math-35",
    category: "Matematik",
    name: "OBEB",
    description: "iki tamsayının ortak bölenlerinin en büyüğünü Bulur"
  },
  {
    id: "math-36",
    category: "Matematik",
    name: "OKEK",
    description: "İki tamsayının ortak katlarının en küçüğünü bulur"
  },
  {
    id: "math-37",
    category: "Matematik",
    name: "Pi",
    description: "pi sayısını verir"
  },
  {
    id: "math-38",
    category: "Matematik",
    name: "Put string Char",
    description: "Bir String in belirli bir noktasından başlayarak belirtilen miktarda karakter çekebilirsiniz"
  },
  {
    id: "math-39",
    category: "Matematik",
    name: "Rastgele",
    description: "Belirtilen minium ve maksimum değer aralığında rastgele bir sayı üretir"
  },
  {
    id: "math-40",
    category: "Matematik",
    name: "Round",
    description: "işlev , en yakın tam sayıya yuvarlanmış bir sayının değerini döndürür"
  },
  {
    id: "math-41",
    category: "Matematik",
    name: "Saat",
    description: "Sadece saat numeric olarak döner"
  },
  {
    id: "math-42",
    category: "Matematik",
    name: "Sabit",
    description: "Numeric Sabit değer"
  },
  {
    id: "math-43",
    category: "Matematik",
    name: "Sabit String",
    description: "Ön tanımlı bir string objesini tanımamlarımız sağlar"
  },
  {
    id: "math-44",
    category: "Matematik",
    name: "Saniye",
    description: "sadece saniyeyi numeric olarak döner"
  },
  {
    id: "math-45",
    category: "Matematik",
    name: "Sayı/ Binary String",
    description: "Bir sayıyı binary stringe çevirir"
  },
  {
    id: "math-46",
    category: "Matematik",
    name: "Sayı/Boolean Dönüştürücü",
    description: "Girişteki değeri binary değere dönüştürür"
  },
  {
    id: "math-47",
    category: "Matematik",
    name: "Sayı/HexString",
    description: "Decimal bir değeri Hexadecimal stringe çevirir"
  },
  {
    id: "math-48",
    category: "Matematik",
    name: "Sayı/String",
    description: "Sayısal bir veriyi stringe dönüştürür"
  },
  {
    id: "math-49",
    category: "Matematik",
    name: "Sinüs",
    description: "Girişteki numerik veriyi çıkışa sinüs olarak çevirir"
  },
  {
    id: "math-50",
    category: "Matematik",
    name: "String Birleştir",
    description: "İki Stringi birleştirip tek bir string çıkışı üretir"
  },
  {
    id: "math-51",
    category: "Matematik",
    name: "String Eşitlik",
    description: "String türündeki bir nesneyi karşılaştırmaya yarar"
  },
  {
    id: "math-52",
    category: "Matematik",
    name: "String Includes",
    description: "Yazı içinde geçen bir kelimeyi küçük/büyük harf bakmaksızın ara bulursan çıkışı üretir"
  },
  {
    id: "math-53",
    category: "Matematik",
    name: "String Küçük/Büyük",
    description: "Yazıyı küçük veya büyük harf olarak değiştirrebilirz"
  },
  {
    id: "math-54",
    category: "Matematik",
    name: "String Length",
    description: "Yazının uzunluğunu tam sayı cinsinden döndürür"
  },
  {
    id: "math-55",
    category: "Matematik",
    name: "String Reflector",
    description: "İçin atanan değeri bir değişknede saklar . Buildera gidene kadar zincir şeklinde devam etmeli"
  },
  {
    id: "math-56",
    category: "Matematik",
    name: "String Replace",
    description: "Yazı içinde geçen bir kelimeyi başka bir kelime ile değiştirebilirisizniz"
  },
  {
    id: "math-57",
    category: "Matematik",
    name: "String Splitter",
    description: "Yazıyı belirtilen kelimelerin geçtiği yerlerdeen böler.Gelirttiğiniz indexi çeker"
  },
  {
    id: "math-58",
    category: "Matematik",
    name: "String /Bool",
    description: "String Tipindeki giriş verisini bool tipinde çevirir"
  },
  {
    id: "math-59",
    category: "Matematik",
    name: "String /Sayı",
    description: "String Tipindeki bir değeri sayısal değere dönüştürür"
  },
  {
    id: "math-60",
    category: "Matematik",
    name: "String /Tarih",
    description: "Belirtilen formatta gelen yazı tipindeki objeyi Taarih/Zaman objesine dönüştürür"
  },
  {
    id: "math-61",
    category: "Matematik",
    name: "Sıcaklık Birim Çevirici",
    description: "Girişteki sıcaklık birimini seçili sıcaklık birimine çevirir"
  },
  {
    id: "math-62",
    category: "Matematik",
    name: "Tanjant",
    description: "Girişteki numerik veriyi çıkışa tanjant olarak çevirir"
  },
  {
    id: "math-63",
    category: "Matematik",
    name: "Tarih/EPOCH",
    description: "Girdi olarak gelen Tarih/Zaman objesini UNİX zaman damgasına çevirir"
  },
  {
    id: "math-64",
    category: "Matematik",
    name: "Tarih/ Zaman",
    description: "Girdi olarak gelen Tarih/ zaman objesini belirttiğiniz formattaki yazıya dönüştürür"
  },
  {
    id: "math-65",
    category: "Matematik",
    name: "Tarih Zaman",
    description: "Şimdilik zaman taarih objesi olarak döndürür"
  },
  {
    id: "math-66",
    category: "Matematik",
    name: "Toplam",
    description: "iki sayısal değer toplar"
  },
  {
    id: "math-67",
    category: "Matematik",
    name: "Uzunluk birim çevirici",
    description: "Girişteki uzunluk cinsini seçili uzunluk cinsine çevirir"
  },
  {
    id: "math-68",
    category: "Matematik",
    name: "yüzde",
    description: "Girişteki değerin yüzddesini alır"
  },
  {
    id: "math-69",
    category: "Matematik",
    name: "Yıl",
    description: "Hangi yılda olduğumuzu numeric olarak döndürür"
  },
  {
    id: "math-70",
    category: "Matematik",
    name: "Zaman Ayarla",
    description: "Girdi olarak gelen Tarih/ Zaman objesinin bir özelliğine belirttiğiniz türden bir zaman set eder. Örnek Tarihin saniysinin 12 olarak ayarlayabilirsiniz"
  },
  {
    id: "math-71",
    category: "Matematik",
    name: "Zaman Damgası",
    description: "1 ocak 1970 ' ten beri geçen saniye sayısı"
  },
  {
    id: "math-72",
    category: "Matematik",
    name: "Zaman ekle/ çıkar",
    description: "Girdi olarak gelen Tarih/ Zaman objesine belirttiğiniz türden bir zamana ekler. örnek tarihe 4 gün ekleyip çıkartaabilirsiniz negatif girdiler çıkarma yapar pozitifler ekleme"
  },
  {
    id: "math-73",
    category: "Matematik",
    name: "Çarpma",
    description: "iki sayısal değeri birbiriyle çarpar"
  },
  {
    id: "math-74",
    category: "Matematik",
    name: "Çıkarma",
    description: "İki sayısal değeri birbirinden çıkarır"
  },
  {
    id: "math-75",
    category: "Matematik",
    name: "Üst",
    description: "sayısal bir değerin kuvvetini alır"
  },
  {
    id: "math-76",
    category: "Matematik",
    name: "İnsan/ Sayaç Dedektörü Tipi",
    description: "İnsan sayısı verisini tip doğrulamasınını yapabilirsiniz.Bool tipinde çıkış üretir"
  },
  {
    id: "math-77",
    category: "Matematik",
    name: "insan /Sayaç Dedektör Ölçüm",
    description: "Girişten gelen insan sayacının spesifik bir özelliğini seçip çıktı olarak verir sayısal çıktı üretir geçersiz verilere -1 olarak döner"
  },

  // Aksiyon
  {
    id: "act-1",
    category: "Aksiyonlar",
    name: "Bildirim Gönde",
    description: "Beliritlen kullanıcılara bildirim gönderir"
  },
  {
    id: "act-2",
    category: "Aksiyonlar",
    name: "Ble Sabir SoS",
    description: "Bir Ble tagi bir zamanda beliritlen süre kadar hareketsiz duruyorsa alarm üret. Kural Periyodik Görevlerle belirili aralıklarla çalışmak  zorundadır"
  },
  {
    id: "act-3",
    category: "Aksiyonlar",
    name: "BlueBot Çalıştır",
    description: "Bu kural içerisinden başka bir blue bot kuralını tetikler"
  },
  {
    id: "act-4",
    category: "Aksiyonlar",
    name: "Chaz Arıza Seti",
    description: "Bir cihazı sanal olarak genel arıa durumuna sokabiliriz"
  },
  {
    id: "act-5",
    category: "Aksiyonlar",
    name: "Discord Mesajı",
    description: "Bir discord kanalına mesaj gönderebilirsiniz"
  },
  {
    id: "act-6",
    category: "Aksiyonlar",
    name: "Darco Analog sot",
    description: "Bir draco girişine , program içerisindeki bir değeri ayarlar"
  },
  {
    id: "act-7",
    category: "Aksiyonlar",
    name: "Darco Sayaç Seti",
    description: "Darco Girişinin sayacını belirlemiş olduğunuz değere set eder"
  },
  {
    id: "act-8",
    category: "Aksiyonlar",
    name: "Darco Çıkış",
    description: "Portaldaki bir noktanın değerinin değiştirir"
  },
  {
    id: "act-9",
    category: "Aksiyonlar",
    name: "Geçerli Bölge Kameraları",
    description: "Tetikleyici bir bölgeye eşleşiyorsa veilgili bölgede kamera layoutları varsa ekrana getirir"
  },
  {
    id: "act-10",
    category: "Aksiyonlar",
    name: "Ham Soket",
    description: "Soket Üzerinden TCP/UDP UTF-8 mesaj gönderir"
  },
  {
    id: "act-11",
    category: "Aksiyonlar",
    name: "Kamera Görünüm Ayarla",
    description: "bir kamera görünümü ekrana getirir"
  },
  {
    id: "act-12",
    category: "Aksiyonlar",
    name: "Kamera olayı üret",
    description: "Destekleyen kameralara için belirttiğiniz isimde bir olay üretebilirsiniz"
  },
  {
    id: "act-13",
    category: "Aksiyonlar",
    name: "MQTT Gönder",
    description: "Uzak bir mqtt brokera msaj gönder"
  },
  {
    id: "act-14",
    category: "Aksiyonlar",
    name: "Mail Gönder",
    description: "kendi smtp sunucunuz üzerinden mail gönderebilirsiniz"
  },
  {
    id: "act-15",
    category: "Aksiyonlar",
    name: "Metin Referansı Gğncelle",
    description: "Portaldaki bir .cihazın metin referansınıgünceller"
  },
  {
    id: "act-16",
    category: "Aksiyonlar",
    name: "NoVif Recoder",
    description: "Novif adaptor tarfından sürülen kameralardan görüntü kayıtlarını email olarak gönderir"
  },
  {
    id: "act-17",
    category: "Aksiyonlar",
    name: "Portal Değişken Set",
    description: "Porta tanımlı bir sanal değişkenin değerini günceller"
  },
  {
    id: "act-18",
    category: "Aksiyonlar",
    name: "Rest Api Soket",
    description: "HTTP protokolü ile uzak bir sistem ile iletişim kurabilirsiniz"
  },
  {
    id: "act-19",
    category: "Aksiyonlar",
    name: "Slac mesajı",
    description: "Bi Slac kanalına mesaj gönderebilirsiniz"
  },
  {
    id: "act-20",
    category: "Aksiyonlar",
    name: "Telegram /Mesajı",
    description: "Bir telegram gurubuna mesaj göndermenizi sağlar"
  },
  {
    id: "act-21",
    category: "Aksiyonlar",
    name: "Temizlik Anketi Sıfırla",
    description: "otomatik olarak anket sonuçlarını sıfırlar"
  },
  {
    id: "act-22",
    category: "Aksiyonlar",
    name: "Wake on The Lan",
    description: "Bir vekil cihaz aracılığıyla uzak bir bilgisayarı uyandırmak için kullanır"
  },
  {
    id: "act-23",
    category: "Aksiyonlar",
    name: "İş Emri Oluştur",
    description: "Bir kurala Bağlı olarak iş emri üretmenizi sağlar"
  },
  {
    id: "act-24",
    category: "Aksiyonlar",
    name: "İş Emri Süreci",
    description: "Bir iş emri sürecinin değiştirebilrisiniz"
  },
  {
    id: "act-25",
    category: "Aksiyonlar",
    name: "İş Emrini Kaptır",
    description: "İş Emri Tipindeki nesneyi kapatır"
  }
];
