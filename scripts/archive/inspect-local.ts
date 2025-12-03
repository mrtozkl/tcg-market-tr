import * as fs from 'fs';
import * as cheerio from 'cheerio';

const html = fs.readFileSync('oyunkurucu.html', 'utf-8');
const $ = cheerio.load(html);

// Find all script tags and look for product data
$('script').each((i, elem) => {
    const content = $(elem).html() || '';
    if (content.includes('Disney - Lorcana')) {
        console.log(`\n--- Found data in script ${i} ---`);

        // Try to find the JSON object structure
        // Look for "available" or "inventory"
        const availableMatch = content.match(/"available":\s*(true|false)/);
        if (availableMatch) {
            console.log('Found "available" field:', availableMatch[0]);
        } else {
            console.log('No "available" field found in this script');
        }

        const inventoryMatch = content.match(/"inventory_quantity":\s*\d+/);
        if (inventoryMatch) {
            console.log('Found "inventory_quantity" field:', inventoryMatch[0]);
        }

        // Print a snippet of the JSON to see structure
        const snippetIndex = content.indexOf('Disney - Lorcana');
        const start = Math.max(0, snippetIndex - 200);
        const end = Math.min(content.length, snippetIndex + 500);
        console.log('Snippet:', content.substring(start, end));
    }
});
