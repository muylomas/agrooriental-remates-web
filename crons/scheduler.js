const cron = require('node-cron');
const common = require('./common');

const clear_scheduler_list = require('./clear_scheduler_list');
const auction_close_notifications = require('./auction-close-notifications');

// Avisos por WhatsApp de remates cerrados (adjudicado / cierre al vendedor).
cron.schedule('*/5 * * * *', function () {
    auction_close_notifications.run();
});

cron.schedule('*/5 * * * *', function () {
    const taskId = common.createNewTaskInScheduler("heartbeat-5m", 100);
    common.insertTaskInScheduler("heartbeat-5m", taskId, 100, "");
});

cron.schedule('*/10 * * * *', function () {
    const taskId = common.createNewTaskInScheduler("heartbeat-10m", 100);
    common.insertTaskInScheduler("heartbeat-10m", taskId, 100, "");
});

cron.schedule('*/30 * * * *', function () {
    const taskId = common.createNewTaskInScheduler("heartbeat-30m", 100);
    common.insertTaskInScheduler("heartbeat-30m", taskId, 100, "");
});

cron.schedule('0 * * * *', function () {
    const taskId = common.createNewTaskInScheduler("heartbeat-1h", 100);
    common.insertTaskInScheduler("heartbeat-1h", taskId, 100, "");
});

cron.schedule('0 7 * * *', function () {
    const taskId = common.createNewTaskInScheduler("heartbeat-1am", 100);

    clear_scheduler_list.clearSchedulerList(function () {

    });

    common.insertTaskInScheduler("heartbeat-1am", taskId, 100, "");
});

cron.schedule('0 12 * * MON', function () {
    const taskId = common.createNewTaskInScheduler("heartbeat-monday-7am", 100);
    common.insertTaskInScheduler("heartbeat-monday-7am", taskId, 100, "");
});
