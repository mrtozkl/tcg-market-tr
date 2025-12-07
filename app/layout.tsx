import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
    metadataBase: new URL('https://tcg-market-tr.vercel.app'),
    title: {
        default: 'TCG Market Türkiye | Kart Pazarı',
        template: '%s | TCG Market Türkiye'
    },
    description: 'Türkiye\'nin en büyük TCG kart pazarı. Pokemon, One Piece, Magic: The Gathering ve daha fazlası için güvenilir satıcıları ve en uygun fiyatları bulun.',
    keywords: ['TCG', 'Kart Oyunu', 'Pokemon Kartları', 'Magic The Gathering', 'One Piece Card Game', 'Türkiye', 'Kart Satışı', 'Koleksiyon'],
    authors: [{ name: 'TCG Market Türkiye' }],
    creator: 'TCG Market Türkiye',
    openGraph: {
        type: 'website',
        locale: 'tr_TR',
        url: 'https://tcg-market-tr.vercel.app',
        title: 'TCG Market Türkiye | Kart Pazarı',
        description: 'Türkiye\'nin en büyük TCG kart pazarı. Nadir kartları bulun, fiyatları karşılaştırın.',
        siteName: 'TCG Market Türkiye',
        images: [
            {
                url: '/og-image.png', // Needs to be added to public folder or generated
                width: 1200,
                height: 630,
                alt: 'TCG Market Türkiye'
            }
        ]
    },
    twitter: {
        card: 'summary_large_image',
        title: 'TCG Market Türkiye | Kart Pazarı',
        description: 'Türkiye\'nin en büyük TCG kart pazarı.',
        images: ['/og-image.png'], // Needs to be added
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="tr">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            '@context': 'https://schema.org',
                            '@type': 'WebSite',
                            name: 'TCG Market Türkiye',
                            url: 'https://tcg-market-tr.vercel.app',
                            description: 'Türkiye\'nin en büyük TCG kart pazarı.',
                            potentialAction: {
                                '@type': 'SearchAction',
                                target: 'https://tcg-market-tr.vercel.app/cards?q={search_term_string}',
                                'query-input': 'required name=search_term_string',
                            },
                        }),
                    }}
                />
            </head>
            <body>{children}</body>
        </html>
    );
}
