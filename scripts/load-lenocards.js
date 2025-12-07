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
// Load environment variables
var dotenv_1 = require("dotenv");
var path_1 = require("path");
var fs_1 = require("fs");
var envPath = path_1.default.join(process.cwd(), '.env.local');
if (fs_1.default.existsSync(envPath)) {
    var envConfig = dotenv_1.default.parse(fs_1.default.readFileSync(envPath));
    for (var k in envConfig) {
        process.env[k] = envConfig[k];
    }
    console.log('✅ Loaded .env.local');
}
var lenocards_1 = require("../lib/scraper/lenocards");
function loadLenoCards() {
    return __awaiter(this, void 0, void 0, function () {
        var db, scraper, cards, cardMap, uniqueCards, deleteResult, insertedCount, _i, uniqueCards_1, card, error_1, countResult;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Promise.resolve().then(function () { return require('../lib/db'); })];
                case 1:
                    db = (_a.sent()).db;
                    console.log('\n🚀 Starting Leno Cards load process...\n');
                    scraper = new lenocards_1.LenoCardsScraper();
                    return [4 /*yield*/, scraper.scrape()];
                case 2:
                    cards = _a.sent();
                    console.log("\n\u2705 Fetched ".concat(cards.length, " in-stock cards."));
                    cardMap = new Map();
                    cards.forEach(function (card) {
                        var key = card.product_url || card.name;
                        if (!cardMap.has(key)) {
                            cardMap.set(key, card);
                        }
                    });
                    uniqueCards = Array.from(cardMap.values());
                    console.log("\uD83D\uDD0D Unique cards: ".concat(uniqueCards.length, "\n"));
                    // 3. Database Update
                    console.log('💾 Updating database...');
                    return [4 /*yield*/, db.query('DELETE FROM cards WHERE seller_name = $1', ['Leno Cards'])];
                case 3:
                    deleteResult = _a.sent();
                    console.log("Deleted ".concat(deleteResult.rowCount, " old cards"));
                    insertedCount = 0;
                    _i = 0, uniqueCards_1 = uniqueCards;
                    _a.label = 4;
                case 4:
                    if (!(_i < uniqueCards_1.length)) return [3 /*break*/, 9];
                    card = uniqueCards_1[_i];
                    _a.label = 5;
                case 5:
                    _a.trys.push([5, 7, , 8]);
                    return [4 /*yield*/, db.query("INSERT INTO cards (name, game, price, currency, seller_name, image_url, product_url, last_updated)\n                VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())", [
                            card.name,
                            card.game,
                            card.price,
                            card.currency,
                            card.seller_name,
                            card.image_url,
                            card.product_url
                        ])];
                case 6:
                    _a.sent();
                    insertedCount++;
                    if (insertedCount % 50 === 0)
                        process.stdout.write('.');
                    return [3 /*break*/, 8];
                case 7:
                    error_1 = _a.sent();
                    console.error("Error inserting ".concat(card.name, ":"), error_1.message);
                    return [3 /*break*/, 8];
                case 8:
                    _i++;
                    return [3 /*break*/, 4];
                case 9:
                    console.log("\n\n\u2705 Load complete! Inserted: ".concat(insertedCount));
                    return [4 /*yield*/, db.query('SELECT COUNT(*) FROM cards WHERE seller_name = $1', ['Leno Cards'])];
                case 10:
                    countResult = _a.sent();
                    console.log("Total Leno Cards cards in DB: ".concat(countResult.rows[0].count));
                    return [2 /*return*/];
            }
        });
    });
}
loadLenoCards().catch(console.error);
