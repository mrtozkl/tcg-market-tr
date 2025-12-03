import * as fs from 'fs';
import * as cheerio from 'cheerio';

const html = fs.readFileSync('cardhouse_pokemon.html', 'utf-8');
const $ = cheerio.load(html);

console.log('Searching for subcategories...');
// Ikas subcategories usually in a grid or list
const links = $('a');
links.each((i, el) => {
    const href = $(el).attr('href');
    const text = $(el).text().trim();
    // Filter for likely subcategories
    if (href && !href.includes('javascript') && !href.includes('#') && text.length > 2) {
        // Check if it looks like a category link (e.g. /pokemon/...)
        // or just list all links to see structure
        console.log(`Link: ${text} -> ${href}`);
    }
});
