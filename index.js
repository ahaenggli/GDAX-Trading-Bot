#!/usr/bin/env node

/*
 ============================================================================
 Name        : GDAX Trading Bot
 Author      : Kenshiro, ahaenggli
 Version     : 8.00
 Copyright   : GNU General Public License (GPLv3)
 Description : Trading bot for the Coinbase Pro exchange
 ============================================================================
 */

const APP_VERSION = "v8.00";

const GdaxModule = require('coinbase-pro');

// .env Files are awesome
const dotenv = require('dotenv');
dotenv.config();

// load environment vars or empty
const PASSPHRASE = process.env.TRADING_BOT_PASSPHRASE || '';
const KEY = process.env.TRADING_BOT_KEY || '';
const SECRET = process.env.TRADING_BOT_SECRET || '';

const GDAX_URI = 'https://api.pro.coinbase.com';

const SLEEP_TIME = 30000;

// Profit percentage trading a seed
const PROFIT_PERCENTAGE = 2.00; 
const MINIMUM_BUY_PRICE_MULTIPLIER = 100.5 / 100.0;
const SELL_PRICE_MULTIPLIER = (100.0 + PROFIT_PERCENTAGE) / 100.0;

const CURRENCY_PAIRS = 
{
    LTC_BTC : {Name:'LTC-BTC',Rounding:6,SEED_AMOUNT:1.00},
    ETH_BTC : {Name:'ETH-BTC',Rounding:5,SEED_AMOUNT:1.00},
    //XLM_BTC : {Name:'XLM-BTC',Rounding:8,SEED_AMOUNT:100.00},
    //EOS_BTC : {Name:'EOS-BTC',Rounding:6,SEED_AMOUNT:1.00},
    //ZRX_BTC : {Name:'ZRX-BTC',Rounding:8,SEED_AMOUNT:10.00},
    ETC_BTC : {Name:'ETC-BTC',Rounding:6,SEED_AMOUNT:1.00},
    XTZ_BTC : {Name:'XTZ-BTC',Rounding:8,SEED_AMOUNT:1.00}
};

const TICKERS = {};
        
let numberOfCyclesCompleted = 0;
let estimatedProfit = 0;
let authenticatedClient = null;
let publicClient = null;


function sleep(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
 }

 
const sellOrderCallbackGeneric = async(error, response, data) => 
{
    if (error)
        return console.log(error);

    if ((data!=null) && (data.status==='pending'))
    {
        myProduct = data.product_id;
        myKey = myProduct.replace('-','_');
        var cur = myProduct.split('-')[0];
        var btc = myProduct.split('-')[1];

        estimatedProfit = estimatedProfit + CURRENCY_PAIRS[myKey]['SEED_AMOUNT'] * (parseFloat(data.price) - TICKERS[cur]['lastBuyOrderPrice']);
		averagePriceTEZOS = TICKERS[cur]['lastBuyOrderPrice'];          
        TICKERS[cur]['lastBuyOrderPrice'] = null;
        TICKERS[cur]['lastBuyOrderId'] = null;
        numberOfCyclesCompleted++;
 	}

    return console.log(data);
}

const getFilledPriceCallbackGeneric = async(error, response, data) =>  
{
	if (error)
        return console.log(error);

	if ((Array.isArray(data)) && (data.length >= 1))
	{
        myProduct = data[0].product_id;
        myKey = myProduct.replace('-','_');
        
        var cur = myProduct.split('-')[0];
        var btc = myProduct.split('-')[1];
        
        TICKERS[cur].lastBuyOrderPrice = null;
		TICKERS[cur]['lastBuyOrderPrice'] = parseFloat(data[0].price);

		let highestPrice;
	
		if (TICKERS[cur]['askPrice'] > TICKERS[cur]['lastBuyOrderPrice'])
		    highestPrice = TICKERS[cur]['askPrice'];
		else
		    highestPrice = TICKERS[cur]['lastBuyOrderPrice'];

		const sellPrice = highestPrice * SELL_PRICE_MULTIPLIER;
		const sellSize = TICKERS[cur]['Available'] - 0.000000001;

		const sellParams = 
		{
		    'price': sellPrice.toFixed(CURRENCY_PAIRS[myKey]['Rounding']),
		    'size': sellSize.toFixed(4),
		    'product_id': myProduct,
		    'post_only': true,
		};

		console.log("");
		console.log("\x1b[41m%s\x1b[0m", "[SELL ORDER <" + myKey + ">] Price: " + sellPrice.toFixed(CURRENCY_PAIRS[myKey]['Rounding']) + ", size: " + sellSize.toFixed(2) + ""); 

		setTimeout(()=>authenticatedClient.sell(sellParams, sellOrderCallbackGeneric), 3000);
	}

	return; //console.log(data);
}

async function placeGenericSellOrder(lastId, product_id)
{
    if(lastId !== undefined && lastId != null)
      await authenticatedClient.getFills({ order_id: lastId }, getFilledPriceCallbackGeneric);
    else await authenticatedClient.getFills({ product_id: product_id }, getFilledPriceCallbackGeneric);	
}

const buyOrderCallbackGeneric = async(error, response, data) => 
{
	if (error)
        return console.log(error);

    if ((data != null) && (data.status === 'pending')){

        var myTicker = data.product_id;
        myTickerKey = myTicker.replace('-', '_');
        var cur = myTicker.split('-')[0];
        var btc = myTicker.split('-')[1];

        console.log(data.id);
        TICKERS[cur]['lastBuyOrderId'] = data.id;
    }

    return console.log(data);
}

async function placeGenericBuyOrder(cur_pair, cur_key) 
{
    var cur = cur_pair.split('-')[0];
    var btc = cur_pair.split('-')[1];

    const minimumBuyPrice = TICKERS[cur]['averagePrice'] * MINIMUM_BUY_PRICE_MULTIPLIER;

    if (TICKERS[cur]['askPrice'] >= minimumBuyPrice)
    {
        const buySize = CURRENCY_PAIRS[cur_key]['SEED_AMOUNT'];

        const buyParams = 
	    {
            'size': buySize.toFixed(CURRENCY_PAIRS[cur_key]['ROUNDING']),
            'product_id': cur_pair,
            'type': 'market'
		};

		console.log("");
		console.log("\x1b[42m%s\x1b[0m", "[BUY ORDER] Size: " + buySize.toFixed(CURRENCY_PAIRS[cur_key]['ROUNDING']) + " "+cur);
        
        console.log(buyParams);
        await authenticatedClient.buy(buyParams, buyOrderCallbackGeneric);
    }
}

const getGenericProductTickerCallback = async (error, response, data) => 
{ 
	if (error)
        return console.log(error);
      
    if ((data!=null) && (data.ask!=null) && (data.time!=null))
    {
        var myTicker = (response['request']['href']);
        myTicker = myTicker.replace('https://api.pro.coinbase.com/products/', '');
        myTicker = myTicker.replace('/ticker', '');
        myTickerKey = myTicker.replace('-', '_');

        var cur = myTicker.split('-')[0];
        var btc = myTicker.split('-')[1];

        // no trading possible... 
        if(!TICKERS[cur]['trading_enabled']) return;
        
        // disabled trading with amount === 0
        if(CURRENCY_PAIRS[myTickerKey]['SEED_AMOUNT'] === 0) return;

        TICKERS[cur]['askPrice'] = parseFloat(data.ask);

        if (TICKERS[cur]['averagePrice']===null)
            console.log("["+cur+" TICKER] Now: " + TICKERS[cur]['askPrice'].toFixed(8) + ", time: " + data.time);
        else
            console.log("["+cur+" TICKER] Now: " + TICKERS[cur]['askPrice'].toFixed(8) + ", average: " + TICKERS[cur]['averagePrice'].toFixed(8) + ", time: " + data.time);
                    
		const buyPrice = TICKERS[cur]['askPrice'] * CURRENCY_PAIRS[myTickerKey]['SEED_AMOUNT']; 

        if ((TICKERS[btc]['Available'] >= buyPrice) && (TICKERS[cur]['averagePrice'] != null) && TICKERS[cur]['Available'] <= 0)            
            placeGenericBuyOrder(myTicker,myTickerKey);
        else if ((TICKERS[cur]['Available'] >= CURRENCY_PAIRS[myTickerKey]['SEED_AMOUNT']))
            placeGenericSellOrder(TICKERS[cur]['lastBuyOrderId'], myTicker);

        if (TICKERS[cur]['averagePrice'] === null)
        TICKERS[cur]['averagePrice'] = TICKERS[cur]['askPrice'];
        else
        TICKERS[cur]['averagePrice'] = (TICKERS[cur]['averagePrice'] * 1000 + TICKERS[cur]['askPrice']) / 1001;

    }
}

const getAccountsCallback = async (error, response, data) => 
{
    if (error)
        return console.log(error);

    if ((data!=null) && (Symbol.iterator in Object(data)))
    {
        for(const item of data)
        {   
            if(TICKERS[item.currency] !== undefined){
                TICKERS[item.currency]['Available'] = parseFloat(item.available);
                TICKERS[item.currency]['Balance'] = parseFloat(item.balance);
                TICKERS[item.currency]['trading_enabled'] = item.trading_enabled;

                if(TICKERS[item.currency]['Pair'] !== undefined) await publicClient.getProductTicker(CURRENCY_PAIRS[TICKERS[item.currency]['Pair']]['Name'], getGenericProductTickerCallback);
                await sleep(2000);
                //console.log(item);
            }
        }

        console.table(TICKERS);
        console.log("[INFO] Number of cycles completed: " + numberOfCyclesCompleted + ", estimated profit: " + estimatedProfit.toFixed(8) + " BTC\n");        
    }
}

// Main logic
console.log("\n");
console.log("          __________  ___   _  __    ______               ___");
console.log("         / ____/ __ \\/   | | |/ /   /_  __/________ _____/ (_)___  ____ _");
console.log("        / / __/ / / / /| | |   /     / / / ___/ __ `/ __  / / __ \\/ __ `/");
console.log("       / /_/ / /_/ / ___ |/   |     / / / /  / /_/ / /_/ / / / / / /_/ / ");
console.log("       \\____/_____/_/  |_/_/|_|    /_/ /_/   \\__,_/\\__,_/_/_/ /_/\\__, /");
console.log("                                                                /____/");   
console.log("                                  ____        __");
console.log("                                 / __ )____  / /_");
console.log("                                / __  / __ \\/ __/");
console.log("                               / /_/ / /_/ / /_ ");
console.log("                              /_____/\\____/\\__/   " + APP_VERSION);

console.log("\n\n\n\n                    \"The Revolution Will Be Decentralized\"");

console.log("\n\n\n\nConnecting to Coinbase Pro in " + parseInt(SLEEP_TIME/1000) + " seconds ..."); 

/* just once upon a time */
TICKERS['BTC'] = {
    Pair: undefined,
    Available : 0,
    Balance : 0,
    trading_enabled : false
};

for(var x in CURRENCY_PAIRS){
    var c1 = x.split('_')[0];

    TICKERS[c1] = {
        Pair: x,
        askPrice : null,
        Price : null,
        Available : 0,
        Balance : 0,
        trading_enabled : false,
        lastBuyOrderId: null,
        averagePrice: null
    };
}

/* every X miliseconds */
setInterval(async () => 
{
    console.log('\n\n');
    
    //set to default each time
    for(var x in CURRENCY_PAIRS){
        var c1 = x.split('_')[0];        
            //TICKERS[c1]['askPrice'] = null;
            TICKERS[c1]['Available'] = 0;
            TICKERS[c1]['Balance'] = 0;
    }

    publicClient = new GdaxModule.PublicClient(GDAX_URI); 
    authenticatedClient = new GdaxModule.AuthenticatedClient(KEY, SECRET, PASSPHRASE, GDAX_URI);

    // Get the balance of the wallets and execute the trading strategy
    await authenticatedClient.getAccounts(getAccountsCallback);

}, SLEEP_TIME);
