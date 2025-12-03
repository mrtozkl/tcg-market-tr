import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load env
const envPath = path.join(process.cwd(), '.env.local');
const envConfig = dotenv.parse(fs.readFileSync(envPath));
for (const k in envConfig) {
    process.env[k] = envConfig[k];
}

async function main() {
    const { sql } = await import('../lib/db');
    console.log('Verifying database...');

    const excalibur = await sql`
    SELECT name, product_url, image_url, price 
    FROM cards 
    WHERE name LIKE '%Excalibur%'
  `;
    console.log('Excalibur matches:', excalibur.rows.length);
    console.log('Excalibur rows:', excalibur.rows);

    const leftovers = await sql`
    SELECT name, product_url, image_url, price 
    FROM cards 
    WHERE name LIKE '%Leftovers%'
  `;
    console.log('Leftovers:', leftovers.rows[0]);

    const count = await sql`SELECT count(*) FROM cards`;
    console.log('Total cards:', count.rows[0].count);
}

main().catch(console.error);
