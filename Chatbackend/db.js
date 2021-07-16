const express = require('express');
const bcrypt = require('bcrypt');

function createRouter(db) {
    const router = express.Router();
    // the routes are defined here
    router.get('/answer', function (req, res, next) {
        db.query(
            'SELECT * FROM answers AS a LEFT JOIN',
            (error, results) => {
                if (error) {
                    console.log(error);
                    res.status(500).json({status: 'error'});
                } else {
                    res.status(200).json(results);
                }
            }
        );
    });
    return router;
}

module.exports = createRouter;
