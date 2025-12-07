import { MetadataRoute } from 'next';
import { getSellers } from '@/lib/data';
import { db } from '@/lib/db';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://tcg-market-tr.vercel.app';

    // Static routes
    const routes = [
        '',
        '/cards',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: route === '' ? 1 : 0.8,
    }));

    // Dynamic routes from Sellers (using query params as planned)
    const { sellers } = await getSellers();
    const sellerRoutes = sellers.map((seller) => ({
        url: `${baseUrl}/cards?seller=${encodeURIComponent(seller.name)}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.6,
    }));

    // Dynamic routes from Games (using query params)
    let gameRoutes: MetadataRoute.Sitemap = [];
    try {
        const gamesResult = await db.query('SELECT DISTINCT game FROM cards');
        const games = gamesResult.rows.map((row: any) => row.game);

        gameRoutes = games.map((game: string) => ({
            url: `${baseUrl}/cards?game=${encodeURIComponent(game)}`,
            lastModified: new Date(),
            changeFrequency: 'daily' as const,
            priority: 0.7,
        }));
    } catch (error) {
        console.error('Error fetching games for sitemap:', error);
    }

    return [...routes, ...gameRoutes, ...sellerRoutes];
}
