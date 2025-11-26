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

export interface SiteMetadata {
    lastUpdate: string;
    disclaimers: string[];
    donationLink?: string;
}

export interface SellersData {
    sellers: Seller[];
    metadata: SiteMetadata;
}

export async function getSellers(): Promise<SellersData> {
    if (!GOOGLE_SHEET_CSV_URL) {
        console.error('GOOGLE_SHEET_CSV_URL environment variable is not set');
        return {
            sellers: [],
            metadata: { lastUpdate: '', disclaimers: [] }
        };
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

        const sellers: Seller[] = [];
        const metadata: SiteMetadata = {
            lastUpdate: '',
            disclaimers: [],
        };

        data.forEach((row: any) => {
            const col1 = row['Column 1'];

            // Check for metadata rows
            if (col1) {
                if (col1.startsWith('Bu liste zaman zaman güncellenecektir')) {
                    metadata.lastUpdate = col1;
                    return;
                }
                if (col1.startsWith('Listede bulunan hiçbir firma') || col1.startsWith('Liste siralamasi tamamiyle')) {
                    metadata.disclaimers.push(col1);
                    return;
                }
                if (col1.startsWith('Bu listeyi hazirlayanlara kahve')) {
                    metadata.donationLink = row['Pokemon Japonca']; // The link is in the 3rd column (index 2) based on CSV structure
                    return;
                }
            }

            // Normal seller row
            if (row['Sitesi'] && row['Sitesi'].trim() !== '') {
                sellers.push({
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
                });
            }
        });

        return { sellers, metadata };
    } catch (error) {
        console.error('Error fetching sellers:', error);
        return {
            sellers: [],
            metadata: { lastUpdate: '', disclaimers: [] }
        };
    }
}
