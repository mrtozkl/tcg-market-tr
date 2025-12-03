import React from 'react';
import { ExternalLink, Github, Coffee } from 'lucide-react';
import { SiteMetadata } from '@/lib/data';

interface FooterProps {
    metadata?: SiteMetadata;
}

export default function Footer({ metadata }: FooterProps) {
    return (
        <footer className="mt-24 border-t border-white/10 bg-slate-950 pt-16 pb-8">
            <div className="container">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-white">Hakkımızda</h3>
                        <p className="text-muted-foreground leading-relaxed">
                            TCG Market Türkiye, Türkiye'deki TCG (Trading Card Game) koleksiyoncularını ve satıcılarını
                            bir araya getiren bağımsız bir rehberdir. Amacımız, koleksiyoncuların aradıkları kartlara
                            ve ürünlere en kolay şekilde ulaşmalarını sağlamaktır.
                        </p>
                        {metadata?.lastUpdate && (
                            <p className="text-sm text-slate-500 font-medium">
                                {metadata.lastUpdate}
                            </p>
                        )}
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-white">Veri Kaynağı</h3>
                        <p className="text-muted-foreground leading-relaxed">
                            Bu sitedeki veriler, topluluk tarafından yönetilen bir Google Sheet üzerinden
                            otomatik olarak çekilmektedir. Verilerin güncelliği ve doğruluğu topluluk katkılarıyla sağlanır.
                        </p>
                        <a
                            href="https://docs.google.com/spreadsheets/d/1NhCFUEdG6DuS1zxCTGYXNgiF9PJRT02HIj-Bh-a6y7M"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-primary hover:text-primary-hover transition-colors font-medium"
                        >
                            Google Sheet'i Görüntüle <ExternalLink className="w-4 h-4" />
                        </a>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-white">Yasal Uyarı</h3>
                        <p className="text-sm text-muted-foreground italic opacity-80">
                            Bu proje tamamen bilgilendirme amaçlıdır ve kar amacı gütmemektedir.
                            Listelenen satıcılarla herhangi bir ticari bağımız bulunmamaktadır.
                        </p>
                        {metadata?.disclaimers.map((disclaimer, index) => (
                            <p key={index} className="text-sm text-muted-foreground italic opacity-80">
                                {disclaimer}
                            </p>
                        ))}
                    </div>
                </div>

                <div className="pt-8 border-t border-white/10 flex flex-col items-center gap-6 text-center">
                    <p className="text-slate-500 text-sm">
                        &copy; {new Date().getFullYear()} TCG Market Türkiye. Topluluk için yapılmıştır.
                    </p>

                    <div className="flex flex-wrap justify-center gap-6">
                        <a
                            href="https://github.com/mrtozkl/tcg-market-tr"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
                        >
                            <Github className="w-4 h-4" /> GitHub'da İncele
                        </a>

                        {metadata?.donationLink && (
                            <a
                                href={metadata.donationLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-sm text-amber-500 hover:text-amber-400 transition-colors"
                            >
                                <Coffee className="w-4 h-4" /> Kahve Ismarla
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </footer>
    );
}
