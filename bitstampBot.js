const version = "2.0.9"
console.log("bitstampBot.js", version)
const BitstampClient = require("./bitstampClient.js")
const fs = require('fs');
var WebSocketClient = require('websocket').client;



class BitstampBot {

    constructor(profile) {
        this.profile = profile
        this.client = new BitstampClient(profile)
        this.executeTrades = profile.executeTrades
        this.currency = profile.defaultCurrency.toLowerCase()
        this.crypto = profile.defaultCrypto.toLowerCase()
        this.timesLowered = 0
        if ("debug" in profile) {
            this.debug = profile.debug
            this.logInfo(`we run in debug mode\t${this.debug}`, 2)
        } else {
            this.logInfo("debug parameter not set in profile, using false as default", 2)
            this.debug = false
        }
        if ("lowerPrice" in profile) {
            this.lowerPrice = profile.lowerPrice
            this.logInfo(`we lower prices\t${this.lowerPrice}`, 2)
        } else {
            this.logInfo("lowerPrice parameter not set in profile, using false as default", 2)
            this.lowerPrice = false
        }

        this.logInfo({ "currency": this.currency }, 2)
        this.logInfo({ "crypto": this.crypto }, 2)
        this.willRun = false
        this.willClose = false

    }

    async init() {
        var willRun = false


        var result = await this.client.getAccountBalance(false)
        this.logInfo(result, 2)
        // this.amount = parseFloat(result[this.crypto + "_available"]) // to test
        this.amount = parseFloat(result[this.currency + "_available"]).toFixed(4)
        this.fee = parseFloat(result["fee"])
        this.realAmount = (this.amount * (1 - this.fee / 100)).toFixed(4)
        const condAmount = 20 < this.amount
        const condTrades = this.executeTrades
        const condFile = fs.existsSync(this.profile.path_bot_thresholds)
        if (!condTrades || (condAmount && condFile)) {
            willRun = true
        }

        if (condFile) {
            // file does not contain high nor low
            if (! await this.readThresholds(true)) {
                this.logInfo(`File "${this.profile.path_bot_thresholds}" does not contain high and/or low value`, 1)
                willRun = false
            }
        } else {
            if (condTrades) {
                this.logInfo(`Please make sure the file "${this.profile.path_bot_thresholds}" exists`, 1)
                willRun = false
            }

        }

        if (this.debug) {
            this.logInfo("We run in debug mode, like executing trades, but not", 2)
            willRun = true
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
            if (self.debug) {
                self.logInfo(`We are in debug mode: like executing trades, but not executing them`, 1)
            }
            var priceHigh = self.referenceTradePrice * (1 + self.high / 100)
            self.logInfo(`------------------`, 1)
            self.logInfo(`Reference trade price ${self.referenceTradePrice}`, 1)
            self.logInfo(`We buy high with ${self.high}% loss at ${priceHigh}`, 1)
            self.buyPrice = (self.referenceTradePrice * (1 + (self.low / 100))).toFixed(4)
            self.logInfo(`We buy low with ${self.low}% profit at ${self.buyPrice}`, 1)
            self.logInfo(`------------------`, 1)
            self.logInfo(`Current ${self.currency} balance is ${self.amount}`, 1)
            self.logInfo(`Current fee is ${self.fee}`, 1)
            self.logInfo("stop the bot with <ctrl><c> or by closing this window", 1)
            // if executeTrades then create limit buy order at low
            if (self.executeTrades && !self.debug) {
                // calculate proper amount: usd - fee
                self.logInfo(`Amount available to buy ${self.realAmount}`, 1)

                var resultCreate = await self.client.createLimitBuyOrder((self.realAmount / self.buyPrice).toFixed(4), self.buyPrice)
                self.orderId = resultCreate.id
                self.logInfo({ "Created buy order": resultCreate }, 1)
                if ("error" == resultCreate.status) {
                    self.logInfo(`Buy order failed`, 1)
                    console.log(resultCreate)
                    return
                }

            } else {

                self.logInfo(`We would, but we don't, create a buy order for ${(self.realAmount / self.buyPrice).toFixed(4)} at ${self.buyPrice}`, 1)
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

                        if (!self.willClose) {
                            if (self.executeTrades || self.debug) {
                                var high = self.high
                                if (self.timesLowered >= 2) {
                                    high = high / 2
                                }
                                if (price >= self.referenceTradePrice * (1 + (high / 100))) {
                                    if (!self.debug) {
                                        var resultCancel = await self.client.doCancelOrder(self.orderId)
                                        self.logInfo(resultCancel, 1)
                                        self.logInfo("we have to buy high, cancelling existing order and buying instantly", 1)
                                        var result = await self.client.getAccountBalance(false)
                                        self.logInfo(result, 1)
                                        self.amount = parseFloat(result[self.currency + "_available"]).toFixed(4)
                                        self.logInfo(`amount we can spend ${self.amount}`, 1)

                                        var resultCreate = await self.client.createInstantBuyOrder(self.amount)
                                        connection.close()
                                        self.logInfo({ "instant buy order": resultCreate }, 1)
                                    }
                                }
                                // if set in profile to "lowerPrices"
                                if (self.lowerPrice) {
                                    // now check if half of the low has been overcome and lower buyPrice
                                    var whenToLower = self.referenceTradePrice * (1 + (self.low / 100 / 2))
                                    if (price <= whenToLower) {
                                        self.timesLowered++
                                        // if we anyway do have a current order, then cancel it and recreate the new one at the lower price
                                        var prevReferenceTradePrice = self.referenceTradePrice
                                        self.referenceTradePrice = whenToLower
                                        self.buyPrice = (self.referenceTradePrice * (1 + (self.low / 100))).toFixed(4)
                                        if (!self.debug) {
                                            var result = await self.client.getOpenOrders()
                                        }
                                        if (self.debug || 0 < result.length) {
                                            // cancel order
                                            if (!self.debug) {
                                                var resultCancel = await self.client.doCancelOrder(self.orderId)
                                                self.logInfo(resultCancel, 1)
                                                self.logInfo("we lower reference trade price now", 1)
                                                var result = await self.client.getAccountBalance(false)
                                                self.logInfo(result, 1)
                                                self.amount = parseFloat(result[self.currency + "_available"]).toFixed(4)


                                            }
                                            // create new order
                                            if (!self.debug) {
                                                var resultCreate = await self.client.createLimitBuyOrder((self.realAmount / self.buyPrice).toFixed(4), self.buyPrice)
                                                self.orderId = resultCreate.id
                                                self.logInfo({ "Created buy order": resultCreate }, 1)
                                            }

                                            self.logInfo(`previous reference trade price ${prevReferenceTradePrice} \t current reference trade price ${self.referenceTradePrice}`, 1)
                                            self.logInfo(`created new buy order at lower price ${self.buyPrice}`, 1)
                                        }
                                    }

                                }

                            }

                            // now to the heartbeat stuff
                            if (0 == minute % self.profile.heartBeat) {
                                if (!heartBeatUpdated) {
                                    self.logInfo(`We are running ${new Date()} and current price is ${price}`, 1)
                                    console.log("this is heartbeat")
                                    heartBeatUpdated = true

                                }
                            } else {
                                heartBeatUpdated = false
                            }
                        }
                        // now read the thresholds
                        if (0 == minute % self.profile.thresholdIntervall) {
                            if (!thresholdsUpdated) {
                                var prevBuyPrice = self.buyPrice
                                await self.readThresholds(false)
                                thresholdsUpdated = true
                                self.buyPrice = prevBuyPrice
                            }

                            if (self.executeTrades && !self.debug) {
                                var result = await self.client.getOpenOrders()
                                if (0 == result.length) {

                                    if (self.willClose) {
                                        self.logInfo("still no open orders, closing", 1)
                                        connection.close()
                                    }
                                    self.logInfo("no open orders, we bought low, waiting one more intervall to close", 1)
                                    self.willClose = true
                                } else {
                                    self.orderId = result[0].id
                                    self.willClose = false
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

            client.connect(self.profile.ws_endpoint);


        } else {
            self.logInfo(`Bot won't run, check ${self.currency} balance ${self.profile.executeTrades ? " or executeTrades flag in profile" : ""}`, 1)
        }

    }

    async readThresholds(logToScreen) {
        const data = fs.readFileSync(this.profile.path_bot_thresholds)
        var prevReferenceTradePrice = 0
        if (this.referenceTradePrice) {
            prevReferenceTradePrice = this.referenceTradePrice
        }
        if (0 <= data.indexOf("high") && 0 <= data.indexOf("low")) {
            var params = JSON.parse(data)
            var prevHigh = this.high
            var prevLow = this.low
            this.high = params.high
            this.low = params.low
            this.referenceTradePrice = params.referenceTradePrice
            if (0 != prevReferenceTradePrice) {
                this.referenceTradePrice = prevReferenceTradePrice
            }
            if ((prevHigh != this.high || prevLow != this.low) && !(logToScreen)) {
                this.logInfo({ "new bot threshold - high": this.high }, 2)
                this.logInfo({ "new bot threshold - low": this.low }, 2)
                this.logInfo({ "new bot threshold - referenceTradePrice": this.referenceTradePrice }, 2)
            }
            if (logToScreen) {
                this.logInfo({ "bot threshold - high": this.high }, 2)
                this.logInfo({ "bot threshold - low": this.low }, 2)
                this.logInfo({ "bot threshold - referenceTradePrice": this.referenceTradePrice }, 2)
            }
            return true
        } else {
            return false
        }
    }

    logInfo(info, level) {
        // it not debugging, do not output to console

        if (this.profile.logToScreen) {
            if (level <= this.profile.debugLevel) {
                console.log(info)
            }
        }
        // always output to file

        if ('object' == typeof (info)) {
            info = JSON.stringify(info, null, 4)
        }
        // here we write a file
        fs.appendFileSync(this.profile.path_log, info);
        fs.appendFileSync(this.profile.path_log, "\r");
    }
}

module.exports = BitstampBot