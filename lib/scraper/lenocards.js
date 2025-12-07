"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LenoCardsScraper = void 0;
var LenoCardsScraper = /** @class */ (function () {
    function LenoCardsScraper() {
        this.name = 'Leno Cards';
        this.baseUrl = 'https://lenocards.com.tr';
    }
    LenoCardsScraper.prototype.scrape = function () {
        return __awaiter(this, void 0, void 0, function () {
            var cards, page, hasNextPage, url, response, data, products, _i, products_1, product, game, availableVariants, cheapestVariant, price, image, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        cards = [];
                        console.log("\nScraping ".concat(this.name, " (Shopify JSON)..."));
                        page = 1;
                        hasNextPage = true;
                        _a.label = 1;
                    case 1:
                        if (!hasNextPage) return [3 /*break*/, 7];
                        url = "".concat(this.baseUrl, "/products.json?limit=250&page=").concat(page);
                        console.log("Fetching ".concat(url, "..."));
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 5, , 6]);
                        return [4 /*yield*/, fetch(url)];
                    case 3:
                        response = _a.sent();
                        if (!response.ok) {
                            console.error("Failed to fetch page ".concat(page, ": ").concat(response.status));
                            return [3 /*break*/, 7];
                        }
                        return [4 /*yield*/, response.json()];
                    case 4:
                        data = _a.sent();
                        products = data.products;
                        if (!products || products.length === 0) {
                            hasNextPage = false;
                            return [3 /*break*/, 7];
                        }
                        console.log("Found ".concat(products.length, " products on page ").concat(page));
                        for (_i = 0, products_1 = products; _i < products_1.length; _i++) {
                            product = products_1[_i];
                            game = this.detectGame(product);
                            if (!game)
                                continue;
                            availableVariants = product.variants.filter(function (v) { return v.available; });
                            if (availableVariants.length === 0)
                                continue;
                            cheapestVariant = availableVariants.reduce(function (prev, curr) {
                                return parseFloat(curr.price) < parseFloat(prev.price) ? curr : prev;
                            });
                            price = parseFloat(cheapestVariant.price);
                            image = '';
                            if (product.images.length > 0) {
                                image = product.images[0].src;
                            }
                            if (price > 0) {
                                cards.push({
                                    name: product.title,
                                    price: price,
                                    currency: 'TRY', // Shopify usually returns local currency, assuming TRY for lenocards.com.tr
                                    seller_name: this.name,
                                    game: game,
                                    image_url: image,
                                    product_url: "".concat(this.baseUrl, "/products/").concat(product.handle)
                                });
                            }
                        }
                        page++;
                        // Safety break
                        if (page > 50)
                            hasNextPage = false;
                        return [3 /*break*/, 6];
                    case 5:
                        error_1 = _a.sent();
                        console.error("Error scraping page ".concat(page, ":"), error_1);
                        hasNextPage = false;
                        return [3 /*break*/, 6];
                    case 6: return [3 /*break*/, 1];
                    case 7: return [2 /*return*/, cards];
                }
            });
        });
    };
    LenoCardsScraper.prototype.detectGame = function (product) {
        var text = (product.title + ' ' + product.product_type + ' ' + product.tags.join(' ')).toLowerCase();
        if (text.includes('pokemon'))
            return 'Pokemon';
        if (text.includes('magic') || text.includes('mtg'))
            return 'Magic: The Gathering';
        if (text.includes('yu-gi-oh') || text.includes('yugioh'))
            return 'Yu-Gi-Oh!';
        if (text.includes('one piece'))
            return 'One Piece';
        if (text.includes('lorcana'))
            return 'Lorcana';
        if (text.includes('star wars'))
            return 'Star Wars';
        // Default to Pokemon if unsure but looks like a card?
        // Or return empty string to skip.
        // Let's be safe and only include known games.
        return '';
    };
    return LenoCardsScraper;
}());
exports.LenoCardsScraper = LenoCardsScraper;
