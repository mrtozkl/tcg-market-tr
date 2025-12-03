import { Card } from '@/lib/scraper/types';
import { ImageOff, ExternalLink, Store } from 'lucide-react';

interface CardListProps {
    cards: any[]; // Using any for now as DB row type might differ slightly from Card interface
}

export default function CardList({ cards }: CardListProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards.map((card) => (
                <div key={card.id} className="group relative flex flex-col overflow-hidden rounded-xl border border-white/10 bg-card transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10">
                    <div className="relative aspect-[3/4] bg-white p-6 flex items-center justify-center border-b border-white/5 overflow-hidden">
                        {card.image_url ? (
                            <img
                                src={card.image_url}
                                alt={card.name}
                                className="w-full h-full object-contain drop-shadow-md transition-transform duration-500 group-hover:scale-110"
                                loading="lazy"
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full w-full text-slate-300">
                                <ImageOff className="w-12 h-12 mb-3 opacity-20" />
                                <span className="text-xs font-medium opacity-40">Görsel Yok</span>
                            </div>
                        )}
                        <div className="absolute top-3 right-3 bg-slate-950/90 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] font-bold text-white border border-white/10 shadow-lg z-10">
                            {card.game}
                        </div>
                    </div>

                    <div className="p-5 flex flex-col flex-1">
                        <div className="flex-1">
                            <h3 className="text-base font-bold text-white mb-3 line-clamp-2 group-hover:text-primary transition-colors" title={card.name}>
                                {card.name}
                            </h3>

                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                                <Store className="w-4 h-4 text-secondary" />
                                <span className="font-medium">{card.seller_name}</span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 pt-4 border-t border-white/5">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Fiyat</span>
                                <div className="text-xl font-bold text-primary">
                                    {card.price ? (
                                        <div className="flex items-baseline gap-1">
                                            {card.price} <span className="text-sm font-normal text-muted-foreground">{card.currency}</span>
                                        </div>
                                    ) : (
                                        <span className="text-muted-foreground text-lg">--</span>
                                    )}
                                </div>
                            </div>
                            <a
                                href={card.product_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg bg-primary text-white text-sm font-bold transition-all hover:bg-primary-hover hover:shadow-lg hover:shadow-primary/20 active:scale-95"
                            >
                                <span>Satın Al</span>
                                <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
