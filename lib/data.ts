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

const TRUTHY_VALUES = ['evet', 'yes', 'true', '1', 'var'];

function parseBoolean(value: string | undefined): boolean {
    if (!value) return false;
    const normalized = value.trim().toLowerCase();
    return TRUTHY_VALUES.includes(normalized);
}

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
                    pokemon_en: parseBoolean(row['Pokemon Ingilizce']),
                    pokemon_jp: parseBoolean(row['Pokemon Japonca']),
                    pokemon_kr: parseBoolean(row['Pokemon Korece']),
                    pokemon_cn: parseBoolean(row['Pokemon Cince']),
                    onepiece_en: parseBoolean(row['One Piece Ingilizce']),
                    onepiece_jp: parseBoolean(row['One Piece Japonca']),
                    mtg: parseBoolean(row['Magic: The Gathering']),
                    riftbound_en: parseBoolean(row['Riftbound Ingilizce']),
                    riftbound_cn: parseBoolean(row['Riftbound Cince']),
                    lorcana: parseBoolean(row['Lorcana']),
                    topps: parseBoolean(row['TOPPS']),
                    yugioh: parseBoolean(row['Yu-Gi-Oh!']),
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
