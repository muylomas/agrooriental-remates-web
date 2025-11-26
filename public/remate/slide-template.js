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
                    <p class="mb-2">
                        <a href="__lot_equineARU__" target="_blank" class="">
                            __lot_equineFather__ <b>Y</b> __lot_equineMother__  <b>X</b> __lot_equineMaternalGrandfather__
                        </a>
                    </p>
                    <p class="card-text fs-6 mb-2">
                        <b>Categoría</b>: <span="text-uppercase">__lot_type__</span></br>
                        <b>RP</b>: __lot_equineRP__</br>
                        <b>Pelo</b>: __lot_equineHair__</br>
                        <b>Nacimiento</b>: __lot_equineBirth__</br>
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


        <footer id="footer" class="footer solid-bg">

		
			<div class="wf-wrap">
				<div class="wf-container-footer">
					<div class="wf-container">
						<section id="presscore-contact-info-widget-2" class="widget widget_presscore-contact-info-widget wf-cell wf-1-4"><div class="widget-title">Contáctenos</div><ul class="contact-info"><li><span class="color-primary">Teléfono:</span><br>(+598) 2604 3036, (+598) 99 647 561</li><li><span class="color-primary">Dirección:</span><br>Gral. Domingo French 1948, 
Montevideo, Uruguay.</li><li><span class="color-primary">Horarios:</span><br>Lunes a Viernes: 9:00 hrs. a 18:00 hrs.</li></ul><div class="soc-ico"><p class="assistive-text">Find us on:</p><a title="Facebook page opens in new window" href="https://www.facebook.com/agrooriental.com.uy/" target="_blank" class="facebook"><span class="soc-font-icon"></span><span class="screen-reader-text">Facebook page opens in new window</span></a><a title="Twitter page opens in new window" href="https://twitter.com/agrooriental/" target="_blank" class="twitter"><span class="soc-font-icon"></span><span class="screen-reader-text">Twitter page opens in new window</span></a><a title="Instagram page opens in new window" href="https://www.instagram.com/agro_oriental/" target="_blank" class="instagram"><span class="soc-font-icon"></span><span class="screen-reader-text">Instagram page opens in new window</span></a></div></section><section id="block-3" class="widget widget_block wf-cell wf-1-4">  
  
  <div class="
    mailpoet_form_popup_overlay
      "></div>
  <div id="mailpoet_form_4" class="mailpoet_form mailpoet_form_html mailpoet_form_position_ mailpoet_form_animation_ mailpoet_form_tight_container">

    <style type="text/css">
     #mailpoet_form_4 .mailpoet_form {  }
#mailpoet_form_4 form { margin-bottom: 0; }
#mailpoet_form_4 p.mailpoet_form_paragraph { margin-bottom: 10px; }
#mailpoet_form_4 .mailpoet_column_with_background { padding: 10px; }
#mailpoet_form_4 .mailpoet_form_column:not(:first-child) { margin-left: 20px; }
#mailpoet_form_4 .mailpoet_paragraph { line-height: 20px; margin-bottom: 20px; }
#mailpoet_form_4 .mailpoet_segment_label, #mailpoet_form_4 .mailpoet_text_label, #mailpoet_form_4 .mailpoet_textarea_label, #mailpoet_form_4 .mailpoet_select_label, #mailpoet_form_4 .mailpoet_radio_label, #mailpoet_form_4 .mailpoet_checkbox_label, #mailpoet_form_4 .mailpoet_list_label, #mailpoet_form_4 .mailpoet_date_label { display: block; font-weight: normal; }
#mailpoet_form_4 .mailpoet_text, #mailpoet_form_4 .mailpoet_textarea, #mailpoet_form_4 .mailpoet_select, #mailpoet_form_4 .mailpoet_date_month, #mailpoet_form_4 .mailpoet_date_day, #mailpoet_form_4 .mailpoet_date_year, #mailpoet_form_4 .mailpoet_date { display: block; }
#mailpoet_form_4 .mailpoet_text, #mailpoet_form_4 .mailpoet_textarea { width: 200px; }
#mailpoet_form_4 .mailpoet_checkbox {  }
#mailpoet_form_4 .mailpoet_submit {  }
#mailpoet_form_4 .mailpoet_divider {  }
#mailpoet_form_4 .mailpoet_message {  }
#mailpoet_form_4 .mailpoet_form_loading { width: 30px; text-align: center; line-height: normal; }
#mailpoet_form_4 .mailpoet_form_loading > span { width: 5px; height: 5px; background-color: #5b5b5b; }
#mailpoet_form_4 h2.mailpoet-heading { margin: 0 0 20px 0; }
#mailpoet_form_4 h1.mailpoet-heading { margin: 0 0 10px; }#mailpoet_form_4{border: 0px solid #000000;border-radius: 2px;text-align: left;}#mailpoet_form_4 form.mailpoet_form {padding: 0px;}#mailpoet_form_4{width: 100%;}#mailpoet_form_4 .mailpoet_message {margin: 0; padding: 0 20px;}
        #mailpoet_form_4 .mailpoet_validate_success {color: #00d084}
        #mailpoet_form_4 input.parsley-success {color: #00d084}
        #mailpoet_form_4 select.parsley-success {color: #00d084}
        #mailpoet_form_4 textarea.parsley-success {color: #00d084}
      
        #mailpoet_form_4 .mailpoet_validate_error {color: #cf2e2e}
        #mailpoet_form_4 input.parsley-error {color: #cf2e2e}
        #mailpoet_form_4 select.parsley-error {color: #cf2e2e}
        #mailpoet_form_4 textarea.textarea.parsley-error {color: #cf2e2e}
        #mailpoet_form_4 .parsley-errors-list {color: #cf2e2e}
        #mailpoet_form_4 .parsley-required {color: #cf2e2e}
        #mailpoet_form_4 .parsley-custom-error-message {color: #cf2e2e}
      #mailpoet_form_4 .mailpoet_paragraph.last {margin-bottom: 0} @media (max-width: 500px) {#mailpoet_form_4 {background-image: none;}} @media (min-width: 500px) {#mailpoet_form_4 .last .mailpoet_paragraph:last-child {margin-bottom: 0}}  @media (max-width: 500px) {#mailpoet_form_4 .mailpoet_form_column:last-child .mailpoet_paragraph:last-child {margin-bottom: 0}} 
    </style>

    <form target="_self" method="post" action="https://agrooriental.uy/wp-admin/admin-post.php?action=mailpoet_subscription_form" class="mailpoet_form mailpoet_form_form mailpoet_form_html mailpoet_form_tight_container" novalidate="" data-delay="" data-exit-intent-enabled="" data-font-family="" data-cookie-expiration-time="">
      <input type="hidden" name="data[form_id]" value="4">
      <input type="hidden" name="token" value="cfb0c3adf0">
      <input type="hidden" name="api_version" value="v1">
      <input type="hidden" name="endpoint" value="subscribers">
      <input type="hidden" name="mailpoet_method" value="subscribe">

      <label class="mailpoet_hp_email_label" style="display: none !important;">Please leave this field empty<input type="email" name="data[email]"></label><p class="mailpoet_form_paragraph " style="text-align: left"><span style="font-family: Poppins" data-font="Poppins" class="mailpoet-has-font">¡Registrate para recibir información del agro en Uruguay, y mantente al día de nuestros últimos lotes y próximos remates</span></p>
<div class="mailpoet_paragraph "><label for="form_email_4" class="mailpoet-screen-reader-text" style="font-size: 16px;line-height: 1.2;" data-automation-id="form_email_label">Dirección de correo electrónico  <span class="mailpoet_required">*</span></label><input type="email" autocomplete="email" class="mailpoet_text" id="form_email_4" name="data[form_field_OTY2ZTg2NTUxYTc4X2VtYWls]" title="Dirección de correo electrónico" value="" style="width:100%;box-sizing:border-box;background-color:#ffffff;border-style:solid;border-radius:0px !important;border-width:1px;border-color:#313131;padding:15px;margin: 0 auto 0 0;font-family:'Montserrat';font-size:16px;line-height:1.5;height:auto;" data-automation-id="form_email" placeholder="Dirección de correo electrónico *" data-parsley-required="true" data-parsley-minlength="6" data-parsley-maxlength="150" data-parsley-type-message="This value should be a valid email." data-parsley-errors-container=".mailpoet_error_email_" data-parsley-required-message="This field is required."></div>
<div class="mailpoet_paragraph last"><input type="submit" class="mailpoet_submit" value="Confirmar suscripción" data-automation-id="subscribe-submit-button" data-font-family="Montserrat" style="width:100%;box-sizing:border-box;background-color:#ffffff;border-style:solid;border-radius:2px !important;border-width:1px;border-color:#313131;padding:15px;margin: 0 auto 0 0;font-family:'Montserrat';font-size:16px;line-height:1.5;height:auto;color:#000000;font-weight:bold;"><span class="mailpoet_form_loading"><span class="mailpoet_bounce1"></span><span class="mailpoet_bounce2"></span><span class="mailpoet_bounce3"></span></span></div>

      <div class="mailpoet_message">
        <p class="mailpoet_validate_success" style="display:none;">Revisa tu bandeja de entrada o la carpeta de spam para confirmar tu suscripción.
        </p>
        <p class="mailpoet_validate_error" style="display:none;">        </p>
      </div>
    </form>

      </div>

  </section>					</div><!-- .wf-container -->
				</div><!-- .wf-container-footer -->
			</div><!-- .wf-wrap -->

			
<!-- !Bottom-bar -->
<div id="bottom-bar" class="logo-left" role="contentinfo">
    <div class="wf-wrap">
        <div class="wf-container-bottom">

			<div id="branding-bottom"><a class="" href="https://agrooriental.uy/"><img class=" preload-me" src="https://agrooriental.uy/wp-content/uploads/2020/09/logo_agrooriental-e1601025470942.png" srcset="https://agrooriental.uy/wp-content/uploads/2020/09/logo_agrooriental-e1601025470942.png 120w, https://agrooriental.uy/wp-content/uploads/2020/09/logo_agrooriental-e1601025470942.png 120w" width="120" height="60" sizes="120px" alt="Agrooriental"></a></div>
                <div class="wf-float-left">

					Desarrollado para Agrooriental. Todos los derechos reservados.
                </div>

			
            <div class="wf-float-right">

				
            </div>

        </div><!-- .wf-container-bottom -->
    </div><!-- .wf-wrap -->
</div><!-- #bottom-bar -->
	</footer>
    `;