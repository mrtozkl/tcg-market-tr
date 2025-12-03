import * as fs from 'fs';
import * as cheerio from 'cheerio';

const html = fs.readFileSync('kollektit.html', 'utf-8');
const $ = cheerio.load(html);

const cards = $('.showcase');
if (cards.length > 0) {
    console.log(cards.first().html());
} else {
    console.log('No cards found');
}
