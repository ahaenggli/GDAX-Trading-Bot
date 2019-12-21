# GDAX Trading Bot

This program is an automated trading system that can autonomously trade several currency pairs in the Coinbase Pro exchange. 

* LTC_BTC : {Name:'LTC-BTC',Rounding:6,SEED_AMOUNT:1.00},
* ETH_BTC : {Name:'ETH-BTC',Rounding:5,SEED_AMOUNT:1.00},
* XLM_BTC : {Name:'XLM-BTC',Rounding:8,SEED_AMOUNT:1.00},
* EOS_BTC : {Name:'EOS-BTC',Rounding:6,SEED_AMOUNT:1.00},
* ZRX_BTC : {Name:'ZRX-BTC',Rounding:8,SEED_AMOUNT:1.00},
* ETC_BTC : {Name:'ETC-BTC',Rounding:6,SEED_AMOUNT:1.00},
* XTZ_BTC : {Name:'XTZ-BTC',Rounding:8,SEED_AMOUNT:1.00}

Keep in mind that trading is a risky activity that can involve a loss of money. You should only invest the amount you can afford to lose.

## Trading strategy

The trading strategy consists of issuing a large number of low value orders. The program continuously monitors the price of each coin and issues a market buy order when the price begins to rise above the weighted average of the previous prices. Once the buy order is filled, the program issues a limit sell order at a higher price.

### The seed

The seed is the amount of each coin that the program will trade continuously to earn bitcoins. The greater the seed, the greater the benefit. The seed values must be set for each currency pair in the program variable `CURRENCY_PAIRS`.

You should be able to buy at least 10 seeds of each coin with your initial bitcoin balance. The more seeds you can buy, the easier it will be to recover from a losing streak.

Example:

- Your seeds are set as 1 XTZ and 1 ETH (default settings) 
- The price of Tezos is 0.01 BTC and the price of Ethereum is 0.02 BTC
- You should be able to buy 10 seeds of each coin with your initial bitcoin balance
- Your minimum bitcoin balance should be: (0.01 + 0.02) * 10 = 0.3 BTC

## Quick guide

### Registration

- Register in Coinbase (https://www.coinbase.com)
- Use the Coinbase account to login to the Coinbase Pro exchange (https://pro.coinbase.com)
- Deposit the amount of bitcoins you want

### API Key generation

Generate an API Key only with trade permission (https://pro.coinbase.com/profile/api)

### Environment variables

Save the three values of the API key in the following environment variables of the operating system (or your .env file):

- TRADING_BOT_PASSPHRASE
- TRADING_BOT_KEY
- TRADING_BOT_SECRET

### Installation

- Install Node.js (https://nodejs.org)
- Download this repository
- Open a system console
- Run "npm install" in the root folder to install the required modules

### Configuration

- Open the file "index.js" with a text editor
- Set the seeds in the variable `CURRENCY_PAIRS`

### Execution

- Open a system console
- Run "node index.js" in the root folder to start the execution of the program
- Press Ctrl + C to exit 

## Donations

Please consider making a donation to the following Coinbase Bitcoin Wallet address (BTC):

1JoVYW4bvz1NXUmHeEPVniArfWYdWWE6n8
