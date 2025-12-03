import { Suspense } from 'react';
import { getSellers, Seller } from '@/lib/data';
import SellerCard from '@/components/SellerCard';
import FilterSidebar from '@/components/FilterSidebar';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const dynamic = 'force-dynamic';

export default async function Home({
    searchParams,
}: {
    searchParams: { [key: string]: string | string[] | undefined };
}) {
    const { sellers: allSellers, metadata } = await getSellers();

    const filteredSellers = allSellers.filter((seller) => {
        for (const [key, value] of Object.entries(searchParams)) {
            if (key in seller && value === 'true') {
                if (!seller[key as keyof Seller]) {
                    return false;
                }
            }
        }
        return true;
    });

    return (
        <main className="min-h-screen flex flex-col">
            <Header />

            {/* Hero Section */}
            <section className="relative pt-20 pb-32 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background pointer-events-none" />
                <div className="container relative z-10 text-center">
                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 animate-fade-in">
                        <span className="bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                            Türkiye'nin TCG
                        </span>
                        <br />
                        <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                            Pazar Yeri
                        </span>
                    </h1>
                    <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-slide-up">
                        En sevdiğiniz kart oyunları için güvenilir satıcıları keşfedin.
                        Pokemon, One Piece, Magic: The Gathering ve daha fazlası.
                    </p>
                </div>
            </section>

            <div className="container pb-20 flex-1">
                <div className="flex flex-col lg:flex-row gap-8">
                    <Suspense fallback={<div className="w-full lg:w-64 h-96 bg-card/50 animate-pulse rounded-xl" />}>
                        <FilterSidebar />
                    </Suspense>

                    <div className="flex-1">
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {filteredSellers.map((seller) => (
                                <SellerCard key={seller.name} seller={seller} />
                            ))}
                        </div>

                        {filteredSellers.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-white/10 rounded-xl bg-white/5">
                                <p className="text-lg font-medium text-slate-300">
                                    Aradığınız kriterlere uygun satıcı bulunamadı.
                                </p>
                                <p className="text-sm text-muted-foreground mt-2">
                                    Lütfen filtreleri temizleyip tekrar deneyin.
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
