import * as fs from 'fs';
import * as cheerio from 'cheerio';

const html = fs.readFileSync('carddunyasi.html', 'utf-8');
const $ = cheerio.load(html);

console.log('Body HTML start:');
console.log($('body').html()?.substring(0, 2000));

console.log('Searching for "Pokemon" text in links:');
$('a').each((i, el) => {
    if ($(el).text().toLowerCase().includes('pokemon')) {
        console.log($(el).text().trim(), '->', $(el).attr('href'));
    }
});

console.log('Searching for product container candidates (divs with class):');
const divs = $('div[class]');
const classes = new Set();
divs.each((i, el) => {
    const cls = $(el).attr('class');
    if (cls) classes.add(cls);
});
console.log('Classes found:', Array.from(classes).slice(0, 50));
