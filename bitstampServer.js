const version = "1.2.0"
console.log("bitstampServer.js", version)
const BitstampClient = require("./bitstampClient.js")

//server.js
const url = require('url')
var express = require('express');
var app = express();
var session = require('express-session')
var stream = require('stream');

fs = require('fs');

pairs = { xrp_btc: "xrp_btc", uni_btc: "uni_btc", ltc_btc: "ltc_btc", link_btc: "link_btc", xlm_btc: "xlm_btc", bch_btc: "bch_btc", aave_btc: "aave_btc", algo_btc: "algo_btc", comp_btc: "comp_btc", snx_btc: "snx_btc", bat_btc: "bat_btc", mkr_btc: "mkr_btc", zrx_btc: "zrx_btc", yfi_btc: "yfi_btc", uma_btc: "uma_btc", omg_btc: "omg_btc", knc_btc: "knc_btc", crv_btc: "crv_btc", audio_btc: "audio_btc", eth_btc: "eth_btc", btc_usd: "btc_usd", xrp_usd: "xrp_usd", uni_usd: "uni_usd", ltc_usd: "ltc_usd", link_usd: "link_usd", xlm_usd: "xlm_usd", bch_usd: "bch_usd", aave_usd: "aave_usd", algo_usd: "algo_usd", comp_usd: "comp_usd", snx_usd: "snx_usd", bat_usd: "bat_usd", mkr_usd: "mkr_usd", zrx_usd: "zrx_usd", yfi_usd: "yfi_usd", uma_usd: "uma_usd", omg_usd: "omg_usd", knc_usd: "knc_usd", crv_usd: "crv_usd", audio_usd: "audio_usd", grt_usd: "grt_usd", dai_usd: "dai_usd", gusd_usd: "gusd_usd", gbp_usd: "gbp_usd", eur_usd: "eur_usd", eth_usd: "eth_usd", usdt_usd: "usdt_usd", usdc_usd: "usdc_usd", pax_usd: "pax_usd", btc_gbp: "btc_gbp", xrp_gbp: "xrp_gbp", ltc_gbp: "ltc_gbp", link_gbp: "link_gbp", xlm_gbp: "xlm_gbp", bch_gbp: "bch_gbp", omg_gbp: "omg_gbp", eth_gbp: "eth_gbp", pax_gbp: "pax_gbp", btc_eur: "btc_eur", xrp_eur: "xrp_eur", uni_eur: "uni_eur", ltc_eur: "ltc_eur", link_eur: "link_eur", xlm_eur: "xlm_eur", bch_eur: "bch_eur", aave_eur: "aave_eur", algo_eur: "algo_eur", comp_eur: "comp_eur", snx_eur: "snx_eur", bat_eur: "bat_eur", mkr_eur: "mkr_eur", zrx_eur: "zrx_eur", yfi_eur: "yfi_eur", uma_eur: "uma_eur", omg_eur: "omg_eur", knc_eur: "knc_eur", crv_eur: "crv_eur", audio_eur: "audio_eur", grt_eur: "grt_eur", gbp_eur: "gbp_eur", eth_eur: "eth_eur", usdt_eur: "usdt_eur", usdc_eur: "usdc_eur", pax_eur: "pax_eur", link_eth: "link_eth", eth_2eth: "eth_2eth", btc_usdt: "btc_usdt", xrp_usdt: "xrp_usdt", eth_usdt: "eth_usdt", usdc_usdt: "usdc_usdt", btc_usdc: "btc_usdc", eth_usdc: "eth_usdc", btc_pax: "btc_pax", xrp_pax: "xrp_pax", eth_pax: "eth_pax", }


class BitstampGUIServer {

    constructor(configuration) {
        this.configuration = configuration
    }

    run() {
        var configuration = this.configuration
        this.profiles = this.configuration.profiles
        this.logInfo({ "profiles": this.profiles }, 3)

        this.defaultProfileName = this.configuration.defaultProfile.name
        this.logInfo({ "default profile name": this.defaultProfileName }, 3)
        this.defaultProfileKey
        for (var key in this.profiles) {
            if (this.profiles[key].name == this.defaultProfileName) {
                this.defaultProfileKey = key
            }
        }
        this.logInfo({ "default profile key": this.defaultProfileKey }, 3)
        this.currentProfileKey = this.defaultProfileKey
        const defaultProfile = this.configuration.defaultProfile
        this.logInfo({ "default profile": defaultProfile }, 3)


        this.currentCurrency = defaultProfile.defaultCurrency.toLowerCase()
        this.currentCrypto = defaultProfile.defaultCrypto.toLowerCase()
        this.logInfo({ "current currency": this.currentCurrency }, 3)
        this.logInfo({ "current crypto": this.currentCrypto }, 3)
        this.client = new BitstampClient(this.configuration)

        // const path = require('path')

        process.once('SIGINT', function (code) {
            console.log('SIGINT received, shutting down...');
            process.exit()
        });


        app.use(session({
            secret: 'chosen language',
            saveUninitialized: true,
            resave: false,
        }))

        // app.use(express.static('./html')); // set default directory

        //setting the port.
        var server = app.listen(3003, function (err) {
            app.use(express.static(__dirname + '/'));
            if (err) {
                console.log(err.message)
            }
            //  var host = app.address().address
            //  var port = app.address().port

            console.log("***** Server listening at port 3003")
        });


        app.get('/', (request, response) => {
            this.logInfo("***** reloading page", 1)
            this.client.setProfile(defaultProfile)
            this.currentCurrency = defaultProfile.defaultCurrency.toLowerCase()
            this.currentCrypto = defaultProfile.defaultCrypto.toLowerCase()
            this.currentProfileKey = this.defaultProfileKey

            this.logInfo({ "current currency": this.currentCurrency }, 2)
            this.logInfo({ "current crypto": this.currentCrypto }, 2)

            response.sendFile(__dirname + '/html/bitstampGUI.html')
        });


        app.get('/cancelOrder', async (request, response) => {

            try {
                var t = request.url
                var urlString = "http://www.some.crap" + t
                var responseURL = new URL(urlString)
                var params = new URLSearchParams(responseURL.search);

                var id = params.get("id")
                var fee = parseFloat(params.get("fee"))
                var newPrice = parseFloat(params.get("newPrice"))
                this.logInfo(`order ID to cancel\t${id}`, 2)
                this.logInfo(`new Price\t${newPrice}`, 2)
                this.logInfo(`fee\t${fee}`, 2)
                let resultCancel = await this.client.doCancelOrder(id)
                this.logInfo({ "result from cancel": resultCancel }, 3)
                var resultCreate
                if (resultCancel.type == 1) {
                    resultCreate = await this.client.createLimitSellOrder(resultCancel.amount, newPrice.toFixed(4))
                } else {
                    var balances = await this.client.getAccountBalance(false)
                    amount = balances[this.currentCurrency + "_available"]
                    crypto_original = balances[this.currentCrypto]

                    let currency_available = amount * (1 - fee) // deduct fee already
                    let newAmount = currency_available / newPrice
                    this.logInfo(`new amount\t${newAmount}`, 2)
                    resultCreate = await this.client.createLimitBuyOrder(newAmount.toFixed(4), newPrice.toFixed(4))
                }
                this.logInfo({ "result from new order": resultCreate }, 3)
                response.json(resultCreate)


            } catch (e) {
                console.log(e)
            }

        });

        app.get('/sellNow', async (request, response) => {

            try {
                var balances = await this.client.getAccountBalance(false)
                var amount = balances[this.currentCrypto + "_available"]

                // check if orders available
                var resultCreate
                var orders = await this.client.getOpenOrders()
                if (orders.length > 0) {
                    order = orders[0]
                    this.logInfo({ "open order": order }, 3)

                    // type 0 = buy, type 1 = sell

                    if ("1" == order.type) {
                        this.logInfo("need to cancel existing sell order", 1)
                        // buy order which needs be cancelled
                        await this.client.doCancelOrder(order.id)
                    }

                    var balances = await this.client.getAccountBalance(false)
                    var amount = balances[this.currentCrypto + "_available"]

                    //{ crypto: '0.00000000', currency: '0.00' }
                    if (0 < amount) {
                        resultCreate = await this.client.createInstantSellOrder(amount)

                        this.logInfo({ "instant sell result": resultCreate }, 3)

                    } else {
                        this.logInfo("nothing to sell available", 1)
                    }

                } else {
                    this.logInfo("no open order to cancel", 2)
                    if (0 < amount) {
                        resultCreate = await this.client.createInstantSellOrder(amount)

                        this.logInfo({ "instant sell result": resultCreate }, 3)

                    } else {
                        this.logInfo("nothing to sell available", 1)
                    }

                }

            } catch (e) {
                console.log(e)
            }

        });

        app.get('/buyNow', async (request, response) => {

            try {
                var balances = await this.client.getAccountBalance(false)
                var amount = balances[this.currentCurrency + "_available"]
                var resultCreate
                // check if orders available
                var orders = await this.client.getOpenOrders()
                if (orders.length > 0) {
                    order = orders[0]
                    this.logInfo({ "open order": order }, 2)

                    // type 0 = buy, type 1 = sell

                    if ("0" == order.type) {
                        this.logInfo("need to cancel existing buy order", 1)
                        // buy order which needs be cancelled
                        await this.client.doCancelOrder(order.id)
                    }
                    balances = await this.client.getAccountBalance(false)
                    amount = balances[this.currentCurrency + "_available"]

                    if (0 < amount) {
                        resultCreate = await this.client.createInstantBuyOrder(amount)

                        this.logInfo({ "instant buy result": resultCreate }, 3)

                    } else {
                        this.logInfo("no money to buy available", 1)
                    }

                } else {
                    this.logInfo("no open order to cancel", 2)
                    if (0 < amount) {
                        resultCreate = await this.client.createInstantBuyOrder(amount)

                        this.logInfo({ "instant buy result": resultCreate }, 3)
                    } else {
                        this.logInfo("no money to buy available", 1)
                    }
                }

                // now create instant buy order


            } catch (e) {
                console.log(e)
            }

        });

        app.get('/getFee', async (request, response) => {

            try {

                var fee = await this.client.getFee()
                this.logInfo({ "current fee": fee }, 2)
                response.json(fee)


            } catch (e) {
                console.log(e)
            }

        });


        app.get('/getCurrency', async (request, response) => {

            try {
                this.logInfo({ "current currency": this.currentCurrency }, 2)
                response.json({ currency: this.currentCurrency.toUpperCase() })
            } catch (e) {
                console.log(e)
            }

        });

        app.get('/setCurrency', async (request, response) => {

            try {
                var t = request.url
                var urlString = "http://www.some.crap" + t
                var responseURL = new URL(urlString)
                var params = new URLSearchParams(responseURL.search);

                this.currentCurrency = params.get("currency").toLowerCase()
                this.logInfo({ "new currency": this.currentCurrency }, 2)
                this.client.setCurrency(this.currentCurrency)
                response.json({ result: "success" })
            } catch (e) {
                console.log(e)
            }

        });

        app.get('/getProfiles', async (request, response) => {

            try {
                this.logInfo({ "profiles": this.profiles }, 3)
                this.logInfo({ "defaultProfileKey": this.defaultProfileKey }, 3)
                this.logInfo({ "currentProfileKey": this.currentProfileKey }, 3)
                var profiles = this.profiles
                var result = { profiles, currentProfile: this.currentProfileKey }
                response.json(result)
            } catch (e) {
                console.log(e)
            }

        });

        app.get('/changeProfile', async (request, response) => {

            try {
                var t = request.url
                var urlString = "http://www.some.crap" + t
                var responseURL = new URL(urlString)
                var params = new URLSearchParams(responseURL.search);

                var profile = params.get("profile")
                this.logInfo({ "new profile": profile }, 2)
                response.json({ result: "success" })
                var newProfile = {}
                // fetch new profile
                for (var key in this.profiles) {
                    if (key == profile) {
                        newProfile = this.profiles[key]
                        this.currentProfileKey = key
                    }
                }
                this.logInfo({ "New profile": newProfile }, 2)

                this.client.setProfile(newProfile)
                this.currentCurrency = newProfile.defaultCurrency.toLowerCase()
                this.currentCrypto = newProfile.defaultCrypto.toLowerCase()
                this.logInfo({ "current currency": this.currentCurrency }, 2)
                this.logInfo({ "current crypto": this.currentCrypto }, 2)

            } catch (e) {
                console.log(e)
            }

        });


        app.get('/getCrypto', async (request, response) => {

            try {
                this.logInfo({ "current crypto": this.currentCrypto }, 2)
                response.json({ crypto: this.currentCrypto.toUpperCase() })
            } catch (e) {
                console.log(e)
            }

        });


        app.get('/setCrypto', async (request, response) => {

            try {
                var t = request.url
                var urlString = "http://www.some.crap" + t
                var responseURL = new URL(urlString)
                var params = new URLSearchParams(responseURL.search);

                this.currentCrypto = params.get("crypto").toLowerCase()
                this.logInfo({ "new crypto": this.currentCrypto }, 2)
                this.client.setCrypto(this.currentCrypto)
                response.json({ result: "success" })
            } catch (e) {
                console.log(e)
            }

        });

        app.get('/writeBotThresholds', async (request, response) => {

            try {
                var t = request.url
                var urlString = "http://www.some.crap" + t
                var responseURL = new URL(urlString)
                var params = new URLSearchParams(responseURL.search);

                var high = params.get("high")
                this.logInfo({ "new bot threshold - high": high }, 1)
                var low = params.get("low")
                this.logInfo({ "new bot threshold - low": low }, 1)
                // here we write a file
                await fs.writeFile(this.configuration.path_bot_thresholds, 'high=' + high + "\rlow=" + low, function (err) {
                    if (err) {
                        console.log(err);
                        response.json({ result: "failure" })
                    }
                    logInfo("new thresholds written for bot to pick up", 1);
                    response.json({ result: "success" })

                });

            } catch (e) {
                console.log(e)

            }

        });

        app.get('/readBotThresholds', async (request, response) => {

            try {
                // here we write a file
                if (fs.existsSync(this.configuration.path_bot_thresholds)) {
                    const data = fs.readFileSync(this.configuration.path_bot_thresholds, 'utf8')
                    var params = data.split("\r")
                    this.logInfo({ "current bot threshold - high": params[0].split("=")[1] }, 1)
                    this.logInfo({ "current bot threshold - low": params[1].split("=")[1] }, 1)

                    var thresholds = { high: params[0].split("=")[1], low: params[1].split("=")[1] }
                    response.json(thresholds)
                }

            } catch (e) {
                console.log(e)
                response.json({ result: "failure" })
            }

        });

        app.get('/getOpenOrder', async (request, response) => {

            try {
                // console.log(parts)
                let result = await this.client.getOpenOrders()
                if (result[0] === undefined) {
                    this.logInfo("no open orders to return", 2)
                    result = { "id": "", "buyPrice": "", type: "" }
                    response.json(result)
                } else {
                    this.logInfo({ "open order": result[0] }, 2)
                    response.json(result[0])
                }


            } catch (e) {
                console.log(e)
            }

        });

        app.get('/getLastSellPrice', async (request, response) => {

            try {
                var lastSellPrice = await this.getLastSellPrice()
                this.logInfo({ "last sell price": lastSellPrice }, 2)
                response.json(lastSellPrice)

            } catch (e) {
                console.log(e)
            }

        });

        app.get('/getCurrentPrice', async (request, response) => {

            try {
                var currentPrice = await this.getCurrentPrice()
                this.logInfo({ "current price": currentPrice }, 2)
                response.json(currentPrice)

            } catch (e) {
                console.log(e)
            }

        });

        app.get('/getBalance', async (request, response) => {

            try {

                let result = await this.client.getAccountBalance(false)
                this.logInfo({ "profile Balance": result }, 2)
                // console.log("currencCrypto", this.currentCrypto, "this.currentCurrency", this.currentCurrency)
                // convert universal
                var balances = {
                    crypto_available: result[this.currentCrypto + '_available'], crypto_reserved: result[this.currentCrypto + '_reserved'],
                    currency_available: result[this.currentCurrency + '_available'], currency_reserved: result[this.currentCurrency + '_reserved']
                }
                this.logInfo({ "returned to GUI": balances }, 2)
                response.json(balances)

            } catch (e) {
                console.log(e)
            }

        });


        app.get('/getTransactions', async (request, response) => {

            try {
                var t = request.url
                var urlString = "http://www.some.crap" + t
                var responseURL = new URL(urlString)
                var params = new URLSearchParams(responseURL.search);

                const dateFrom = new Date(params.get("dateFrom"))
                this.logInfo({ "date from": dateFrom }, 2)

                var txs = await this.getTransactions(dateFrom)
                response.json(txs)

            } catch (e) {
                console.log(e)
            }

        });


        app.get('/getAccountsOverview', async (request, response) => {

            try {
                var result = await this.getAccountsOverview()

                var mydata = new Array()
                var accBalances = result.rearrangedAccountsBalances
                for (var c in accBalances) {
                    for (var a in accBalances[c]) {
                        var e = { account: a, currency: c, available: accBalances[c][a].available, reserved: accBalances[c][a].reserved }
                        mydata.push(e)
                    }

                }

                response.json(mydata)

            } catch (e) {
                console.log(e)
            }

        });

        // "/transferFunds?fromAccount=" + fromAccount + "&toAccount=" + toAccount + "&transferCurrency=" + transferCurrency + "&transferAmount=" + transferAmount
        app.get('/transferFunds', async (request, response) => {
            try {
                var t = request.url
                var urlString = "http://www.some.crap" + t
                var responseURL = new URL(urlString)
                var params = new URLSearchParams(responseURL.search);

                const fromAccount = params.get("fromAccount")
                const toAccount = params.get("toAccount")
                const transferCurrency = params.get("transferCurrency")
                const transferAmount = parseFloat(params.get("transferAmount"))
                var fromAccountID = ""
                var toAccountID = ""
                this.logInfo({ fromAccount: fromAccount, toAccount: toAccount, transferCurrency: transferCurrency, transferAmount: transferAmount }, 2)

                // get uniqueID for both accounts
                for (var profile in this.profiles) {
                    if (profile == fromAccount) {
                        fromAccountID = this.profiles[profile].uniqueID
                    }
                    if (profile == toAccount) {
                        toAccountID = this.profiles[profile].uniqueID
                    }

                }
                this.logInfo({ fromAccountID: fromAccountID, toAccountID: toAccountID }, 2)

                // set Main Account
                var currentProfile = this.currentProfileKey
                var newProfile = this.profiles["main"]
                this.client.setProfile(newProfile)

                // transferFunds
                // from nonMain to nonMain
                if ("main" != fromAccount && "main" != toAccount) {
                    var resultToMain = await this.client.doTransferToMain(fromAccountID, transferAmount, transferCurrency)
                    this.logInfo(resultToMain, 3)
                    var resultFromMain = await this.client.doTransferFromMain(toAccountID, transferAmount, transferCurrency)
                    this.logInfo(resultFromMain, 3)
                    // revert to selected Account
                    newProfile = this.profiles[currentProfile]
                    this.client.setProfile(newProfile)
                    if ("error" == resultToMain.status || "error" == resultFromMain.status) {
                        response.json({ result: "failure" })
                    } else {
                        response.json({ result: "success" })
                    }
                }
                // from main, ie. not required to move to main
                if ("main" == fromAccount) {
                    var resultFromMain = await this.client.doTransferFromMain(toAccountID, transferAmount, transferCurrency)
                    this.logInfo(resultFromMain, 3)
                    // revert to selected Account
                    newProfile = this.profiles[currentProfile]
                    this.client.setProfile(newProfile)
                    if ("error" == resultFromMain.status) {
                        response.json({ result: "failure" })
                    } else {
                        response.json({ result: "success" })
                    }

                }
                // to main, ie. not required to move to toAccount
                if ("main" == toAccount) {
                    var resultToMain = await this.client.doTransferToMain(fromAccountID, transferAmount, transferCurrency)
                    this.logInfo(resultToMain, 3)
                    // revert to selected Account
                    newProfile = this.profiles[currentProfile]
                    this.client.setProfile(newProfile)
                    if ("error" == resultToMain.status) {
                        response.json({ result: "failure" })
                    } else {
                        response.json({ result: "success" })

                    }
                }

            } catch (e) {
                console.log(e)
                response.json({ result: "failure" })
            }

        });

        //...
        app.get('/download', async (request, response) => {
            //...
            var t = request.url
            var urlString = "http://www.some.crap" + t
            var responseURL = new URL(urlString)
            var params = new URLSearchParams(responseURL.search);

            const dateFrom = new Date(params.get("dateFrom"))
            this.logInfo({ "date from": dateFrom }, 2)

            var txs = await this.getTransactions(dateFrom)
            var fileData = ""
            // header
            for (var k in txs[0]) {
                if (k == "a1" || k == "a2") {
                    fileData += "Amount,"
                } else if (k == "p1" || k == "p2") {
                    fileData += "Code,"
                } else {
                    fileData += k + ","
                }
            }
            fileData = fileData.substring(0, fileData.length - 1)
            fileData += "\r"


            for (var i in txs) {

                for (var k in txs[i]) {
                    if (k == "datetime") {
                        fileData += '"' + txs[i][k].toISOString() + '",'
                    } else if ("p1" == k || "p2" == k) {
                        fileData += '"' + txs[i][k].toUpperCase() + '",'
                    }
                    else {
                        fileData += '"' + txs[i][k] + '",'
                    }

                }
                fileData = fileData.substring(0, fileData.length - 1)
                fileData += "\r"
            }

            var fileContents = Buffer.from(fileData);

            var readStream = new stream.PassThrough();
            readStream.end(fileContents);

            response.set('Content-disposition', 'attachment; filename=Transactions.csv');
            response.set('Content-Type', 'text/plain');

            readStream.pipe(response);
        });

        async function logInfo(info, level) {
            // it not debugging, do not output to console
            if (configuration.debug) {
                if (level <= configuration.debugLevel) {
                    console.log(info)
                }
            }
            // always output to file

            if ('object' == typeof (info)) {
                info = JSON.stringify(info, null, 4)
            }
            // here we write a file
            fs.appendFileSync(configuration.path_log, info);
            fs.appendFileSync(configuration.path_log, "\r");
        }
    }
    async getLowestPrice(orderID) {
        var transactionFound = false
        var transactions = await this.client.getUserTransactions("limit=60")

        this.logInfo({ "last 10 transactions": transactions }, 3)

        var minPrice = 999999999999
        for (var transaction in transactions) {
            //console.log(result[order])

            //console.log(`Checking transactions: \t${transaction}`)
            var t = transactions[transaction].order_id
            if (orderID == t) {
                transactionFound = true

                // console.log(`found sell transaction\t${order_id}`)
                var price = transactions[transaction][`${this.currentCrypto}_${this.currentCurrency}`]
                //console.log(`Price\t${price}`)
                if (price < minPrice) {
                    minPrice = price
                }

            }
        }
        if (minPrice == 999999999999) {
            minPrice = NaN
        }
        this.logInfo(`last minimum sell price\t${minPrice}`, 2)
        return minPrice

    }

    async getLastSellPrice() {
        var transactionFound = false
        var transactions = await this.client.getUserTransactions("limit=40")
        var lowestPrice = -1
        var order_id = ""
        for (var transaction in transactions) {
            // console.log(transactions[transaction])

            var order_id = transactions[transaction].order_id
            var xrp = parseFloat(transactions[transaction][`${this.currentCrypto}`])
            var type = transactions[transaction].type
            if (type == '2' && xrp < 0) {
                transactionFound = true

                // console.log(`found sell transaction\t${order_id}`)
                lowestPrice = await this.getLowestPrice(order_id)
                break
            }
        }
        if (lowestPrice == -1) {
            lowestPrice = NaN
        }
        return { "sellPrice": lowestPrice }
    }

    async getCurrentPrice() {
        var ticker = await this.client.getHourlyTicker()
        this.logInfo({ "current price, ticker": ticker }, 2)
        return { "currentPrice": ticker.last }
    }

    async getTransactions(dateFrom) {
        var result = await this.client.getUserTransactions("limit=1000")
        // console.log(result)

        var d = new Date()
        const offset = d.getTimezoneOffset()

        var price
        var cryptoAmount
        var currencyAmount
        var order_id
        var id
        var type
        var fee
        var cryptoCode
        var currencyCode
        var pair
        var dtString
        var dt
        var txs = []
        for (var k in result) {

            Object.keys(result[k]).forEach(function (key) {
                var pos = key.indexOf("_")
                if (0 < pos && "order_id" != key) {
                    // found pair
                    if (key in pairs) {
                        // confirmed pair
                        cryptoCode = key.substring(0, pos)
                        currencyCode = key.substring(pos + 1, key.length)
                        // console.log(currencyCode, cryptoCode)
                        pair = key
                    }

                }
            })
            price = result[k][pair]
            cryptoAmount = parseFloat(result[k][cryptoCode])
            currencyAmount = parseFloat(result[k][currencyCode])
            order_id = result[k]['order_id']
            id = result[k]['id']
            type = result[k]['type']
            fee = result[k]['fee']
            dtString = result[k]['datetime'].substring(0, 19)

            var dtTemp = new Date(dtString)

            dt = new Date(dtTemp - (2 * 60000 * offset)) // 2* cause the Date() caused recalculation of offset, now we have to "go back twice the offset

            var tx = { order_id: order_id, id: id, datetime: dt, fee: fee, price: price, a1: cryptoAmount, p1: cryptoCode, a2: currencyAmount, p2: currencyCode, }
            // console.log(tx)
            if (dt >= dateFrom && type == "2") {
                txs.push(tx)
            }
        }

        return txs

    }

    async logInfo(info, level) {
        // it not debugging, do not output to console
        if (this.configuration.debug) {
            if (level <= this.configuration.debugLevel) {
                console.log(info)
            }
        }
        // always output to file

        if ('object' == typeof (info)) {
            info = JSON.stringify(info, null, 4)
        }
        // here we write a file
        fs.appendFileSync(this.configuration.path_log, info);
        fs.appendFileSync(this.configuration.path_log, "\r");
    }


    async getAccountsOverview() {
        var allAccountsBalances = {}
        for (var a in this.configuration.profiles) {
            if ("uniqueID" in this.configuration.profiles[a]) {
                var profileName = this.configuration.profiles[a].name
                await this.client.setProfile(this.configuration.profiles[a])
                var result = await this.client.getAccountBalance(true)
                allAccountsBalances[profileName] = result

            }
        }

        var filteredProfilesBalances = {}
        for (var a in allAccountsBalances) {
            var filtered = this.getNonZeroBalances(allAccountsBalances[a])
            filteredProfilesBalances[a] = filtered
        }
        // console.log("profile balances", filteredProfilesBalances)
        // clean filteredProfilesBalances: add 0 if there's no reserved or no available
        var cleanedAccountBalances = this.cleanAccountBalances(filteredProfilesBalances)

        // console.log("profile balances", cleanedAccountBalances)

        // rearrange cryptoBalances by profile
        var rearrangedAccountsBalances = this.rearrangeAccountsBalances(cleanedAccountBalances)

        // console.log(rearrangedAccountsBalances)

        return { rearrangedAccountsBalances, cleanedAccountBalances }
    }

    getNonZeroBalances(balances) {
        var filteredBalances = {}
        for (var k in balances) {
            var available = k.indexOf("available")
            var reserved = k.indexOf("reserved")
            if (0 < available || 0 < reserved) {
                var value = parseFloat(balances[k])
                if (0 < value) {
                    filteredBalances[k] = parseFloat(balances[k])
                }

            }


        }
        return filteredBalances
    }

    cleanAccountBalances(balances) {

        // first get all currencies
        // loop profiles
        var currencies = {}
        for (var a in balances) {
            // loop balances
            for (var b in balances[a]) {
                var currency = b.substring(0, b.indexOf("_"))
                if (!(currency in currencies)) {
                    currencies[currency] = currency
                }
            }
        }
        // then check if either _reserved or _available is missing if one of them is available
        for (var a in balances) {
            // loop balances
            for (var c in currencies) {
                if ((c + "_available") in balances[a]) {
                    if (!((c + "_reserved") in balances[a])) {
                        // add reserved
                        balances[a][c + "_reserved"] = 0
                    }
                }
                if ((c + "_reserved") in balances[a]) {
                    if (!((c + "_available") in balances[a])) {
                        // add available
                        balances[a][c + "_available"] = 0
                    }
                }
            }
        }


        return balances
    }

    rearrangeAccountsBalances(balances) {

        var restructured = {}

        // first get all currencies
        // loop profiles
        var currencies = {}
        for (var a in balances) {
            // loop balances
            for (var b in balances[a]) {
                var currency = b.substring(0, b.indexOf("_"))
                if (!(currency in currencies)) {
                    currencies[currency] = currency
                }
            }
        }
        // then restructure
        for (var c in currencies) {
            restructured[c] = {}
            for (var a in balances) {
                if ((c + "_available") in balances[a]) {
                    var b = { reserved: balances[a][c + "_reserved"], available: balances[a][c + "_available"] }
                    restructured[c][a] = b
                }
            }

        }


        return restructured
    }
}



module.exports = BitstampGUIServer