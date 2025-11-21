const cron = require('node-cron');
const common = require('./common');

const request_assignment = require('./request_assignment');

const request_quotation = require('./emails_quotations');
const request_notifications = require('./emails_requests');
const request_logistics = require('./emails_logistics');
const providers_tracking = require('./emails_providers');

const emails_invoice_indiv = require('./emails_invoice_indiv');

const orders_po_sync = require('./orders_po_sync');

const clear_scheduler_list = require('./clear_scheduler_list');

//cron.schedule('*/1 * * * *', function () {
//    const taskId = common.createNewTaskInScheduler("heartbeat", 100);
//    common.insertTaskInScheduler("heartbeat", taskId, 100, "");
//});

cron.schedule('*/5 * * * *', function () {
    const taskId = common.createNewTaskInScheduler("heartbeat-5m", 100);

    /*common.availabilityTaskInScheduler("sendAssignmentNotificationsMA",
        function (availability) {
            if (availability) {
                request_assignment.sendAssignmentNotifications();
            }
        }
    );*/

    common.insertTaskInScheduler("heartbeat-5m", taskId, 100, "");

});

cron.schedule('*/10 * * * *', function () {
    const taskId = common.createNewTaskInScheduler("heartbeat-10m", 100);

    /*common.availabilityTaskInScheduler("ordersPOSyncRunning",
        function (availability) {
            if (availability) {
                orders_po_sync.runprocc();
            }
        }
    );

    common.availabilityTaskInScheduler("logisticsUpdatesEmails",
        function (availability) {
            if (availability) {
                request_logistics.logisticsUpdatesEmails();
            }
        }
    );

    common.availabilityTaskInScheduler("requestsUpdatesEmails",
        function (availability) {
            if (availability) {
                request_notifications.requestsUpdatesEmails();
            }
        }
    );*/

    common.insertTaskInScheduler("heartbeat-10m", taskId, 100, "");
});

cron.schedule('*/30 * * * *', function () {
    const taskId = common.createNewTaskInScheduler("heartbeat-30m", 100);

    /*common.availabilityTaskInScheduler("quotationsEmails",
        function (availability) {
            if (availability) {
                request_quotation.quotationsEmails();
            }
        }
    );

    common.availabilityTaskInScheduler("sendQuotationsEmails",
        function (availability) {
            if (availability) {
                request_quotation.sendQuotation();
            }
        }
    );

    common.availabilityTaskInScheduler("invoiceServiceNotifIndiv",
        function (availability) {
            if (availability) {
                emails_invoice_indiv.invoiceServiceNotifIndiv();
            }
        }
    );*/

    common.insertTaskInScheduler("heartbeat-30m", taskId, 100, "");
});

cron.schedule('0 * * * *', function () {
    const taskId = common.createNewTaskInScheduler("heartbeat-1h", 100);

    common.insertTaskInScheduler("heartbeat-1h", taskId, 100, "");

});


cron.schedule('0 7 * * *', function () {
    var taskId = common.createNewTaskInScheduler("heartbeat-1am", 100);

    clear_scheduler_list.clearSchedulerList(function () {

    });

    common.insertTaskInScheduler("heartbeat-1am", taskId, 100, "");
});

cron.schedule('0 12 * * MON', function () {
    const taskId = common.createNewTaskInScheduler("heartbeat-monday-7am", 100);

    /*common.availabilityTaskInScheduler("providersUpdateEmails",
        function (availability) {
            if (availability) {
                providers_tracking.providersUpdateEmails();
            }
        }
    );*/

    common.insertTaskInScheduler("heartbeat-monday-7am", taskId, 100, "");
});
