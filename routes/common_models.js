function Common() { }

Common.prototype.currencies = function () {
    return [
        "USD",
        "EUR",
        "UYU",
        "ARS",
    ];
};

module.exports = new Common();