# TCG Market Türkiye

Bu proje, Türkiye'deki TCG (Trading Card Game) satıcılarını listeyen bir Next.js uygulamasıdır.

## Kurulum

1. Bağımlılıkları yükleyin:
   ```bash
   npm install
   ```

2. Geliştirme sunucusunu başlatın:
   ```bash
   npm run dev
   ```

3. Tarayıcınızda [http://localhost:3000](http://localhost:3000) adresine gidin.

## Deployment

### Vercel

1. Push your code to a Git repository (GitHub, GitLab, Bitbucket).
2. Import the project into Vercel.
3. In the "Configure Project" step, add the following **Environment Variable**:
   - Name: `GOOGLE_SHEET_CSV_URL`
   - Value: `https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/export?format=csv&gid=0` (Use your actual Google Sheet CSV export URL)
4. Click **Deploy**.

## Özellikler

- **Satıcı Listesi**: Google Sheets verilerinden çekilen satıcılar.
- **Filtreleme**: Sol menüden oyun ve dil bazlı filtreleme yapabilirsiniz.
- **Premium Tasarım**: Modern, karanlık mod arayüzü.

## Veri Güncelleme

Veriler `public/sellers.csv` dosyasında tutulmaktadır. Bu dosyayı güncelleyerek siteyi güncelleyebilirsiniz.
