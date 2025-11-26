# TCG Market Türkiye

![TCG Market Türkiye Banner](https://via.placeholder.com/1200x300/0f172a/8b5cf6?text=TCG+Market+T%C3%BCrkiye)

[![Vercel Deploy](https://deploy-badge.vercel.app/vercel/tcg-market-tr)](https://tcg-market-tr.vercel.app/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Türkiye'deki TCG (Trading Card Game) koleksiyoncuları için kapsamlı satıcı rehberi. Pokemon, One Piece, Magic: The Gathering ve daha fazlası için güvenilir satıcıları bulun.

🔗 **Canlı Site:** [https://tcg-market-tr.vercel.app/](https://tcg-market-tr.vercel.app/)

## 🌟 Özellikler

- **Geniş Satıcı Ağı:** Türkiye genelindeki TCG satıcılarının güncel listesi.
- **Detaylı Filtreleme:** Oyuna (Pokemon, One Piece, MTG vb.) ve dile (İngilizce, Japonca vb.) göre filtreleme.
- **Canlı Veri:** Google Sheets entegrasyonu sayesinde anlık güncellenen veriler.
- **Responsive Tasarım:** Mobil, tablet ve masaüstü cihazlarla tam uyumlu modern arayüz.

## 🚀 Kurulum

Projeyi yerel ortamınızda çalıştırmak için aşağıdaki adımları izleyin:

### Gereksinimler

- Node.js 18+
- npm veya yarn

### Adımlar

1.  Depoyu klonlayın:
    ```bash
    git clone https://github.com/kullaniciadi/tcg-market-tr.git
    cd tcg-market-tr
    ```

2.  Bağımlılıkları yükleyin:
    ```bash
    npm install
    ```

3.  Ortam değişkenlerini ayarlayın:
    - `.env.example` dosyasının adını `.env.local` olarak değiştirin.
    - `GOOGLE_SHEET_CSV_URL` değerini kendi Google Sheet CSV linkinizle güncelleyin.

4.  Geliştirme sunucusunu başlatın:
    ```bash
    npm run dev
    ```

5.  Tarayıcınızda [http://localhost:3000](http://localhost:3000) adresine gidin.

## 📦 Deployment (Vercel)

Bu proje Vercel üzerinde çalışmak üzere optimize edilmiştir.

1.  Projenizi GitHub'a yükleyin.
2.  Vercel'de yeni bir proje oluşturun ve GitHub deponuzu seçin.
3.  **Environment Variables** kısmına aşağıdaki değişkeni ekleyin:
    - `GOOGLE_SHEET_CSV_URL`: Google Sheet CSV export linkiniz.
4.  **Deploy** butonuna tıklayın.

## 🤝 Katkıda Bulunma

Bu proje topluluk odaklıdır. Katkıda bulunmak isterseniz:

1.  Bu depoyu forklayın.
2.  Yeni bir branch oluşturun (`git checkout -b feature/yeni-ozellik`).
3.  Değişikliklerinizi yapın ve commit leyin (`git commit -m 'Yeni özellik eklendi'`).
4.  Branch'inizi pushlayın (`git push origin feature/yeni-ozellik`).
5.  Bir Pull Request oluşturun.

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için `LICENSE` dosyasına bakabilirsiniz.

---

<p align="center">
  Made with ❤️ for the TCG Community
</p>
