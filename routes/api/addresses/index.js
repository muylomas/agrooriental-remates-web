const express = require('express');
const router = express.Router();
const addresses = require('../../addresses');

router.get('/states/:countryId', function (req, res, next) {
    addresses.getStates(
        req.params.countryId,
        function (countryStates) {
            __auxStates = countryStates;
            res.json({
                error: 0,
                states: __auxStates,
            });
        }
    );
});

router.get('/locations/:stateId', function (req, res, next) {
    addresses.getLocations(
        req.params.stateId,
        function (countryLocations) {
            res.json({
                error: 0,
                locations: countryLocations,
            });
        }
    );
});

module.exports = router;