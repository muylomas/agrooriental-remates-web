const slideTemplate =
    `
        <div class="col-xl-3 col-lg-3 col-md-3 col-sm-6 col-12">
            <div class="card m-2" id="lot-__lot_lotId__">
                <div class="card-img-top" style="background-image:url(__lot_imagesArray_0__);height: 245px;background-size: cover;" alt="Lote 25"></div>
                <div class="card-body px-3">
                    <div class="btn btn-dark text-uppercase p-2 m-0">
                        <b>Lote 25</b>
                    </div>
                    <h4 class="card-title text-uppercase mt-3 mb-2">
                        LAS BRUJAS FUERZA NUEVA TE
                    </h4>
                    <p class="card-text">
                        Potranca
                        <br>
                        (AS Malke Sedutor-TE  Y Devota De Santa Marcia  X Indio Do Boeiro)
                        <br>
                        RP: 125
                        <br>
                        Cabaña: Las Brujas
                    </p>
                    
                    <div class="row mb-1">
                        <div class="col-12 p-0 m-0">
                            <h5 class="w-100">
                                <small id="auction-bid-status-__lot_lotId__" class="text-muted w-100">
                                </small>
                            </h5>
                        </div>
                    </div>
                    <div class="row mb-1">
                        <div class="col-6 p-0 m-0 position-relative" onclick="auctionBidsHistory(__lot_lotId__)">
                            <i id="auction-bid-view-history-__lot_lotId__" class="mdi mdi-eye position-absolute top-0 end-0 pt-3 icon-md text-primary translate-middle d-none"></i>
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
                        <div class="col-6 m-0">
                            <div id="category-media-value-container-__lot_lotId__">
                                <h5>
                                    <small class="text-muted">Promedio de cat.</small>
                                </h5>
                                <mark class="bg-dark text-white" style="font-size: 18px">
                                    USD <b>__lot_auctionAvg__</b>
                                    <small>
                                        __lot_auctionAvgPercentage__
                                    </small>
                                </mark>
                            </div>
                        </div>
                    </div>
                    
                    <div id="bid-auction-actions-container-__lot_lotId__">
                        <div class="row">
                            <div class="col-6 text-center pr-1">
                                <button class="bid-action-button btn btn-warning text-dark w-100 h-100" id="auction-bid-button-x1-__lot_lotId__" onclick="javascript:auctionBidByStep(__lot_lotId__,1)" style="line-height: 1.3rem;">
                                    Ofertar __lot_lastAuctionPrice1Step__
                                </button>
                            </div>
                            <div class="col-6 text-center pl-1">
                                <button class="bid-action-button btn btn-warning text-dark w-100 h-100" id="auction-bid-button-x2-__lot_lotId__" onclick="javascript:auctionBidByStep(__lot_lotId__,2)" style="line-height: 1.3rem;">
                                    Ofertar __lot_lastAuctionPrice2Step__
                                </button>
                            </div>
                        </div>
                        <div class="row mt-4">
                            <div class="col-12 p-0 m-0">
                                <div class="d-flex align-items-left justify-content-left justify-content-md-left">
                                    <div class="d-flex flex-column justify-content-around">
                                        <button class="btn btn-icon btn-danger" onclick="auctionBidAddToPrice(__lot_lotId__, -1)">
                                            <i class="mdi mdi-minus"></i>
                                        </button>
                                    </div>
                                    <div class="d-flex flex-column justify-content-around">
                                        <input class="form-control text-center p-2 h-100" 
                                            style="font-size: large;"
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
                                    <div class="d-flex flex-column justify-content-around w-100" style="margin-left:20px">
                                        <button class="bid-action-button btn btn-warning text-dark h-100" onclick="javascript:auctionBidCustom(__lot_lotId__)">
                                            Ofertar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="row mt-5">
                            <div class="col-12 p-0 m-0">
                                <h5>
                                    <small class="text-muted">
                                        Compra inmediata
                                    </small>
                                </h5>
                                <h2 class="text-primary">
                                    <small>__lot_currency__</small>
                                    <span>__lot_salePrice_formatted__</span>
                                    <span class="text-small">__lot_priceUnits__</span>
                                </h2>
                                <button class="btn btn-primary btn-lg font-weight-medium w-100 mb-2" id="buy-action-button-__lot_lotId__" onclick="javascript:buyInmediatelly(__lot_lotId__)">
                                    Comprar ya
                                </button>
                                <p class="text-primary">
                                    Forma de pago: __lot_paymentTermName__
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;