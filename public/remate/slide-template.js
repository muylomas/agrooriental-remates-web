const slideTemplate =
    `
        <div class="col-xl-3 col-lg-3 col-md-3 col-sm-6 col-12">
            <div class="card m-2" id="lot-__lot_lotId__">
                <div class="cattle-media-container">
                    <video class="position-absolute top-50 start-50 translate-middle" preload="auto" playsinline="" autoplay="autoplay" loop="" muted="">
                        <source id="video-__lot_lotId__" type="video/mp4" src="__lot_video__" style="display: none;" />
                    </video>
                    <div id="image-__lot_lotId__" class="cattle-image position-absolute top-0 start-0 w-100 h-100" style="background-image:url(__lot_imagesArray_0__);" alt="Lote __lot_lotId__"></div>
                    <div class="position-absolute bottom-0 end-0 pe-2 pb-2 ">
                        <a id="view-in-youtube-__lot_lotId__" href="https://www.youtube.com/watch?v=9pRCCNSLiVI" type="button" 
                            class="btn btn-icon btn-youtube btn-rounded me-3 p-2 d-none" 
                            target="_blank">
                                <i class="mdi mdi-youtube"></i>
                        </a>
                        <button id="view-media-selector-__lot_lotId__" type="button" class="btn btn-primary btn-rounded btn-icon" onclick="javascript:changeVideoImageDisplay(__lot_lotId__,1)">
                            <i class="mdi mdi-video"></i>
                        </button>
                    </div>
                </div>
                <div class="card-body px-3">
                    <div class="d-flex justify-content-between flex-wrap">
                        <div class="d-flex align-items-end flex-wrap">
                            <div class="btn btn-dark text-uppercase fs-5 p-2 m-0">
                                <b>Lote __lot_lotId__</b>
                            </div>
                        </div>
                        <script>
                            startDates[__lot_lotId__] = Date.parse('__lot_auctionStartString__');
                            endDates[__lot_lotId__] = Date.parse('__lot_auctionEndString__');
                        </script>
                        <div class="countdown-container d-flex justify-content-between align-items-end flex-wrap" id="countdown-container-__lot_lotId__">
                            <h3 class="mb-0 d-inline-block text-center p-2 me-2">
                                <span class="text-white" id="countdown-days-__lot_lotId__">
                                    --
                                </span>
                            </h3>
                            <h3 class="mb-0 d-inline-block text-center p-2">
                                <span class="text-white" id="countdown-hours-__lot_lotId__">
                                    --
                                </span>
                            </h3>
                            <h3 class="mb-0 d-inline-block text-center p-2">
                                <span class="text-white">:</span>
                            </h3>
                            <h3 class="mb-0 d-inline-block text-center p-2">
                                <span class="text-white" id="countdown-mins-__lot_lotId__">
                                    --
                                </span>
                            </h3>
                            <h3 class="mb-0 d-inline-block text-center p-2">
                                <span class="text-white">:</span>
                            </h3>
                            <h3 class="mb-0 d-inline-block text-center p-2">
                                <span class="text-white" id="countdown-secs-__lot_lotId__">
                                    --
                                </span>
                            </h3>
                        </div>
                    </div>
                    <h4 class="card-title text-uppercase fs-5 mt-3 m-0">
                        __lot_equineName__
                    </h4>
                    <a href="__lot_equineARU__" target="_blank" class="mb-2">
                        (__lot_equineFather__ <b>Y</b> __lot_equineMother__  <b>X</b> __lot_equineMaternalGrandfather__)
                    </a>
                    <p class="card-text text-uppercase fs-6">
                        <b>__lot_type__</b>
                    </p>
                    <p class="card-text fs-6 mb-2">
                        <b>RP</b>: __lot_equineRP__
                        <br>
                        <b>Cabaña</b>: Chimango
                    </p>
                    
                    <div class="row mb-1">
                        <div class="col-12 p-0 m-0">
                            <h5 class="w-100">
                                <small id="auction-bid-status-__lot_lotId__" class="text-muted w-100">
                                    <div class="badge fs-4 w-100">
                                        &nbsp;
                                    </div>
                                </small>
                            </h5>
                        </div>
                    </div>
                    <div class="row mb-1">
                        <div class="col-12 p-0 m-0 position-relative" onclick="auctionBidsHistory(__lot_lotId__)">
                            <i id="auction-bid-view-history-__lot_lotId__" 
                                class="mdi mdi-eye position-absolute bottom-0 end-0 pt-3 icon-md text-primary translate-middle d-none">
                            </i>
                            <h2 class="text-primary mb-0 mt-1">
                                <small>__lot_currency__</small>
                                <span id="last-auction-bid-price-auction-__lot_lotId__">
                                    __lot_lastPriceAuction_formatted__
                                </span>
                                <span class="text-small">
                                    __lot_priceUnits__
                                </span>
                            </h2>
                            <p class="text-primary">Forma de pago: __lot_paymentTermName__</p>
                        </div>
                    </div>
                    
                    <div id="bid-auction-actions-container-__lot_lotId__">
                        <div class="row">
                            <div class="col-6 text-center pe-1">
                                <button class="bid-action-button btn btn-warning text-dark fs-5 lh-sm w-100 h-100" id="auction-bid-button-x1-__lot_lotId__" onclick="javascript:auctionBidByStep(__lot_lotId__,1)">
                                    Ofertar __lot_lastAuctionPrice1Step__
                                </button>
                            </div>
                            <div class="col-6 text-center ps-1">
                                <button class="bid-action-button btn btn-warning text-dark fs-5 lh-sm w-100 h-100" id="auction-bid-button-x2-__lot_lotId__" onclick="javascript:auctionBidByStep(__lot_lotId__,2)">
                                    Ofertar __lot_lastAuctionPrice2Step__
                                </button>
                            </div>
                        </div>
                        <div class="row mt-3">
                            <div class="col-12 p-0 m-0">
                                <div class="d-flex align-items-left justify-content-left justify-content-md-left">
                                    <div class="d-flex flex-column justify-content-around">
                                        <button class="btn btn-icon btn-danger" onclick="auctionBidAddToPrice(__lot_lotId__, -1)">
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
                                                value="__lot_lastAuctionPrice3Step__">
                                    </div>
                                    <div class="d-flex flex-column justify-content-around">
                                        <button class="btn btn-icon btn-primary" onclick="auctionBidAddToPrice(__lot_lotId__, 1)">
                                            <i class="mdi mdi-plus"></i>
                                        </button>
                                    </div>
                                    <div class="d-flex flex-column justify-content-around ms-2 w-100">
                                        <button class="bid-action-button btn btn-warning text-dark fs-5 lh-sm h-100" onclick="javascript:auctionBidCustom(__lot_lotId__)">
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