function getLotParamsById(lotId) {
    let __aux_lot = {};
    for (let index in lots) {
        if (lots[index].lotId == lotId) {
            __aux_lot = lots[index];
        }
    }
    return __aux_lot;
};

function showCustomerWinning(lotId, bidAmount, showButton) {
    $("#auction-bid-status-" + lotId).html(
        `
            <div class="badge badge-success w-100">
                Vas ganando!!
            </div>
        `
    );

    if (showButton) {
        if ($("#lots-active-bids-button-lot-" + lotId).length) {
            $("#lots-active-bids-button-lot-" + lotId).html(
                `
                    <a href="#lote-` + lotId + `" class="btn btn-success btn-rounded btn-fw">
                        #` + lotId + ` - USD ` + bidAmount + ` <i class="mdi mdi-check" style="font-size: 0.875rem;"></i>
                    </a>
                `
            );
        }
        else {
            $("#lots-active-bids").append(
                `
                    <li id="lots-active-bids-button-lot-` + lotId + `" class="nav-item">
                        <a href="#lote-` + lotId + `" class="btn btn-success btn-rounded btn-fw">
                            #` + lotId + ` - USD ` + bidAmount + ` <i class="mdi mdi-check" style="font-size: 0.875rem;"></i>
                        </a>
                    </li>
                `
            );
        }
    }
};

function showCustomerLoosing(lotId, bidAmount, showButton) {
    $("#auction-bid-status-" + lotId).html(
        `
            <div class="badge badge-danger blink_me  w-100">
                Apurate, vas a perder el lote.
            </div>
        `
    );

    if (showButton) {
        if ($("#lots-active-bids-button-lot-" + lotId).length) {
            $("#lots-active-bids-button-lot-" + lotId).html(
                `
                    <a href="#lote-` + lotId + `" class="btn btn-danger btn-rounded btn-fw">
                        #` + lotId + ` - USD ` + bidAmount + ` <i class="mdi mdi-alarm" style="font-size: 0.875rem;"></i>
                    </a>
                `
            );
        }
        /*else {
            $("#lots-active-bids").append(
                `
                    <li id="lots-active-bids-button-lot-` + lotId + `" class="nav-item">
                        <a href="#lote-` + lotId + `" class="btn btn-danger btn-rounded btn-fw">
                            #` + lotId + ` - USD ` + bidAmount + ` <i class="mdi mdi-alert-octagon" style="font-size: 0.875rem;"></i>
                        </a>
                    </li>
                `
            );
        }*/
    }
};

function auctionBidPriceChanged(lotId) {
    let __aux_lot = getLotParamsById(lotId);

    let __aux_newBid = parseFloat($("#auction-bid-price-" + lotId).val());

    if (__aux_lot.lastPrice < __aux_newBid) {
        if (__aux_lot.auctionPriceType == 1) {
            $("#auction-bid-price-" + lotId).val(__aux_newBid.toFixed(2));
        }
        else {
            $("#auction-bid-price-" + lotId).val(__aux_newBid.toFixed(0));
        }
    }
    else {
        if (__aux_lot.auctionPriceType == 1) {
            $("#auction-bid-price-" + lotId).val(__aux_lot.lastPrice.toFixed(2));
        }
        else {
            $("#auction-bid-price-" + lotId).val(__aux_lot.lastPrice.toFixed(0));
        }
    }
};

function auctionBidAddToPrice(lotId, sign) {
    let __aux_lot = getLotParamsById(lotId);

    let __aux_newBid = parseFloat($("#auction-bid-price-" + lotId).val()) + __aux_lot.stepPrice * sign;

    if (__aux_lot.lastPrice < __aux_newBid) {
        if (__aux_lot.auctionPriceType == 1) {
            $("#auction-bid-price-" + lotId).val(__aux_newBid.toFixed(2));
        }
        else {
            $("#auction-bid-price-" + lotId).val(__aux_newBid.toFixed(0));
        }
    }
    else {
        if (__aux_lot.auctionPriceType == 1) {
            $("#auction-bid-price-" + lotId).val(__aux_lot.lastPrice.toFixed(2));
        }
        else {
            $("#auction-bid-price-" + lotId).val(__aux_lot.lastPrice.toFixed(0));
        }
    }
};

function auctionBidByStep(lotId, multiplier) {
    let __aux_lot = getLotParamsById(lotId);

    if (__aux_lot.lotId == lotId)
        auctionBid(lotId, __aux_lot.lastPriceAuction + multiplier * __aux_lot.stepPrice);
}

function auctionBidCustom(lotId) {
    auctionBid(lotId, parseFloat($("#auction-bid-price-" + lotId).val()));
};

function auctionBid(lotId, bidPrice) {
    socket.emit(
        'auctionBidCustomers',
        {
            bid: bidPrice,
            lotId: lotId,
        }
    );
};

function buyInmediatelly(lotId) {
    let __aux_lot = getLotParamsById(lotId);

    if (__aux_lot.lotId == lotId) {
        socket.emit(
            'auctionBidCustomers',
            {
                bid: __aux_lot.salePrice,
                lotId: __aux_lot.lotId,
            }
        );
    }
};

function auctionBidUpdateFunc(auctionBidUpdate) {
    if (
        auctionBidUpdate.price &&
        auctionBidUpdate.lotId
    ) {

        let __aux_lot = getLotParamsById(auctionBidUpdate.lotId);

        if (
            __aux_lot.lotId == auctionBidUpdate.lotId &&
            __aux_lot.lastPriceAuction != auctionBidUpdate.price
        ) {
            __aux_lot.lastPriceAuction = auctionBidUpdate.price;
            __aux_lot.lastPrice = auctionBidUpdate.price + __aux_lot.stepPrice;
            updateAuctionBidPrice(__aux_lot.lotId, __aux_lot.lastPriceAuction, __aux_lot.stepPrice, __aux_lot.auctionPriceType);

            if (socket.id == auctionBidUpdate.socketId) {
                showCustomerWinning(__aux_lot.lotId, __aux_lot.lastPriceAuction, true);
            }
            else {
                showCustomerLoosing(__aux_lot.lotId, __aux_lot.lastPriceAuction, true);
            }

            if (auctionBidUpdate.end) {
                location.reload();
            }
        }
    }
};

socketGestion.on('auctionBidUpdate', (auctionBidUpdate) => {
    auctionBidUpdateFunc(auctionBidUpdate);
});

socket.on('auctionBidUpdate', (auctionBidUpdate) => {
    auctionBidUpdateFunc(auctionBidUpdate);
});

socket.on('auctionBidError', (auctionBidUpdate) => {
    if (auctionBidUpdate.error) {
        window.location.replace("/ingresar");
    }
    else
        window.location.replace("/ingresar");
});

function updateAuctionBidPrice(lotId, lastAuctionPrice, stepPrice, auctionPriceType) {
    let __aux_newBid = parseFloat($("#auction-bid-price-" + lotId).val());
    let __aux_fixedDigits = auctionPriceType == 1 ? 2 : 0;
    if (__aux_newBid < lastAuctionPrice + 3 * stepPrice) {
        $("#auction-bid-price-" + lotId).val((lastAuctionPrice + 3 * stepPrice).toFixed(__aux_fixedDigits));
    }

    $("#auction-bid-button-x1-" + lotId).html("Ofertar " + (lastAuctionPrice + stepPrice).toFixed(__aux_fixedDigits));
    $("#auction-bid-button-x2-" + lotId).html("Ofertar " + (lastAuctionPrice + 2 * stepPrice).toFixed(__aux_fixedDigits));

    $("#last-auction-bid-price-" + lotId).fadeOut(400, function () {
        $(this).html(lastAuctionPrice.toFixed(__aux_fixedDigits) + " ").fadeIn(400);
    });
}

$(document).ready(function () {
    for (let index in lots) {
        if (lots[index].auctionBidcustomerId == userId) {
            showCustomerWinning(lots[index].lotId, lots[index].lastPriceAuction, true);
        }
        else {
            showCustomerLoosing(lots[index].lotId, lots[index].lastPriceAuction, false);
        }
    }
});