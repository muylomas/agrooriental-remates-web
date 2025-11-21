function Common() { }

var connection = require('../routes/connection_db');
var common = require('./common');

Common.prototype.runprocc = function () {
    var taskId = common.createNewTaskInScheduler("ordersPOSyncRunning", 0);

    connection.query(
        `
            UPDATE orders_items 
            INNER JOIN po_items ON 
                po_items.mercadoOrderId = orders_items.mercadoId AND 
                po_items.mercadoOrderLine= orders_items.mercadoLine
            SET
                orders_items.status = po_items.status
            WHERE po_items.status >= 100 AND po_items.status != 5000
        `,
        function (err, results) {
            if (err) {
                console.log(err);
                common.insertTaskInScheduler("ordersPOSyncRunning", taskId, 0, "");
            }
            else {
                connection.query(
                    `
                        UPDATE po_items  
                        INNER JOIN orders_items ON 
                            po_items.mercadoOrderId = orders_items.mercadoId AND 
                            po_items.mercadoOrderLine= orders_items.mercadoLine
                        SET
                            po_items.status = orders_items.status
                        WHERE 
                            orders_items.status >= 100 AND orders_items.status < 10000 AND 
                            po_items.status != 5000 AND orders_items.status != 5000 
                    `,
                    function (err, results) {
                        if (err) {
                            console.log(err);
                            common.insertTaskInScheduler("ordersPOSyncRunning", taskId, 0, "");
                        }
                        else {
                            connection.query(
                                `
                                    UPDATE po_items SET
                                        po_items.status = 150
                                    WHERE 
                                        po_items.status NOT IN (40,45,200) AND 
                                        po_items.status < 100 AND 
                                        po_items.quantity = 0 
                                `,
                                function (err, results) {
                                    if (err) {
                                        console.log(err);
                                        common.insertTaskInScheduler("ordersPOSyncRunning", taskId, 0, "");
                                    }
                                    else {

                                        common.insertTaskInScheduler("ordersPOSyncRunning", taskId, 100, "");
                                    }
                                });
                        }
                    });
            }
        });
};

module.exports = new Common();