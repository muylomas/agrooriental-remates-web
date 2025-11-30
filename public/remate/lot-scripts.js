var slider;

function initializeActionsAndDisplays() {
    $(
        "[id^='share-contact-salesagent'], [id^='lot-chat-button'], .share-contact-bg, " +
        "[id^='button-auction-bid'], .auction-bid-bg, " +
        "[id^='lot-detail-description'], [id^='lot-detail-icons'], " +
        ".lot-detail-close, .lot-chat-close, " +
        "#averages-by-type-open, #averages-types-infinite-scroll, .averages-by-type-close"
    ).on("click", function () {
        if ($(this).attr("id")) {
            let idMinusArray = $(this).attr("id").split("-");
            const elementLotId = idMinusArray[idMinusArray.length - 1];
            if ($(this).attr("id").startsWith("share-contact-salesagent-")) {
                $("#share-contact-" + elementLotId).addClass("open");
                $(".topbar-overlay-video").hide();
            }
            else if ($(this).attr("id").indexOf("auction-") != -1) {
                $("#auction-bid-" + elementLotId).addClass("open");
                getAuctionBidsForLot(elementLotId, function () { });
                $(".topbar-overlay-video").hide();
                slider.stopSlider();
            }
            else if ($(this).attr("id").indexOf("lot-detail-") != -1) {
                $("#lot-detail-" + elementLotId).addClass("open");
                $(".topbar-overlay-video").hide();
                slider.stopSlider();
            }
            else if (
                $(this).attr("id") == "averages-by-type-open" ||
                $(this).attr("id") == "averages-types-infinite-scroll"
            ) {
                $("#averages-by-type").addClass("open");
                $(".topbar-overlay-video").hide();
                slider.stopSlider();
            }
            else if ($(this).attr("id").startsWith("lot-chat-button")) {
                getInitialComments(elementLotId);
                $("#lot-chat-" + elementLotId).addClass("open");
                $(".topbar-overlay-video").hide();
                slider.unbind();
                slider.stopSlider();
            }
        }
        else {
            if (
                $(this).attr("class").indexOf("lot-detail-") != -1 ||
                $(this).attr("class").indexOf("lot-chat-") != -1 ||
                $(this).hasClass("averages-by-type-close")
            ) {
                $("[id^='lot-chat-'].open").removeClass("open");
                $("[id^='lot-detail-'].open").removeClass("open");
                $("#averages-by-type").removeClass("open");
            }
            else
                $(this).parent().removeClass("open");

            slider.stopSlider();
            slider.startSlider();

            $(".topbar-overlay-video").show();
        }
    });

    $("[id^='google-map-bottom-desc-text-']").hide();
    $("[id^='google-map-under-desc-text-']").show();

    countdownTimers = {};
    for (lotIdIndex in startDates) {
        countdownTimers[lotIdIndex] = setInterval('generalTimer(' + lotIdIndex + ')', 1000);
    }

    for (let index in activeAuctionBids) {
        if (activeAuctionBids[index].isWinning) {
            showCustomerWinning(activeAuctionBids[index].lotId, false, false, true);
        }
        else {
            showCustomerLoosing(activeAuctionBids[index].lotId, false, true, true);
        }
    }
};

function videoFitAndCenter(lotId) {
    const windowHeight = $(document).height();
    const windowWidth = $(document).width();
    const videoHeight = $("#video-source-" + lotId).parent().height();
    const videoWidth = $("#video-source-" + lotId).parent().width();

    if ((videoHeight / videoWidth) > (windowHeight / windowWidth)) {
        $("#video-source-" + lotId).parent().width("100%");
        $("#video-source-" + lotId).parent().height("auto");
    }
    else {
        $("#video-source-" + lotId).parent().height("100%");
        $("#video-source-" + lotId).parent().width("auto");
    }
};

function getAuctionBidsForLot(lotId, callback) {
    $.post(
        "/api/cattle/lot/auction/bids",
        {
            "lotId": lotId,
        },
        function (results) {
            if (typeof results === 'object' && results !== null) {
                if (
                    "auctionBids" in results &&
                    "lotId" in results && results.lotId
                ) {
                    for (let index in lots) {
                        if (lots[index].lotId == results.lotId) {
                            lots[index].auctionBids = results.auctionBids;
                        }
                    }
                }
            }

            callback();
        }
    );
};

function auctionBidsHistory(lotId) {
    getAuctionBidsForLot(
        lotId,
        function () {
            let auctionBids = []
            let indSLots = 0;
            for (let index in lots) {
                if (lots[index].lotId == lotId) {
                    auctionBids = lots[index].auctionBids;
                    indSLots = index;
                }
            }

            const wrapper = document.createElement('div');

            if (auctionBids.length) {
                let __aux_bidsRows = "";
                for (let indBid in auctionBids) {
                    const __aux_bid = auctionBids[indBid];
                    let __aux_bidAmount = __aux_bid.amount;
                    if (lots[indSLots].auctionPriceType == 1) {
                        __aux_bidAmount = __aux_bid.amount.toFixed(2);
                    }
                    else {
                        __aux_bidAmount = __aux_bid.amount.toFixed(0);
                    }

                    __aux_bidsRows +=
                        `
                            <tr class="bg-white">
                                <td class="py-2 text-center">
                                    `+ __aux_bid.bidDate + `
                                </td>
                                <td class="py-2 text-center">
                                    `+ __aux_bid.bidTime + `
                                </td>
                                <td class="py-2 text-center">
                                    USD <b>`+ __aux_bidAmount + `</b>
                                </td>
                            </tr>
                        `;
                }

                wrapper.innerHTML =
                    `
                        <div class="dataTables_wrapper dt-bootstrap4 no-footer mt-4">
                            <table class="table dataTable no-footer border-0">
                                <thead class="bg-secondary text-light">
                                    <tr>
                                        <th class="py-2 text-center">
                                            <h6 class="m-0">FECHA</h6>
                                        </th>
                                        <th class="py-2 text-center">
                                            <h6 class="m-0">HORA</h6>
                                        </th>
                                        <th class="py-2 text-center">
                                            <h6 class="m-0">MONTO</h6>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ` + __aux_bidsRows + `
                                </tbody>
                            </table>
                        </div>
                    `;
            }
            else {
                wrapper.innerHTML =
                    `
                    <div class="bg-light p-4">
                        No hay ofertas por el momento.
                    </div>
                `;
            }

            swal({
                title: "ÚLTIMOS PIQUES",
                content: wrapper,
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
                $("#button-auction-bid-" + lotId).click();
            });
        }
    );
};

function insertLotLoop(lots, indSLots, callback) {
    if (indSLots < lots.length) {
        let __aux_slideHTML = slideTemplate;

        for (let indObj in lots[indSLots]) {
            if (__aux_slideHTML.indexOf("__lot_" + indObj + "__") != -1) {
                __aux_slideHTML =
                    __aux_slideHTML
                        .replace(new RegExp("__lot_" + indObj + "__", 'g'), lots[indSLots][indObj]);
            }
        }
        __aux_auctionPriceType = 1;
        if ("auctionPriceType" in lots[indSLots]) {
            __aux_auctionPriceType = lots[indSLots].auctionPriceType;
        }

        __aux_slideHTML =
            __aux_slideHTML
                .replace(new RegExp("__lot_imagesArray_0__", 'g'), lots[indSLots].imagesArray[0]);

        let __aux_lastAuctionPriceFormatted = "0.00";
        let __aux_lastAuctionPrice1Step = "0.00";
        let __aux_lastAuctionPrice2Step = "0.00";
        let __aux_lastAuctionPrice3Step = "0.00";
        let __aux_salePriceFormatted = "0.00";
        let __aux_priceUnit = "por bulto";

        let __aux_intermediate_lastPrice = 0;
        if ("lastPrice" in lots[indSLots] && lots[indSLots].lastPrice) {
            __aux_intermediate_lastPrice = lots[indSLots].lastPrice;
        }

        let __aux_intermediate_stepPrice = 5;
        if ("stepPrice" in lots[indSLots] && lots[indSLots].stepPrice) {
            __aux_intermediate_stepPrice = lots[indSLots].stepPrice;
        }
        else {
            if (__aux_auctionPriceType == 1) {
                __aux_intermediate_stepPrice = 0.01
            }
        }

        __aux_lastAuctionPriceFormatted = (__aux_intermediate_lastPrice).toFixed(0);
        __aux_lastAuctionPrice1Step = (__aux_intermediate_lastPrice + 1 * __aux_intermediate_stepPrice).toFixed(0);
        __aux_lastAuctionPrice2Step = (__aux_intermediate_lastPrice + 2 * __aux_intermediate_stepPrice).toFixed(0);
        __aux_lastAuctionPrice3Step = (__aux_intermediate_lastPrice + 3 * __aux_intermediate_stepPrice).toFixed(0);
        __aux_salePriceFormatted = (lots[indSLots].salePrice).toFixed(0);

        if (__aux_auctionPriceType == 1) {
            __aux_lastAuctionPriceFormatted = (__aux_intermediate_lastPrice).toFixed(2);
            __aux_lastAuctionPrice1Step = (__aux_intermediate_lastPrice + 1 * __aux_intermediate_stepPrice).toFixed(2);
            __aux_lastAuctionPrice2Step = (__aux_intermediate_lastPrice + 2 * __aux_intermediate_stepPrice).toFixed(2);
            __aux_lastAuctionPrice3Step = (__aux_intermediate_lastPrice + 3 * __aux_intermediate_stepPrice).toFixed(2);
            __aux_salePriceFormatted = (lots[indSLots].salePrice).toFixed(2);
            __aux_priceUnit = "por kilo";
        }


        __aux_slideHTML =
            __aux_slideHTML
                .replace(new RegExp("__lot_lastPriceAuction_formatted__", 'g'), __aux_lastAuctionPriceFormatted);
        __aux_slideHTML =
            __aux_slideHTML
                .replace(new RegExp("__lot_lastAuctionPrice1Step__", 'g'), __aux_lastAuctionPrice1Step);
        __aux_slideHTML =
            __aux_slideHTML
                .replace(new RegExp("__lot_lastAuctionPrice2Step__", 'g'), __aux_lastAuctionPrice2Step);
        __aux_slideHTML =
            __aux_slideHTML
                .replace(new RegExp("__lot_lastAuctionPrice3Step__", 'g'), __aux_lastAuctionPrice3Step);
        __aux_slideHTML =
            __aux_slideHTML
                .replace(new RegExp("__lot_salePrice_formatted__", 'g'), __aux_salePriceFormatted);
        __aux_slideHTML =
            __aux_slideHTML
                .replace(new RegExp("__lot_priceUnits__", 'g'), __aux_priceUnit);

        __aux_slideHTML =
            __aux_slideHTML
                .replace(
                    new RegExp("__lot_totalQuantitySideBar__", 'g'),
                    `
                            <i class="mdi mdi-cow mt-5 icon-md"></i>
                            <h4>
                                ` + lots[indSLots].totalQuantity + `
                            </h4>
                        `
                );

        if ('ageArray' in lots[indSLots] && lots[indSLots].ageArray.length) {
            if (lots[indSLots].ageArray[0].ageUnit == 5) {
                const __more_ages = (lots[indSLots].ageArray.length > 1 ? " ..." : "");
                __aux_slideHTML =
                    __aux_slideHTML
                        .replace(
                            new RegExp("__lot_agesString__", 'g'),
                            `
                                    <i class="mdi mdi-tooth mt-5 icon-md"></i>
                                    <h4>
                                        ` + lots[indSLots].ageArray[0].teethName + `
                                    </h4>
                                `
                        );
            }
            else {
                __aux_slideHTML =
                    __aux_slideHTML
                        .replace(
                            new RegExp("__lot_agesString__", 'g'),
                            `
                                    <div class="mb-0 mt-3">
                                        <i class="mdi mdi-calendar mt-5 icon-md"></i>
                                        <h4 class="mt-1">
                                            ` + lots[indSLots].ageArray[0].quantity + " " + lots[indSLots].ageArray[0].ageUnitName + `
                                        </h4>
                                    </div>
                                `
                        );
            }


        }
        else {
            __aux_slideHTML = __aux_slideHTML.replace(new RegExp("__lot_agesString__", 'g'), "");
        }

        if (lots[indSLots].auctionAvg == lots[indSLots].auctionAvgOld) {
            __aux_slideHTML =
                __aux_slideHTML
                    .replace(new RegExp(
                        "__lot_auctionAvgPercentage__", 'g'),
                        "<span class='text-primary'>=</span>"
                    );

        }

        if (lots[indSLots].auctionAvg < lots[indSLots].auctionAvgOld) {
            __aux_slideHTML =
                __aux_slideHTML
                    .replace(new RegExp(
                        "__lot_auctionAvgPercentage__", 'g'),
                        `
                                <i class='mdi mdi-arrow-down text-danger'></i>
                                <span class='text-danger'>
                                    ` + Math.round((1 - lots[indSLots].auctionAvg / lots[indSLots].auctionAvgOld) * 100) + `%
                                </span>
                            `
                    );
        }

        if (lots[indSLots].auctionAvg > lots[indSLots].auctionAvgOld) {
            __aux_slideHTML =
                __aux_slideHTML
                    .replace(
                        new RegExp("__lot_auctionAvgPercentage__", 'g'),
                        `
                                <i class='mdi mdi-arrow-up text-success'></i>
                                <span class='text-success'>
                                    ` + Math.round((1 - lots[indSLots].auctionAvgOld / lots[indSLots].auctionAvg) * 100) + `%
                                </span>
                            `
                    );
        }


        $("#remate-lotes").append(__aux_slideHTML);

        if (!lots[indSLots].video)
            $("#view-media-selector-" + lots[indSLots].lotId).hide();
        if (!lots[indSLots].equineYoutube)
            $("#view-in-youtube-" + lots[indSLots].lotId).remove();

        insertLotLoop(lots, indSLots + 1, callback);
    }
    else {
        callback();
    }
};

function openYoutubeLink(link) {
    window.open(link, '_blank');
};

function insertLotsInPage() {
    if (lots && lots.length) {
        insertLotLoop(
            lots, 0,
            function () {
                initializeActionsAndDisplays();
            }
        );
    }
};

window.addEventListener('load', function () {
    insertLotsInPage();
});