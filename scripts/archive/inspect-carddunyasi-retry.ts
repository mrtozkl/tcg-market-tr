import * as fs from 'fs';
import * as cheerio from 'cheerio';

const html = fs.readFileSync('carddunyasi.html', 'utf-8');
const $ = cheerio.load(html);

console.log('Searching for product cards with broader selectors...');
const products = $('div[class*="col-"]');
console.log(`Found ${products.length} divs with col-* class.`);

// Try to find a product by title if known, or just dump some divs
// Subagent saw "Spider-Man" products.
console.log('Searching for "Spider-Man" text:');
const spider = $('*:contains("Spider-Man")').last();
console.log('Spider-Man element:', spider.prop('tagName'), spider.attr('class'));
console.log('Parent:', spider.parent().prop('tagName'), spider.parent().attr('class'));

// Check if we have the right page content
console.log('Page title:', $('title').text());
console.log('Body start:', $('body').html()?.substring(0, 500));
