const slideTemplate =
    `
        <div id="lote-__lot_lotId__" class="col-xl-3 col-lg-3 col-md-3 col-sm-6 col-12 stretch-card bg-white">
            <div class="card m-2" id="lot-__lot_lotId__" style="min-width: auto;">
                <div id="cattle-media-container-__lot_lotId__" class="cattle-media-container position-relative overflow-hidden w-100">
                    <img class="w-100" src="https://agro-oriental-remates.s3.us-west-1.amazonaws.com/web/images/banners/chimango-video-background.jpg">
                    <div id="image-__lot_lotId__" class="cattle-image position-absolute top-0 start-0 w-100 h-100" style="background-image:url(__lot_imagesArray_0__);" alt="Lote __lot_lotId__"></div>
                    <div class="position-absolute bottom-0 end-0 pe-2 pb-2 ">
                        <button id="view-in-youtube-__lot_lotId__" 
                            type="button"
                            onclick="openYoutubeLink('__lot_equineYoutube__')" 
                            class="btn btn-icon btn-youtube btn-rounded me-3 p-2 h-100 d-none">
                                <i class="mdi mdi-youtube"></i>
                        </button>
                        <button id="view-media-selector-__lot_lotId__" type="button" class="btn btn-primary btn-rounded btn-icon" onclick="javascript:changeVideoImageDisplay(__lot_lotId__)">
                            <i class="mdi mdi-video"></i>
                        </button>
                    </div>
                </div>
                <div class="card-body px-3">
                    <div class="d-flex justify-content-between flex-wrap align-items-center">
                        <div class="d-flex align-items-end flex-wrap">
                            <div class="btn btn-dark text-uppercase fs-5 p-2 m-0">
                                <b>Lote __lot_subId__</b>
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
                            <h4 class="mb-0 d-inline-block text-center p-2">
                                <span class="text-white">:</span>
                            </h4>
                            <h4 class="mb-0 d-inline-block text-center p-2">
                                <span class="text-white" id="countdown-mins-__lot_lotId__">
                                    --
                                </span>
                            </h4>
                            <h4 class="mb-0 d-inline-block text-center p-2">
                                <span class="text-white">:</span>
                            </h4>
                            <h4 class="mb-0 d-inline-block text-center p-2">
                                <span class="text-white" id="countdown-secs-__lot_lotId__">
                                    --
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
                    <p class="card-text fs-6 mb-2">
                        <b>Categoría</b>: <span="text-uppercase">__lot_type__</span></br>
                        <b>RP</b>: __lot_equineRP__</br>
                        <b>Pelo</b>: __lot_equineHair__</br>
                        <b>Nacimiento</b>: __lot_equineBirth__</br>
                        <b>Cabaña</b>: __lot_equineCabin__
                    </p>
                    
                    <div id="auction-bid-status-container-__lot_lotId__" class="row mb-1 d-none">
                        <div class="col-12 p-0 m-0">
                            <h5 class="w-100">
                                <small id="auction-bid-status-__lot_lotId__" class="text-muted w-100">
                                </small>
                            </h5>
                        </div>
                    </div>
                    <div class="row mb-1">
                        <div class="col-12 p-0 m-0 position-relative">
                            <button 
                                id="auction-bid-view-history-__lot_lotId__"
                                class="btn btn-dark lh-sm position-absolute end-0 d-none" 
                                onclick="auctionBidsHistory(__lot_lotId__)"
                            >
                                <b>PIQUES</b>
                            </button>
                            <h5 
                                id="auction-bid-no-history-__lot_lotId__" 
                                class="d-inline-block text-center bg-dark lh-sm position-absolute end-0 mb-0 p-2 d-none"
                            >
                                <span class="text-white">SIN PRE-OFERTAS</span>
                            </h5>
                            
                            <h1 class="text-primary m-0">
                                <span class="fs-5">__lot_currency__</span>
                                <span id="last-auction-bid-price-auction-__lot_lotId__">
                                    __lot_lastPriceAuction_formatted__
                                </span>
                            </h2>
                            <p class="text-dark">__lot_paymentTermName__</p>
                        </div>
                    </div>
                    
                    <div id="bid-auction-actions-container-__lot_lotId__">
                        <button id="auction-bid-button-x1-__lot_lotId__" class="btn bid-action-button fs-5 lh-sm w-100 d-none" onclick="javascript:auctionBidByStep(__lot_lotId__,0)">
                            Ofertar __lot_lastAuctionPrice1Step__
                        </button>
                        <div id="auction-bid-button-multiple-__lot_lotId__" class="row d-none">
                            <div class="col-12 p-0 m-0">
                                <div class="d-flex align-items-left justify-content-left justify-content-md-left">
                                    <div class="d-flex flex-column justify-content-around">
                                        <button class="btn btn-icon bid-action-button-step" onclick="auctionBidAddToPrice(__lot_lotId__, -1)">
                                            <i class="mdi mdi-minus"></i>
                                        </button>
                                    </div>
                                    <div class="d-flex flex-column justify-content-around">
                                        <input class="form-control text-center fs-4 p-2 h-100" 
                                            id="auction-bid-price-__lot_lotId__" 
                                            type="number" 
                                            onchange="auctionBidPriceChanged(__lot_lotId__)" 
                                            name="auctionBidPrice"
                                                placeholder="0.00" 
                                                step="__lot_stepPrice__" 
                                                value="__lot_lastAuctionPriceMultiStep__">
                                    </div>
                                    <div class="d-flex flex-column justify-content-around">
                                        <button class="btn btn-icon bid-action-button-step" onclick="auctionBidAddToPrice(__lot_lotId__, 1)">
                                            <i class="mdi mdi-plus"></i>
                                        </button>
                                    </div>
                                    <div class="d-flex flex-column justify-content-around ms-2 w-100">
                                        <button class="bid-action-button btn text-dark fs-5 lh-sm h-100" onclick="javascript:auctionBidCustom(__lot_lotId__)">
                                            Ofertar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;