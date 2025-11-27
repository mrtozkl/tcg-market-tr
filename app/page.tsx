import { Suspense } from 'react';
import { getSellers, Seller } from '@/lib/data';
import SellerCard from '@/components/SellerCard';
import FilterSidebar from '@/components/FilterSidebar';
import Header from '@/components/Header';

import Footer from '@/components/Footer';

export default async function Home({
    searchParams,
}: {
    searchParams: { [key: string]: string | string[] | undefined };
}) {
    const { sellers: allSellers, metadata } = await getSellers();


    const filteredSellers = allSellers.filter((seller) => {
        // Iterate over all search params
        for (const [key, value] of Object.entries(searchParams)) {
            // If the param key is a valid key in Seller and the param is present
            if (key in seller && value === 'true') {
                // If the seller doesn't have this property as true, exclude them
                if (!seller[key as keyof Seller]) {
                    return false;
                }
            }
        }
        return true;
    });

    return (
        <main>
            <div className="container">
                <Header />
                <div className="main-layout">
                    <Suspense fallback={<div>Filtreler yükleniyor...</div>}>
                        <FilterSidebar />
                    </Suspense>
                    <div>
                        <div className="grid">
                            {filteredSellers.map((seller) => (
                                <SellerCard key={seller.name} seller={seller} />
                            ))}
                        </div>
                        {filteredSellers.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                                Aradığınız kriterlere uygun satıcı bulunamadı.
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <Footer metadata={metadata} />
        </main>
    );
}
