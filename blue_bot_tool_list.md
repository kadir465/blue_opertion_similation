**portal nesneleri:**


\-Açık İş Emirleri= Belirtilen kritelere göre iş emirlerini workorder enamuter tipinde döndürür

\-Bina/İnsan Sayısı= Spesifik bir bina sayı verisini döndürür boş bırakılırsa binery döndürülür . çıktı tipi:people\_count

\-Box Uç Nokta = Başka bir BlueBox nokta değerini döndürür.Nokta değeri boş geçilirse geçerli nokta varsayılan olarak kabul edilir

\-Bölge Olay Tipi= Portal Olay tipieşleşirse çıktı üretir

\- Cihaz Arızası= Kuralı tetikleyen cihazda arza varsa çıkış üretir.(Not Alarm varsa çıkış üretmez , sadece arıza durumunda çıkış üretir)

\-Cihaz Nota Tipi= Tetikleyici bir cihaz tipi ile eşleşiyorsa çıkış üretir

\-Cihaz Tipi= Tetikleyici bir cihaz tipi ile eşleşiyorsa çıkış üretir

\-Dijital Giriş= Boolean tipindeki girişler için kullanılır

\-Draco İnput= Bir giriş / çıkış nokktasının değerini döndürür

\-Draco Sayacı= Sayaç özelliği dijital inputların değerini döndürür

\-Geçerli Portal Objesi= kuralı tetikleyen obje

\-Geçerli Sanal Bölge= Kuralın tetiklendiği sanal bölge

\-HTTP Reguest Key= HTTP Body üzerinden bir veriyi string türünde alabilriz

\-HTTP Response Key= Rest api yanıtında bir obje değeri çekmeye yarar

\-kamera Alarmı= Guruba eklediğiniz kameralardan birinde hata varsa çıkış üretir

\-Notlar= Ekrana hatırlayıcı yorumlar ekleyebilriz

\-Obje/Bölge= Belirttiğiniz objelerden herhangi bir seçili bölgede bulunuyorsa , bileşen çıkışı üretir

\-Olay Tipi=Zaten tetiklenmiş olan programın hangi olay tipi ile tetiklendiğini gösterir

\-Portal Değişkeni=Portalda anımlı bir sanal değişkenin değerini döndürür

\-Portal Metin Referansı=Portalda bir cihazdan gelen metin referans noktalarının değerini getirir

\-RTLS Bölge Envanter Sayısı= Bölgede bulunan insan harici envanter sayısı

\-RTLS Bölge Toplam Sayısı= Bölgede bulunan tüm takip edilebilir objelerin sayısını verir

\-RTLS Bölge insan sayısı= Bölgede Bulunan İnsan sayısı

\-RestAPi/Response=Uzak bir sunucuya rest api sorgusu yapar ve http\_rsponse tipinde çıktı üretir

\-Temizlik Anket Seçenek Değeri=temizlik görevinde kulalnılan anket tabletinin seçenek değerini döndürür

\-Teknik Sayı Değeri= Kuralı tetikleen noka sayısı bir değere saipse,ilgili değer döndürülür

\-Yangın Dedektörü Alarmı=Gruba eklediiniz yangın dedktörlerinden birinde alarm varsa çıkış üretir

\-İnan Sayaç Dedktörü= spesifik bir dedktör döndürür boş bırakılırsa tetikleyici dedktörü döndürür.çıktı tipi: people\_count

\-İnsan/Sayaç (Bölge/Bina Sayısı)=Belirli bi bölge veya inanın insan sayım sonucunun numeric olarakdöndürür.. geçersiz veriler -1 olarak döner

\-iş Emri(UUID) = UUID değeri ile portalda bir iş emrini getirir





**Operatörler:**



\-And Gate= Mantıksal ve kapısı

\-Bool seçici= Seçici girişin durumuna göre giriş çıkış yönlendirir

\-Karşılaştırıcı= İki Sayısal değeri birbiriyle karşılaştırır

\-Nand Kapısı= Mantıksal ve değil Kapısı

\-Nor Kapısı=Mantıksal veya değil kapısı

\-Not Gate=Mantıksal Değil Kapısı

\-Numerik Seçici= Seçici girişin durumuna göre giriş çıkışa yönlendirir

\-Or Gate=Mantıksal veya kapısı

\-String Seçici=Bir Bool değere göre birinci veya ikinci inputtdaki string çıkışa aktarır

\-XNoR Gate=Mantıksal özel veya değil kapısı

\-XoR Gate= Mantıksal Özel Veya kapısı







**Matematik:**



\-Ark Kosinüs=Girişteki numerik veriyi çıkışa ark kosünüs olarak çevirir

\-Ark Sinüs=Girişteki numerik veriyi çıkışa ark sinüs olark çevirir

\-Ark Tanjant=Girişteki numerik veriyi çıkışa ark tanjant olarak çevirir

\-Ay Numarası= Hangi ayda olduğunuzu numeric olarak gönder

\-Açı Dönüştürücü= Girişteki açı cinsini seçil açı cinsin çevirir

\-Bar/Yükseklik= Girişteki bar tipindeki basıncı, metre tipinde sıvı yüksekliğine çevirir

\-Base64 Decoder/Encode =Bir Stringi Base64' e çevirir veya çözer

\-Basınç Birim Çevirici= Seçili giriş basınç birimini seçili basınç birimine çevirir

\-Binary Sitring /sayı = Bir binary string sayısı dönüştürür

\-Bit= Sabit bit değeri

\-Bits/Byte Dönüştürücü= 8- bitlik değeri 1 byte a dönüştürür

\-Bool/String = Bool tipindeki veriyi stringe dönüştürür

\-Boolean/Sayı Dönüştürücü= Girişteki binary değeri numerik değere dönüştürür

\-Byte/Bit Dönüştürücü=Girişteki byte değerin binary sisteme çevirip, seçili bitin değerini döndürür

\-Bölme=İki sayısal değeri bibirine böler

\-Ceil=işlev her zaman yuvarlar ve belirli bir sayıdan büyük veya ona eşit olan daha küçük tamsayıyı döndürür

\-Dakika=Sadece dakikayı numeric olarak döner

\-Epoch/Tarih= Girdi olarak gelen UNIX zaman damgası objesini Taarih /Zaman opjesine döndürür

\-Exp= e'nin üssünü hesaplar

\-Faktoriyel=Girişteki sayının faktöriyelini alarak çıkışa gönderir

\-Gamma Fonksiyonu=Gamma Fonksiyonu matematikte faktöriyel fonksiyonun karmaşık saylar ve tam sayı olmayan reel sayılar için genellemesi olan ir sonksiyondur .Г simgesiyle gösterilir

\-Gün Numarası= Ayın hangi günü olduğunu numeric olarak döner

\-Gün?= Şimdiki zamanı belirtiğiniz bir gün ile karşılaştırır

\-Haftasonu=Şimdiki zaman eğer hafta sonu ise çıkış üretir

\-Hash Fonksiyonu=Bir String belirttiğinz algoritma ie hashler

\-HexString/Sayı=Hexadecimal String sayıya çevirir

\-Hiperbolik Sinüs=Girişteki numerik veriyi çıkışa hiperbolik sinüs olarak çevirir

\-Kosinüs=Girişteki numerik veriyi çıkışa kosünüs olarak çevirir

\-Kök= Sayısal bir değerin n. dereceden kökünü alır

\-Logaritma=Giriş değerinin beliritlen tabanda algoritmasını alır

\-Menzil/Yüzde=Limitleri belli bir değer aralığı için, giriş değerini yüzdesel olarak çıkışa aktarır

\-Min/max= Seçtiğiniz davranış onksiyonuna göre iki değer karşılaştıraarak minimum veya maksimum olanı çıkışa aktarır

\-Mod =Girişteki değeri Mod Değerine alır

\-Mutlak Değer = Girişteki numeric verinin mutlak değerini alır

\-OBEB = iki tamsayının ortak bölenlerinin en büyüğünü Bulur

\-OKEK= İki tamsayının ortak katlarının en küçüğünü bulur

\-Pi= pi sayısını verir

\-Put string Char= Bir String in belirli bir noktasından başlayarak belirtilen miktarda karakter çekebilirsiniz

\-Rastgele=Belirtilen minium ve maksimum değer aralığında rastgele bir sayı üretir

\-Round=işlev , en yakın tam sayıya yuvarlanmış bir sayının değerini döndürür

\-Saat=Sadece saat numeric olarak döner

\-Sabit=Numeric Sabit değer

\-Sabit String= Ön tanımlı bir string objesini tanımamlarımız sağlar

\-Saniye=sadece saniyeyi numeric olarak döner

\-Sayı/ Binary String=Bir sayıyı binary stringe çevirir

\-Sayı/Boolean Dönüştürücü= Girişteki değeri binary değere dönüştürür

\-Sayı/HexString= Decimal bir değeri Hexadecimal stringe çevirir

\-Sayı/String= Sayısal bir veriyi stringe dönüştürür

\-Sinüs=Girişteki numerik veriyi çıkışa sinüs olarak çevirir

\-String Birleştir=İki Stringi birleştirip tek bir string çıkışı üretir

\-String Eşitlik=String türündeki bir nesneyi karşılaştırmaya yarar

\-String Includes=Yazı içinde geçen bir kelimeyi küçük/büyük harf bakmaksızın ara bulursan çıkışı üretir

\-String Küçük/Büyük= Yazıyı küçük veya büyük harf olarak değiştirrebilirz

\-String Length= Yazının uzunluğunu tam sayı cinsinden döndürür

\-String Reflector= İçin atanan değeri bir değişknede saklar . Buildera gidene kadar zincir şeklinde devam etmeli

\-String Replace=Yazı içinde geçen bir kelimeyi başka bir kelime ile değiştirebilirisizniz

\-String Splitter= Yazıyı belirtilen kelimelerin geçtiği yerlerdeen böler.Gelirttiğiniz indexi çeker

\-String /Bool = String Tipindeki giriş verisini bool tipinde çevirir

\-String /Sayı= String Tipindeki bir değeri sayısal değere dönüştürür

\-String /Tarih= Belirtilen formatta gelen yazı tipindeki objeyi Taarih/Zaman objesine dönüştürür

\-Sıcaklık Birim Çevirici= Girişteki sıcaklık birimini seçili sıcaklık birimine çevirir

\-Tanjant=Girişteki numerik veriyi çıkışa tanjant olarak çevirir

\-Tarih/EPOCH = Girdi olarak gelen Tarih/Zaman objesini UNİX zaman damgasına çevirir
-Tarih/ Zaman =Girdi olarak gelen Tarih/ zaman objesini belirttiğiniz formattaki yazıya dönüştürür

\-Tarih Zaman= Şimdilik zaman taarih objesi olarak döndürür

\-Toplam=iki sayısal değer toplar

\-Uzunluk birim çevirici= Girişteki uzunluk cinsini seçili uzunluk cinsine çevirir

\-yüzde=Girişteki değerin yüzddesini alır

\-Yıl =Hangi yılda olduğumuzu numeric olarak döndürür

\-Zaman Ayarla=Girdi olarak gelen Tarih/ Zaman objesinin bir özelliğine belirttiğiniz türden bir zaman set eder. Örnek Tarihin saniysinin 12 olarak ayarlayabilirsiniz

\-Zaman Damgası=1 ocak 1970 ' ten beri geçen saniye sayısı

\-Zaman ekle/ çıkar= Girdi olarak gelen Tarih/ Zaman objesine belirttiğiniz türden bir zamana ekler. örnek tarihe 4 gün ekleyip çıkartaabilirsiniz negatif girdiler çıkarma yapar pozitifler ekleme 

\-Çarpma= iki sayısal değeri birbiriyle çarpar

\-Çıkarma=İki sayısal değeri birbirinden çıkarır

\-Üst=sayısal bir değerin kuvvetini alır

\-İnsan/ Sayaç Dedektörü Tipi=İnsan sayısı verisini tip doğrulamasınını yapabilirsiniz.Bool tipinde çıkış üretir

\-insan /Sayaç Dedektör Ölçüm= Girişten gelen insan sayacının spesifik bir özelliğini seçip çıktı olarak verir sayısal çıktı üretir geçersiz verilere -1 olarak döner









**Aksiyon:**



\-Bildirim Gönde=Beliritlen kullanıcılara bildirim gönderir

\-Ble Sabir SoS= Bir Ble tagi bir zamanda beliritlen süre kadar hareketsiz duruyorsa alarm üret. Kural Periyodik Görevlerle belirili aralıklarla çalışmak  zorundadır

\-BlueBot Çalıştır=Bu kural içerisinden başka bir blue bot kuralını tetikler

\-Chaz Arıza Seti= Bir cihazı sanal olarak genel arıa durumuna sokabiliriz

\-Discord Mesajı=Bir discord kanalına mesaj gönderebilirsiniz

\-Darco Analog sot= Bir draco girişine , program içerisindeki bir değeri ayarlar

\-Darco Sayaç Seti= Darco Girişinin sayacını belirlemiş olduğunuz değere set eder

\-Darco Çıkış=Portaldaki bir noktanın değerinin değiştirir

\-Geçerli Bölge Kameraları =Tetikleyici bir bölgeye eşleşiyorsa veilgili bölgede kamera layoutları varsa ekrana getirir

\-Ham Soket=Soket Üzerinden TCP/UDP UTF-8 mesaj gönderir

\-Kamera Görünüm Ayarla=bir kamera görünümü ekrana getirir

\-Kamera olayı üret=Destekleyen kameralara için belirttiğiniz isimde bir olay üretebilirsiniz

\-MQTT Gönder=Uzak bir mqtt brokera msaj gönder

\-Mail Gönder=kendi smtp sunucunuz üzerinden mail gönderebilirsiniz

\-Metin Referansı Gğncelle=Portaldaki bir .cihazın metin referansınıgünceller

\-NoVif Recoder=Novif adaptor tarfından sürülen kameralardan görüntü kayıtlarını email olarak gönderir

Portal Değişken Set=Porta tanımlı bir sanal değişkenin değerini günceller

\-Rest Api Soket=HTTP protokolü ile uzak bir sistem ile iletişim kurabilirsiniz

\-Slac mesajı= Bi Slac kanalına mesaj gönderebilirsiniz

\-Telegram /Mesajı= Bir telegram gurubuna mesaj göndermenizi sağlar

\-Temizlik Anketi Sıfırla=otomatik olarak anket sonuçlarını sıfırlar

\-Wake on The Lan= Bir vekil cihaz aracılığıyla uzak bir bilgisayarı uyandırmak için kullanır

\-İş Emri Oluştur= Bir kurala Bağlı olarak iş emri üretmenizi sağlar

\-İş Emri Süreci= Bir iş emri sürecinin değiştirebilrisiniz

\-İş Emrini Kaptır= İş Emri Tipindeki nesneyi kapatır































































