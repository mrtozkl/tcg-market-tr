import * as fs from 'fs';
import * as cheerio from 'cheerio';

const html = fs.readFileSync('carddunyasi_cat.html', 'utf-8');
const $ = cheerio.load(html);

console.log('Searching for product cards on category page...');
// Selectors from subagent
const products = $('div.col-6.col-md-3.col-lg-3.mb-3');
console.log(`Found ${products.length} products.`);

if (products.length > 0) {
    const first = products.first();
    console.log('First card HTML:', first.html()?.substring(0, 500));

    const title = first.find('a.cd.chp b').text().trim();
    const link = first.find('a.cd.chp').attr('href');
    const imgStyle = first.find('a.db.sabityuks div[style*="background-image"]').attr('style');

    console.log('Title:', title);
    console.log('Link:', link);
    console.log('Image Style:', imgStyle);

    // Price
    const parentText = first.text().trim();
    console.log('Parent Text:', parentText);
} else {
    console.log('Body HTML start:', $('body').html()?.substring(0, 1000));
}
