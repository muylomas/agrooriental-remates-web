function findIndexByLotId(lotId) {
    let result = { found: false, id: 0 };
    for (let index in lots) {
        if (lots[index].lotId == lotId) {
            result = { found: true, id: index };
        }
    }

    return result;
};

function changeVideoImageDisplay(lotId) {
    if (
        !($("#image-" + lotId).is(":hidden"))
    ) {
        $("#image-" + lotId).hide();

        const indexById = findIndexByLotId(lotId);
        if (indexById.found && indexById.id in lots && lots[indexById.id].video) {
            $("#cattle-media-container-" + lotId).prepend(
                `
                    <video id="video-`+ lotId + `" class="position-absolute top-50 start-50 translate-middle" preload="auto" playsinline="" autoplay="autoplay" loop="" muted="">
                        <source id="video-source-`+ lotId + `" type="video/mp4" src="` + lots[indexById.id].video + `"/>
                    </video>
                `
            );

            $("#view-in-youtube-" + lotId).show();
            $("#view-in-youtube-" + lotId).removeClass("d-none");
            $("#view-media-selector-" + lotId + " i").removeClass("mdi-video");
            $("#view-media-selector-" + lotId + " i").addClass("mdi-camera");
        }

    }
    else {
        $("#image-" + lotId).show();
        $("#video-" + lotId).remove();
        $("#view-in-youtube-" + lotId).hide();
        $("#view-media-selector-" + lotId + " i").removeClass("mdi-camera");
        $("#view-media-selector-" + lotId + " i").addClass("mdi-video");
    }
};

function auctionInfo() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML =
        `
            <div class="text-start" style="max-height: 70vh;overflow: scroll;">

                <h4>
                    <b>Cabaña Chimango</b>
                </h4>
                <h5>
                    <b>Fecha</b>: 11/12/2025, 19:00hs
                </h5>
                <h5>
                    <b>Ubicación</b>: Centro Las Lechuzas, Rincón de Pando
                </h5>
                <h5 class="mb-3">
                    <b>Modalidad</b>: Presencial
                </h4>

                <h4> Comercialización </h4>
                <ul>
                    <li>
                        La oferta del remate será de 63 potros, 30 machos (enteros y castrados) y 33 hembras. 
                        Cabe aclarar que saldrán a venta únicamente aquellos ejemplares que hayan sido preofertados. 
                        El remate será presencial, en el CT Las Lechuzas de Juan Pablo González, 
                        ubicado en Rincón de Pando - Canelones, transmitido por Paisano TV y por agrooriental.uy, 
                        el jueves 11 de diciembre, desde las 19 hs.
                    </li>
                    <li>
                        Las preofertas pueden realizarse a través de la página agrooriental.uy. 
                        Todos los que pre oferten y compren tendrán la inscripción gratis al Redomón Agro Oriental. 
                        Para aquellos que compren y no hayan realizado preoferta, la inscripción al redomón será de 300 dólares 
                        americanos en caso de querer participar. 
                        El Redomón se realizará el 6 al 8 de febrero de 2025 en el CT Las Lechuzas, el 100% de los potros vendidos en 
                        el remate estarán habilitados a correr dicha prueba.
                    </li>
                    <li>
                        Todas las preofertas participarán por 3 servicios de “Campana Echo a Mano”, que se adjudicarán de la siguiente 
                        manera: Un servicio para la preoferta más alta. Un servicio para el cliente que registre la mayor cantidad de 
                        preofertas (se considera 1 preoferta por lote). Un servicio mediante sorteo entre todos los participantes que 
                        hayan realizado al menos una preoferta.
                    </li>
                    <li>
                        El rematador comenzará con la pre oferta más alta de cada lote. Una pre oferta aceptada, es una obligación de compra, 
                        en caso de que no se realicen ofertas superiores, el animal será adjudicado a quien hizo esta última pre oferta.
                    </li>
                    <li>
                        Se rematará en un total de 18 cuotas, en dólares americanos. Efectuando el pago en 18 cuotas con tarjeta de crédito Visa 
                        o Master Card, o en 12 cuotas financiadas mediante crédito otorgado por el escritorio, previa aprobación.
                    </li>
                    <li>
                        La administración y el remate serán llevados a cabo por el escritorio Agro Oriental, para los clientes que necesiten 
                        crédito será obligatoria la aprobación previa por el escritorio, de no ser así, no podrá operar en compras. 
                        Cualquier consulta comuníquese con el 098 232 707 y 099 419 545.
                    </li>
                    <li>
                        Los trámites de compra, y la información necesaria para efectuar la misma deberán realizarse el día del remate (por 
                        ejemplo: N° de DICOSE). Los animales no pueden ser devueltos ni solicitar reducir su precio una vez caído el martillo. 
                        Por eso, los compradores tienen derecho a revisar los animales antes de la fecha del remate, con un técnico de su 
                        confianza.
                    </li>
                    <li>
                        La transferencia de los animales se realizará a solicitud y cargo del comprador, y será concluida una vez cancelado 
                        el pago de la compra. En caso de que una firma compre 2 o más animales, los pagos que se vayan realizando, 
                        se tomaran como pago de todos los lotes comprados, y no como pago de uno en particular.
                    </li>
                    <li>
                        El precio una vez bajado el martillo, está libre de cualquier tipo de cambio. La palabra del rematador podrá 
                        modificar o complementar estas condiciones y reglamentos.
                    </li>
                </p>
            </div>
        `;

    swal({
        title: "Información",
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
    });
};

function loginSwal() {

    const wrapper = document.createElement('div');
    wrapper.innerHTML =
        `
            <div class="content-wrapper auth app-full-bg p-0 m-0">
                <div class="row w-100">
                    <div class="col-lg-4 mx-auto">
                        <div class="auth-form-transparent text-left p-5 text-center">
                            <form method="post" name="loginForm" action="/login">
                                <h2 class="text-white mb-2 w-100 text-center">Ingresar</h2>
                                <h4 class="text-white mb-5 w-100 text-center">Para ofertar debes tener una cuenta y loguearte</h4>
                                
                                
                                <input type="hidden" name='loginMethodType' value='phone'>
                                <div class="form-group phone-form-input">
                                    <div class="input-group">
                                        <div class="input-group-prepend m-0 p-0">
                                            <select class="form-control px-2 py-1 h-100" name="phoneCountry"">
                                                <option value="1">+598</option>
                                                <option value="2">+54</option>
                                                <option value="3">+56</option>
                                                <option value="4">+1</option>
                                            </select>
                                        </div>
                                        <input class="form-control" type="number" name="phoneNumber" placeholder="99099099" min="91000000" max="99999999">
                                    </div>
                                </div>
                                <div class="form-group email-form-input" style="display: none;">
                                    <input class="form-control text-center" type="user" name="user" placeholder="Usuario">
                                </div>
                                <div class="form-group email-form-input" style="display: none;">
                                    <input class="form-control text-center" type="password" name="password" placeholder="Contraseña">
                                </div>
                                <button class="btn btn-block btn-warning text-dark btn-lg font-weight-medium w-100" type="submit"> Ingresar</button>
                                <h4 class="text-white mt-5 mb-3 w-100 text-left">No tenés cuenta?</h4>
                                <a class="btn btn-inverse-light btn-fw border-white text-white btn-lg font-weight-medium w-100" href="/registro">
                                    Crear una cuenta
                                </a>
                                <p class="mt-2 text-white">
                                    Al crear una cuenta, adhieres a los <a class="css-1qaijid r-bcqeeo r-qvutc0 r-poiln3 r-1loqt21" href="#" target="_blank" role="link">Términos y Condiciones</a> y a la <a class="css-1qaijid r-bcqeeo r-qvutc0 r-poiln3 r-1loqt21" href="#" target="_blank" role="link">Política de Privacidad</a>, incluyendo el uso de <a class="css-1qaijid r-bcqeeo r-qvutc0 r-poiln3 r-1loqt21" href="" target="_blank">Cookies.</a>
                                </p>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        `;

    swal({
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
    });
};