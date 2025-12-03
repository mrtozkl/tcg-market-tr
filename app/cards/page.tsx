import { db } from '@/lib/db';
import CardList from '@/components/CardList';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getSellers } from '@/lib/data';
import SearchInput from '@/components/SearchInput';
import CardFilterSidebar from '@/components/CardFilterSidebar';
import Pagination from '@/components/Pagination';
import { Suspense } from 'react';

export const dynamic = 'force-dynamic';

export default async function CardsPage({
    searchParams,
}: {
    searchParams: { [key: string]: string | string[] | undefined };
}) {
    const { metadata } = await getSellers();
    const query = searchParams.q as string;
    const gameFilter = searchParams.game as string;
    const sellerFilter = searchParams.seller as string;
    const minPrice = searchParams.minPrice as string;
    const maxPrice = searchParams.maxPrice as string;
    const page = Number(searchParams.page) || 1;
    const pageSize = 24;
    const offset = (page - 1) * pageSize;

    // Fetch distinct games and sellers for filters
    let games: string[] = [];
    let sellers: string[] = [];
    try {
        const gamesResult = await db.query('SELECT DISTINCT game FROM cards ORDER BY game');
        games = gamesResult.rows.map((row: any) => row.game);

        const sellersResult = await db.query('SELECT DISTINCT seller_name FROM cards ORDER BY seller_name');
        sellers = sellersResult.rows.map((row: any) => row.seller_name);
    } catch (error) {
        console.error('Error fetching filter options:', error);
    }

    // Basic filtering logic
    let sqlQuery = 'SELECT * FROM cards';
    let countQuery = 'SELECT COUNT(*) FROM cards';
    const params: any[] = [];
    const conditions: string[] = [];

    if (query) {
        conditions.push(`name ILIKE $${params.length + 1}`);
        params.push(`%${query}%`);
    }

    if (gameFilter) {
        conditions.push(`game ILIKE $${params.length + 1}`);
        params.push(`%${gameFilter}%`);
    }

    if (sellerFilter) {
        conditions.push(`seller_name = $${params.length + 1}`);
        params.push(sellerFilter);
    }

    if (minPrice) {
        conditions.push(`price >= $${params.length + 1}`);
        params.push(minPrice);
    }

    if (maxPrice) {
        conditions.push(`price <= $${params.length + 1}`);
        params.push(maxPrice);
    }

    if (conditions.length > 0) {
        const whereClause = ' WHERE ' + conditions.join(' AND ');
        sqlQuery += whereClause;
        countQuery += whereClause;
    }

    sqlQuery += ` ORDER BY last_updated DESC LIMIT ${pageSize} OFFSET ${offset}`;

    let cards: any[] = [];
    let totalItems = 0;
    try {
        const [cardsResult, countResult] = await Promise.all([
            db.query(sqlQuery, params),
            db.query(countQuery, params)
        ]);
        cards = cardsResult.rows;
        totalItems = parseInt(countResult.rows[0].count, 10);
    } catch (error) {
        console.error('Error fetching cards:', error);
        // Fallback to empty array if table doesn't exist yet
    }

    const totalPages = Math.ceil(totalItems / pageSize);

    return (
        <main className="min-h-screen flex flex-col">
            <Header />

            <div className="relative pt-32 pb-20 overflow-hidden">
                <div className="absolute inset-0 bg-slate-950">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-violet-500/10 via-slate-950 to-slate-950" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-cyan-500/10 via-slate-950 to-slate-950" />
                </div>

                <div className="container relative z-10">
                    <div className="flex flex-col lg:flex-row gap-8 lg:items-end justify-between">
                        <div className="max-w-2xl">
                            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
                                Kart Pazarı
                            </h1>
                            <p className="text-lg text-muted-foreground leading-relaxed">
                                Türkiye'nin en geniş TCG koleksiyonunu keşfedin. Nadir kartları bulun, fiyatları karşılaştırın ve koleksiyonunuzu tamamlayın.
                            </p>
                        </div>
                        <div className="w-full lg:w-auto lg:min-w-[400px]">
                            <SearchInput />
                        </div>
                    </div>
                </div>
            </div>

            <div className="container pb-20 -mt-8 relative z-20">
                <div className="flex flex-col lg:flex-row gap-8">
                    <Suspense fallback={<div className="w-full lg:w-64 h-96 bg-card/50 animate-pulse rounded-xl" />}>
                        <CardFilterSidebar games={games} sellers={sellers} />
                    </Suspense>

                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
                            <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                                <span className="text-sm font-medium text-muted-foreground">
                                    <span className="text-white font-bold">{totalItems}</span> kart listeleniyor
                                </span>
                            </div>
                            {/* Future: Add Sort/Filter dropdowns here */}
                        </div>

                        {cards.length > 0 ? (
                            <>
                                <CardList cards={cards} />
                                <Pagination currentPage={page} totalPages={totalPages} />
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-24 px-4 text-center rounded-3xl border border-white/5 bg-white/5 backdrop-blur-sm">
                                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-900/50 mb-6 border border-white/5">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-muted-foreground opacity-50">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3">
                                    {query ? `"${query}" için sonuç bulunamadı` : 'Henüz kart listelenmemiş'}
                                </h3>
                                <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
                                    {query ? 'Farklı anahtar kelimelerle aramayı deneyin veya yazım hatası olup olmadığını kontrol edin.' : 'Veritabanı güncellendiğinde kartlar burada görünecek.'}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <Footer metadata={metadata} />
        </main>
    );
}
