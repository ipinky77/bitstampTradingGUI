const version = "1.2.0"
console.log("bitstampBot.js", version)
const BitstampClient = require("./bitstampClient.js")
const fs = require('fs');
var WebSocketClient = require('websocket').client;



class BitstampBot {

    constructor(configuration) {
        this.configuration = configuration
        this.client = new BitstampClient(configuration)
        this.executeTrades = configuration.executeTrades
        this.account = configuration.defaultProfile
        this.currency = configuration.defaultProfile.defaultCurrency.toLowerCase()
        this.crypto = configuration.defaultProfile.defaultCrypto.toLowerCase()

        this.logInfo({ "currency": this.currency }, 2)
        this.logInfo({ "crypto": this.crypto }, 2)
        this.willRun = false

    }

    async init() {
        var willRun = false


        var result = await this.client.getAccountBalance(false)
        this.logInfo(result, 2)
        // this.amount = parseFloat(result[this.crypto + "_available"]) // to test
        this.amount = parseFloat(result[this.currency + "_available"])
        this.fee = parseFloat(result["fee"])
        this.realAmount = this.amount * (1 - this.fee / 100)
        const condAmount = 20 < this.amount
        const condTrades = this.executeTrades
        const condFile = fs.existsSync(this.configuration.path_bot_thresholds)
        if (!condTrades || (condAmount && condFile)) {
            willRun = true
        }
        if (condTrades) {
            if (condFile) {
                // file does not contain high nor low
                if (! await this.readThresholds()) {
                    this.logInfo(`File "${this.configuration.path_bot_thresholds}" does not contain high and/or low value`, 1)
                    willRun = false
                }
            } else {
                this.logInfo(`Please make sure the file "${this.configuration.path_bot_thresholds}" exists`, 1)
                willRun = false
            }
        }
        this.willRun = willRun
    }

    async run() {
        var heartBeatUpdated = false
        var thresholdsUpdated = false

        var self = this
        if (self.willRun) {
            self.logInfo("Bot is starting…", 1)
            self.logInfo(`We are ${self.executeTrades ? "" : " NOT "} executing trades`, 1)
            self.logInfo(`We buy high at ${self.high}`, 1)
            self.logInfo(`We buy low at ${self.low}`, 1)
            self.logInfo(`Current ${self.currency} balance is ${self.amount}`, 1)
            self.logInfo(`Current fee is ${self.fee}`, 1)
            self.logInfo("stop the bot with <ctrl><c> or by closing this window", 1)
            // if executeTrades then create limit buy order at low
            if (self.executeTrades) {
                // calculate proper amount: usd - fee
                self.logInfo(`Amount available to buy ${self.realAmount}`, 1)

                var resultCreate = await self.client.createLimitBuyOrder(self.realAmount, self.low)
                self.orderId = resultCreate.id
                self.logInfo({ "Created buy order": resultCreate }, 1)
                if ("error" == resultCreate.status) {
                    self.logInfo(`Bot won't run, check ${self.currency} balance ${self.executeTrades ? " or executeTrades flag in configuration" : ""}`, 1)
                    return
                }

            }

            var client = new WebSocketClient();

            let apiCall = {
                "event": "bts:subscribe",
                "data": {
                    "channel": "live_trades_xrpusd"
                }
            }

            client.on('connectFailed', function (error) {
                console.log('Connect Error: ' + error.toString());
            });

            client.on('connect', function (connection) {

                self.logInfo('WebSocket Client Connected', 1);
                connection.on('error', function (error) {
                    console.log("Connection Error: " + error.toString());
                });
                connection.on('close', function () {
                    console.log('Connection Closed');
                });
                connection.on('message', async function (message) {

                    var response = JSON.parse(message.utf8Data)
                    self.logInfo(response, 3)
                    if ("bts:subscription_succeeded" == response.event) {
                        self.logInfo("successfully subscribed to ticker", 1)
                        return
                    }
                    if ('trade' == response.event) {
                        var minute = new Date().getMinutes()
                        var price = response.data.price

                        if (self.executeTrades) {
                            if (price >= self.high) {
                                var resultCancel = await self.client.cancelOrder(self.orderId)
                                self.logInfo(resultCancel, 3)
                                self.logInfo("we have to buy high, cancelling existing order and buying instantly", 1)

                                var resultCreate = await self.client.createInstantBuyOrder(self.amount)
                                self.logInfo(resultCreate, 3)

                            }
                        }

                        // now to the heartbeat stuff
                        if (0 == minute % self.configuration.heartBeat) {
                            if (!heartBeatUpdated) {
                                self.logInfo(`We are running ${new Date()} and current price is ${price}`, 1)
                                console.log("this is heartbeat")
                                heartBeatUpdated = true
                            }
                        } else {
                            heartBeatUpdated = false
                        }

                        // now read the thresholds
                        if (0 == minute % self.configuration.thresholdIntervall) {
                            if (!thresholdsUpdated) {
                                var oldHigh = self.high
                                await self.readThresholds()
                                if (oldHigh != self.high) {
                                    self.logInfo(`We have updated bot thresholds: high=${self.high} / low=${self.low}`, 1)
                                }
                                thresholdsUpdated = true
                            }

                            if (self.executeTrades) {
                                var result = await self.client.getOpenOrders()
                                if (0 == result.length) {
                                    self.logInfo("no open orders, we bought low", 1)
                                } else {
                                    orderId = result[0].id
                                }
                            }
                        } else {
                            thresholdsUpdated = false
                        }



                    }
                    if ("bts:request_reconnect" == response.event) {
                        self.logInfo("reconnecting to the ticker", 1)
                        connection.send(JSON.stringify(apiCall))
                    }

                });

                if (connection.connected) {

                    connection.send(JSON.stringify(apiCall));

                }
            });

            client.connect(self.configuration.ws_endpoint);


        } else {
            self.logInfo(`Bot won't run, check ${self.currency} balance ${self.configuration.executeTrades ? " or executeTrades flag in configuration" : ""}`, 1)
        }

    }

    async readThresholds() {
        const data = fs.readFileSync(this.configuration.path_bot_thresholds, 'utf8')
        if (0 <= data.indexOf("high") && 0 <= data.indexOf("low")) {
            var params = data.split("\r")
            this.high = parseFloat(params[0].split("=")[1])
            this.low = parseFloat(params[1].split("=")[1])
            this.logInfo({ "current bot threshold - high": this.high }, 2)
            this.logInfo({ "current bot threshold - low": this.low }, 2)
            return true
        } else {
            return false
        }
    }

    logInfo(info, level) {
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
}

module.exports = BitstampBot