const connection = require('../connection_db');
const common_auth = require('../common_auth');
const common_accounts = require('./common');
const common_customers = require('../customers/common');

function getTransactions(customer, callback) {
    let transactions = [];
    customer.socsFarmsFilter = common_accounts.socsFarmsFilter(customer);

    let socsFarmsFilterQueryString = [
        " auctions_bids.customerId = ? ",
        " cattle_complete.customerId = ? ",
    ];
    if (customer.socsFarmsFilter.societiesQueryVals.length) {
        socsFarmsFilterQueryString.push(
            " societies_complete.societyId IN (" + customer.socsFarmsFilter.societiesQueryString.join() + ") "
        );
    }
    if (customer.socsFarmsFilter.framsQueryVals.length) {
        socsFarmsFilterQueryString.push(
            " cattle_complete.farmId IN (" + customer.socsFarmsFilter.framsQueryString.join() + ") "
        );
    }

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
                    IF(
                        cattle_complete.auctionPriceType = 1,
                        cattle_totals.quantity * cattle_complete.meanWeight * auctions_bids.price,
                        cattle_totals.quantity * auctions_bids.price
                    )
                ) AS total,
                IF (
                    cattle_complete.saleDate IS NULL,
                    "--/--/----",
                    DATE_FORMAT(
                        cattle_complete.saleDate,
                        '%d/%m/%Y'
                    ) 
                    ) AS saleDateFormated,
                currencies.name AS currencyName,
                IF( 
                    payments_in_advance.id IS NOT NULL,
                    payments_in_advance.id,
                    FALSE
                ) AS paymentsInAdvanceId,
                payments_in_advance.amount AS paymentsInAdvanceAmount,
                auctions_bids.price AS lastPriceAuction
            FROM cattle_complete
            LEFT JOIN currencies ON currencies.id = cattle_complete.currencyId
            LEFT JOIN cattle_totals ON cattle_totals.lotId = cattle_complete.lotId
            LEFT JOIN auctions_bids_max ON auctions_bids_max.lotId = cattle_complete.lotId
            LEFT JOIN auctions_bids ON auctions_bids.id = auctions_bids_max.auctionBidId AND auctions_bids.lotId = cattle_complete.lotId
            LEFT JOIN clients_farms ON clients_farms.farmId = cattle_complete.farmId AND clients_farms.status = 1
            LEFT JOIN clients_societies ON clients_societies.clientId = clients_farms.clientId AND clients_societies.status = 1
            LEFT JOIN societies_complete ON societies_complete.societyId = clients_societies.societyId
            LEFT JOIN payments_in_advance ON payments_in_advance.lotId = cattle_complete.lotId
            WHERE
                ` + socsFarmsFilterQueryString.join(" OR ") + `
            GROUP BY cattle_complete.lotId
            ORDER BY CONCAT(cattle_complete.lotId) DESC
        `,
        [
            customer.customerId,
            customer.customerId,
        ].concat(customer.socsFarmsFilter.societiesQueryVals)
            .concat(customer.socsFarmsFilter.framsQueryVals),
        function (err, results) {
            if (err) {
                console.log(err);
            }
            else if (results.length) {
                for (let index in results) {
                    if (
                        results[index].statusKey == "approved" &&
                        results[index].lastPriceAuction && results[index].customerId &&
                        !results[index].active
                    ) {
                        results[index].statusName = "Vendido";
                        results[index].statusKey = "sold";
                    }

                    if (results[index].statusKey == "sold") {
                        if (
                            customer.socsFarmsFilter.framsQueryVals.includes(results[index].farmId) ||
                            results[index].customerId == customer.customerId
                        ) {
                            results[index].transactionKey = "sales";
                        }
                        else {
                            results[index].transactionKey = "purchases";
                            results[index].paymentsInAdvanceId = false;
                        }

                        transactions.push(results[index]);
                    }
                }
            }

            callback(
                transactions
            );
        }
    );
};

function Common() { }

Common.prototype.getViewParams = function (sessionID, callback) {
    common_auth.basic(sessionID, function (reply) {
        if (reply.err) {
            callback(
                '/login',
                {},
                "redirect",
            );
        }
        else {
            common_customers.getCustomerById(
                reply.user.id,
                function (returnCustomer) {
                    getTransactions(
                        returnCustomer,
                        function (returntransactions) {
                            callback(
                                'accounts/balance-and-transactions',
                                {
                                    transactions: returntransactions,
                                    customer: returnCustomer,
                                    accountTabs: common_accounts.accountTabs(),
                                },
                                "render",
                            );
                        }
                    );
                }
            );
        }
    });
};

module.exports = new Common();