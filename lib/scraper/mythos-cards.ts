import { Card, Scraper } from './types';
import puppeteer from 'puppeteer';

export class MythosCardsScraper implements Scraper {
    name = 'Mythos Cards';
    private url = 'https://mythos.cards/product/hobbybox';

    async scrape(): Promise<Card[]> {
        const cards: Card[] = [];
        console.log(`\nScraping ${this.name}...`);

        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        try {
            const page = await browser.newPage();
            // Set viewport to a reasonable size to ensure elements are visible
            await page.setViewport({ width: 1280, height: 800 });

            console.log(`Navigating to ${this.url}...`);
            await page.goto(this.url, { waitUntil: 'networkidle2', timeout: 60000 });

            console.log('Waiting for product cards...');
            await page.waitForSelector('.wrapper', { timeout: 30000 });

            // Scroll to bottom repeatedly to load all items (infinite scroll)
            // We'll try scrolling a few times or until no new items appear
            let previousHeight = 0;
            let scrollAttempts = 0;
            const maxScrolls = 20; // Limit to avoid infinite loops

            while (scrollAttempts < maxScrolls) {
                previousHeight = await page.evaluate('document.body.scrollHeight') as number;
                await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
                await new Promise(r => setTimeout(r, 2000)); // Wait for load

                const newHeight = await page.evaluate('document.body.scrollHeight') as number;
                if (newHeight === previousHeight) {
                    break; // No more content loaded
                }
                scrollAttempts++;
                console.log(`Scrolled ${scrollAttempts}/${maxScrolls}...`);
            }

            // Extract data
            const productData = await page.evaluate(() => {
                const items: any[] = [];
                const cards = document.querySelectorAll('a.wrapper');

                cards.forEach(card => {
                    const titleElem = card.querySelector('h4') as HTMLElement;
                    const title = titleElem ? titleElem.innerText.trim() : '';

                    const link = card.getAttribute('href');

                    // Category is often in a span before the h4
                    // Structure: div > span (category) ... h4 (title)
                    // Let's look for the span sibling of h4 or parent's first child
                    // Based on inspection: .wrapper > div > span
                    const categorySpan = card.querySelector('div > span') as HTMLElement;
                    const categoryText = categorySpan ? categorySpan.innerText.trim() : '';

                    // Price
                    // Structure: .wrapper div > div > div (price)
                    // It might be nested. Let's look for text containing 'TL' or numbers
                    // The price is usually in the last div of the card content
                    const priceDivs = card.querySelectorAll('div');
                    let priceText = '';
                    // Try to find the div with the price. It usually has a specific class or style, 
                    // but based on inspection it was just a div.
                    // Let's grab all text and parse price later, or try to find the specific element.
                    // Re-inspecting selector: .wrapper div > div > div:first-child
                    // Let's try to find a div that looks like a price
                    for (const div of Array.from(priceDivs)) {
                        const text = (div as HTMLElement).innerText.trim();
                        if (text.includes('TL') || text.match(/\d{1,3}(\.\d{3})*,\d{2}/)) {
                            priceText = text;
                            break;
                        }
                    }

                    const imgElem = card.querySelector('img');
                    const imageUrl = imgElem ? (imgElem.getAttribute('src') || imgElem.getAttribute('data-src')) : '';

                    if (title && link) {
                        items.push({
                            title,
                            link,
                            priceText,
                            imageUrl,
                            categoryText
                        });
                    }
                });
                return items;
            });

            console.log(`Found ${productData.length} products.`);

            for (const item of productData) {
                // Parse Price
                // "2.600,00 TL" -> 2600.00
                const rawPrice = item.priceText.replace('TL', '').replace('₺', '').trim();
                let price = 0;
                if (rawPrice) {
                    price = parseFloat(rawPrice.replace(/\./g, '').replace(',', '.'));
                }

                // Infer Game
                let game = 'Other';
                const textToCheck = (item.title + ' ' + item.categoryText).toLowerCase();

                if (textToCheck.includes('pokemon')) game = 'Pokemon';
                else if (textToCheck.includes('magic') || textToCheck.includes('mtg')) game = 'Magic: The Gathering';
                else if (textToCheck.includes('yu-gi-oh') || textToCheck.includes('yugioh')) game = 'Yu-Gi-Oh!';
                else if (textToCheck.includes('one piece')) game = 'One Piece';
                else if (textToCheck.includes('lorcana')) game = 'Lorcana';
                else if (textToCheck.includes('star wars')) game = 'Star Wars';
                else if (textToCheck.includes('flesh and blood')) game = 'Flesh and Blood';
                else if (textToCheck.includes('naruto')) game = 'Naruto';
                else if (textToCheck.includes('harry potter')) game = 'Harry Potter';
                else if (
                    textToCheck.includes('sport') ||
                    textToCheck.includes('nba') ||
                    textToCheck.includes('fifa') ||
                    textToCheck.includes('topps') ||
                    textToCheck.includes('panini') ||
                    textToCheck.includes('premier league') ||
                    textToCheck.includes('epl') ||
                    textToCheck.includes('football') ||
                    textToCheck.includes('soccer') ||
                    textToCheck.includes('f1') ||
                    textToCheck.includes('formula 1')
                ) game = 'Sports Cards';

                if (price > 0) {
                    cards.push({
                        seller_name: this.name,
                        game,
                        name: item.title,
                        price,
                        currency: 'TRY',
                        image_url: item.imageUrl.startsWith('http') ? item.imageUrl : `https://mythos.cards${item.imageUrl}`,
                        product_url: item.link.startsWith('http') ? item.link : `https://mythos.cards${item.link}`
                    });
                }
            }

        } catch (error) {
            console.error('Error scraping Mythos Cards:', error);
        } finally {
            await browser.close();
        }

        return cards;
    }
}
