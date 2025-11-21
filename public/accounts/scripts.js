function openTransaction(transId) {
    window.location.href = "/cuentas/transaccion/" + transId;
};

function errorDialog() {
    swal({
        title: "ERROR",
        text: "No se pudo solicitar el adelanto. Inténtalo más tarde.",
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
};

function successialog() {
    swal({
        title: "Procesando Adelanto",
        text: "El pedido de adelanto fue recibido y será analizado por nuestro departamento de riesgo. Te estaremos contactando a la brevedad.",
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

function checkPaymentInAdvanceAmount() {
    const pInAMin = parseInt($("[name='paymentInAdvanceAmount']").attr("min"));
    const pInAMax = parseInt($("[name='paymentInAdvanceAmount']").attr("max"));
    let amountInAdvance = parseInt($("[name='paymentInAdvanceAmount']").val());

    let amountOk = true;
    if (pInAMin > amountInAdvance) {
        $("[name='paymentInAdvanceAmount']").val(pInAMin);
        amountOk = false;
    }
    if (pInAMax < amountInAdvance) {
        $("[name='paymentInAdvanceAmount']").val(pInAMax);
        amountOk = false;
    }

    if (!amountOk) {
        const swalWrapper = document.createElement('div');
        swalWrapper.innerHTML =
            `
                <h3 class="mb-3">Error en monto de anticipo</h3>
                <p class="text-left"> 
                    El monto de anticipo solicitado se encuentra fuera del rango permitido:
                </p> 
                <h4>
                    Rando permitido de adelanto: <small class='mr-2'>USD</small>` + pInAMin + ` a <small class='mr-2'>USD</small>` + pInAMax + `
                </h5>
                <p class="text-left">
                    Vuelve a intentarlo, eligiendo un monto dentro del rango anteriormente mencionado.
                </p>
            `;

        swal({
            content: swalWrapper,
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

    return amountOk;
};

function requestPaymentInAdvance() {
    if (checkPaymentInAdvanceAmount()) {
        $.post(
            "/api/accounts/request/advance",
            {
                lotId: parseInt($("[name='paymentInAdvanceLotId']").val()),
                amount: parseInt($("[name='paymentInAdvanceAmount']").val()),
            },
            function (results) {
                let problemsInRequest = true;
                let paymentInAdvanceId = 0;
                let paymentsInAdvanceAmount = 0;
                if ("error" in results) {
                    if (!results.error && results.paymentInAdvanceId) {
                        problemsInRequest = false;
                        paymentInAdvanceId = results.paymentInAdvanceId;
                        paymentsInAdvanceAmount = results.paymentsInAdvanceAmount;
                    }
                }

                if (problemsInRequest) {
                    errorDialog();
                }
                else {
                    $("#paymentInAdvanceSection").removeClass("text-left");
                    $("#paymentInAdvanceSection").addClass("text-center");
                    $("#paymentInAdvanceSection").addClass("bg-warning");
                    $("#paymentInAdvanceSection").html(
                        `
                            <p class="m-0 p-2 w-100">
                                Adelanto #` + paymentInAdvanceId + ` por</br>
                                <b>USD ` + paymentsInAdvanceAmount + `</b></br>
                                en proceso
                            </p>
                        `
                    );
                    successialog();
                }
            }
        );
    }
}