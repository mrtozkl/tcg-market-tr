import Papa from 'papaparse';

export interface Seller {
    name: string;
    website: string;
    location: string;
    pokemon_en: boolean;
    pokemon_jp: boolean;
    pokemon_kr: boolean;
    pokemon_cn: boolean;
    onepiece_en: boolean;
    onepiece_jp: boolean;
    mtg: boolean;
    riftbound_en: boolean;
    riftbound_cn: boolean;
    lorcana: boolean;
    topps: boolean;
    yugioh: boolean;
}

const BOOLEAN_MAP: Record<string, boolean> = {
    'Evet': true,
    'Hayir': false,
    '?': false, // Treat unknown as false for now
};

const GOOGLE_SHEET_CSV_URL = process.env.GOOGLE_SHEET_CSV_URL;

export async function getSellers(): Promise<Seller[]> {
    if (!GOOGLE_SHEET_CSV_URL) {
        console.error('GOOGLE_SHEET_CSV_URL environment variable is not set');
        return [];
    }

    try {
        const response = await fetch(GOOGLE_SHEET_CSV_URL, { next: { revalidate: 60 } }); // Revalidate every 60 seconds

        if (!response.ok) {
            throw new Error(`Failed to fetch data: ${response.statusText}`);
        }

        const fileContent = await response.text();

        const { data } = Papa.parse(fileContent, {
            header: true,
            skipEmptyLines: true,
        });

        return data
            .filter((row: any) => row['Sitesi'] && row['Sitesi'].trim() !== '') // Filter out rows without a website (footer/disclaimer rows)
            .map((row: any) => ({
                name: row['Column 1'],
                website: row['Sitesi'],
                location: row['Dukkani'],
                pokemon_en: BOOLEAN_MAP[row['Pokemon Ingilizce']] || false,
                pokemon_jp: BOOLEAN_MAP[row['Pokemon Japonca']] || false,
                pokemon_kr: BOOLEAN_MAP[row['Pokemon Korece']] || false,
                pokemon_cn: BOOLEAN_MAP[row['Pokemon Cince']] || false,
                onepiece_en: BOOLEAN_MAP[row['One Piece Ingilizce']] || false,
                onepiece_jp: BOOLEAN_MAP[row['One Piece Japonca']] || false,
                mtg: BOOLEAN_MAP[row['Magic: The Gathering']] || false,
                riftbound_en: BOOLEAN_MAP[row['Riftbound Ingilizce']] || false,
                riftbound_cn: BOOLEAN_MAP[row['Riftbound Cince']] || false,
                lorcana: BOOLEAN_MAP[row['Lorcana']] || false,
                topps: BOOLEAN_MAP[row['TOPPS']] || false,
                yugioh: BOOLEAN_MAP[row['Yu-Gi-Oh!']] || false,
            }));
    } catch (error) {
        console.error('Error fetching sellers:', error);
        return [];
    }
}
