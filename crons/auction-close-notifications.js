// Avisos por WhatsApp (Meta Tapa) cuando cierra el remate de un lote:
//   auction.won    al mayor postor
//   auction.closed al vendedor (cattle_complete.customerId), se haya vendido o no
//
// Corre cada 5 minutos (crons/scheduler.js) y revisa los lotes publicados
// (statusId = 5) que cerraron en las últimas 2 horas: auctionEnd ya pasó, o la
// oferta llegó al precio de venta directa (salePrice), que lo cierra en el momento.
// Revisar la misma ventana varias veces no duplica avisos: la idempotencyKey
// lleva el lote y su auctionEnd, y Meta Tapa ignora una clave repetida. Si el
// remate se extiende o se reabre (routes/cattle/update.js), el nuevo cierre
// tiene otra clave y se avisa de nuevo.
//
// auctionEnd está en hora de Uruguay; la base está en UTC (de ahí el - 3 HOUR,
// igual que en el resto del sitio).

const connection = require('../routes/connection_db');
const meta_tapa = require('../helpers/meta-tapa');

const WINDOW_HOURS = 2;

function run() {
    connection.query(
        `
            SELECT
                cattle_complete.lotId AS lotId,
                cattle_complete.subId AS subId,
                DATE_FORMAT(cattle_complete.auctionEnd, '%Y%m%d%H%i') AS auctionEndKey,
                TRIM(CONCAT(
                    COALESCE(cattle_complete.salesagentName, ''), ' ',
                    COALESCE(cattle_complete.salesagentSurname, '')
                )) AS salesagent,
                auctions_bids.price AS price,
                winner.customerId AS winnerId,
                winner.customerName AS winnerName,
                winner.phoneCountryCode AS winnerPhoneCountryCode,
                winner.phoneNumber AS winnerPhoneNumber,
                winnerCustomer.whatsappOptIn AS winnerOptIn,
                seller.customerId AS sellerId,
                seller.customerName AS sellerName,
                seller.phoneCountryCode AS sellerPhoneCountryCode,
                seller.phoneNumber AS sellerPhoneNumber,
                sellerCustomer.whatsappOptIn AS sellerOptIn
            FROM cattle_complete
            LEFT JOIN auctions_bids_max ON auctions_bids_max.lotId = cattle_complete.lotId
            LEFT JOIN auctions_bids ON
                auctions_bids.id = auctions_bids_max.auctionBidId AND
                auctions_bids.lotId = cattle_complete.lotId
            LEFT JOIN customers_complete AS winner ON winner.customerId = auctions_bids.customerId
            LEFT JOIN customers AS winnerCustomer ON winnerCustomer.id = auctions_bids.customerId
            LEFT JOIN customers_complete AS seller ON seller.customerId = cattle_complete.customerId
            LEFT JOIN customers AS sellerCustomer ON sellerCustomer.id = cattle_complete.customerId
            WHERE
                cattle_complete.statusId = 5 AND
                cattle_complete.auctionEnd > NOW() - INTERVAL 3 HOUR - INTERVAL ? HOUR AND
                (
                    cattle_complete.auctionEnd <= NOW() - INTERVAL 3 HOUR OR
                    (cattle_complete.salePrice > 0 AND auctions_bids.price >= cattle_complete.salePrice)
                )
        `,
        [
            WINDOW_HOURS,
        ],
        function (err, results) {
            if (err) {
                console.log('auction-close-notifications:', err);
                return;
            }

            results.forEach(function (lot) {
                const lotNumber = String(lot.subId || lot.lotId);
                const sold = lot.price != null && !!lot.winnerId;

                const winnerPhone = meta_tapa.telefonoE164(lot.winnerPhoneCountryCode, lot.winnerPhoneNumber);
                if (sold && lot.winnerOptIn == 1 && winnerPhone) {
                    meta_tapa.enviarEvento(
                        "auction.won",
                        "lote-" + lot.lotId + "-adjudicado-" + lot.auctionEndKey,
                        { telefono: winnerPhone, nombre: lot.winnerName || "", idExterno: String(lot.winnerId) },
                        {
                            idLote: String(lot.lotId),
                            lote: lotNumber,
                            monto: Number(lot.price),
                            contacto: lot.salesagent || "Agro Oriental",
                        }
                    );
                }

                const sellerPhone = meta_tapa.telefonoE164(lot.sellerPhoneCountryCode, lot.sellerPhoneNumber);
                if (lot.sellerId && lot.sellerOptIn == 1 && sellerPhone) {
                    const datos = { idLote: String(lot.lotId), lote: lotNumber, vendido: sold };
                    if (sold) datos.monto = Number(lot.price);
                    meta_tapa.enviarEvento(
                        "auction.closed",
                        "lote-" + lot.lotId + "-cerrado-" + lot.auctionEndKey,
                        { telefono: sellerPhone, nombre: lot.sellerName || "", idExterno: String(lot.sellerId) },
                        datos
                    );
                }
            });
        }
    );
}

module.exports = { run };
