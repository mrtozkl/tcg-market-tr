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
        <div className="card">
            <h3 className="card-title">{seller.name}</h3>
            <div className="card-location">
                <MapPin size={16} />
                <span>{seller.location}</span>
            </div>

            <div className="tags">
                {tags.map((tag) => (
                    <span key={tag} className="tag">
                        {tag}
                    </span>
                ))}
            </div>

            <a
                href={seller.website}
                target="_blank"
                rel="noopener noreferrer"
                className="visit-btn"
            >
                Siteye Git <ExternalLink size={16} style={{ display: 'inline', marginLeft: '4px' }} />
            </a>
        </div>
    );
}
