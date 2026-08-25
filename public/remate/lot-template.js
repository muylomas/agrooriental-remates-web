const lotTemplate =
    `
        <div id="lote-__lot_subId__" class="col-xl-3 col-lg-3 col-md-3 col-sm-6 col-12 bg-agrooriental stretch-card">
            <div class="card border-0 m-2" id="lot-__lot_lotId__" style="min-width: auto; min-width: -webkit-fill-available;">
                <div id="cattle-media-container-__lot_lotId__" class="cattle-media-container position-relative overflow-hidden w-100">
                    <img class="w-100" src="__lot_videoBackground__">
                    <div id="image-__lot_lotId__"
                        title="LOTE __lot_subId__ - __lot_equineName__"
                        class="cattle-image position-absolute top-0 start-0 w-100 h-100"
                        style="background-image:url(__lot_imagesArray_0__);"
                        alt="Lote __lot_lotId__ - __lot_equineName__">
                    </div>
                    <div class="position-absolute bottom-0 end-0 pe-2 pb-2 ">
                        <button id="view-in-youtube-__lot_lotId__"
                            type="button"
                            onclick="openYoutubeLink('__lot_equineYoutube__')"
                            class="btn btn-icon btn-youtube btn-rounded me-3 p-2 h-100 d-none">
                                <i class="mdi mdi-youtube"></i>
                        </button>
                        <button id="view-media-selector-__lot_lotId__" type="button" class="btn btn-danger btn-rounded btn-icon" onclick="javascript:changeVideoImageDisplay(__lot_lotId__)">
                            <i class="mdi mdi-video"></i>
                        </button>
                    </div>
                </div>
                <div class="card-body px-3">
                    <div class="d-flex justify-content-between flex-wrap align-items-center">
                        <div class="d-flex align-items-end flex-wrap">
                            <div class="btn btn-dark text-uppercase fs-5 p-2 m-0 aoc-lot-tag">
                                <b>LOTE __lot_subId__</b>
                            </div>
                        </div>
                        <script>
                            startDates[__lot_lotId__] = Date.parse('__lot_auctionStartString__');
                            endDates[__lot_lotId__] = Date.parse('__lot_auctionEndString__');
                        </script>
                        <div class="countdown-container d-flex justify-content-between align-items-end flex-wrap" id="countdown-container-__lot_lotId__">
                            <h4 class="mb-0 d-inline-block text-center p-2 me-2">
                                <span class="text-white" id="countdown-days-__lot_lotId__">
                                    --
                                </span>
                            </h4>
                            <h4 class="mb-0 d-inline-block text-center p-2">
                                <span class="text-white" id="countdown-hours-__lot_lotId__">
                                    --
                                </span>
                            </h4>
                            <h4 class="countdown-time-separators-__lot_lotId__ mb-0 d-inline-block text-center p-2">
                                <span class="text-white">:</span>
                            </h4>
                            <h4 class="mb-0 d-inline-block text-center p-2">
                                <span class="text-white" id="countdown-mins-__lot_lotId__">
                                    --
                                </span>
                            </h4>
                            <h4 class="countdown-time-separators-__lot_lotId__ mb-0 d-inline-block text-center p-2">
                                <span class="text-white">:</span>
                            </h4>
                            <h4 class="mb-0 d-inline-block text-center p-2">
                                <span class="text-white" id="countdown-secs-__lot_lotId__">
                                    --
                                </span>
                            </h4>
                            <h4 id="countdown-auction-ended-__lot_lotId__" class="mb-0 d-inline-block text-center p-2 d-none">
                                <span class="text-white">
                                    Finalizada
                                </span>
                            </h4>
                            <h4 id="countdown-auction-not-started-__lot_lotId__" class="mb-0 d-inline-block text-center p-2 d-none">
                                <span class="text-white">
                                    Comienza el __lot_lotAuctionStart__
                                </span>
                            </h4>
                        </div>
                    </div>
                    <h4 class="card-title text-uppercase fs-5 mt-3 m-0">
                        __lot_equineName__
                    </h4>
                    <p class="text-truncate mb-2">
                        <a href="__lot_equineARU__" target="_blank" class="">
                            __lot_equineFather__ <b>Y</b> __lot_equineMother__
                        </a>
                    </p>
                    <p class="aoc-lot-meta">
                        <span class="aoc-lot-meta-item"><b>Categoría</b>__lot_type__</span>
                        <span class="aoc-lot-meta-item"><b>RP</b>__lot_equineRP__</span>
                        <span id="lot-params-height-__lot_lotId__" class="aoc-lot-meta-item"><b>Alzada</b>__lot_equineHeight__</span>
                        <span class="aoc-lot-meta-item"><b>Pelo</b>__lot_equineHair__</span>
                        <span class="aoc-lot-meta-item"><b>Nacimiento</b>__lot_equineBirth__</span>
                        <span class="aoc-lot-meta-item"><b>Cabaña</b>__lot_equineCabin__</span>
                    </p>

                    <div id="auction-bid-status-container-__lot_lotId__" class="row mb-1 d-none">
                        <div class="col-12 p-0 m-0">
                            <h5 class="w-100">
                                <small id="auction-bid-status-__lot_lotId__" class="text-muted w-100">
                                </small>
                            </h5>
                        </div>
                    </div>
                    <div class="aoc-lot-bid-row">
                        <button
                            id="auction-bid-view-history-__lot_lotId__"
                            class="btn btn-dark lh-sm aoc-piques-btn d-none"
                            onclick="auctionBidsHistory(__lot_lotId__)"
                        >
                            <div id="auction-bid-spinner-__lot_lotId__"  class="float-start pe-2 d-none">
                                <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                            </div>
                            <span id="auction-bid-label-__lot_lotId__">
                                <b>PIQUES</b>
                            </span>
                        </button>
                        <h5
                            id="auction-bid-no-history-__lot_lotId__"
                            class="d-inline-block text-center bg-dark lh-sm p-2 mb-0 d-none"
                        >
                            <span class="text-white">SIN PRE-OFERTAS</span>
                        </h5>

                        <div class="aoc-lot-price">
                            <h1 class="text-primary m-0">
                                <span class="fs-5">__lot_currency__</span>
                                <span id="last-auction-bid-price-auction-__lot_lotId__">
                                    __lot_lastPriceAuction_formatted__
                                </span>
                            </h1>
                            <p class="text-dark aoc-lot-installments">__lot_paymentTermName__</p>
                        </div>

                        <div id="bid-auction-actions-container-__lot_lotId__" class="aoc-lot-offer">
                            <button id="auction-bid-button-x1-__lot_lotId__" class="btn bid-action-button fs-5 lh-sm d-none" onclick="javascript:auctionBidByStep(__lot_lotId__,0)">
                                Ofertar __lot_lastAuctionPrice1Step__
                            </button>
                            <div id="auction-bid-button-multiple-__lot_lotId__" class="aoc-bid-stepper d-none">
                                <button class="btn btn-icon bid-action-button-step" onclick="auctionBidAddToPrice(__lot_lotId__, -1)">
                                    <i class="mdi mdi-minus"></i>
                                </button>
                                <input class="form-control text-center fs-4 p-2 h-100 aoc-bid-input"
                                    id="auction-bid-price-__lot_lotId__"
                                    type="number"
                                    onchange="auctionBidPriceChanged(__lot_lotId__)"
                                    name="auctionBidPrice"
                                        placeholder="0.00"
                                        step="__lot_stepPrice__"
                                        value="__lot_lastAuctionPriceMultiStep__">
                                <button class="btn btn-icon bid-action-button-step" onclick="auctionBidAddToPrice(__lot_lotId__, 1)">
                                    <i class="mdi mdi-plus"></i>
                                </button>
                                <button class="bid-action-button btn fs-5 lh-sm h-100" onclick="javascript:auctionBidCustom(__lot_lotId__)">
                                    Ofertar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

// Tarjeta reducida usada por el carrusel de Destacados (ver /remate/carousel-scripts.js).
// Solo muestra la info esencial + un acceso directo a la tarjeta completa del lote.
const lotCarouselTemplate =
    `
        <div class="col-12 bg-agrooriental stretch-card">
            <div class="card border-0 m-2">
                <div class="cattle-media-container position-relative overflow-hidden w-100">
                    <img class="w-100" src="__lot_imagesArray_0__">
                    <div class="btn btn-dark text-uppercase fs-6 p-2 m-0 aoc-lot-badge-float">
                        <b>LOTE __lot_subId__</b>
                    </div>
                </div>
                <div class="card-body px-3 pt-2">
                    <h4 class="text-truncate card-title text-uppercase fs-5 m-0">
                        __lot_equineName__
                    </h4>
                    <p class="text-truncate mb-2">
                        __lot_equineFather__ <b>Y</b> __lot_equineMother__
                    </p>
                    <p class="aoc-meta">
                        <b>__lot_type__</b><span class="aoc-dot-sep">•</span><b>RP __lot_equineRP__</b><span class="aoc-dot-sep">•</span><b>__lot_equineHair__</b>
                    </p>
                    <div class="aoc-price-row pt-0">
                        <h1 class="text-primary m-0"><span class="fs-5">__lot_currency__</span> __lot_lastPriceAuction_formatted__</h1>
                        <a class="btn bid-action-button fs-5 lh-sm" href="#lote-__lot_subId__">Ver lote</a>
                    </div>
                </div>
            </div>
        </div>
    `;
