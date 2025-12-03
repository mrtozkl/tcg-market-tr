import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

async function inspect() {
    const response = await fetch('https://oyunkurucu.com/collections/tcg');
    const html = await response.text();

    // Find the script tag containing the product data
    // It seems to be inside a script tag, let's try to find the one with the pattern
    const regex = /\{"price":\{"amount":[\d.]+,"currencyCode":"[^"]+"\},"product":\{"title":"[^"]+","vendor":"[^"]+","id":"[^"]+"[^}]*"url":"[^"]+","type":"[^"]+"\},"id":"[^"]+","image":\{"src":"[^"]+"\},"sku":"[^"]*","title":"[^"]+"/g;

    // Let's try to find the full JSON object instead of just matching parts
    // The data seems to be in a structure like: var ... = [...] or just [...] inside a script

    // Let's look for a larger chunk around one match
    const match = regex.exec(html);
    if (match) {
        console.log('Found a match!');
        // Get 500 chars before and after to see context and other fields
        const start = Math.max(0, match.index - 100);
        const end = Math.min(html.length, match.index + 1000);
        console.log(html.substring(start, end));
    } else {
        console.log('No match found with current regex');

        // Dump all script tags to see where data is
        const $ = cheerio.load(html);
        $('script').each((i, elem) => {
            const content = $(elem).html() || '';
            if (content.includes('Disney - Lorcana')) {
                console.log(`Found data in script ${i}`);
                console.log(content.substring(0, 500));
            }
        });
    }
}

inspect();
