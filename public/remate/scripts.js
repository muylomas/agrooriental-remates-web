function findIndexByLotId(lotId) {
    let result = { found: false, id: 0 };
    for (let index in lots) {
        if (lots[index].lotId == lotId) {
            result = { found: true, id: index };
        }
    }

    return result;
};

// Alterna foto/video del lote. Al pasar a video, la foto queda visible
// mientras el video carga (debajo de ella); cuando el video empieza a
// reproducirse ("playing"), la clase video-playing hace un único fundido:
// la foto se desvanece y deja ver el video sobre fondo oscuro (styles.css).
// Si el navegador no llega a reproducirlo, la foto queda como estaba.
function changeVideoImageDisplay(lotId) {
    const $container = $("#cattle-media-container-" + lotId);

    if (!$("#video-" + lotId).length) {
        const indexById = findIndexByLotId(lotId);
        if (indexById.found && indexById.id in lots && lots[indexById.id].video) {
            $container.prepend(
                `
                    <video id="video-`+ lotId + `" class="position-absolute top-50 start-50 translate-middle" preload="auto" playsinline="" autoplay="autoplay" loop="" muted="">
                        <source id="video-source-`+ lotId + `" type="video/mp4" src="` + lots[indexById.id].video + `"/>
                    </video>
                `
            );

            const videoElement = document.getElementById("video-" + lotId);
            videoElement.addEventListener("playing", function () {
                $container.addClass("video-playing");
            }, { once: true });

            $("#view-in-youtube-" + lotId).show();
            $("#view-in-youtube-" + lotId).removeClass("d-none");
            $("#view-media-selector-" + lotId + " i").removeClass("mdi-video");
            $("#view-media-selector-" + lotId).removeClass("btn-danger");
            $("#view-media-selector-" + lotId + " i").addClass("mdi-camera");
            $("#view-media-selector-" + lotId).addClass("btn-primary");
        }
    }
    else {
        $container.removeClass("video-playing");
        $("#video-" + lotId).remove();
        $("#view-in-youtube-" + lotId).hide();
        $("#view-media-selector-" + lotId + " i").removeClass("mdi-camera");
        $("#view-media-selector-" + lotId).removeClass("btn-primary");
        $("#view-media-selector-" + lotId + " i").addClass("mdi-video");
        $("#view-media-selector-" + lotId).addClass("btn-danger");
    }
};

function auctionInfo() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = auctionTerms;

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
                    <div class="col-lg-4 mx-auto" style="min-width: 370px;">
                        <div class="auth-form-transparent text-left p-5 text-center">
                            <form method="post" name="loginForm" action="/login">
                                <h2 class="text-white mb-2 w-100 text-center">Ingresar</h2>
                                <h4 class="text-white mb-5 w-100 text-center">Para ofertar ingresá con tu celular. Te mandamos un código por WhatsApp; si es tu primera vez, después te pedimos tu nombre.</h4>
                                
                                
                                <input type="hidden" name='loginMethodType' value='phone'>
                                <div class="form-group phone-form-input">
                                    <div class="input-group">
                                        <div class="input-group-prepend m-0 p-0">
                                            <select class="form-control px-2 py-1 h-100" name="phoneCountry"">
                                                <option value="1">🇺🇾 +598</option>
                                                <option value="2">🇦🇷 +54</option>
                                                <option value="3">🇨🇱 +56</option>
                                                <option value="4">🇺🇸 +1</option>
                                                <option value="6">🇧🇷 +55</option>
                                                <option value="5">🇵🇾 +595</option>
                                                <option value="7">🇩🇪 +49</option>
                                            </select>
                                        </div>
                                        <input class="form-control" type="number" name="phoneNumber" placeholder="99099099">
                                    </div>
                                </div>
                                <button class="btn btn-block btn-warning text-dark btn-lg font-weight-medium w-100" type="submit">Ingresar</button>
                                <p class="mt-4 text-white">
                                    Al ingresar, adherís a los <a class="css-1qaijid r-bcqeeo r-qvutc0 r-poiln3 r-1loqt21" href="/terminos-y-condiciones" target="_blank" role="link">Términos y Condiciones</a> y a la <a class="css-1qaijid r-bcqeeo r-qvutc0 r-poiln3 r-1loqt21" href="/politica-de-privacidad" target="_blank" role="link">Política de Privacidad</a>, incluyendo el uso de <a class="css-1qaijid r-bcqeeo r-qvutc0 r-poiln3 r-1loqt21" href="/politica-de-privacidad#cookies" target="_blank">Cookies.</a>
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
(function () {
    const scrollThreshold = 5;

    // El layout "fsvs" (html.fsvs) llegó a fijar el <html> con
    // overflow:hidden aunque acá nunca se inicialice el plugin de scroll a
    // pantalla completa (se corrigió agregando "no-hijack" en
    // home-baseHTML.pug). Igual dejamos esta detección tomando el mayor
    // entre los tres orígenes posibles de scrollTop, por las dudas de que
    // algún navegador termine scrolleando document.documentElement o
    // document.body en vez de "window".
    const getScrollTop = function () {
        return Math.max(
            window.scrollY || 0,
            (document.documentElement && document.documentElement.scrollTop) || 0,
            (document.body && document.body.scrollTop) || 0
        );
    };

    const getHeaders = function () {
        return document.querySelectorAll(".balance-header.fixed-top");
    };

    let lastScrollTop = getScrollTop();

    // capture:true para engancharnos aunque el scroll ocurra en un
    // contenedor interno en vez de en window (los eventos "scroll" de
    // elementos no burbujean, pero sí se capturan de arriba hacia abajo).
    window.addEventListener("scroll", function () {
        const headers = getHeaders();
        if (!headers.length) {
            return;
        }

        const currentScroll = getScrollTop();

        if (Math.abs(currentScroll - lastScrollTop) <= scrollThreshold) {
            return;
        }

        const headerHeight = headers[0].offsetHeight;

        if (currentScroll > lastScrollTop && currentScroll > headerHeight) {
            headers.forEach((header) => header.classList.add("header-hidden"));
        } else {
            headers.forEach((header) => header.classList.remove("header-hidden"));
        }

        lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
    }, { passive: true, capture: true });

    // Al volver de background (iOS restaura la pestaña desde bfcache sin
    // recargar ni disparar "scroll"), forzamos que la barra vuelva a
    // mostrarse y resincronizamos la posición conocida con la real, para
    // que no quede pegada oculta hasta el próximo scroll hacia abajo.
    const resetHeaderOnResume = function () {
        getHeaders().forEach((header) => header.classList.remove("header-hidden"));
        lastScrollTop = getScrollTop();
    };

    window.addEventListener("pageshow", resetHeaderOnResume);
    document.addEventListener("visibilitychange", function () {
        if (document.visibilityState === "visible") {
            resetHeaderOnResume();
        }
    });
})();
