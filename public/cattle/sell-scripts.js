function deleteSavedLotData(elementObj, lotId) {
    $(elementObj).prop('disabled', true);
    $.post(
        "/api/cattle/lot/saved/delete",
        {
            lotId: lotId,
        },
        function (results) {
            if ("error" in results) {
                if (!results.error) {
                    $("#saved-lot-" + lotId).remove();
                }
            }
            $(elementObj).prop('disabled', false);
        }
    );
}

function openSavedLot(lotId) {
    window.location.href = "/ganado/lote/nuevo/s/" + lotId;
};