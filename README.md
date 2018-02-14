# GDAX Trading Bot

This program is an automated trading system that can autonomously trade the BTC / EUR pair in the GDAX exchange. 

Keep in mind that trading is a risky activity that can involve a loss of money. You should only invest the amount you can afford to lose.

## Trading strategy

The GDAX Trading Bot continuously monitors the price of bitcoin and issues a buy order when the price begins to rise above the weighted average of the previous prices. Once the buy order is filled, the program sells all the available bitcoins with a small increase over the purchase price and begins to evaluate the next buy order. It uses only limit orders with no fees.

If the price trend is upward, the benefit is assured and no user action is required. If the price trend is downward and there are sell orders that are not filled for too long, you can cancel them or wait for the price trend to change. To cancel a sell order you must go to the GDAX website, cancel the current sell order and issue a new limit sell order at a lower price.

### The seed

The seed is the amount of bitcoins that the program will buy and sell continuously to earn euros. The greater the seed, the greater the benefit. The seed value must be set in the program variable SEED_BTC_AMOUNT.

It is recommended that the seed does not exceed one twentieth of the amount of bitcoins you can buy.

Example:

- If your current euro balance is 2000 euros and the bitcoin price is 10000 euros you can buy 0.2 btc
- If you can buy 0.2 btc the recommended seed is 0.01 btc

## Quick guide

### Registration

- Register in Coinbase (https://www.coinbase.com)
- Use the Coinbase account to login to the Gdax exchange (https://www.gdax.com)
- Deposit the amount of euros you want with a SEPA transfer.

### API Key generation

Generate an API Key only with trade permission (https://www.gdax.com/settings/api)

### Environment variables

Save the three values of the API key in the following environment variables of the operating system:

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
- Set the seed in the variable SEED_BTC_AMOUNT

### Execution

- Open a system console
- Run "node index.js" in the root folder to start the execution of the program
- Press Ctrl + C to exit 

## Donations

Please consider making a donation to the following bitcoin address (BTC):

1KNcZ1z3yuEK1hF27y53MyjJSZsPUYz3Ty