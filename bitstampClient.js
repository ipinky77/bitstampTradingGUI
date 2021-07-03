const version = "1.2.0"
console.log("BitstampClient", version)
const utf8 = require("utf8")
const crypto = require('crypto'); // responsible to create the nonce
const https = require("https");
const uuid = require("uuid");

const contentType = "application/x-www-form-urlencoded"


class BitStampClient {
    signature = undefined
    timeStamp = undefined
    nonce = undefined
    requestMessage = undefined
    config = undefined
    fields = ''

    constructor(configuration) {

        this.config = configuration
        this.server = this.config.server
        this.api_key = this.config.defaultAccount.key
        this.api_secret = this.config.defaultAccount.secret

        this.currency = "usd" // default currency
        this.crypto = "xrp" // default crypto
        this.setUrls()
    }

    setUrls() {
        // POST urls, corresponding to a getUserTransactions("limit=3")
        this.userTransactions = "/api/v2/user_transactions/" // time=minute/hour/day
        this.openOrders = `/api/v2/open_orders/${this.crypto}${this.currency}/`
        this.accountBalance = "/api/v2/balance/"
        this.cancelOrder = "/api/v2/cancel_order/" // id=orderId
        this.openOrders = `/api/v2/open_orders/${this.crypto}${this.currency}/`
        this.instantBuyOrder = `/api/v2/buy/instant/${this.crypto}${this.currency}/` // amount=dollarAmountToBuy
        this.instantSellOrder = `/api/v2/sell/instant/${this.crypto}${this.currency}/` // amount=XRPToSell
        this.marketBuyOrder = `/api/v2/buy/market/${this.crypto}${this.currency}/` // amount=dollarAmountToBuy
        this.marketSellOrder = `/api/v2/sell/market/${this.crypto}${this.currency}/` // amount=XRPToSell
        this.limitBuyOrder = `/api/v2/buy/${this.crypto}${this.currency}/` // amount=dollarAmountToBuy&price=priceToBuyAt
        this.limitSellOrder = `/api/v2/sell/${this.crypto}${this.currency}/` //amount=XRPToSell&price=priceToSellAt
        this.transferToMain = `/api/v2/transfer-to-main/`
        this.transferFromMain = `/api/v2/transfer-from-main/`
        // GET urls // no header required
        this.transactions = `/api/v2/transactions/${this.crypto}${this.currency}/?time=minute`
        this.orderBook = `/api/v2/order_book/${this.crypto}${this.currency}/?group=0`
        this.dailyTicker = `/api/v2/ticker/${this.crypto}${this.currency}/`
        this.hourlyTicker = `/api/v2/ticker_hour/${this.crypto}${this.currency}/`

    }

    setCurrency(currency) {
        this.currency = currency.toLowerCase()
        this.setUrls()
    }

    setCrypto(crypto) {
        this.crypto = crypto.toLowerCase()
        this.setUrls()
    }

    setAccount(account) {

        this.api_key = account.key
        this.api_secret = account.secret
        this.setCurrency(account.defaultCurrency)
        this.setCrypto(account.defaultCrypto)
    }

    createTimeStamp() {
        this.timeStamp = Date.now() // current timestamp
    }

    createNonce() {
        this.nonce = uuid.v4()
    }

    setFields(fields) {
        this.fields = fields // limit/amount/price MANDATORY, if nothing, then offset=1
    }

    createRequestMessage(url_path) {
        var message = "BITSTAMP " + this.api_key + "POST" + this.server +
            url_path + '' + contentType +
            this.nonce + this.timeStamp + "v2" + this.fields
        //console.log(message)
        this.requestMessage = message
    }

    createSignature() {
        try {
            var hmac = crypto.createHmac('sha256', this.api_secret);
            hmac.update(this.requestMessage, 'utf8');
            // from Bitstamp API docu, but does not work https://www.bitstamp.net/api/ search for Authentication
            //hmac.update(myNonce.toString() + '22031722' + api_key, 'utf8');
            this.signature = hmac.digest('hex');
        } catch (err) {
            console.log(err)
        }
    }

    createHeaders(url_path, fields) {
        this.createNonce()
        this.createTimeStamp()
        this.setFields(fields)
        this.createRequestMessage(url_path)
        this.createSignature()
        var headers = {
            'X-Auth': 'BITSTAMP ' + this.api_key,
            'X-Auth-Signature': this.signature,
            'X-Auth-Nonce': this.nonce,
            'X-Auth-Timestamp': this.timeStamp,
            'X-Auth-Version': 'v2',
            'Content-Type': contentType,
            'Content-Length': this.fields.length
        }
        this.headers = headers
    }

    doPost(url_path, fields) {
        this.createHeaders(url_path, fields)

        var options = {
            host: this.server,
            path: url_path,
            method: 'POST',
            headers: this.headers
        };
        //console.log(options)
        let str = ''
        try {
            //console.log("message:" + message)

            return new Promise((resolve, reject) => {
                const request = https.request(options, (response) => {
                    //console.log(response.headers)

                    response.on('data', function (chunk) {
                        str += chunk;
                    });

                    response.on('end', function () {
                        // here goes your logic
                        var result = JSON.parse(str);
                        //console.log(result)
                        resolve(result)
                    });

                    response.on('error', function (err) {
                        console.log(err)
                        reject(err)
                    })
                })
                request.write(fields)
                request.end()

            })


        } catch (err) {
            console.log(err)
        }
    }
    // per default get the last 2 user transactions
    async getUserTransactions(fields = "limit=2") {
        return await this.doPost(this.userTransactions, fields)
    }

    async getOpenOrders() {
        return await this.doPost(this.openOrders, "offset=1")
    }

    // accountbalance doesn't need fields, so we default
    async getAccountBalance(available = true) {
        var all = await this.doPost(this.accountBalance, "offset=1")
        if (available) {
            var balances = {}
            balances[`${this.crypto}`] = all[`${this.crypto}_available`]
            balances[`${this.currency}`] = all[`${this.currency}_available`]
            return balances
        } else {
            // xrp_available: '52.04485451',
            // xrp_balance: '152.04485451',
            // xrp_reserved: '100.00000000',
            // usd_available: '0.00',
            // usd_balance: '0.00',
            // usd_reserved: '0.00',
            var balances = {}
            balances[`${this.crypto}_available`] = all[`${this.crypto}_available`]
            balances[`${this.crypto}_reserved`] = all[`${this.crypto}_reserved`]
            balances[`${this.currency}_available`] = all[`${this.currency}_available`]
            balances[`${this.currency}_reserved`] = all[`${this.currency}_reserved`]


            return balances
        }
    }

    // accountbalance doesn't need fields, so we default
    async getFee() {
        var all = await this.doPost(this.accountBalance, "offset=1")
        var fee = { fee: all[`${this.crypto}${this.currency}_fee`] }
        return fee
    }


    doCancelOrder(orderId) {
        var fields = `id=${orderId}`
        return this.doPost(this.cancelOrder, fields)
    }

    doTransferToMain(subAccount, amount, currency) {
        var fields = `subAccount=${subAccount}&amount=${amount}&currency=${currency}`
        return this.doPost(this.transferToMain, fields)
    }

    doTransferFromMain(subAccount, amount, currency) {
        var fields = `subAccount=${subAccount}&amount=${amount}&currency=${currency}`
        return this.doPost(this.transferFromMain, fields)
    }

    // amount = XRP
    createLimitSellOrder(amount, price) {
        var fields = `amount=${amount}&price=${price}`
        return this.doPost(this.limitSellOrder, fields)
    }

    // amount = USD
    createLimitBuyOrder(amount, price) {
        var fields = `amount=${amount}&price=${price}`
        return this.doPost(this.limitBuyOrder, fields)
    }

    // amount = XRP
    createMarketSellOrder(amount) {
        var fields = `amount=${amount}`
        return this.doPost(this.marketSellOrder, fields)
    }

    // amount = USD
    createMarketBuyOrder(amount) {
        var fields = `amount=${amount}`
        return this.doPost(this.marketBuyOrder, fields)
    }

    // amount = XRP
    createInstantSellOrder(amount) {
        var fields = `amount=${amount}`
        return this.doPost(this.instantSellOrder, fields)
    }

    // amount = USD
    createInstantBuyOrder(amount) {
        var fields = `amount=${amount}`
        return this.doPost(this.instantBuyOrder, fields)
    }

    doGet(url_path) {
        this.createHeaders(url_path, "")

        var options = {
            host: this.server,
            path: url_path,
            method: 'GET',
            headers: this.headers
        };
        //console.log(options)
        let str = ''
        try {
            //console.log("message:" + message)

            return new Promise((resolve, reject) => {
                const request = https.request(options, (response) => {
                    //console.log(response.headers)

                    response.on('data', function (chunk) {
                        str += chunk;
                    });

                    response.on('end', function () {
                        // here goes your logic
                        var result = JSON.parse(str);
                        //console.log(result)
                        resolve(result)
                    });

                    response.on('error', function (err) {
                        reject(err)
                    })
                })
                request.end()

            })


        } catch (err) {
            console.log(err)
        }
    }

    getHourlyTicker() {
        return this.doGet(this.hourlyTicker)
    }

    getDailyTicker() {
        return this.doGet(this.dailyTicker)
    }

    getOrderBook() {
        return this.doGet(this.orderBook)
    }

    // query = "?time=minute/day/hour"
    getTransactions(query = "") {
        return this.doGet(this.transactions + query)
    }

    async getLastSellPrice() {
        var transactions = await this.getUserTransactions("limit=10")

        var lastPrice = -1
        var priceFound = false
        for (var t in transactions) {
            var transaction = transactions[t]

            if (`${this.crypto}_${this.currency}` in transaction && 0 > parseFloat(transaction.xrp)) {
                lastPrice = parseFloat(transaction[`${this.crypto}_${this.currency}`])
                priceFound = true
                break
            }
        }

        return lastPrice
    }

}

module.exports = BitStampClient

