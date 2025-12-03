import * as fs from 'fs';
import * as cheerio from 'cheerio';

const html = fs.readFileSync('gizala_cat.html', 'utf-8');
const $ = cheerio.load(html);

console.log('Dumping first product HTML:');
const first = $('.homeproduct').first();
console.log(first.html());
