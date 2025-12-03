import * as fs from 'fs';
import * as cheerio from 'cheerio';

const html = fs.readFileSync('oyunkurucu.html', 'utf-8');
const $ = cheerio.load(html);

const productCards = $('a.ok-collection-slide');
// Dump the first card's HTML
console.log(productCards.first().html());
