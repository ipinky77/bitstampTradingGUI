defaultAccount = {
    name: 'your preferred account name, possible the same as the Bitstamp subaccount',
    key: 'your API key for the sub account',
    secret: 'your API secret for the sub account',
    defaultCrypto: 'XRP', // if unsure leave this and check in GUI after installation for currency pairs
    defaultCurrency: 'USD' // if unsure leave this and check in GUI after installation for currency pairs
}

secondAccount = {
    name: 'your preferred account name, possible the same as the Bitstamp subaccount',
    key: 'your API key for the sub account',
    secret: 'your API secret for the sub account',
    defaultCrypto: 'XRP', // if unsure leave this and check in GUI after installation for currency pairs
    defaultCurrency: 'USD' // if unsure leave this and check in GUI after installation for currency pairs
}

var accounts = { defaultAccount, secondAccount }

var configuration = {};
configuration.server = 'www.bitstamp.net'
configuration.ws_endpoint = 'wss://ws.bitstamp.net'
configuration.defaultAccount = defaultAccount
configuration.accounts = accounts
configuration.path_bot_ini = '../bot/config.ini' // if your bot directory is on the same level as the GUI directory you can leave this
configuration.debug = true // set to false if you don't want to see messages in the server window
configuration.debugLevel = 1 // can set to 2 to display results from Bitstamp API
configuration.path_log = "bitstampServerLog.txt"


module.exports = configuration
