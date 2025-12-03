import * as fs from 'fs';
import * as cheerio from 'cheerio';

const html = fs.readFileSync('paralel_cat.html', 'utf-8');
const $ = cheerio.load(html);

console.log('Dumping pagination HTML:');
const pagination = $('.pagination, .paging, .pages, .nav-links');
console.log(pagination.html());

const next = $('a:contains("Sonraki"), a:contains("Next"), a[aria-label="Next"]');
console.log('Next link:', next.attr('href'));
