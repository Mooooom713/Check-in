const express = require('express');
const bodyParser = require('body-parser');
const connection = require('../database');
const request = require('request');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post('/', (req, res) => {
    if (!req.body.user_id || !req.body.jscode || !req.body.role) {
        res.status(400);
        res.send('invalid data');
        return;
    }
    const appid = 'wx32879baf70eb1e28';
    const secret = '8216b172029a406b3e0becc346487ceb';
    let wechat_id = null;
    request('https://api.weixin.qq.com/sns/jscode2session?appid=' + appid + '&secret=' + secret + '&js_code=' + req.body.jscode + '&grant_type=authorization_code', function (error, response, body) {
        if (!error && response.statusCode === 200) {
            wechat_id = body.openid;
        }
    })
    if (!wechat_id) {
        res.status(500);
        res.send('failed');
        return;
    }
    let sql = "SELECT * FROM `user` WHERE `user_id` = '" + req.body.user_id + "' AND `role` = '" + req.body.role + "'";
    connection.query(sql, function (error, result) {
        if (error) {
            res.status(500);
            res.send(error);
        } else if (result.length === 0) {
            res.status(404);
            res.send('no ' + req.body.role + '\'s user_id = ' + req.body.user_id);
        } else if (result[0].wechat_id === "") {
            sql = "UPDATE `user` SET `wechat_id `= '" + wechat_id + "' WHERE `user_id` = '" + req.body.user_id + "'";
            connection.query(sql, function (error) {
                if (error) {
                    res.status(500);
                    res.send(error);
                } else {
                    res.send('bind successfully');
                }
            })
        } else if (result[0].wechat_id === wechat_id) {
            res.send('login successfully');
        } else {
            res.status(400);
            res.send('already binded');
        }
    })
})

app.listen(process.env.PORT || 5050);
