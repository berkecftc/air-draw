# 🌌 Neon Air Draw — AI Spatial Canvas

[![Live Demo](https://img.shields.io/badge/demo-online-brightgreen?style=for-the-badge)](https://air-draw-ecru.vercel.app/)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/react-%2320232d.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![CSS3](https://img.shields.io/badge/css3-%231572B6.svg?style=for-the-badge&logo=css3&logoColor=white)

🚀 **Canlı Demo (Live Demo):** [air-draw-ecru.vercel.app](https://air-draw-ecru.vercel.app/)

**Neon Air Draw**, yapay zeka tabanlı el takip (hand-tracking) teknolojisini kullanarak tarayıcınız üzerinden havada çizim yapmanızı sağlayan, fütüristik tasarıma sahip gerçek zamanlı bir web uygulamasıdır. 

*A high-performance, real-time AI-powered drawing web application that allows users to draw in the air using their webcam and hand tracking, inspired by the "Minority Report" style spatial HUDs.*

---

## ✨ Özellikler / Features

- 🛸 **AI Destekli El Takibi (AI-Powered Hand Tracking):** Ekstra donanıma ihtiyaç duymadan, yalnızca bilgisayarınızın web kamerası aracılığıyla parmaklarınızı 21 farklı eklem noktasından takip eder.
- 🎨 **Dinamik Fütüristik Temalar (Dynamic UI Themes):** 3 farklı neon teması arasında dilediğiniz an geçiş yapabilirsiniz:
  - **Neon Dark (Cyberpunk):** Canlı pembe ve turkuaz tonlarında koyu cam arayüzü.
  - **Cyberpunk Gold (Amber):** Endüstriyel koyu turuncu ve altın tonları.
  - **Deep Ocean (Teal):** Derin okyanus mavisi ve su yeşili tonları.
- 🖌️ **Gelişmiş Fırça Türleri (Advanced Brush Modes):**
  - **Düz Fırça (Solid):** Net ve kararlı çizgiler.
  - **Neon Işıltı (Glow):** Arkasında neon ışığı yansıması bırakan parlayan çizgiler.
  - **Kaligrafi (Calligraphy):** Elinizin hareket hızına göre dinamik kalınlığı değişen fırça.
  - **Gökkuşağı (Rainbow):** Çizim esnasında renk değiştiren dinamik gradyan fırça.
- 🖐️ **Temassız Jest Kontrolleri (Spatial Gesture Controls):** Tuşlara dokunmadan çizim yapabilir, silebilir ve temayı havada değiştirebilirsiniz.
- ⏱️ **Geri/İleri Al & Temizle (Undo/Redo & Clear):** 25 adıma kadar geçmiş hafızası ile çizimlerinizi geri alabilir veya ileri sarabilirsiniz.
- 💾 **Çizimi Kaydetme (Export Drawing):** Çizdiğiniz şaheserleri şeffaf arka planlı yüksek çözünürlüklü PNG formatında bilgisayarınıza indirebilirsiniz.

---

## 🖐️ Hareket Kontrol Rehberi / Spatial Gesture Guide

Uygulama, elinizin havada aldığı şekillere göre otomatik olarak mod değiştirir:

| El Hareketi (Gesture) | Eylem (Action) | Açıklama (Description) |
| :---: | :--- | :--- |
| **👆 Tek İşaret Parmağı** | **Çizim Modu (Draw)** | Yalnızca işaret parmağınızı uzatıp diğer parmakları kapattığınızda çizim yapar. |
| **🖐️ Açık Avuç İçi** | **Silgi Modu (Erase)** | Tüm parmaklarınızı açtığınızda avuç içiniz bir tahta silgisi gibi çalışarak çizimleri siler. |
| **✌️ Zafer / V İşareti** | **Tema Değiştir (Cycle Theme)** | İşaret ve orta parmağınızı açtığınızda arayüzün rengini ve temasını değiştirir (1.5 sn bekleme süreli). |
| **✋ El Yokken / Diğerleri** | **İmleç / Gezinme (Hover)** | Parmağınızı ekranda çizmeden gezdirebilir ve fırça boyutunu önizleyebilirsiniz. |

---

## 🛠️ Teknolojiler / Tech Stack

- **Framework:** React 19 + TypeScript + Vite
- **AI Engine:** Google MediaPipe Tasks-Vision (WASM & Palm/Hand Landmarker model)
- **Styling:** Vanilla CSS (Modern CSS Custom Properties, Frosted Glassmorphism, Neon glow filters)
- **Icons:** Lucide React
- **Model Yükleme:** Google CDN (Bant genişliğini ve depo boyutunu korumak amacıyla modeller dinamik olarak Google CDN sunucularından çekilir).

---

## 🚀 Kurulum ve Çalıştırma / Local Installation

Projeyi bilgisayarınızda yerel olarak çalıştırmak için aşağıdaki adımları takip edin:

### Gereksinimler
- Node.js (v18 ve üzeri)
- npm veya yarn paket yöneticisi

### 1. Depoyu Klonlayın veya İndirin
```bash
git clone <depo-adresi>
cd Web-app
```

### 2. Bağımlılıkları Yükleyin
```bash
npm install
```

### 3. Geliştirici Sunucusunu Başlatın
```bash
npm run dev
```
Terminal ekranında çıkan adresi (genellikle `http://localhost:5173`) tarayıcınızda açın. Tarayıcının kamera erişim iznini onayladıktan sonra elinizi kameraya göstererek havada çizmeye başlayabilirsiniz!

---

## 📦 Vercel ile Canlıya Alma / Deployment

Bu uygulama, Vercel üzerinde sıfır yapılandırma ile çalışabilecek şekilde tasarlanmıştır.

### Yöntem 1: Vercel CLI Kullanarak (En Hızlısı)
Eğer bilgisayarınızda Vercel CLI kurulu ise proje klasöründe şu komutu çalıştırmanız yeterlidir:
```bash
vercel
```
Çıkan soruları `Enter` tuşuna basarak varsayılan ayarlarla geçebilirsiniz.

### Yöntem 2: GitHub Entegrasyonu
1. Kodlarınızı kendi GitHub deponuza yükleyin.
2. [Vercel Dashboard](https://vercel.com/dashboard) sayfasına gidin.
3. **Add New > Project** seçeneğini tıklayın ve GitHub deponuzu içe aktarın.
4. Vercel, Vite + React projenizi otomatik olarak tanıyacaktır. **Deploy** butonuna tıklayarak yayına alabilirsiniz.

---

## 🧠 Algoritma ve Optimizasyonlar / Behind the Scenes

- **Koordinat Yumuşatma (EMA - Exponential Moving Average):** Kameradan gelen ham koordinat verilerindeki el titremelerini ve sapmaları engellemek için üstel hareketli ortalama filtresi kullanılmıştır. Bu sayede pürüzsüz ve akıcı çizgiler çizilir.
- **Performans Optimizasyonu:** Web kamerası görüntüsü doğrudan HTML5 Video elementiyle arka planda GPU destekli olarak aynalanır. El iskeleti ve çizimler ise iki ayrı katmanlı canvas üzerinde çizilerek render yükü minimuma indirilmiştir (60 FPS stabilite).
- **Aynalama Senkronizasyonu:** Kamera görüntüsü CSS yardımıyla aynalanırken, çizilen çizgiler JavaScript tarafında `(1 - x)` formülü ile simetrik olarak hesaplanır. Bu sayede çizim yaparken eliniz tam olarak ekranla senkronize hareket eder ve çiziminizi kaydettiğinizde ters yansımaz, tam olarak ekranda gördüğünüz şekilde kaydedilir.

---

*Geliştiren berkecftci. İyi çizimler!*
