function generalTimer(lotId) {
    if (lotId == 64) {
        console.log("=================================== generalTimer 64 ===================================");
    }
    const seconds = (endDates[lotId] - Date.now()) / 1000;
    var days = Math.floor(seconds / 24 / 60 / 60);
    var hoursLeft = Math.floor((seconds) - (days * 86400));
    var hours = Math.floor(hoursLeft / 3600);
    var minutesLeft = Math.floor((hoursLeft) - (hours * 3600));
    var minutes = Math.floor(minutesLeft / 60);
    var remainingSeconds = seconds % 60;
    function pad(n) {
        const newN = Math.floor(n);
        return (newN < 10 ? "0" + newN : newN);
    }

    let daysNumber = parseInt(pad(days));

    if (daysNumber > 0) {
        $('#countdown-days-' + lotId).html(daysNumber + "<small>d</small>");
    }
    else {
        $('#countdown-days-' + lotId).parent().parent().remove()
    }

    $('#countdown-hours-' + lotId).html(pad(hours));
    $('#countdown-mins-' + lotId).html(pad(minutes));
    $('#countdown-secs-' + lotId).html(pad(remainingSeconds));

    if (seconds <= 0) {

        if (lotId == 64) {
            console.log("seconds <= 0");
        }
        clearInterval(countdownTimers[lotId]);
        /*$('#countdown-days-' + lotId).html("-");
        $('#countdown-hours-' + lotId).html("--");
        $('#countdown-mins-' + lotId).html("--");
        $('#countdown-secs-' + lotId).html("--");
        $('#countdown-container-' + lotId).remove();*/

        /*$('#countdown-days-' + lotId).remove();
        $('#countdown-hours-' + lotId).remove();
        $('#countdown-mins-' + lotId).remove();
        $('#countdown-secs-' + lotId).remove();*/
        $('#countdown-auction-ended-' + lotId).removeClass("d-none");
    }
};