import * as fs from 'fs';
import * as cheerio from 'cheerio';

const html = fs.readFileSync('tcgsepeti_cat.html', 'utf-8');
const $ = cheerio.load(html);

console.log('Body HTML start:');
console.log($('body').html()?.substring(0, 2000));

console.log('Searching for "wc-block-grid__product" classes:');
const els = $('[class*="wc-block-grid__product"]');
console.log(`Found ${els.length} elements.`);
if (els.length > 0) {
    console.log('First element HTML:', els.first().html()?.substring(0, 500));
    console.log('First element classes:', els.first().attr('class'));
}
