import * as fs from 'fs';
import * as cheerio from 'cheerio';

const html = fs.readFileSync('cemcollector_search.html', 'utf-8');
const $ = cheerio.load(html);

console.log('Dumping footer/pagination HTML:');
const footer = $('footer, .footer, .pagination, .woocommerce-pagination');
console.log(footer.html()?.substring(0, 1000));

console.log('Body end:');
const body = $('body').html();
console.log(body?.substring(body.length - 2000));
