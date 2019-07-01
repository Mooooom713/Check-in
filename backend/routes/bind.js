const express = require('express');
const router = express.Router();
const connection = require('../database');

router.post('/', (req, res) => {
    if (!req.body.user_id || !req.body.wechat_id) {
        res.status(400);
        res.send('invalid data');
        return;
    }
    let sql = "SELECT * FROM `user` WHERE `user_id` = '" + req.body.user_id + "'";
    connection.query(sql, function (error, result) {
        if (error) {
            res.status(500);
            res.send(error);
        } else if (result.length === 0) {
            res.status(404);
            res.send('user_id not exist');
        } else if (result[0].wechat_id === "") {
            sql = "UPDATE `user` SET `wechat_id `= '" + req.body.wechat_id + "' WHERE `user_id` = '" + req.body.user_id + "'";
            connection.query(sql, function (error) {
                if (error) {
                    res.status(500);
                    res.send(error);
                } else {
                    res.send('bind successfully');
                }
            })
        } else {
            res.status(400);
            res.send('already binded');
        }
    })
})

module.exports = router;