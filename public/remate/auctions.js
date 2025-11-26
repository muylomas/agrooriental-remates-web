function getLotParamsById(lotId) {
    let __aux_lot = {};
    for (let index in lots) {
        if (lots[index].lotId == lotId) {
            __aux_lot = lots[index];
        }
    }
    return __aux_lot;
};

function showCustomerWinning(lotId, auctionBidEnd, showAlert, showButton) {
    $("#auction-bid-status-container-" + lotId).removeClass("d-none");
    if (auctionBidEnd) {
        $("#auction-bid-status-" + lotId).html(
            `
                 <div class="badge badge-success fs-4 w-100">
                     Felicitaciones!! Estamos procesando tu compra.
                 </div>
             `
        );
        $("#category-media-value-container-" + lotId).remove();
    }
    else {
        $("#auction-bid-status-" + lotId).html(
            `
                <div class="badge badge-success fs-4 w-100">
                    Vas ganando!!
                </div>
            `
        );
    }

    if (showButton) {
        let goToLotButton =
            `
                <a href="#lote-` + lotId + `" class="btn btn-warning btn-rounded btn-fw text-dark">
                    #` + lotId + ` <i class="mdi mdi-alarm" style="font-size: 0.875rem;"></i>
                </a>
            `;
        if (auctionBidEnd) {
            goToLotButton =
                `
                    <a href="#lote-` + lotId + `" class="btn btn-success btn-rounded btn-fw">
                        #` + lotId + ` <i class="mdi mdi-trophy" style="font-size: 0.875rem;"></i>
                    </a>
                `;
        }

        if ($("#lots-active-bids-button-lot-" + lotId).length) {
            $("#lots-active-bids-button-lot-" + lotId).html(goToLotButton);
        }
        else {
            $("#lots-active-bids").append(
                '<li id="lots-active-bids-button-lot-' + lotId + '" class="nav-item m-1">' + goToLotButton + '</li>'
            );
        }


    }

    if (showAlert) {
        showBidAlertSuccess(auctionBidEnd, lotId);
    }
};

function showCustomerLoosing(lotId, auctionBidEnd, showButton, initialize) {
    $("#auction-bid-status-container-" + lotId).removeClass("d-none");
    if (auctionBidEnd) {
        $("#auction-bid-status-" + lotId).html(
            `
                 <div class="badge badge-danger fs-4 w-100">
                     Este lote ha sido vendido.
                 </div>
             `
        );
        $("#category-media-value-container-" + lotId).remove();
    }
    else {
        $("#auction-bid-status-" + lotId).html(
            `
                <div class="badge badge-danger blink_me fs-4 w-100">
                    Apurate, vas a perder el lote.
                </div>
            `
        );
    }

    if (showButton) {
        let goToLotButton =
            `
                <a href="#lote-` + lotId + `" class="btn btn-danger btn-rounded btn-fw">
                    #` + lotId + ` <i class="mdi mdi-alarm" style="font-size: 0.875rem;"></i>
                </a>
            `;
        if (auctionBidEnd) {
            goToLotButton =
                `
                    <a href="#lote-` + lotId + `" class="btn btn-secondary btn-rounded btn-fw">
                        #` + lotId + ` <i class="mdi mdi-close" style="font-size: 0.875rem;"></i>
                    </a>
                `;
        }

        if ($("#lots-active-bids-button-lot-" + lotId).length) {
            $("#lots-active-bids-button-lot-" + lotId).html(goToLotButton);

            showBidAlertWarning(lotId, auctionBidEnd);
        }
        else if (initialize) {
            $("#lots-active-bids").append(
                '<li id="lots-active-bids-button-lot-' + lotId + '" class="nav-item m-1">' + goToLotButton + '</li>'
            );
        }
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
        auctionBid(lotId, __aux_lot.lastPrice + multiplier * __aux_lot.stepPrice);
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
            updateAuctionBidPrice(auctionBidUpdate.end, __aux_lot.lotId, __aux_lot.lastPriceAuction, __aux_lot.stepPrice, __aux_lot.auctionPriceType, __aux_lot);

            if (socket.id == auctionBidUpdate.socketId) {
                showCustomerWinning(__aux_lot.lotId, auctionBidUpdate.end, true, true);
            }
            else {
                showCustomerLoosing(__aux_lot.lotId, auctionBidUpdate.end, true, false);
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
    console.log("=============== auctionBidError ===============");
    console.log(auctionBidUpdate);
    swal({
        title: "ERROR",
        text: "No se pudo ingresar la oferta, intentalo nuevamente.",
        icon: 'warning',
        buttons: {
            cancel: {
                text: "Recargar la página",
                value: false,
                visible: true,
                className: "btn btn-primary",
                closeModal: true,
            },
        }
    }).then((value) => {
        window.location.replace("/")
        swal.close();
    });
    console.log("=============== auctionBidError ===============");
});

function updateAuctionBidPrice(auctionBidEnd, lotId, lastAuctionPrice, stepPrice, auctionPriceType, lotParams) {
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
    $("#last-auction-bid-price-auction-" + lotId).fadeOut(400, function () {
        $(this).html(lastAuctionPrice.toFixed(__aux_fixedDigits) + " ").fadeIn(400);
    });

    let __aux_amount = lotParams.auctionPriceType == 1 ? lastAuctionPrice.toFixed(2) : lastAuctionPrice.toFixed(0);
    let __aux_bid_type = lotParams.auctionPriceType == 1 ? "por kilo" : "por bulto";

    $("#button-auction-bid-" + lotId + " button").html(
        "Quiero el lote / " + lotParams.currency + " " + __aux_amount + " " +
        "<span class='text-small'>" + __aux_bid_type + "</span>"
    );

    if (auctionBidEnd) {
        $("#button-auction-bid-" + lotId + " button").prop('disabled', true);
        $("#bid-auction-actions-container-" + lotId).remove();
        $("#button-auction-bid-" + lotId + " button").html(
            "Vendido / " + lotParams.currency + " " + __aux_amount + " " +
            "<span class='text-small'>" + __aux_bid_type + "</span>"
        );
        endDates[lotId] = Date.now();
    }
    else {
        $("#button-auction-bid-" + lotId + " button").html(
            "Quiero el lote / " + lotParams.currency + " " + __aux_amount + " " +
            "<span class='text-small'>" + __aux_bid_type + "</span>"
        );
    }
}

function showBidAlertSuccess(auctionBidEnd) {
    let __aux_title = "Bien!!";
    let __aux_description = "Tu oferta va ganando.";

    if (auctionBidEnd) {
        __aux_title = "Felicitaciones!!";
        __aux_description =
            "El lote ya casi es tuyo!!\n" +
            "Estamos procesando tu oferta.\n" +
            "Te contactaremos para avanzar con la compra.";
    }

    swal({
        title: __aux_title,
        text: __aux_description,
        icon: 'success',
        buttons: {
            cancel: {
                text: "Cerrar",
                value: false,
                visible: true,
                className: "btn btn-primary",
                closeModal: true,
            },
        }
    }).then((value) => {
        swal.close();
    });
};

var automaticAuctionOpenerForlotId = false;
function showBidAlertWarning(lotId, auctionBidEnd) {
    let __aux_title = "Superaron tu oferta";
    let __aux_description = "Ofertá más que el mejor postor, apurate!!";
    let __aux_confirm = "Ofertar";

    if (auctionBidEnd) {
        __aux_title = "Se vendió";
        __aux_description = "Superaron tu oferta y el lote ya no está disponible.";
        __aux_confirm = "Ver";
    }

    swal({
        title: __aux_title,
        text: __aux_description,
        icon: 'warning',
        buttons: {
            cancel: {
                text: "Ignorar",
                value: false,
                visible: true,
                className: "btn btn-light",
                closeModal: true,
            },
            confirm: {
                text: __aux_confirm,
                value: true,
                visible: true,
                className: "btn btn-warning text-dark",
                closeModal: true
            },
        }
    }).then((value) => {
        automaticAuctionOpenerForlotId = lotId;
        swal.close();
        if (value) {
            if (!auctionBidEnd) {
                setTimeout(() => {
                    window.location.href = "#lote-" + automaticAuctionOpenerForlotId;
                    setTimeout(() => {
                        console.log("pre open auctions controller");
                        $("#button-auction-bid-" + automaticAuctionOpenerForlotId).click();
                    }, 2000);
                }, 500);
            }
        }
    });
};

$(document).ready(function () {
    for (let index in activeAuctionBids) {
        if (activeAuctionBids[index].isWinning) {
            showCustomerWinning(activeAuctionBids[index].lotId, false, false, true);
        }
        else {
            showCustomerLoosing(activeAuctionBids[index].lotId, false, true, true);
        }
    }
});