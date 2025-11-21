const connection = require('../connection_db');
const common_auth = require('../common_auth');
const common_customers = require('../customers/common');

function getTransactions(customer, callback) {
    let transactions = [];

    let societiesQueryString = [];
    let societiesQueryVals = [];
    for (let societyItem in customer.societies) {
        if (!societiesQueryVals.includes(customer.societies[societyItem].id)) {
            societiesQueryVals.push(customer.societies[societyItem].id);
            societiesQueryString.push("?");
        }
    }

    let framsQueryString = [];
    let framsQueryVals = [];
    for (let farmItem in customer.farms) {
        if (!framsQueryVals.includes(customer.farms[farmItem].id)) {
            framsQueryVals.push(customer.farms[farmItem].id);
            framsQueryString.push("?");
        }
    }

    if (framsQueryVals.length && societiesQueryVals.length) {
        connection.query(
            `
                SELECT 
                    cattle_complete.*,
                    cattle_totals.quantity AS totalQuantity,
                    cattle_totals.females AS females,
                    IF (
                        auctions_bids.id IS NULL,
                        "--/--/----",
                        DATE_FORMAT(
                            auctions_bids.created_at,
                            '%d/%m/%Y'
                        ) 
                    ) AS totalDate,
                    IF (
                        auctions_bids.id IS NULL,
                        0,
                        cattle_totals.quantity * auctions_bids.price
                    ) AS total,
                    IF (
                        cattle_complete.saleDate IS NULL,
                        "--/--/----",
                        DATE_FORMAT(
                            cattle_complete.saleDate,
                            '%d/%m/%Y'
                        ) 
                     ) AS saleDateFormated
                FROM cattle_complete
                LEFT JOIN cattle_totals ON cattle_totals.lotId = cattle_complete.lotId
                LEFT JOIN auctions_bids_max ON auctions_bids_max.lotId = cattle_complete.lotId
                LEFT JOIN auctions_bids ON auctions_bids.id = auctions_bids_max.auctionBidId
                LEFT JOIN clients_farms ON clients_farms.farmId = cattle_complete.farmId AND clients_farms.status = 1
                LEFT JOIN clients_societies ON clients_societies.clientId = clients_farms.clientId AND clients_societies.status = 1
                LEFT JOIN societies_complete ON societies_complete.societyId = clients_societies.societyId
                WHERE
                    cattle_complete.farmId IN (` + framsQueryString.join() + `) OR
                    societies_complete.societyId IN (` + societiesQueryString.join() + `)
                ORDER BY CONCAT(cattle_complete.lotId) DESC
            `,
            framsQueryVals
                .concat(societiesQueryVals),
            function (err, results) {
                if (err) {
                    console.log(err);
                }
                else if (results.length) {
                    for (let index in results) {
                        if (framsQueryVals.includes(results[index].farmId)) {
                            results[index].tabKey = "sales";
                        }
                        else {
                            results[index].tabKey = "purchases";
                        }

                        transactions.push(results[index]);
                    }
                }

                callback(
                    transactions
                );
            }
        );
    }
    else {
        connection.query(
            `
                SELECT 
                    cattle_complete.*,
                    cattle_totals.quantity AS totalQuantity,
                    cattle_totals.females AS females,
                    IF (
                        auctions_bids.id IS NULL,
                        "--/--/----",
                        DATE_FORMAT(
                            auctions_bids.created_at,
                            '%d/%m/%Y'
                        ) 
                    ) AS totalDate,
                    IF (
                        auctions_bids.id IS NULL,
                        0,
                        cattle_totals.quantity * auctions_bids.price
                    ) AS total
                FROM cattle_complete
                LEFT JOIN cattle_totals ON cattle_totals.lotId = cattle_complete.lotId
                LEFT JOIN auctions_bids_max ON auctions_bids_max.lotId = cattle_complete.lotId
                LEFT JOIN auctions_bids ON auctions_bids.id = auctions_bids_max.auctionBidId
                WHERE
                    auctions_bids.customerId = ? OR
                    cattle_complete.customerId = ?
                ORDER BY CONCAT(cattle_complete.lotId) DESC
            `,
            [
                customer.customerId,
                customer.customerId,
            ],
            function (err, results) {
                if (err) {
                    console.log(err);
                }
                else if (results.length) {
                    for (let index in results) {
                        if (results[index].customerId == customer.customerId) {
                            results[index].tabKey = "sales";
                        }
                        else {
                            results[index].tabKey = "purchases";
                        }

                        transactions.push(results[index]);
                    }
                }

                console.log(transactions);

                callback(
                    transactions
                );
            }
        );
    }
};

function Common() { }

Common.prototype.accountTabs = function (customer) {
    return [
        {
            key: 'sales',
            name: "Ventas",
            nameAction: "Venta",
            active: true,
            empty: "No hay ventas para mostrar"
        }, {
            key: 'purchases',
            name: "Compras",
            nameAction: "Compra",
            active: false,
            empty: "No hay compras para mostrar"
        }, {
            key: 'advances',
            name: "Adelantos",
            nameAction: "Adelanto",
            active: false,
            empty: "No hay adelantos para mostrar"
        },
    ];
};

Common.prototype.socsFarmsFilter = function (customer) {
    let socsFarmsFilter = {
        societiesQueryString: [],
        societiesQueryVals: [],
        framsQueryString: [],
        framsQueryVals: [],
    };

    for (let societyItem in customer.societies) {
        if (!socsFarmsFilter.societiesQueryVals.includes(customer.societies[societyItem].id)) {
            socsFarmsFilter.societiesQueryVals.push(customer.societies[societyItem].id);
            socsFarmsFilter.societiesQueryString.push("?");
        }
    }

    for (let farmItem in customer.farms) {
        if (!socsFarmsFilter.framsQueryVals.includes(customer.farms[farmItem].id)) {
            socsFarmsFilter.framsQueryVals.push(customer.farms[farmItem].id);
            socsFarmsFilter.framsQueryString.push("?");
        }
    }

    return socsFarmsFilter;
};

module.exports = new Common();