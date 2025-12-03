import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load env vars
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    const envConfig = dotenv.parse(fs.readFileSync(envPath));
    for (const k in envConfig) {
        process.env[k] = envConfig[k];
    }
}

import { getSellers } from '../lib/data';

const IMPLEMENTED_SELLERS = [
    'Lemon Cards',
    'Oyunkurucu',
    'Kollektit',
    'Card House',
    'Karakterci',
    'Slab and Pack',
    'Gorilla Custom Cards',
    'Mega Collectable',
    'Store Cuttlefish',
    'Goblin Store',
    'Pegasus Oyuncak',
    'Mythos Cards'
];

async function main() {
    console.log('Fetching sellers from Google Sheet...');
    const { sellers } = await getSellers();

    console.log(`Total sellers found: ${sellers.length}`);

    const remainingSellers = sellers.filter(s => {
        // Normalize names for comparison (trim, lowercase check if needed)
        // For now, exact match or partial match might be needed
        return !IMPLEMENTED_SELLERS.some(implemented =>
            s.name.toLowerCase().includes(implemented.toLowerCase()) ||
            implemented.toLowerCase().includes(s.name.toLowerCase())
        );
    });

    console.log('\n--- Remaining Sellers ---');
    remainingSellers.forEach(s => {
        console.log(`- ${s.name} (${s.website})`);
    });

    console.log('\n--- Implemented Sellers (Verified) ---');
    sellers.filter(s => !remainingSellers.includes(s)).forEach(s => {
        console.log(`[x] ${s.name}`);
    });
}

main().catch(console.error);
