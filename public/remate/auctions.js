function getLotParamsById(lotId) {
    let __aux_lot = { lot: {}, index: -1 };
    for (let index in lots) {
        if (lots[index].lotId == lotId) {
            __aux_lot.lot = lots[index];
            __aux_lot.index = index;
        }
    }
    return __aux_lot;
};

function showCustomerWinning(lotId, price, auctionBidEnd, showAlert) {
    if (price) {
        let alreadyIn = false;

        for (let indAAB in activeAuctionBids) {
            if (activeAuctionBids[indAAB].lotId == lotId) {
                alreadyIn = true;
                activeAuctionBids[indAAB].isWinning = 1;
                activeAuctionBids[indAAB].price = price;
            }
        }

        if (!alreadyIn) {
            activeAuctionBids.push(
                {
                    isWinning: 1,
                    lotId: lotId,
                    price: price,
                }
            );
        }
    }

    if (activeAuctionBids.length)
        $("#only-active-auctions-bids").removeClass("d-none");

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
                <div class="badge fs-4 w-100" style="background: #4e7b44 !important">
                    Picás en punta!!
                </div>
            `
        );
    }

    if (showAlert) {
        showBidAlertSuccess(auctionBidEnd, lotId);
    }
};

function showCustomerLoosing(lotId, price, auctionBidEnd, showButton) {
    let isLotBidedByCustomer = false;
    for (let indAAB in activeAuctionBids) {
        if (activeAuctionBids[indAAB].lotId == lotId) {
            isLotBidedByCustomer = true;
            if (price) {
                activeAuctionBids[indAAB].isWinning = 0;
                activeAuctionBids[indAAB].price = price;
            }
        }
    }

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
        if (isLotBidedByCustomer) {
            $("#auction-bid-status-" + lotId).html(
                `
                    <div class="badge badge-danger blink_me fs-4 w-100">
                        Hay un pique nuevo para este lote!!
                    </div>
                `
            );
        }
    }

    if (showButton && isLotBidedByCustomer) {
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

        showBidAlertWarning(lotId, auctionBidEnd);
    }
};

let price_was_changed = false;
function auctionBidPriceChanged(lotId) {
    const searchLot = getLotParamsById(lotId);
    const __aux_lot = searchLot.lot;

    let __aux_newBid = parseFloat($("#auction-bid-price-" + lotId).val());

    let priceFixedCount = 0;
    if (__aux_lot.auctionPriceType == 1)
        priceFixedCount = 2;

    price_was_changed = false;

    if (__aux_lot.lastPrice < __aux_newBid) {
        $("#auction-bid-price-" + lotId).val(__aux_newBid.toFixed(priceFixedCount));
    }
    else {
        price_was_changed = true;
        $("#auction-bid-price-" + lotId).val((__aux_lot.lastPrice + __aux_lot.stepPrice).toFixed(priceFixedCount));
    }
};

function auctionBidAddToPrice(lotId, sign) {
    const searchLot = getLotParamsById(lotId);
    const __aux_lot = searchLot.lot;

    let __aux_newBid = parseFloat($("#auction-bid-price-" + lotId).val()) + __aux_lot.stepPrice * sign;

    let priceFixedCount = 0;
    if (__aux_lot.auctionPriceType == 1)
        priceFixedCount = 2;

    if (__aux_lot.lastPrice < __aux_newBid) {
        $("#auction-bid-price-" + lotId).val(__aux_newBid.toFixed(priceFixedCount));
    }
    else {
        $("#auction-bid-price-" + lotId).val((__aux_lot.lastPrice + __aux_lot.stepPrice).toFixed(priceFixedCount));
    }
};

function auctionBidByStep(lotId, multiplier) {
    const searchLot = getLotParamsById(lotId);
    const __aux_lot = searchLot.lot;

    if (__aux_lot.lotId == lotId)
        auctionBid(lotId, __aux_lot.lastPrice + multiplier * __aux_lot.stepPrice);
}

function auctionBidCustom(lotId) {
    if (price_was_changed) {
        price_was_changed = false;
        swal({
            text: "El precio fue modificado porque era menor que la última oferta.",
            icon: 'warning',
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
    }
    else {
        auctionBid(lotId, parseFloat($("#auction-bid-price-" + lotId).val()));
    }
};

function closeComfirmSwal() {
    swal.close();
};

function auctionBid(lotId, bidPrice) {
    //if (lotId == 63) {
    const searchedLot = getLotParamsById(lotId);
    const wrapper = document.createElement('div');
    wrapper.innerHTML =
        `
                <div class="bid-action-button w-100">
                    <h4 class="p-3 m-0">CONFIRMAR PIQUE</h4>
                </div>
                <div class="auction-bid-confirm cattle-media-container position-relative overflow-hidden w-100">
                    <img class="w-100" src="https://agro-oriental-remates.s3.us-west-1.amazonaws.com/web/images/banners/chimango-video-background.jpg">
                    <div class="cattle-image position-absolute top-0 start-0 w-100 h-100" style="background-image:url(` + searchedLot.lot.imagesArray[0] + `);" 
                        alt="Lote ` + lotId + ` - ` + searchedLot.lot.equineName + `"></div>

                    <div class="position-absolute bottom-0 start-50 translate-middle-x mb-4 w-100">
                        <button class="btn btn-light fs-5 lh-sm me-4" onclick="closeComfirmSwal()">
                            Cancelar
                        </button>
                        <button class="bid-action-button btn fs-5 lh-sm" onclick="auctionBidFinal(` + lotId + `,` + bidPrice + `)">
                            Ofertar
                        </button>
                    </div>
                </div>
                <div class="bid-action-button p-2 w-100"></div>
            `;
    swal({
        ttitle: "CONFIRMAR PIQUE",
        content: wrapper,
        buttons: {
            cancel: {
                text: "Cerrar",
                value: false,
                visible: false,
                className: "btn btn-primary",
                closeModal: true,
            },
        }
    }).then((value) => {
        swal.close();
    });/*
    }
    else {
        socket.emit(
            'auctionBidCustomers',
            {
                bid: bidPrice,
                lotId: lotId,
            }
        );
    }*/
};

function auctionBidFinal(lotId, bidPrice) {
    swal.close();
    socket.emit(
        'auctionBidCustomers',
        {
            bid: bidPrice,
            lotId: lotId,
        }
    );
};

function buyInmediatelly(lotId) {
    const searchLot = getLotParamsById(lotId);
    const __aux_lot = searchLot.lot;

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
        const searchLot = getLotParamsById(auctionBidUpdate.lotId);
        const lotIndex = searchLot.index;
        const __aux_lot = searchLot.lot;

        if (
            __aux_lot.lotId == auctionBidUpdate.lotId &&
            __aux_lot.lastPriceAuction != auctionBidUpdate.price
        ) {
            lots[lotIndex].lastPriceAuction = auctionBidUpdate.price;
            lots[lotIndex].lastPrice = auctionBidUpdate.price;
            lots[lotIndex].auctionBidcustomerId = 1;

            updateAuctionBidPrice(auctionBidUpdate.end, lots[lotIndex]);

            $("#auction-bid-view-history-" + __aux_lot.lotId).removeClass("d-none");
            $("#auction-bid-no-history-" + __aux_lot.lotId).addClass("d-none");

            if (socket.id == auctionBidUpdate.socketId) {
                showCustomerWinning(__aux_lot.lotId, __aux_lot.lastPrice, auctionBidUpdate.end, true);
            }
            else {
                showCustomerLoosing(__aux_lot.lotId, __aux_lot.lastPrice, auctionBidUpdate.end, true);
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
    if (auctionBidUpdate && "error" in auctionBidUpdate && auctionBidUpdate.error == "1.1") {
        loginSwal();
    }
    else {
        swal({
            title: "ERROR",
            text: auctionBidUpdate.msg,
            icon: 'warning',
            buttons: {
                close_h: {
                    text: "Cerrar",
                    value: "close",
                    visible: false,
                    className: "btn btn-primary",
                    closeModal: true,
                },
                cancel: {
                    text: "Recargar la página",
                    value: "reload",
                    visible: true,
                    className: "btn btn-light",
                },
                close: {
                    text: "Cerrar",
                    value: "close",
                    visible: true,
                    className: "btn btn-primary",
                    closeModal: true,
                },
            }
        }).then((value) => {
            console.log(value);
            if (value == "reload")
                window.location.replace("/");
            //swal.close();
        });
    }
});

function updateAuctionBidPrice(auctionBidEnd, lotParams) {
    const lotId = lotParams.lotId;
    const lastAuctionPrice = lotParams.lastPriceAuction;
    const auctionPriceType = lotParams.auctionPriceType;

    let __aux_fixedDigits = auctionPriceType == 1 ? 2 : 0;

    $("#auction-bid-price-" + lotId).val((lastAuctionPrice + lotParams.stepPrice).toFixed(__aux_fixedDigits));
    $("#auction-bid-button-x1-" + lotId).html("Ofertar " + (lastAuctionPrice + lotParams.stepPrice).toFixed(__aux_fixedDigits));

    const searchLot = getLotParamsById(lotId);
    if (searchLot.index > -1 && lots[searchLot.index].auctionBidcustomerId) {
        $("#auction-bid-button-multiple-" + lotId).removeClass("d-none");
        $("#auction-bid-button-x1-" + lotId).addClass("d-none");
    }
    else {
        $("#auction-bid-button-multiple-" + lotId).addClass("d-none");
        $("#auction-bid-button-x1-" + lotId).removeClass("d-none");
    }

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
    let __aux_title = "Superaron tu oferta por el lote " + lotId;
    let __aux_description = "Ofertá más que el mejor postor, apurate!!";
    let __aux_confirm = "Ofertar";

    if (auctionBidEnd) {
        __aux_title = "Se vendió";
        __aux_description = "Superaron tu oferta y el lote " + lotId + " ya no está disponible.";
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
                        $("#button-auction-bid-" + automaticAuctionOpenerForlotId).click();
                    }, 2000);
                }, 500);
            }
        }
    });
};

function showActiveAuctionBids() {
    if ($("#only-active-auctions-bids i").hasClass("mdi-toggle-switch")) {
        $("#only-active-auctions-bids i").addClass("mdi-toggle-switch-off");
        $("#only-active-auctions-bids i").addClass("text-danger");
        $("#only-active-auctions-bids i").removeClass("mdi-toggle-switch");
        $("#only-active-auctions-bids i").removeClass("text-success");

        $("div[id^='lote-']").removeClass("d-none");
    }
    else {
        $("#only-active-auctions-bids i").addClass("mdi-toggle-switch");
        $("#only-active-auctions-bids i").addClass("text-success");
        $("#only-active-auctions-bids i").removeClass("mdi-toggle-switch-off");
        $("#only-active-auctions-bids i").removeClass("text-danger");

        $("div[id^='lote-']").addClass("d-none");

        for (let indAAB in activeAuctionBids) {
            $("#lote-" + activeAuctionBids[indAAB].lotId).removeClass("d-none");
        }
    }
};

$(document).ready(function () {
    for (let index in activeAuctionBids) {
        activeAuctionBidsLotIds.push(activeAuctionBids[index].lotId);
        if (activeAuctionBids[index].isWinning) {
            showCustomerWinning(activeAuctionBids[index].lotId, 0, false, false);
        }
        else {
            showCustomerLoosing(activeAuctionBids[index].lotId, 0, false, false);
        }
    }
});