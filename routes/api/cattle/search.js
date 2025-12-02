const common_auth = require('../../common_auth');
const cattle_home = require('../../cattle/home');
const auctions_lots = require('../../auctions/lots');

function Common() { }

Common.prototype.forMap = function (sessionID, params, callback) {
    common_auth.basic(sessionID, function (reply) {
        if (reply.err) {
            callback([]);
        }
        else {
            cattle_home.getLotsForMap(
                reply.user.id,
                params,
                function (returnLots) {
                    callback(returnLots);
                }
            );
        }
    });
};

Common.prototype.auctionBidsByLotId = function (sessionID, lotId, callback) {
    let auctionBids = [];

    common_auth.basic(sessionID, function (reply) {
        if (reply.err) {
            callback({
                error: true,
                auctionBids: [],
                lotId: lotId,
                msg: "1.1",
            });
        }
        else {
            auctions_lots.getAuctionsByLotId(
                lotId,
                function (returnauctionBids) {
                    callback({
                        error: false,
                        auctionBids: returnauctionBids,
                        lotId: lotId,
                    });
                }
            );
        }
    });
};

module.exports = new Common();