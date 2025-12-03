# Deployment Guide

## Vercel Deployment

This project is a Next.js application and is ready to be deployed on Vercel.

### Prerequisites

1.  **Vercel Account**: Sign up at [vercel.com](https://vercel.com).
2.  **PostgreSQL Database**: You need a Postgres database. You can use Vercel Postgres or any other provider (Supabase, Neon, etc.).
3.  **Environment Variables**: You must set the following environment variables in your Vercel project settings:

    ```env
    POSTGRES_URL="postgres://user:password@host:port/database?sslmode=require"
    GOOGLE_SHEET_CSV_URL="your_google_sheet_csv_url"
    ```

### Steps

1.  **Push to Git**: Ensure your code is pushed to a Git repository (GitHub, GitLab, Bitbucket).
2.  **Import Project**: Go to Vercel Dashboard -> Add New -> Project -> Import your repository.
3.  **Configure Project**:
    -   Framework Preset: Next.js (should be detected automatically).
    -   Root Directory: `./`
    -   **Environment Variables**: Add the variables listed above.
4.  **Deploy**: Click "Deploy".

### Important Note on Scrapers

This project includes web scrapers in `lib/scraper` and scripts in `scripts/`.

-   **Puppeteer Scrapers**: Scrapers that use Puppeteer (Goblin Store, Tizy Cards, Card House, etc.) **will not run on Vercel's standard Serverless Functions** out of the box due to size limits and the lack of a Chromium binary.
    -   **Recommendation**: Run these scripts locally or on a VPS/dedicated server.
    -   **Alternative**: If you must run them on Vercel, you need to configure `puppeteer-core` and `@sparticuz/chromium`. This requires code changes.
-   **Fetch/Cheerio Scrapers**: Scrapers that use `fetch` or `cheerio` (Leno Cards, Gameland) **can** run on Vercel (e.g., in API routes or Cron Jobs).

## Running Scripts Locally

You can run the scraper scripts locally using `npx tsx`:

```bash
# Run a specific scraper loader
npx tsx scripts/load-goblin.ts
npx tsx scripts/load-lenocards.ts

# Run the cron job logic manually
npx tsx scripts/run-cron.ts
```

## Database Migration

If you are setting up a fresh database, run the migration script locally:

```bash
npx tsx scripts/migrate.ts
```
