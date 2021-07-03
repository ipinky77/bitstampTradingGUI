const version = "1.1.7"
console.log("bitstampGUI.js", version)
var currentCurrency = ""
var currentCrypto = ""
var currentAccount = ""

var availableCryptos = []
var availableCurrencies = []
var currencyPairs = { BTCUSD: { crypto: "BTC", currency: "USD" }, BTCGBP: { crypto: "BTC", currency: "GBP" }, BTCEUR: { crypto: "BTC", currency: "EUR" }, BTCUSDT: { crypto: "BTC", currency: "USDT" }, BTCUSDC: { crypto: "BTC", currency: "USDC" }, BTCPAX: { crypto: "BTC", currency: "PAX" }, XRPBTC: { crypto: "XRP", currency: "BTC" }, XRPUSD: { crypto: "XRP", currency: "USD" }, XRPGBP: { crypto: "XRP", currency: "GBP" }, XRPEUR: { crypto: "XRP", currency: "EUR" }, XRPUSDT: { crypto: "XRP", currency: "USDT" }, XRPPAX: { crypto: "XRP", currency: "PAX" }, UNIBTC: { crypto: "UNI", currency: "BTC" }, UNIUSD: { crypto: "UNI", currency: "USD" }, UNIEUR: { crypto: "UNI", currency: "EUR" }, LTCBTC: { crypto: "LTC", currency: "BTC" }, LTCUSD: { crypto: "LTC", currency: "USD" }, LTCGBP: { crypto: "LTC", currency: "GBP" }, LTCEUR: { crypto: "LTC", currency: "EUR" }, LINKBTC: { crypto: "LINK", currency: "BTC" }, LINKUSD: { crypto: "LINK", currency: "USD" }, LINKGBP: { crypto: "LINK", currency: "GBP" }, LINKEUR: { crypto: "LINK", currency: "EUR" }, LINKETH: { crypto: "LINK", currency: "ETH" }, XLMBTC: { crypto: "XLM", currency: "BTC" }, XLMUSD: { crypto: "XLM", currency: "USD" }, XLMGBP: { crypto: "XLM", currency: "GBP" }, XLMEUR: { crypto: "XLM", currency: "EUR" }, BCHBTC: { crypto: "BCH", currency: "BTC" }, BCHUSD: { crypto: "BCH", currency: "USD" }, BCHGBP: { crypto: "BCH", currency: "GBP" }, BCHEUR: { crypto: "BCH", currency: "EUR" }, AAVEBTC: { crypto: "AAVE", currency: "BTC" }, AAVEUSD: { crypto: "AAVE", currency: "USD" }, AAVEEUR: { crypto: "AAVE", currency: "EUR" }, ALGOBTC: { crypto: "ALGO", currency: "BTC" }, ALGOUSD: { crypto: "ALGO", currency: "USD" }, ALGOEUR: { crypto: "ALGO", currency: "EUR" }, COMPBTC: { crypto: "COMP", currency: "BTC" }, COMPUSD: { crypto: "COMP", currency: "USD" }, COMPEUR: { crypto: "COMP", currency: "EUR" }, SNXBTC: { crypto: "SNX", currency: "BTC" }, SNXUSD: { crypto: "SNX", currency: "USD" }, SNXEUR: { crypto: "SNX", currency: "EUR" }, BATBTC: { crypto: "BAT", currency: "BTC" }, BATUSD: { crypto: "BAT", currency: "USD" }, BATEUR: { crypto: "BAT", currency: "EUR" }, MKRBTC: { crypto: "MKR", currency: "BTC" }, MKRUSD: { crypto: "MKR", currency: "USD" }, MKREUR: { crypto: "MKR", currency: "EUR" }, ZRXBTC: { crypto: "ZRX", currency: "BTC" }, ZRXUSD: { crypto: "ZRX", currency: "USD" }, ZRXEUR: { crypto: "ZRX", currency: "EUR" }, YFIBTC: { crypto: "YFI", currency: "BTC" }, YFIUSD: { crypto: "YFI", currency: "USD" }, YFIEUR: { crypto: "YFI", currency: "EUR" }, UMABTC: { crypto: "UMA", currency: "BTC" }, UMAUSD: { crypto: "UMA", currency: "USD" }, UMAEUR: { crypto: "UMA", currency: "EUR" }, OMGBTC: { crypto: "OMG", currency: "BTC" }, OMGUSD: { crypto: "OMG", currency: "USD" }, OMGGBP: { crypto: "OMG", currency: "GBP" }, OMGEUR: { crypto: "OMG", currency: "EUR" }, KNCBTC: { crypto: "KNC", currency: "BTC" }, KNCUSD: { crypto: "KNC", currency: "USD" }, KNCEUR: { crypto: "KNC", currency: "EUR" }, CRVBTC: { crypto: "CRV", currency: "BTC" }, CRVUSD: { crypto: "CRV", currency: "USD" }, CRVEUR: { crypto: "CRV", currency: "EUR" }, AUDIOBTC: { crypto: "AUDIO", currency: "BTC" }, AUDIOUSD: { crypto: "AUDIO", currency: "USD" }, AUDIOEUR: { crypto: "AUDIO", currency: "EUR" }, GRTUSD: { crypto: "GRT", currency: "USD" }, GRTEUR: { crypto: "GRT", currency: "EUR" }, DAIUSD: { crypto: "DAI", currency: "USD" }, GUSDUSD: { crypto: "GUSD", currency: "USD" }, GBPUSD: { crypto: "GBP", currency: "USD" }, GBPEUR: { crypto: "GBP", currency: "EUR" }, EURUSD: { crypto: "EUR", currency: "USD" }, ETHBTC: { crypto: "ETH", currency: "BTC" }, ETHUSD: { crypto: "ETH", currency: "USD" }, ETHGBP: { crypto: "ETH", currency: "GBP" }, ETHEUR: { crypto: "ETH", currency: "EUR" }, ETH2ETH: { crypto: "ETH", currency: "2ETH" }, ETHUSDT: { crypto: "ETH", currency: "USDT" }, ETHUSDC: { crypto: "ETH", currency: "USDC" }, ETHPAX: { crypto: "ETH", currency: "PAX" }, USDTUSD: { crypto: "USDT", currency: "USD" }, USDTEUR: { crypto: "USDT", currency: "EUR" }, USDCUSD: { crypto: "USDC", currency: "USD" }, USDCEUR: { crypto: "USDC", currency: "EUR" }, USDCUSDT: { crypto: "USDC", currency: "USDT" }, PAXUSD: { crypto: "PAX", currency: "USD" }, PAXGBP: { crypto: "PAX", currency: "GBP" }, PAXEUR: { crypto: "PAX", currency: "EUR" } }
// for testing purposes
// var currencyPairs = {
//     BTCUSD: { crypto: "BTC", currency: "USD" }, BTCGBP: { crypto: "BTC", currency: "GBP" }, XRPUSD: { crypto: "XRP", currency: "USD" }, XRPEUR: { crypto: "XRP", currency: "EUR" }
// }
function init() {
    changePage("Trading")
    getAccounts()
    getCurrency()
    getCrypto()

    reduceLists(currentCurrency, currentCrypto)
    console.log("currentCurrency: " + currentCurrency)
    console.log("currentCrypto: " + currentCrypto)
    setCryptoOptions(currentCurrency, false)
    setCurrencyOptions(currentCrypto, false)
    $("#baseCrypto").val(currentCrypto);
    $("#baseCurrency").val(currentCurrency);

    getBalance()
    getLastSellPrice()
    getCurrentPrice()
    getMinMaxPrice()

    getOpenOrder()
    updateUpDownPrice()
    readBotThresholds()
}

function changeAccount(account) {

    console.log("new account: " + account)

    var scriptUrl = "/changeAccount?account=" + account;
    $.ajax({
        url: scriptUrl,
        type: 'get',
        dataType: 'html',
        async: false,
        success: function (data) {
            result = JSON.parse(data)
        }, timeout: 30000
    });
    currentAccount = account
    init()
    alert('account changed')
}

function getAccounts() {
    var result
    var scriptUrl = "/getAccounts";
    $.ajax({
        url: scriptUrl,
        type: 'get',
        dataType: 'html',
        async: false,
        success: function (data) {
            result = JSON.parse(data)
        }, timeout: 30000
    });

    console.log(result)

    // update Account Switcher
    const accountKeys = Object.keys(result.accounts)
    console.log(accountKeys)

    var accountOptions = {}
    accountKeys.forEach(addAccount)
    var accountOptions
    function addAccount(item) {
        accountOptions[item] = result.accounts[item].name
    }

    var $el = $("#account");
    $el.empty(); // remove old options

    for (account in accountOptions) {
        $el.append($("<option></option>")
            .attr("value", account).text(result.accounts[account].name));

    }
    $("#account").val(result.currentAccount);

}

function getCurrency() {
    var result
    var scriptUrl = "/getCurrency";
    $.ajax({
        url: scriptUrl,
        type: 'get',
        dataType: 'html',
        async: false,
        success: function (data) {
            result = JSON.parse(data)
        }, timeout: 30000
    });
    $("#baseCurrency").val(result.currency)
    currentCurrency = result.currency
    console.log("current currency: " + result.currency)
}

function setCurrency(currency) {
    var result
    console.log("new currency: " + currency)

    var scriptUrl = "/setCurrency?currency=" + currency;
    $.ajax({
        url: scriptUrl,
        type: 'get',
        dataType: 'html',
        async: false,
        success: function (data) {
            result = JSON.parse(data)
        }, timeout: 30000
    });

    getBalance()
    getLastSellPrice()
    getCurrentPrice()
    getMinMaxPrice()

    getOpenOrder()
    updateUpDownPrice()
    readBotThresholds()
    alert('Currency changed')
}

function getCrypto() {
    var result
    var scriptUrl = "/getCrypto";
    $.ajax({
        url: scriptUrl,
        type: 'get',
        dataType: 'html',
        async: false,
        success: function (data) {
            result = JSON.parse(data)
        }, timeout: 30000
    });
    $(".crypto").text(result.crypto)
    $("#baseCrypto").val(result.crypto)
    currentCrypto = result.crypto
    console.log("current crypto: " + result.crypto)
}

function setCrypto(cryptocurrency) {
    var result
    console.log("new crypto: " + cryptocurrency)

    var scriptUrl = "/setCrypto?crypto=" + cryptocurrency;
    $.ajax({
        url: scriptUrl,
        type: 'get',
        dataType: 'html',
        async: false,
        success: function (data) {
            result = JSON.parse(data)
        }, timeout: 30000
    });

    $(".crypto").text(cryptocurrency)
    getBalance()
    getLastSellPrice()
    getCurrentPrice()
    getMinMaxPrice()

    getOpenOrder()
    updateUpDownPrice()
    readBotThresholds()
    alert('Crypto changed')
}

function getBalance() {
    var result
    var scriptUrl = "/getBalance";
    $.ajax({
        url: scriptUrl,
        type: 'get',
        dataType: 'html',
        async: false,
        success: function (data) {
            result = JSON.parse(data)
        }, timeout: 30000
    });
    console.log(result)
    $("#currency_available").text(parseFloat(result.currency_available).toFixed(4))
    $("#currency_reserved").text(parseFloat(result.currency_reserved).toFixed(4))
    $("#crypto_available").text(parseFloat(result.crypto_available).toFixed(4))
    $("#crypto_reserved").text(parseFloat(result.crypto_reserved).toFixed(4))
    getFee()
}

function getFee() {
    var result
    var scriptUrl = "/getFee";
    $.ajax({
        url: scriptUrl,
        type: 'get',
        dataType: 'html',
        async: false,
        success: function (data) {
            result = JSON.parse(data)
        }, timeout: 30000
    });
    $("#fee").text(result.fee)
    console.log(result)
}


function getLastSellPrice() {
    var result
    var scriptUrl = "/getLastSellPrice";
    $.ajax({
        url: scriptUrl,
        type: 'get',
        dataType: 'html',
        async: false,
        success: function (data) {
            result = JSON.parse(data)
        }, timeout: 30000
    });
    console.log(result)
    if (result.sellPrice != null) {
        $("#sellPrice").text(result.sellPrice.toFixed(4))

        getMinMaxPrice()
    }
}

function getMinMaxPrice() {
    const min = parseFloat($("#minimum").val())
    const max = parseFloat($("#maximum").val())
    const fee = parseFloat($("#fee").text())
    const sellPrice = parseFloat($("#sellPrice").text())
    const zeroLossPrice = (sellPrice * (1 - (2 * fee) / 100))
    const minimumPrice = (sellPrice * (1 + min / 100) * (1 - (2 * fee) / 100))
    const maximumPrice = (sellPrice * (1 + max / 100) * (1 - (2 * fee) / 100))
    $("#zeroLossPrice").text(zeroLossPrice.toFixed(4))
    $("#minimumPrice").text(minimumPrice.toFixed(4))
    $("#maximumPrice").text(maximumPrice.toFixed(4))

    const currency_available = parseFloat($("#currency_available").text())
    const currency_reserved = parseFloat($("#currency_reserved").text())
    if (0 == currency_available && 0 == currency_reserved) {
        return
    }
    var amount
    if (0 == currency_reserved) {
        amount = currency_available
    } else {
        amount = currency_reserved
    }
    amount = amount * (1 - fee / 100)
    $("#zeroLossCrypto").text((amount / zeroLossPrice).toFixed(4))
    $("#minimumCrypto").text((amount / minimumPrice).toFixed(4))
    $("#maximumCrypto").text((amount / maximumPrice).toFixed(4))

}

function getCurrentPrice() {
    var result
    var scriptUrl = "/getCurrentPrice";
    $.ajax({
        url: scriptUrl,
        type: 'get',
        dataType: 'html',
        async: false,
        success: function (data) {
            result = JSON.parse(data)
        }, timeout: 30000
    });
    $("#currentPrice").text(parseFloat(result.currentPrice).toFixed(4))
    $("#price_required").val(parseFloat(result.currentPrice).toFixed(4))
    console.log(result)
    getTargetCrypto(false)
}

function getTargetPrice(manuallyInvoked = false) {
    var result
    const fee = parseFloat($("#fee").text())
    const crypto_expected = parseFloat($("#crypto_expected").text())
    const currency_available = parseInt($("#currency_available").text())
    const currency_reserved = parseInt($('#currency_reserved').text())
    var amount = 0
    if (manuallyInvoked && 20 > currency_available && 20 > currency_reserved) {
        alert('only works with available or reserved currency (minimum 20$)')
        return
    }
    if (0 == currency_reserved) {
        amount = currency_available
    } else {
        amount = currency_reserved
    }
    amount = amount * (1 - fee / 100)
    const crypto_target = parseFloat($("#crypto_target").val())
    $("#price_required").val((amount / crypto_target).toFixed(4))
}

function getTargetCrypto(manuallyInvoked = false) {
    const fee = parseFloat($("#fee").text())
    const currency_available = parseInt($("#currency_available").text())
    const currency_reserved = parseInt($('#currency_reserved').text())
    var amount
    if (manuallyInvoked && 20 >= currency_available && 20 >= currency_reserved) {
        alert('only works with available or reserved currency (minimum 20$)')
        return
    }
    if (0 == currency_reserved) {
        amount = currency_available
    } else {
        amount = currency_reserved
    }
    amount = amount * (1 - fee / 100)
    const price_required = parseFloat($("#price_required").val())
    $("#crypto_target").val((amount / price_required).toFixed(4))
}

function getOpenOrder() {
    var result
    var scriptUrl = "/getOpenOrder";
    $.ajax({
        url: scriptUrl,
        type: 'get',
        dataType: 'html',
        async: false,
        success: function (data) {
            result = JSON.parse(data)
        }, timeout: 30000
    });
    $("#buyPrice").text(result.price)
    $("#buyCrypto").text(parseFloat(result.amount).toFixed(0))
    $("#orderID").text(result.id)
    $("#crypto_expected").text((parseFloat(result.amount)).toFixed(4))
    if ("1" == result.type) {
        $("#orderType").text("SELL")
        $("#orderType, #buyPrice, #orderID").addClass("typeSell");
        $("#orderType, #buyPrice, #orderID").removeClass("typeBuy");
    } else if ("0" == result.type) {
        $("#orderType").text("BUY")
        $("#orderType, #buyPrice, #orderID").addClass("typeBuy");
        $("#orderType, #buyPrice, #orderID").removeClass("typeSell");

    } else {
        $("#orderType").text("")
    }
    console.log(result)
    updateUpDownPrice()
}

function changeOrderPriceBy(where, how) {
    var changePriceBy = parseFloat($("#decreasePrice").val())

    if ('up' == how) {
        if ('1000' == where) {
            changePriceBy += 0.1
        } else if ('0100' == where) {
            changePriceBy += 0.01
        } else if ('0010' == where) {
            changePriceBy += 0.001
        } else if ('0001' == where) {
            changePriceBy += 0.0001
        }

    } else {
        if ('1000' == where) {
            changePriceBy -= 0.1
        } else if ('0100' == where) {
            changePriceBy -= 0.01
        } else if ('0010' == where) {
            changePriceBy -= 0.001
        } else if ('0001' == where) {
            changePriceBy -= 0.0001
        }
    }
    $("#decreasePrice").val(changePriceBy.toFixed(4))
    updateUpDownPrice()
}

function updateUpDownPrice() {
    const changePriceBy = parseFloat($("#decreasePrice").val())
    const buyPrice = parseFloat($("#buyPrice").text())
    const upPrice = buyPrice + changePriceBy
    const downPrice = buyPrice - changePriceBy
    $("#upPrice").text(upPrice.toFixed(4))
    $("#downPrice").text(downPrice.toFixed(4))
    const buyCrypto = parseFloat($("#buyCrypto").text())
    const usd = buyCrypto * buyPrice
    const upXRP = usd / upPrice
    const downXRP = usd / downPrice
    $("#upXRP").text(upXRP.toFixed(0))
    $("#downXRP").text(downXRP.toFixed(0))

}

function cancelOrder(type) {
    const orderID = $("#orderID").text()
    const price = parseFloat($("#buyPrice").text())
    const fee = parseFloat($("#fee").text()) / 100
    const decreaseBy = parseFloat($("#decreasePrice").val())
    var newPrice
    if ("lower" == type) {
        newPrice = price - decreaseBy
    } else {
        newPrice = price + decreaseBy
    }

    var result
    var scriptUrl = "/cancelOrder?id=" + orderID + "&newPrice=" + newPrice + "&fee=" + fee;
    console.log(scriptUrl)
    $.ajax({
        url: scriptUrl,
        type: 'get',
        dataType: 'html',
        async: false,
        success: function (data) {
            console.log(data)
            result = JSON.parse(data)
        }, timeout: 30000
    });
    $("#buyPrice").text(result.price)
    $("#orderID").text(result.id)
    $("#buyCrypto").text(parseFloat(result.amount).toFixed(4))
    console.log(result)
    updateUpDownPrice()

}

function readBotThresholds() {
    var result
    var scriptUrl = "/readBotThresholds";
    $.ajax({
        url: scriptUrl,
        type: 'get',
        dataType: 'html',
        async: false,
        success: function (data) {
            result = JSON.parse(data)
        }, timeout: 30000
    });
    $("#newHigh").val(result.high)
    $("#newLow").val(result.low)
    console.log(result)
}

function writeBotThresholds() {
    var result
    const high = $("#newHigh").val()
    const low = $("#newLow").val()
    var scriptUrl = "/writeBotThresholds?high=" + high + "&low=" + low;
    $.ajax({
        url: scriptUrl,
        type: 'get',
        dataType: 'html',
        async: false,
        success: function (data) {
            result = JSON.parse(data)
        }, timeout: 30000
    });
    if (result.result == "failure") {
        alert("thresholds could not be written")
    } else if (result.result == "success") {
        alert("thresholds written")
    }
    console.log(result)
}


function buyNow() {
    var result
    var scriptUrl = "/buyNow"
    console.log(scriptUrl)
    $.ajax({
        url: scriptUrl,
        type: 'get',
        dataType: 'html',
        async: false,
        success: function (data) {
            console.log(data)
            result = JSON.parse(data)
        }, timeout: 30000
    });
    getBalance()
    alert("bought")
    console.log(result)
}


function sellNow() {
    var result
    var scriptUrl = "/sellNow"
    console.log(scriptUrl)
    $.ajax({
        url: scriptUrl,
        type: 'get',
        dataType: 'html',
        async: false,
        success: function (data) {
            console.log(data)
            result = JSON.parse(data)
        }, timeout: 30000
    });
    getBalance()
    alert("sold")
    console.log(result)
}


function setDefaultCurrencyAmount() {
    $("#currency_reserved").text($("#defaultAmount").val())
    $("#currency_available").text("0")
}

function setDefaultSellPrice() {
    $("#sellPrice").text($("#defaultSellPrice").val())
}

function reduceLists(selectedCurrency, selectedCrypto) {
    availableCryptos = []
    availableCurrencies = []

    for ([key, value] of Object.entries(currencyPairs)) {
        if (selectedCrypto == value.crypto) {
            // add to availableCurrencies
            if (selectedCrypto != value.currency) {
                availableCurrencies.push(value.currency)
            }

        }
        if (selectedCurrency == value.currency) {
            // add to availableCryptos
            if (selectedCrypto != value.currency) {
                availableCryptos.push(value.crypto)
            }
        }
    }
    availableCryptos.sort()
    availableCurrencies.sort()
}

function setCryptoOptions(selectedCurrency, backendRefresh) {

    const selectedCrypto = $("#baseCrypto option:selected").text();
    if (backendRefresh) {
        setCurrency(selectedCurrency)
    }


    if ("" != selectedCrypto) {
        reduceLists(selectedCurrency, selectedCrypto)
    }

    var $el = $("#baseCrypto");
    $el.empty(); // remove old options


    for (i = 0; i < availableCryptos.length; i++) {
        item = availableCryptos[i]
        $el.append($("<option></option>")
            .attr("value", item).text(item));
    }

    $("#baseCrypto").val(selectedCrypto);
}
function setCurrencyOptions(selectedCrypto, backendRefresh) {
    const selectedCurrency = $("#baseCurrency option:selected").text();

    if (backendRefresh) {
        setCrypto(selectedCrypto)
    }


    if ("" != selectedCurrency) {
        reduceLists(selectedCurrency, selectedCrypto)
    }

    var $el = $("#baseCurrency");
    $el.empty(); // remove old options

    availableCurrencies.forEach(function (item, index) {
        $el.append($("<option></option>")
            .attr("value", item).text(item));
    });

    $("#baseCurrency").val(selectedCurrency);
}

function changePage(id) {
    const pages = { Trading, currencyPairs, Transactions }


    if (id == "currencyPairs") {
        // show list ordered by crypto
        var byCrypto = ["<b>Pairs by Crypto</b>"]
        for ([key, value] of Object.entries(currencyPairs)) {
            byCrypto.push("<span class='left'>" + value.crypto + "</span><span class='right'>" + value.currency + "</span>")
        }
        byCrypto.sort()

        $("#pairsByCrypto").html(byCrypto.join("<br>"));        // show list ordered by currency


        byCurrency = []
        for ([key, value] of Object.entries(currencyPairs)) {
            e = ["<span class='left'>" + value.crypto + "</span><span class='right'>" + value.currency + "</span>", value.currency + " / " + value.crypto]
            byCurrency.push(e)
        }

        byCurrency.sort(function (a, b) {
            if (a[1] < b[1]) return -1;
            if (a[1] > b[1]) return 1;
            return 0;
        })
        var byCurrencySorted = ["<b>Pairs by Currency</b>"]
        for (var i = 0; i < byCurrency.length; i++) {
            byCurrencySorted.push(byCurrency[i][0])
        }

        $("#pairsByCurrency").html(byCurrencySorted.join("<br>"));        // show list ordered by currency


    }


    for ([key] of Object.entries(pages)) {
        if (key == id) {
            $("#" + id).show()
        } else {
            $("#" + key).hide()
        }
    }

}


function getTransactions() {
    try {
        var result
        const dateFromString = $("#dateFrom").val()
        console.log("date from string", dateFromString)
        const dateFrom = new Date(dateFromString)
        if (isNaN(dateFrom)) {
            alert("invalid date")
            return
        }
        console.log("date from", dateFrom)

        var scriptUrl = "/getTransactions?dateFrom=" + dateFromString;
        $.ajax({
            url: scriptUrl,
            type: 'get',
            dataType: 'html',
            async: false,
            success: function (data) {
                result = JSON.parse(data)
            }, timeout: 30000
        });
        console.log(result)

        var table = createTable(result);
        $("#transactionsContainer").html(table);
        var date = $("#dateFrom").val()
        $("#download").attr('href', "/download?dateFrom=" + date)
        $("#download").show()
    } catch (error) {
        alert(error)
    }

}


function createTable(mydata) {

    var table = "<table border='1'>";
    var tblHeader = "<tr>";
    for (var k in mydata[0]) {
        if (k != "order_id" && k != "id") {
            if (k == "a1" || k == "a2") {
                tblHeader += "<th>Amount</th>"
            } else if (k == "p1" || k == "p2") {
                tblHeader += "<th>Code</th>"
            } else {
                tblHeader += "<th>" + k + "</th>"
            }

        }
    }
    tblHeader += "</tr>"

    table += tblHeader
    var tblRow = ""
    for (var i in mydata) {
        for (var j in mydata[i]) {
            if (j != "order_id" && j != "id") {
                if ("price" == j || "a1" == j || "a2" == j) {
                    tblRow += "<td>" + parseFloat(mydata[i][j]).toFixed(4) + "</td>"
                } else {
                    tblRow += "<td>" + mydata[i][j].toUpperCase() + "</td>"
                }

            }
            if (j == "a1") {
                if (0 > mydata[i][j]) {
                    isSell = true
                } else {
                    isSell = false
                }
            }
        }
        if (isSell) {
            tblRow = "<tr class='typeSell'>" + tblRow + "</tr>"
        } else {
            tblRow = "<tr class='typeBuy'>" + tblRow + "</tr>"
        }
        table += tblRow
        tblRow = ""
    }

    // $.each(mydata, function (index, value) {
    //     var TableRow = "<tr>";
    //     $.each(value, function (key, val) {
    //         TableRow += "<td>" + val + "</td>";
    //     });
    //     TableRow += "</tr>";
    //     $(table).append(TableRow);
    // });
    return table;
};

