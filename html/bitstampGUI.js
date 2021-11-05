const version = "2.0.8"
console.log("bitstampGUI.js", version)
var currentCurrency = ""
var currentCrypto = ""
var currentProfile = ""

var myCookie = {}
var decimals = 4
var masks = {}
var profiles
var accountOverview
var availableCryptos = []
var availableCurrencies = []
var currencyPairs = {}

function init() {
    getCryptoPairs()
    changePage("pageTrading")
    getProfiles()
    getCurrency()
    getCrypto()
    getMasks()
    var mode = getMode()
    var holdingCrypto = areWeHoldingCrypto()
    if (holdingCrypto) {
        $(".crypto").text(currentCurrency)
    } else {
        $(".crypto").text(currentCrypto)

    }

    reduceLists(currentCurrency, currentCrypto)
    console.log("currentCurrency: " + currentCurrency)
    console.log("currentCrypto: " + currentCrypto)
    setCryptoOptions(currentCurrency, false)
    setCurrencyOptions(currentCrypto, false)
    $("#baseCrypto").val(currentCrypto);
    $("#baseCurrency").val(currentCurrency);


    getCurrentPrice()
    getCurrentMask()
    getCurrentPrice()
    getBalance()
    getLastTradePrice()

    getMinMaxPrice()

    getOpenOrder()
    updateUpDownPrice()
    readBotThresholds()

}

function setBalance(mode) {
    if (mode) {
        $("#currency_available").text(0)
        $("#currency_reserved").text(10000)
        $("#crypto_available").text(0)
        $("#crypto_reserved").text(0)
        $(".crypto").text(currentCrypto)
    } else {
        $("#currency_available").text(0)
        $("#currency_reserved").text(0)
        $("#crypto_available").text(0)
        $("#crypto_reserved").text(1000)
        $(".crypto").text(currentCurrency)
    }

}


function getMode() {
    var scriptUrl = "/getMode";
    $.ajax({
        url: scriptUrl,
        type: 'get',
        dataType: 'html',
        async: false,
        success: function (data) {
            result = JSON.parse(data)
        }, timeout: 30000
    });

    console.log("simulate", result)
    $("#mode").val(result)
    if (result) {
        $("#simulate").show()
    }
}

function changeProfile(profile) {

    console.log("new profile: " + profile)
    var params = { "profile": profile }
    var scriptUrl = "/changeProfile";
    $.ajax({
        url: scriptUrl,
        type: 'post',
        dataType: 'json',
        contentType: 'application/json',
        async: false,
        data: JSON.stringify(params),
        success: function (data) {
            result = data
        }, timeout: 30000
    });
    currentProfile = profile

    var prevPage = $("#page option:selected").val();
    init()

    $("#page").val(prevPage).change();
    alert('profile changed')
}

function getProfiles() {
    var result
    var scriptUrl = "/getProfiles";
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
    profiles = result.profiles
    // update Profile Switcher
    const profileKeys = Object.keys(result.profiles)
    console.log(profileKeys)

    var profileOptions = {}
    profileKeys.forEach(addProfile)
    var profileOptions
    function addProfile(item) {
        profileOptions[item] = result.profiles[item].name
    }

    var $el = $("#profile");
    $el.empty(); // remove old options

    for (profile in profileOptions) {
        $el.append($("<option></option>")
            .attr("value", profile).text(result.profiles[profile].name));

    }
    $("#profile").val(result.currentProfile);

}

function getCryptoPairs() {
    var result
    var scriptUrl = "/getCryptoPairs";
    $.ajax({
        url: scriptUrl,
        type: 'get',
        dataType: 'json',
        async: false,
        success: function (data) {
            result = data
        }, timeout: 30000
    });

    console.log(result)
    currencyPairs = result

}


function getMasks() {
    var result
    var scriptUrl = "/readMasks";
    $.ajax({
        url: scriptUrl,
        type: 'get',
        dataType: 'json',
        async: false,
        success: function (data) {
            result = data
        }, timeout: 30000
    });

    if ("result" in result && result.result == "failure") {
        console.log("maybe masks file doesn't exit yet")
    } else {
        masks = result
        console.log("masks", result)
    }
}

function writeMasks() {
    var currency = $("#baseCrypto").val()
    console.log(masks)
    masks[currency] = $("#mask").val()


    var scriptUrl = "/writeMasks";
    $.ajax({
        url: scriptUrl,
        type: 'post',
        dataType: 'json',
        contentType: 'application/json',
        async: false,
        data: JSON.stringify(masks),
        success: function (data) {
            result = data
        }, timeout: 30000
    });

    if ("result" in result && result.result == "failure") {
        console.log("maybe masks file doesn't exit yet")
    } else if ("result" in result && result.result == "success") {
        alert("current mask is saved")
        console.log("masks have been written")
    }
}


function getMultiplier(defaultMask = undefined) {

    var mask
    if (defaultMask === undefined) {
        mask = $("#mask").val()
    } else {
        mask = defaultMask
    }

    var decimalPoint = mask.indexOf(".")
    var p1 = mask.indexOf("1")
    var p2 = mask.indexOf("1", p1 + 1)
    var p3 = mask.indexOf("1", p2 + 1)
    var p4 = mask.indexOf("1", p3 + 1)

    // 10 to the power of decimal point position - position of 1 - if decimal point position is > position 1 1, otherwise 0
    var m1 = 10 ** ((decimalPoint - (decimalPoint > p1 ? 1 : 0)) - p1)
    var m2 = 10 ** ((decimalPoint - (decimalPoint > p2 ? 1 : 0)) - p2)
    var m3 = 10 ** ((decimalPoint - (decimalPoint > p3 ? 1 : 0)) - p3)
    var m4 = 10 ** ((decimalPoint - (decimalPoint > p4 ? 1 : 0)) - p4)

    var multiplier = { '1000': m1, '0100': m2, '0010': m3, '0001': m4 }
    return multiplier
}

function testMask() {
    $("#changeBy").val(parseFloat($("#mask").val()).toFixed(decimals))
    $("#originalPrice").val((0).toFixed(decimals))
    var originalPrice = parseFloat($("#originalPrice").val())
    var changeBy = parseFloat($("#changeBy").val())
    $("#priceUp").text((originalPrice + changeBy).toFixed(decimals))
    $("#priceDown").text((originalPrice - changeBy).toFixed(decimals))
}
// if the mask is equal to the price
function getMask(defaultPrice = undefined) {

    var price
    var maskEditorOpen = false
    if (undefined === defaultPrice) {
        copyCurrentPrice()
        price = parseFloat($("#originalPrice").val())
        maskEditorOpen = true
    } else {
        price = defaultPrice
    }
    var string = (price).toFixed(8).toString()
    var mask = ""
    var i = 0
    var decimalAdded = false
    var cstring = string.split("")

    for (var p = 0; p < cstring.length; p++) {
        var c = cstring[p]
        if ("." == c) {
            decimalAdded = true
            mask += "."
        } else {
            if (!decimalAdded) {
                if (i < 4) {
                    if (i == 0) {
                        if ("0" == c) {
                            mask += "0"
                        } else {
                            mask += "1"
                            i++
                        }
                    } else {
                        mask += "1"
                        i++

                    }
                } else {
                    mask += "0"
                }
            } else {
                if (i > 0) {
                    mask += "1"
                    i++
                } else {
                    if ("0" == c) {
                        mask += "0"
                    } else {
                        mask += "1"
                        i++
                    }
                }
            }
        }
        // do we have 4 ones, then exit
        if (4 == i && decimalAdded) {
            break
        }
    }
    if (0 > mask.indexOf(".")) {
        mask += ".0"
    }

    if (maskEditorOpen) {
        $("#mask").val(mask)

        formatMask()
        $("#changeBy").val(0)

        var originalPrice = parseFloat($("#originalPrice").val())
        var changeBy = parseFloat($("#changeBy").val())
        $("#priceUp").text((originalPrice + changeBy).toFixed(decimals))
        $("#priceDown").text((originalPrice - changeBy).toFixed(decimals))

    } else {
        $("#mask").val(mask)

        masks[currentCrypto] = mask
        formatMask(mask)
    }


}

function copyCurrentPrice() {
    $("#originalPrice").val(parseFloat($("#currentPrice").text()).toFixed(decimals))

}

function changePriceBy(where, how) {
    var multiplier = getMultiplier()
    var changePriceBy = parseFloat($("#changeBy").val())

    if ('up' == how) {
        changePriceBy += multiplier[where]
    } else {
        changePriceBy -= multiplier[where]
    }
    $("#changeBy").val(changePriceBy.toFixed(decimals))

    var originalPrice = parseFloat($("#originalPrice").val())
    var changeBy = parseFloat($("#changeBy").val())
    $("#priceUp").text((originalPrice + changeBy).toFixed(decimals))
    $("#priceDown").text((originalPrice - changeBy).toFixed(decimals))

}

function formatMask(defaultMask = undefined) {
    // get decimals
    var mask
    var maskEditorOpen = false
    if (undefined === defaultMask) {
        mask = $("#mask").val()
        maskEditorOpen = true
    } else {
        mask = defaultMask
    }

    if (0 > mask.indexOf(".")) {
        mask += ".0"
    }
    if ("." == mask.substr(mask.length - 1, 1)) {
        mask += "0"
    }
    if (maskEditorOpen) {
        $("#mask").val(mask)
    } else {
        masks[currentCrypto] = mask
    }


    var l = mask.length
    var posDec = mask.indexOf(".") + 1
    // global variable 
    decimals = l - posDec

    if (maskEditorOpen) {
        var originalPrice = parseFloat($("#originalPrice").val())
        $("#originalPrice").val(originalPrice.toFixed(decimals))
        moveMarker()
    }
}

function moveMarker() {
    var mask = $("#mask").val()

    // pad mask
    var paddedMask = mask
    while (paddedMask.length < 12) {
        paddedMask = "0" + paddedMask
    }

    var g = false
    var b = false
    var y = false
    var r = false
    // remove all classes and emptyMarker class
    for (var i = 1; i <= 12; i++) {
        var tag = "#" + i
        $(tag).removeClass("emptyMarker")
        $(tag).removeClass("blueMarker")
        $(tag).removeClass("yellowMarker")
        $(tag).removeClass("greenMarker")
        $(tag).removeClass("redMarker")
    }

    for (var i = 0; i < paddedMask.length; i++) {
        var c = paddedMask.substr(i, 1)
        var tag = "#" + (i + 1)
        if ("1" == c) {
            if (!g) {
                $(tag).addClass("greenMarker")
                g = true
            } else if (!r) {
                $(tag).addClass("redMarker")
                r = true
            } else if (!y) {
                $(tag).addClass("yellowMarker")
                y = true
            } else if (!b) {
                $(tag).addClass("blueMarker")
                b = true
            }

        } else {
            $(tag).addClass("emptyMarker")
        }
    }

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

    var params = { "currency": currency }

    var scriptUrl = "/setCurrency";
    $.ajax({
        url: scriptUrl,
        type: 'post',
        dataType: 'json',
        contentType: 'application/json',
        async: false,
        data: JSON.stringify(params),
        success: function (data) {
            result = data
        }, timeout: 30000
    });

    currentCurrency = currency
    getCurrentPrice()
    getCurrentMask()
    getCurrentPrice()
    getBalance()
    getLastTradePrice()
    getMinMaxPrice()
    getOpenOrder()

    updateUpDownPrice()
    readBotThresholds()
    $("#decreasePrice").val(0)
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
    $("#baseCrypto").val(result.crypto)
    currentCrypto = result.crypto
    console.log("current crypto: " + result.crypto)
}

function setCrypto(cryptocurrency) {
    var result
    console.log("new crypto: " + cryptocurrency)

    var params = { "crypto": cryptocurrency }

    var scriptUrl = "/setCrypto";
    $.ajax({
        url: scriptUrl,
        type: 'post',
        dataType: 'json',
        contentType: 'application/json',
        async: false,
        data: JSON.stringify(params),
        success: function (data) {
            result = data
        }, timeout: 30000
    });
    console.log(result)
    $(".crypto").text(cryptocurrency)
    currentCrypto = cryptocurrency
    getCurrentPrice()
    getCurrentMask()
    getCurrentPrice()
    getBalance()
    getLastTradePrice()
    getMinMaxPrice()
    getOpenOrder()

    updateUpDownPrice()
    readBotThresholds()
    $("#decreasePrice").val(0)
    alert('Crypto changed')
}

function showMaskEditor() {
    html = $("#maskEditor").html()
    if ("" == html) {
        $("#maskEditor").load("maskEditor.html", function () {
            console.log("mask editor loaded")
        });

    } else {
        $("#maskEditor").show()
    }
}

function hideMaskEditor() {
    $("#maskEditor").hide()
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
    $("#crypto_available").text(parseFloat(result.crypto_available).toFixed(8))
    $("#crypto_reserved").text(parseFloat(result.crypto_reserved).toFixed(8))
    getFee()
    var holdingCrypto = areWeHoldingCrypto()
    if (holdingCrypto) {
        $(".crypto").text(currentCurrency)
    } else {
        $(".crypto").text(currentCrypto)

    }
}

function getCurrentBalance(crypto) {
    var available
    var reserved
    if (crypto) {
        available = parseFloat($("#crypto_available").text())
        reserved = parseFloat($("#crypto_reserved").text())
    } else {
        available = parseFloat($("#currency_available").text())
        reserved = parseFloat($("#currency_reserved").text())
    }
    if (0 < reserved) {
        return reserved
    } else {
        return available
    }
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

// tells if we are having either crypto available or reserved
function areWeHoldingCrypto() {
    const currency_available = parseFloat($("#currency_available").text())
    const currency_reserved = parseFloat($("#currency_reserved").text())
    const crypto_available = parseFloat($("#crypto_available").text())
    const crypto_reserved = parseFloat($("#crypto_reserved").text())
    if (1 <= currency_available || 1 <= currency_reserved) {
        return false
    } else {
        return true
    }
}


function getLastTradePrice() {
    var result
    var scriptUrl = "/getLastTradePrice";
    const crypto = areWeHoldingCrypto()

    var params = { type: crypto }

    var result
    $.ajax({
        url: scriptUrl,
        type: 'post',
        dataType: 'json',
        contentType: 'application/json',
        async: false,
        data: JSON.stringify(params),
        success: function (data) {
            console.log(data)
            result = data
        }, timeout: 30000
    });

    console.log(result)
    if (result.tradePrice != null) {
        $("#tradePrice").text(result.tradePrice.toFixed(decimals))
        $("#referenceTradePrice").val(result.tradePrice.toFixed(decimals))
        getMinMaxPrice()
    } else {
        $("#tradePrice").text(NaN)
    }
}

function getMinMaxPrice() {
    var holdingCrypto = areWeHoldingCrypto()
    if (holdingCrypto) {
        available = parseFloat($("#crypto_available").text())
        reserved = parseFloat($("#crypto_reserved").text())
    } else {

        available = parseFloat($("#currency_available").text())
        reserved = parseFloat($("#currency_reserved").text())
    }


    const min = parseFloat($("#minimum").val())
    const max = parseFloat($("#maximum").val())
    const fee = parseFloat($("#fee").text())
    const tradePrice = parseFloat($("#tradePrice").text())
    var zeroLossPrice
    var minimumPrice
    var maximumPrice
    if (holdingCrypto) {
        zeroLossPrice = (tradePrice * (1 + (2 * fee) / 100))
        minimumPrice = (tradePrice * (1 + min / 100) * (1 + (2 * fee) / 100))
        maximumPrice = (tradePrice * (1 + max / 100) * (1 + (2 * fee) / 100))
    } else {
        zeroLossPrice = (tradePrice * (1 - (2 * fee) / 100))
        minimumPrice = (tradePrice * (1 + min / 100) * (1 - (2 * fee) / 100))
        maximumPrice = (tradePrice * (1 + max / 100) * (1 - (2 * fee) / 100))
    }
    $("#zeroLossPrice").text(zeroLossPrice.toFixed(decimals))
    $("#minimumPrice").text(minimumPrice.toFixed(decimals))
    $("#maximumPrice").text(maximumPrice.toFixed(decimals))
    var reserved
    var available


    var amount
    if (0 == reserved) {
        amount = available
    } else {
        amount = reserved
    }

    if (holdingCrypto) {
        amount = amount * (1 + fee / 100)
        $("#zeroLossCrypto").text((amount * zeroLossPrice).toFixed(8))
        $("#minimumCrypto").text((amount * minimumPrice).toFixed(8))
        $("#maximumCrypto").text((amount * maximumPrice).toFixed(8))
    } else {
        amount = amount * (1 - fee / 100)
        $("#zeroLossCrypto").text((amount / zeroLossPrice).toFixed(8))
        $("#minimumCrypto").text((amount / minimumPrice).toFixed(8))
        $("#maximumCrypto").text((amount / maximumPrice).toFixed(8))
    }


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
    $("#currentPrice").text(parseFloat(result.currentPrice).toFixed(decimals))
    $("#price_required").val(parseFloat(result.currentPrice).toFixed(decimals))
    console.log(result)
    getTargetCrypto(false)
}

function getTargetPrice(manuallyInvoked = false) {

    var holdingCrypto = areWeHoldingCrypto()

    const fee = parseFloat($("#fee").text())

    var amount = getCurrentBalance(holdingCrypto)

    if (holdingCrypto) {
        amount = amount * (1 - fee / 100)
        const crypto_target = parseFloat($("#crypto_target").val())
        $("#price_required").val((crypto_target / amount).toFixed(decimals))
    } else {
        amount = amount * (1 + fee / 100)
        const crypto_target = parseFloat($("#crypto_target").val())
        $("#price_required").val((amount / crypto_target).toFixed(decimals))
    }

}

function getTargetCrypto(manuallyInvoked = false) {
    var holdingCrypto = areWeHoldingCrypto()

    const fee = parseFloat($("#fee").text())

    var amount = getCurrentBalance(holdingCrypto)

    if (holdingCrypto) {
        amount = amount * (1 - fee / 100)
        const price_required = parseFloat($("#price_required").val())
        $("#crypto_target").val((amount * price_required).toFixed(8))

    } else {
        amount = amount * (1 - fee / 100)
        const price_required = parseFloat($("#price_required").val())
        $("#crypto_target").val((amount / price_required).toFixed(8))
    }
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
    $("#buyPrice").text(parseFloat(result.price).toFixed(decimals))
    $("#buyCrypto").text(parseFloat(result.amount).toFixed(8))
    $("#orderID").text(result.id)
    $("#crypto_expected").text((parseFloat(result.amount)).toFixed(8))
    if ("1" == result.type) {
        $("#orderType").text("SELL")
        $("#buyCrypto").text(parseFloat(result.amount * result.price).toFixed(decimals))
        $("#orderType, #buyPrice, #orderID").addClass("typeSell");
        $("#orderType, #buyPrice, #orderID").removeClass("typeBuy");
    } else if ("0" == result.type) {
        $("#orderType").text("BUY")
        $("#orderType, #buyPrice, #orderID").addClass("typeBuy");
        $("#orderType, #buyPrice, #orderID").removeClass("typeSell");

    } else {
        $("#orderType").text("")
        $("#orderType, #buyPrice, #orderID").removeClass("typeBuy");
        $("#orderType, #buyPrice, #orderID").removeClass("typeSell");

    }
    console.log(result)
    updateUpDownPrice()
}

function changeOrderPriceBy(where, how) {

    getCurrentMask()
    // at this point the mask needs be available in the masks object
    var multiplier = getMultiplier(masks[currentCrypto])
    var changePriceBy = parseFloat($("#decreasePrice").val())

    if ('up' == how) {
        changePriceBy += multiplier[where]
    } else {
        changePriceBy -= multiplier[where]
    }
    $("#decreasePrice").val(changePriceBy.toFixed(decimals))

    updateUpDownPrice()
}

function updateUpDownPrice() {
    var type = $("#orderType").text()

    if ("SELL" == type) {
        const changePriceBy = parseFloat($("#decreasePrice").val())
        const buyPrice = parseFloat($("#buyPrice").text())
        const upPrice = buyPrice + changePriceBy
        const downPrice = buyPrice - changePriceBy
        $("#upPrice").text(upPrice.toFixed(decimals))
        $("#downPrice").text(downPrice.toFixed(decimals))
        const buyCurrency = parseFloat($("#buyCrypto").text())
        const buyCrypto = buyCurrency / buyPrice
        const upXRP = buyCrypto * upPrice
        const downXRP = buyCrypto * downPrice
        $("#upXRP").text(upXRP.toFixed(8))
        $("#downXRP").text(downXRP.toFixed(8))

    } else {
        const changePriceBy = parseFloat($("#decreasePrice").val())
        const buyPrice = parseFloat($("#buyPrice").text())
        const upPrice = buyPrice + changePriceBy
        const downPrice = buyPrice - changePriceBy
        $("#upPrice").text(upPrice.toFixed(decimals))
        $("#downPrice").text(downPrice.toFixed(decimals))
        const buyCrypto = parseFloat($("#buyCrypto").text())
        const usd = buyCrypto * buyPrice
        const upXRP = usd / upPrice
        const downXRP = usd / downPrice
        $("#upXRP").text(upXRP.toFixed(8))
        $("#downXRP").text(downXRP.toFixed(8))

    }

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

    var params = { id: orderID, "newPrice": newPrice, "fee": fee }

    var result
    var scriptUrl = "/cancelOrder"
    console.log(scriptUrl)
    $.ajax({
        url: scriptUrl,
        type: 'post',
        dataType: 'json',
        contentType: 'application/json',
        async: false,
        data: JSON.stringify(params),
        success: function (data) {
            console.log(data)
            result = data
        }, timeout: 30000
    });
    $("#buyPrice").text(result.price)
    $("#orderID").text(result.id)
    $("#buyCrypto").text(parseFloat(result.amount).toFixed(8))
    if ("1" == result.type) {
        $("#orderType").text("SELL")
        $("#orderType, #buyPrice, #orderID").addClass("typeSell");
        $("#orderType, #buyPrice, #orderID").removeClass("typeBuy");

    } else {
        $("#orderType").text("BUY")
        $("#orderType, #buyPrice, #orderID").addClass("typeBuy");
        $("#orderType, #buyPrice, #orderID").removeClass("typeSell");
    }

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
    const price = $("#referenceTradePrice").val()

    var thresholds = {}
    thresholds['high'] = parseFloat(high)
    thresholds['low'] = parseFloat(low)
    thresholds['referenceTradePrice'] = parseFloat(price)

    var scriptUrl = "/writeBotThresholds";
    $.ajax({
        url: scriptUrl,
        type: 'post',
        dataType: 'json',
        contentType: 'application/json',
        async: false,
        data: JSON.stringify(thresholds),
        success: function (data) {
            result = data
        }, timeout: 30000
    });
    console.log(result)
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
    const pages = { pageTrading, pageCurrencyPairs, pageTransactions, pageAccounts }


    if (id == "pageCurrencyPairs") {
        getCurrencyPairs()
    }

    if (id == "pageAccounts") {
        getAccountsOverview()
        populateTransferAccounts()
    }


    for ([key] of Object.entries(pages)) {
        if (key == id) {
            $("#" + id).show()
        } else {
            $("#" + key).hide()
        }
    }

}

function populateCurrencyToTransfer(accountFrom) {

    // get account name
    var accountName = profiles[accountFrom].name

    var $c = $("#transferCurrency");
    $c.empty(); // remove old options
    for (var i in accountOverview) {
        if (accountName == accountOverview[i].account && 0 < accountOverview[i].available) {
            $c.append($("<option></option>")
                .attr("value", accountOverview[i].currency).text(accountOverview[i].currency.toUpperCase()));

        }
    }

    populateTransferAccounts()

    // remove option from toAccount
    $("#toAccount option[value='" + accountFrom + "']").each(function () {
        $(this).remove();
    });
}

function populateTransferAccounts() {

    // get selected fromAccount
    var fromAccount = $("#fromAccount").val();
    // populate form with from/to/currency
    var $from = $("#fromAccount");
    var $to = $("#toAccount");
    $from.empty(); // remove old options
    $to.empty(); // remove old options

    $from.append($("<option></option>")
        .attr("value", "default").text("select from Account"));
    $to.append($("<option></option>")
        .attr("value", "default").text("select to Account"));

    for (var profile in profiles) {
        if ('uniqueID' in profiles[profile]) {
            var accountName = profiles[profile].name
            for (var i in accountOverview) {
                if (accountName == accountOverview[i].account && 0 < accountOverview[i].available) {
                    $from.append($("<option></option>")
                        .attr("value", profile).text(profiles[profile].name));
                    break

                }
            }
            $to.append($("<option></option>")
                .attr("value", profile).text(profiles[profile].name));
        }
    }
    if ("" != fromAccount) {
        $("#fromAccount").val(fromAccount);
    } else {
        $("#fromAccount").val("default");
    }

}

function transferFunds() {
    var fromAccount = $("#fromAccount").val();
    var toAccount = $("#toAccount").val();
    var transferCurrency = $("#transferCurrency").val().toUpperCase()
    var transferAmount = parseFloat($("#transferAmount").val())

    if (isNaN(transferAmount)) {
        alert("Please enter a valid number in the amount field")
        return
    }

    var params = {
        "fromAccount": fromAccount, "toAccount": toAccount, "transferCurrency": transferCurrency, "transferAmount": transferAmount
    }


    // if all is fine initiate transfer
    var result
    var scriptUrl = "/transferFunds"


    console.log(scriptUrl)
    $.ajax({
        url: scriptUrl,
        type: 'post',
        dataType: 'json',
        contentType: 'application/json',
        async: false,
        data: JSON.stringify(params),
        success: function (data) {
            console.log(data)
            result = data
        }, timeout: 30000
    });
    console.log(result)

    if ("success" == result.result) {
        getAccountsOverview()
    }
}


function getAccountsOverview() {
    var result
    var scriptUrl = "/getAccountsOverview"
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
    console.log("getAccountsOverview")
    console.log(result)
    accountOverview = result
    createOverviewTable(false)
}

function getCurrencyPairs() {
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

        var params = { "dateFrom": dateFromString }
        var isSuccess = false
        var scriptUrl = "/getTransactions";
        $.ajax({
            url: scriptUrl,
            type: 'post',
            dataType: 'json',
            contentType: 'application/json',
            async: false,
            data: JSON.stringify(params),
            success: function (data) {
                result = data
                isSuccess = true
            },
            timeout: 30000
        });
        console.log(result)
        if (isSuccess) {
            var table = createPairsTable(result);
            $("#transactionsContainer").html(table);
            var date = $("#dateFrom").val()
            $("#download").attr('href', "/download?dateFrom=" + date)
            $("#download").show()

        } else {
            alert('something went wrong')
        }
    } catch (error) {
        alert(error)
    }

}


function createPairsTable(mydata) {

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
                    tblRow += "<td>" + parseFloat(mydata[i][j]).toFixed(8) + "</td>"
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

    return table;
};

function createOverviewTable(byAccount) {
    var mydata = accountOverview
    // mydata.sort(function (a, b) { return a - b });
    var table = ""
    var currencyTotals = {}
    if (byAccount) {
        // sort by account
        mydata.sort(function (a, b) {
            if (a.account == b.account) {
                return a.currency > b.currency ? 1 : -1
            }
            return a.account > b.account ? 1 : -1
        })

        // get proper header
        table = '<table><tr class="double_bottom_border"><th class="row_label columnAccount">Account</th><th class="columnCurrency row_label"><a href="javascript:createOverviewTable(false)">Currency</a></th><th class="column_label">available</th><th class="column_label">reserved</th></tr>'
        for (var i = 0; i < mydata.length; i++) {
            if (i < (mydata.length - 1) && mydata[i + 1].account != mydata[i].account) {
                table += '<tr class="bottom_border"><td class="row_label columnAccount">' + mydata[i].account + ' </td><td class="columnCurrency">' + mydata[i].currency.toUpperCase() + '</td><td class="value columnAmount">' + mydata[i].available.toFixed(8) + ' </td><td class="value columnAmount">' + mydata[i].reserved.toFixed(8) + '</td></tr>'
            } else {
                table += '<tr><td class="row_label columnAccount">' + mydata[i].account + ' </td><td class="columnCurrency">' + mydata[i].currency.toUpperCase() + '</td><td class="value columnAmount">' + mydata[i].available.toFixed(8) + ' </td><td class="value columnAmount">' + mydata[i].reserved.toFixed(8) + '</td></tr>'
            }
        }
        // $("#transfer").hide()
    } else {
        // sort by currency
        mydata = mydata.sort(function (a, b) {
            if (a.currency == b.currency) {
                return a.account > b.account ? 1 : -1
            } return a.currency > b.currency ? 1 : -1
        })

        // get totals
        for (var i = 0; i < mydata.length; i++) {
            if (mydata[i].currency in currencyTotals) {
                // add to the total
                var at = mydata[i].available + currencyTotals[mydata[i].currency].available
                var rt = mydata[i].reserved + currencyTotals[mydata[i].currency].reserved
                currencyTotals[mydata[i].currency] = { available: at, reserved: rt }
            } else {
                // create the element 
                currencyTotals[mydata[i].currency] = { available: mydata[i].available, reserved: mydata[i].reserved }
            }

        }


        // get proper header
        table = '<table><tr class="double_bottom_border"><th class="columnCurrency row_label">Currency</th><th class="row_label"><a href="javascript:createOverviewTable(true)">Account</a></th><th class="column_label">available</th><th class="column_label">reserved</th></tr>'

        var ct = ""
        for (var i = 0; i < mydata.length; i++) {
            if (ct != "" && ct != mydata[i].currency) {
                // add total
                table += '<tr class="double_bottom_border top_border"><td class="row_label">' + ct.toUpperCase() + ' </td><td class="row_label">Total</td><td class="value total">' + currencyTotals[mydata[i - 1].currency].available.toFixed(8) + ' </td><td class="value total">' + currencyTotals[mydata[i - 1].currency].reserved.toFixed(8) + '</td></tr>'
            }

            table += '<tr><td class="row_label">' + mydata[i].currency.toUpperCase() + ' </td><td class="columnAccount">' + mydata[i].account + '</td><td class="value columnAmount">' + mydata[i].available.toFixed(8) + ' </td><td class="value columnAmount">' + mydata[i].reserved.toFixed(8) + '</td></tr>'
            ct = mydata[i].currency
        }
        table += '<tr class="double_bottom_border top_border"><td class="row_label">' + ct.toUpperCase() + ' </td><td class="row_label bottom_border">Total</td><td class="value total">' + currencyTotals[ct].available.toFixed(8) + ' </td><td class="value total">' + currencyTotals[ct].reserved.toFixed(8) + '</td></tr>'

        // $("#transfer").show()
    }

    $("#accountsOverview").html(table)

};

function toolTip(id, key) {
    // find docHeight prior loading the tooltip
    // var docHeight = $(document).height();
    // for some strange reason the docHeight is always to high so we set default to 800
    var docHeight = 800
    // var docWidth = $(document).width();
    // for some strange reason docWidth is minimum 800px, so we set it default to 600
    var docWidth = 600
    $("#" + id + " .tooltiptext").load('toolTips/' + key, function () {
        var tip = $("#" + id)
        var span = $(tip).find('.tooltiptext')
        var height = span.height();
        var width = span.width();

        // if all is fine then return
        if (((mouseY + height) < docHeight) && ((mouseX + width) < docWidth)) {
            return
        }


        var offsetV = docHeight - (mouseY + height)
        if (offsetV < 0) {
            // need to move it higher by minimum offset
            var pos = (offsetV - 20) + "px"
            $(span).css("top", pos)
        }

        var offsetH = docWidth - (mouseX + width)
        if (offsetH < 0) {
            // need to move it higher by minimum offset
            var pos = (offsetH - 20) + "px"
            $(span).css("left", pos)
        }
    })
}

function getCurrentMask() {
    if (!(currentCrypto in masks)) {
        // mask for current crypto not found so create it
        var currentPrice = parseFloat($("#currentPrice").text())
        getMask(currentPrice)
    } else {
        $("#mask").val(masks[currentCrypto])
        formatMask(masks[currentCrypto])
    }
}

function copyMinMaxValues() {
    $("#newLow").val($("#minimum").val())
    $("#newHigh").val($("#maximum").val())
}

function toggleDarkMode() {

    // var darkMode = false

    // var body = $("body")
    // var assignedClasses = body.attr('class')
    // if (undefined != assignedClasses) {
    //     var classList = assignedClasses.split(/\s+/);

    //     for (var i = 0; i < classList.length; i++) {
    //         if (classList[i] === 'dark-mode') {
    //             //do something
    //             darkMode = true
    //             break
    //         }
    //     }

    // }
    var darkMode = myCookie['dark-mode']

    if (darkMode) {
        $("body").removeClass("dark-mode")
        darkMode = false
    } else {
        $("body").addClass("dark-mode")
        darkMode = true
    }
    myCookie['dark-mode'] = darkMode

    var expiration_date = new Date();
    expiration_date.setFullYear(expiration_date.getFullYear() + 1);
    document.cookie = "settings=" + JSON.stringify(myCookie) + "; path=/; expires=" + expiration_date.toUTCString();

}

function getCookie() {

    let name = "settings=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    var thisCookie
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            thisCookie = c.substring(name.length, c.length);
        }
    }
    myCookie = JSON.parse(thisCookie)
}