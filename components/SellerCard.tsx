import React from 'react';
import { Seller } from '@/lib/data';
import { MapPin, ExternalLink } from 'lucide-react';

interface SellerCardProps {
    seller: Seller;
}

export default function SellerCard({ seller }: SellerCardProps) {
    const tags = [
        seller.pokemon_en && 'Pokemon (EN)',
        seller.pokemon_jp && 'Pokemon (JP)',
        seller.pokemon_kr && 'Pokemon (KR)',
        seller.pokemon_cn && 'Pokemon (CN)',
        seller.onepiece_en && 'One Piece (EN)',
        seller.onepiece_jp && 'One Piece (JP)',
        seller.mtg && 'MTG',
        seller.riftbound_en && 'Riftbound (EN)',
        seller.riftbound_cn && 'Riftbound (CN)',
        seller.lorcana && 'Lorcana',
        seller.topps && 'TOPPS',
        seller.yugioh && 'Yu-Gi-Oh!',
    ].filter(Boolean) as string[];

    return (
        <div className="group relative flex flex-col overflow-hidden rounded-xl border border-white/10 bg-card transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10">
            <div className="p-6 flex-1">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors">
                            {seller.name}
                        </h3>
                        {seller.location && (
                            <div className="flex items-center gap-1.5 mt-1 text-sm text-muted-foreground">
                                <MapPin className="w-4 h-4" />
                                <span>{seller.location}</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-4">
                    {tags.map((tag) => (
                        <span key={tag} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                            {tag}
                        </span>
                    ))}
                </div>
            </div>

            <div className="p-4 border-t border-white/5 bg-white/5">
                <a
                    href={seller.website || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg bg-primary text-white font-medium transition-all hover:bg-primary-hover active:scale-95"
                >
                    <span>Satıcıyı Ziyaret Et</span>
                    <ExternalLink className="w-4 h-4" />
                </a>
            </div>
        </div>
    );
}
