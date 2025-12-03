export interface Card {
    seller_name: string;
    game: string;
    name: string;
    price: number | null;
    currency: string;
    image_url: string | null;
    product_url: string;
}

export interface Scraper {
    name: string;
    scrape(): Promise<Card[]>;
}
