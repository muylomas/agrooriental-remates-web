(function ($) {
    showSuccessToast = function (msg) {
        'use strict';
        resetToastPosition();
        $.toast({
            heading: 'Éxito',
            text: msg,
            showHideTransition: 'slide',
            icon: 'success',
            loaderBg: '#71c016',
            position: 'top-right'
        })
    };

    showInfoToast = function (title, msg) {
        'use strict';
        resetToastPosition();
        $.toast({
            heading: title,
            text: msg,
            bgColor: '#FFFFFF',
            textColor: '#444444',
            showHideTransition: 'slide',
            loaderBg: '#4d83ff',
            position: 'top-center'
        })
    };

    showWarningToast = function (msg) {
        'use strict';
        resetToastPosition();
        $.toast({
            heading: 'Warning',
            text: msg,
            showHideTransition: 'slide',
            icon: 'warning',
            loaderBg: '#57c7d4',
            position: 'top-right'
        })
    };
    showDangerToast = function (msg) {
        'use strict';
        resetToastPosition();
        $.toast({
            heading: 'Error',
            text: msg,
            showHideTransition: 'slide',
            icon: 'error',
            loaderBg: '#ff4747',
            position: 'top-right'
        })
    };
    showToastInCustomPosition = function (msg) {
        'use strict';
        resetToastPosition();
        $.toast({
            heading: 'Custom positioning',
            text: msg,
            icon: 'info',
            position: {
                left: 120,
                top: 120
            },
            stack: false,
            loaderBg: '#f96868'
        })
    }
    resetToastPosition = function () {
        $('.jq-toast-wrap').removeClass('bottom-left bottom-right top-left top-right mid-center'); // to remove previous position class
        $(".jq-toast-wrap").css({
            "top": "",
            "left": "",
            "bottom": "",
            "right": ""
        });
    }
})(jQuery);