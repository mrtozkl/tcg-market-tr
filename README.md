# TCG Market Türkiye

![TCG Market Türkiye Banner](https://via.placeholder.com/1200x300/0f172a/8b5cf6?text=TCG+Market+T%C3%BCrkiye)

[![Vercel Deploy](https://deploy-badge.vercel.app/vercel/tcg-market-tr)](https://tcg-market-tr.vercel.app/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Türkiye'deki TCG (Trading Card Game) koleksiyoncuları için kapsamlı pazar yeri ve satıcı rehberi. Pokemon, One Piece, Magic: The Gathering ve daha fazlası için en uygun fiyatları bulun.

🔗 **Canlı Site:** [https://tcg-market-tr.vercel.app/](https://tcg-market-tr.vercel.app/)

## 🌟 Özellikler

- **Otomatik Fiyat Takibi:** 10+ farklı satıcıdan (Goblin, Overgame, Pegasus, vb.) günlük fiyat ve stok verisi çeker.
- **Geniş Veritabanı:** 4000+ kart ve ürün verisi.
- **Akıllı Arama:** Kart adına, oyuna veya satıcıya göre anlık arama.
- **En Ucuz Fiyat:** Aynı kartı satan satıcıları karşılaştırarak en uygun fiyatı gösterir.
- **Responsive Tasarım:** Mobil ve masaüstü uyumlu modern arayüz.

## 🛍️ Desteklenen Satıcılar

Proje aşağıdaki satıcılardan veri çekmektedir:

- **Goblin Store** (Pokemon, MTG, One Piece)
- **Overgame** (Pokemon, MTG)
- **Pegasus Oyuncak** (Pokemon, MTG, One Piece)
- **Leno Cards** (Pokemon)
- **Gameland** (Pokemon)
- **Gizala** (Pokemon)
- **Kollektit** (Pokemon)
- **Card Dunyasi** (Pokemon)
- **Tizy Cards** (Pokemon, MTG)
- **Card House** (Pokemon, MTG)
- **Mythos Cards** (Çeşitli)
- **Gorilla Custom Cards** (Pokemon, MTG)

## 🚀 Kurulum

Projeyi yerel ortamınızda çalıştırmak için:

### Gereksinimler

- Node.js 18+
- PostgreSQL Veritabanı

### Adımlar

1.  **Depoyu Klonlayın:**
    ```bash
    git clone https://github.com/kullaniciadi/tcg-market-tr.git
    cd tcg-market-tr
    ```

2.  **Bağımlılıkları Yükleyin:**
    ```bash
    npm install
    ```

3.  **Ortam Değişkenlerini Ayarlayın:**
    `.env.local` dosyası oluşturun ve aşağıdaki değişkenleri ekleyin:
    ```env
    POSTGRES_URL="postgres://user:password@host:port/database?sslmode=require"
    GOOGLE_SHEET_CSV_URL="google_sheet_csv_url"
    ```

4.  **Veritabanını Hazırlayın:**
    Tabloları oluşturmak için migration scriptini çalıştırın:
    ```bash
    npx tsx scripts/migrate.ts
    ```

5.  **Uygulamayı Başlatın:**
    ```bash
    npm run dev
    ```

## 🕷️ Scraper Kullanımı

Veri çekme işlemleri `scripts/` klasöründeki scriptler ile yapılır.

```bash
# Örnek: Goblin Store verilerini çek
npx tsx scripts/load-goblin.ts

# Örnek: Tüm cron job mantığını çalıştır
npx tsx scripts/run-cron.ts
```

Detaylı bilgi için [scripts/README.md](scripts/README.md) dosyasına bakabilirsiniz.

## 📦 Deployment (Vercel)

Bu proje Vercel üzerinde çalışmaya hazırdır. Detaylı deployment rehberi için **[DEPLOY.md](DEPLOY.md)** dosyasını inceleyin.

**Önemli Not:** Puppeteer tabanlı scraperlar (Goblin, Tizy vb.) Vercel üzerinde doğrudan çalışmaz. Bu scraperları yerel makinenizde veya bir VPS üzerinde zamanlanmış görev (cron job) olarak çalıştırmanız önerilir.

## 🤝 Katkıda Bulunma

1.  Forklayın
2.  Branch oluşturun (`git checkout -b feature/yeni-ozellik`)
3.  Commit atın (`git commit -m 'Yeni özellik: X'`)
4.  Pushlayın (`git push origin feature/yeni-ozellik`)
5.  Pull Request açın

## 📄 Lisans

MIT License
