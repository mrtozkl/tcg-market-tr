import * as fs from 'fs';
import * as cheerio from 'cheerio';

const html = fs.readFileSync('karakterci.html', 'utf-8');
const $ = cheerio.load(html);

console.log('Searching for product cards...');

// Based on browser analysis: a.imgLink seems to be the container or main part
const productLinks = $('a.imgLink');
console.log(`Found ${productLinks.length} product links.`);

if (productLinks.length > 0) {
    const firstLink = productLinks.first();
    console.log('First link HTML:', firstLink.html()?.substring(0, 500));
    console.log('First link parent HTML:', firstLink.parent().html()?.substring(0, 500));

    // Check for title and price siblings
    const parent = firstLink.parent();
    console.log('Parent HTML:', parent.html()?.substring(0, 1000));

    // Try to find title and price relative to parent
    const titleLink = parent.find('a').not('.imgLink').not('.addtowishlist').not('.addtocart');
    console.log('Potential title link:', titleLink.html());
    console.log('Potential title text:', titleLink.text());

    // Price might be text node or in a span
    const priceText = parent.text();
    console.log('Parent full text:', priceText);

    // Check siblings of parent (maybe it's a list item?)
    const grandParent = parent.parent();
    console.log('Grandparent tag:', grandParent.get(0).tagName);
    console.log('Grandparent class:', grandParent.attr('class'));

    if (grandParent.hasClass('product-container')) {
        console.log('Product container found!');
        console.log('Container HTML:', grandParent.html()?.substring(0, 1000));

        // Check for title in container
        const title = grandParent.find('a[title]');
        console.log('Title text:', title.text());
        console.log('Title href:', title.attr('href'));

        // Check for price
        const price = grandParent.find('.current-price, .price, .product-price');
        console.log('Price text:', price.text());

        // If no explicit price class, dump text
        console.log('Container full text:', grandParent.text().trim());
    }
}

// Check for pagination
const pagination = $('.pagination, .paging, .pages');
console.log('Pagination found:', pagination.length > 0);
if (pagination.length > 0) {
    console.log('Pagination HTML:', pagination.html()?.substring(0, 500));
}
