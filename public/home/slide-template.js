const slideTemplate =
    `
        <section class="slide cf" id="lote-__lot_lotId__">
            <div class="content-wrapper d-flex align-items-center full-video-bg p-0 m-0">
                <video class="cattle-video top-50 start-50 translate-middle" preload="auto" playsinline="" autoplay="autoplay" loop="" muted="" onclick="clickOnCattleVideo(__lot_lotId__)">
                    <source id="video-source-__lot_lotId__" type="video/mp4" src="__lot_video__"
                    style="z-index: 1;">
                </video>
                <div class="bottom-overlay-video" id="bottom-overlay-__lot_lotId__" style="z-index: 999; display: block;">
                    <div class="row p-3">
                        <div class="col-9 position-relative">
                            <p class="text-white" id="google-map-bottom-desc-text-__lot_lotId__" style="display: none;">
                                __lot_addressLocationName__, __lot_addressStateName__
                            </p>
                            <div class="google-map-container" id="google-map-bottom-desc-__lot_lotId__"></div>
                            <div class="map-closed-icon position-absolute bottom-0" id="map-closed-icon-__lot_lotId__" onclick="expandMap(__lot_lotId__)" style="background-image: url(&quot;https://mercadoagro-app.s3.amazonaws.com/images/home/maps-icon.png&quot;);">
                                <img class="w-100" src="https://mercadoagro-backoffice.s3.amazonaws.com/images/transparent-pixel.png">
                            </div>
                            <h5 class="p-0 m-0 ms-5 ps-3 text-white text-truncate" id="google-map-under-desc-text-__lot_lotId__">
                                __lot_addressLocationName__, __lot_addressStateName__
                            </h5>
                            <script>
                                latLngForLot[__lot_lotId__] = {
                                    lat: __lot_addressLatitude__,
                                    lng: __lot_addressLongitude__,
                                };
                            </script>
                        </div>
                    </div>
                    <div class="bottom-lot-data row p-3 pt-0" id="lot-detail-description-__lot_lotId__">
                        <div class="col-9">
                            <div class="countdown-container d-flex flex-wrap justify-content-xl-between" id="bottom-countdown-container-__lot_lotId__">
                                <div class="d-flex flex-grow-1 align-items-left justify-content-left justify-content-md-left">
                                    <div class="countdown-day-container d-flex flex-column justify-content-around">
                                        <h2 class="mb-0 d-inline-block text-center p-2">
                                            <span class="text-white" id="countdown-days-__lot_lotId__">
                                                --
                                            </span>
                                        </h2>
                                    </div>
                                    <div class="d-flex flex-column justify-content-around">
                                        <h2 class="mb-0 d-inline-block text-center p-2">
                                            <span class="text-white" id="countdown-hours-__lot_lotId__">
                                                --
                                            </span>
                                        </h2>
                                    </div>
                                    <div class="d-flex flex-column justify-content-around">
                                        <h2 class="mb-0 d-inline-block text-center p-2">
                                            <span class="text-white">:</span>
                                        </h2>
                                    </div>
                                    <div class="d-flex flex-column justify-content-around">
                                        <h2 class="mb-0 d-inline-block text-center p-2">
                                            <span class="text-white" id="countdown-mins-__lot_lotId__">
                                                --
                                            </span>
                                        </h2>
                                    </div>
                                    <div class="d-flex flex-column justify-content-around">
                                        <h2 class="mb-0 d-inline-block text-center p-2">
                                            <span class="text-white">:</span>
                                        </h2>
                                    </div>
                                    <div class="d-flex flex-column justify-content-around">
                                        <h2 class="mb-0 d-inline-block text-center p-2">
                                            <span class="text-white" id="countdown-secs-__lot_lotId__">
                                                --
                                            </span>
                                        </h2>
                                    </div>
                                </div>
                            </div>
                            <script>
                                startDates[__lot_lotId__] = Date.parse('__lot_auctionStartString__');
                                endDates[__lot_lotId__] = Date.parse('__lot_auctionEndString__');
                            </script>
                            <h2 class="text-white mt-3 mb-3">
                                <small>
                                    __lot_currency__
                                </small>
                                <span id="last-auction-bid-price-__lot_lotId__">
                                    __lot_lastPriceAuction_formatted__
                                </span>
                                <span class="text-small">
                                    __lot_priceUnits__
                                </span>
                            </h2>
                            
                            <h3 class="my-2 text-white">
                                __lot_totalQuantity__ __lot_type__
                            </h3>
                            <p class="text-white lot-description">
                                __lot_explanations__
                            </p>
                        </div>
                        <div class="col-3"></div>
                    </div>
                    <div class="button-auction-bid row p-3 pt-0" id="button-auction-bid-__lot_lotId__">
                        <div class="col-12">
                            <button class="bid-action-button btn btn-warning btn-lg text-dark w-100">
                                Quiero el lote
                            </button>
                        </div>
                    </div>
                </div>
                <div class="iconbar-overlay-video row p-2 pb-5" id="iconbar-overlay-__lot_lotId__" style="z-index: 999; display: flex;">
                    <div class="col-12 text-center pb-5">
                        <div class="share-contact-salesagent mb-3" id="share-contact-salesagent-__lot_lotId__" style="background-image:url(__lot_salesagentImageSafe__);">
                            <img class="w-100" src="https://mercadoagro-backoffice.s3.amazonaws.com/images/transparent-pixel.png" alt="__lot_salesagentName__ __lot_salesagentSurname__">
                        </div>
                        <div class="iconbar-toggler" id="lot-detail-icons-__lot_lotId__">
                            <i class="mdi mdi-pound mt-5 icon-md"></i>
                            <h4>__lot_lotId__</h4>
                            __lot_totalQuantitySideBar__
                            <i class="mdi mdi-weight-kilogram mt-5 icon-md"></i>
                            <h4>__lot_meanWeight__</h4>
                            __lot_agesString__
                            <i class="mdi mdi-star mt-5 icon-md text-warning"></i>
                            <h4>__lot_rating__</h4>
                        </div>
                        <button class="share-contact-whatsapp btn btn-success btn-rounded btn-icon mt-2" id="lot-chat-button-__lot_lotId__" type="button">
                            <i class="mdi mdi-whatsapp"></i>
                        </button>
                    </div>
                </div>
            </div>
            <div class="share-contact" id="share-contact-__lot_lotId__">
                <div class="share-contact-bg">
                    <div class="share-contact-wrapper">
                        <div class="row">
                            <div class="col-12">
                                <div class="card border-0">
                                    <div class="card-body">
                                        <h5>
                                            <small class="text-uppercase text-muted">
                                                Agente de venta
                                            </small>
                                        </h5>
                                        <div class="d-flex align-items-center mt-2 p-2">
                                            <div class="cattle-saleagent-profile-image" 
                                                style="
                                                        background:url(__lot_salesagentImageSafe__);
                                                        background-size:cover;
                                                        background-repeat:no-repeat;
                                                        border-radius:50%;
                                                        display: inline-block;
                                                        width:50px;
                                                        height:50px;">
                                                <img src="https://mercadoagro-backoffice.s3.amazonaws.com/images/transparent-pixel.png" 
                                                    alt="__lot_salesagentName__ __lot_salesagentSurname__">
                                            </div>
                                            <div class="ms-3">
                                                <h5 class="m-0 mb-1 p-0 text-uppercase">
                                                    __lot_salesagentName__ __lot_salesagentSurname__
                                                </h5>
                                                <h5 class="m-0 p-0">
                                                    <small class="text-muted">
                                                        __lot_salesagentDeskName__
                                                    </small>
                                                </h4>
                                            </div>
                                        </div>
                                        <div class="row mt-2">
                                            <div class="col-6" style="padding-right:5px;">
                                                <a class="btn btn-success d-flex align-items-center" style="height:100%" href="https://wa.me/?text=__lot_whatsappShare__"
                                                target="_blank">
                                                    <div class="d-flex align-items-center" style="margin:auto;"> <i class="mdi mdi-share-variant mr-2"> </i>Compartir</div>
                                                </a>
                                            </div>
                                            <div class="col-6" style="padding-left:5px;">
                                                <a class="btn btn-inverse-primary btn-fw btn-icon-text d-flex align-items-center" href="https://wa.me/__lot_salesagentPhone__?text=__lot_whatsappMessage__"
                                                target="_blank">
                                                    <div class="d-flex align-items-center" style="margin:auto;">
                                                        <i class="mdi mdi-whatsapp mr-2"></i>
                                                        WhatsApp
                                                    </div>
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <link rel="stylesheet" href="/chat.min.css">
            <div class="lot-chat" id="lot-chat-__lot_lotId__">
                <div class="lot-chat-wrapper">
                    <div class="lot-chat-header d-flex justify-content-between flex-wrap bg-success text-white px-4">
                        <div class="d-flex align-items-center flex-wrap py-3">
                            <h4 class="m-0"> Lote #__lot_lotId__</h4></div>
                        <div class="d-flex justify-content-between align-items-center flex-wrap py-3">
                            <i class="lot-chat-close mdi mdi-close icon-md"></i>
                        </div>
                    </div>
                    <div class="lot-chat-content">
                        <div class="card border-0">
                            <div class="card-body p-0">
                                <div class="row">
                                    <div class="col-12">
                                        <div class="chat-body m-0 p-0">
                                            <div class="chat-container w-100">
                                                <div class="comments-container-overall" id="comments-container-overall-__lot_lotId__">
                                                    <div class="lot-chat-header d-flex justify-content-between flex-wrap bg-success text-white px-4 position-relative invisible">
                                                        <div class="d-flex align-items-center flex-wrap py-3">
                                                            <h4 class="m-0"> Lote #__lot_lotId__</h4>
                                                        </div>
                                                        <div class="d-flex justify-content-between align-items-center flex-wrap py-3">
                                                            <i class="lot-chat-close mdi mdi-close icon-md"></i>
                                                        </div>
                                                    </div>
                                                    <div class="comments-container" id="comments-container-__lot_lotId__"></div>
                                                    <div class="contenteditable-container d-flex justify-content-between flex-wrap bg-light w-100 p-4 mt-2 position-relative invisible">
                                                        <div class="flex-fill me-2 chat-edit-container">
                                                            <div class="chat-edit bg-white p-3" id="comment-input-repilca-text-__lot_lotId__" contenteditable="true"></div>
                                                        </div>
                                                        <div class="d-flex justify-content-between align-items-end flex-wrap">
                                                            <button class="chat-send-button btn btn-success btn-rounded btn-icon" type="button">
                                                                <div class="mdi mdi-send"></div>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="contenteditable-container d-flex justify-content-between flex-wrap bg-light w-100 p-4">
                                                    <div class="flex-fill me-2 chat-edit-container">
                                                        <div class="chat-edit bg-white p-3" id="comment-input-text-__lot_lotId__" contenteditable="true"></div>
                                                    </div>
                                                    <div class="d-flex justify-content-between align-items-end flex-wrap">
                                                        <button class="chat-send-button btn btn-success btn-rounded btn-icon" type="button" onclick="publishComment(__lot_lotId__)">
                                                            <div class="mdi mdi-send"></div>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="auction-bid" id="auction-bid-__lot_lotId__">
                <div class="auction-bid-bg"></div>
                <div class="auction-bid-container">
                    <div class="auction-bid-wrapper">
                        <div class="row">
                            <div class="col-12">
                                <div class="card border-0">
                                    <div class="card-body">
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
                                        __farms_freightsForLot__
                                        <div id="bid-auction-actions-container-__lot_lotId__">
                                            <div class="row">
                                                <div class="col-6 text-center" style="padding-left: 0;">
                                                    <button class="bid-action-button btn btn-warning text-dark w-100 h-100" id="auction-bid-button-x1-__lot_lotId__" onclick="javascript:auctionBidByStep(__lot_lotId__,1)" style="line-height: 1.3rem;">
                                                        Ofertar __lot_lastAuctionPrice1Step__
                                                    </button>
                                                </div>
                                                <div class="col-6 text-center" style="padding-right: 0;">
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
                        </div>
                    </div>
                </div>
            </div>
            <div class="lot-detail" id="lot-detail-__lot_lotId__">
                <div class="lot-detail-wrapper">
                    <div class="lot-detail-header d-flex justify-content-between flex-wrap bg-primary text-white px-4">
                        <div class="d-flex align-items-center flex-wrap py-3">
                            <h4 class="m-0">Detalle del Lote</h4>
                        </div>
                        <div class="d-flex justify-content-between align-items-center flex-wrap py-3">
                            <i class="lot-detail-close mdi mdi-close icon-md"></i>
                        </div>
                    </div>
                    <div class="row mt-5 pt-4">
                        <div class="col-12">
                            <div class="card border-0">
                                <div class="card-body">
                                    <div class="row">
                                        <div class="col-md-5">
                                            <h3 class="mb-2">
                                                __lot_totalQuantity__ __lot_type__
                                            </h3>
                                            <h4 class="text-muted text-truncate">
                                                <small>__lot_farmName__</small>
                                            </h4>
                                            <h5 class="text-muted text-truncate">
                                                __lot_addressLocationName__, __lot_addressStateName__
                                            </h5>
                                            <h6 class="mb-3 text-muted">
                                                LOTE #__lot_lotId__
                                            </h6>
                                            <div class="row">
                                                <div class="col-sm-6 mb-sm-0 mb-2">
                                                    __lot_rating_HTML__
                                                </div>
                                                <div class="col-sm-3 col-6">
                                                    <h4 class="mb-0">
                                                        <b>__lot_meanWeight__</b>
                                                        <small>Kg</small>
                                                    </h4>
                                                </div>
                                                <div class="col-sm-3 col-6">
                                                    __lot_age_HTML__
                                                </div>
                                            </div>
                                            <div class="row mb-2">
                                                <div class="col-sm-6"></div>
                                                <div class="col-sm-6">
                                                    __lot_weighed_msg__
                                                </div>
                                            </div>
                                            __lot_certified_HTML__
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    __lot_explanations_HTML__

                    __lot_breedsArray_HTML__

                    __lot_agesArray_HTML__

                    __lot_wcc_count_HTML__
                    
                    <div class="row">
                        <div class="col-12">
                            <div class="card border-0">
                                <div class="card-body pt-0">
                                    <div class="row">
                                        <div class="col-3 align-items-center">
                                            <div class="text-center">
                                                <h5 class="text-truncate">
                                                    <small class="text-muted">Mochos</small>
                                                </h5>
                                                <h2 class="text-truncate text-muted mt-3 mb-0 lh-normal">
                                                    <span style="word-spacing: -1px;letter-spacing: -2px;">__lot_mochos__</span>
                                                </h2>
                                                <p class="text-truncate text-muted mt-0 mb-2 lh-normal">
                                                    <small>__lot_mochos%__</small>
                                                </p>
                                            </div>
                                        </div>
                                        <div class="col-3 align-items-center">
                                            <div class="text-center">
                                                <h5 class="text-truncate">
                                                    <small class="text-muted">Astados</small>
                                                </h5>
                                                <h2 class="text-truncate text-muted mt-3 mb-0 lh-normal">
                                                    <span style="word-spacing: -1px;letter-spacing: -2px;">__lot_astados__</span>
                                                </h2>
                                                <p class="text-truncate text-muted mt-0 mb-2 lh-normal">
                                                    <small>__lot_astados%__</small>
                                                </p>
                                            </div>
                                        </div>
                                        <div class="col-3 align-items-center">
                                            <div class="text-center">
                                                <h5 class="text-truncate">
                                                    <small class="text-muted">Mochados</small>
                                                </h5>
                                                <h2 class="text-truncate text-muted mt-3 mb-0 lh-normal">
                                                    <span style="word-spacing: -1px;letter-spacing: -2px;">__lot_mochados__</span>
                                                </h2>
                                                <p class="text-truncate text-muted mt-0 mb-2 lh-normal">
                                                    <small>__lot_mochados%__</small>
                                                </p>
                                            </div>
                                        </div>
                                        <div class="col-3 align-items-center">
                                            <div class="text-center">
                                                <h5 class="text-truncate">
                                                    <small class="text-muted">Tocos</small>
                                                </h5>
                                                <h2 class="text-truncate text-muted mt-3 mb-0 lh-normal">
                                                    <span style="word-spacing: -1px;letter-spacing: -2px;">__lot_tocos__</span>
                                                </h2>
                                                <p class="text-truncate text-muted mt-0 mb-2 lh-normal">
                                                    <small>__lot_tocos%__</small>
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="row pt-3 mt-2 border-top">
                                        <div class="col-6">
                                            <div>
                                                <h5 class="text-truncate">
                                                    <small class="text-muted">Trat. Nutricional</small>
                                                </h5>
                                                <h4 class="text-primary m-0 mt-2">__lot_feeding__</h4>
                                                __lot_ration_HTML__
                                            </div>
                                        </div>
                                        <div class="col-6">
                                            <div style="text-align: right;">
                                                <h5 class="text-truncate">
                                                    <small class="text-muted">Zona de garrapata</small>
                                                </h5>
                                                <h4 class="py-2">
                                                    __lot_tick_HTML__
                                                </h4>
                                                <h5 class="text-truncate mt-3">
                                                    <small class="text-muted">Conoce Mio-Mio</small>
                                                </h5>
                                                <h4 class="py-2">
                                                    __lot_mio_HTML__
                                                </h4>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    __lot_weighed_HTML__

                    <div class="row">
                        <div class="col-12">
                            <div class="card border-0">
                                <div class="card-body pt-0">
                                    <h6 class="mb-3 pb-2 border-bottom">Informe de Revisación</h6>
                                    <div class="row">
                                        <div class="col-12">
                                            <h5>
                                                <small class="text-muted">Estado Corporal</small>
                                            </h5>
                                            __lot_bodyStatus_HTML__
                                        </div>
                                    </div>
                                    __lot_health_HTML__
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    `;

const customerFarmFreightTemplate =
    `
        <div class="row item w-100 m-0" id="customer-farm__farm_id__-__lot_id__">
            <div class="col-6">
                <h5 class="m-0 p-0 text-truncate">__farm_name__</h5>
                <p class="text-muted font-weight-normal text-small m-0 p-0">__farm_state__</p>
            </div>
            <div class="col-6 p-0 text-left" id="customer-farm__farm_id__-__lot_id__-freight"></div>
        </div>
    `;