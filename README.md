Pull these two files from github:
macOS:
curl -O https://raw.githubusercontent.com/ipinky77/runBitstampTradingGUI/main/config.js
curl -O https://raw.githubusercontent.com/ipinky77/runBitstampTradingGUI/main/runServer.js

Windows: (Instructions https://techcommunity.microsoft.com/t5/containers/tar-and-curl-come-to-windows/ba-p/382409)
curl -O https://raw.githubusercontent.com/ipinky77/runBitstampTradingGUI/main/config.js
curl -O https://raw.githubusercontent.com/ipinky77/runBitstampTradingGUI/main/runServer.js



alternatively you can create these two files manually, add content between the -------------

runServer.js:
-------------
const configuration = require("./config.js")
const BitstampGUIServer = require("bitstamp_trading_gui")

server = new BitstampGUIServer(configuration)

server.run()
-------------


config.js:
-------------
defaultAccount = {
    name: 'your preferred account name, possible the same as the Bitstamp subaccount',
    key: 'your API key for the sub account',
    secret: 'your API secret for the sub account',
    defaultCrypto: 'XRP', // if unsure leave this and check in GUI after installation for currency pairs
    defaultCurrency: 'USD' // if unsure leave this and check in GUI after installation for currency pairs
}

var accounts = { defaultAccount }

var configuration = {};
configuration.server = 'www.bitstamp.net'
configuration.ws_endpoint = 'wss://ws.bitstamp.net'
configuration.defaultAccount = defaultAccount
configuration.accounts = accounts
configuration.debug = true // set to false if you don't want to see messages in the server window
configuration.debugLevel = 1 // can set to 2 to display results from Bitstamp API
configuration.path_log = "bitstampServerLog.txt"


module.exports = configuration
-------------