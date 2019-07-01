const express = require('express');
const bodyParser = require('body-parser');
const connection = require('./database');
const request = require('request');
const webSocket = require('ws');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const wss = new webSocket.Server({
    port: 5050
});
var clients = [];
var teacherWs = null;

wss.on('connection', function connection(ws) {
    clients.push(ws);
    // 断开连接
    ws.on('close', function close() {
        if (teacherWs && ws === teacherWs) {
            teacherWs = null;
        }
        clients = clients.filter(function (item) {
            return item !== ws;
        })
    });

    // 接收消息
    ws.on('message', function message(message) {
        if (message === 'teacher') {
            teacherWs = ws;
        }
    });
});

function getWechatId(jscode) {
    const appid = 'wx32879baf70eb1e28';
    const secret = '8216b172029a406b3e0becc346487ceb';
    let wechat_id = null;
    request('https://api.weixin.qq.com/sns/jscode2session?appid=' + appid + '&secret=' + secret + '&js_code=' + jscode + '&grant_type=authorization_code', function (error, response, body) {
        if (!error && response.statusCode === 200) {
            wechat_id = body.openid;
        }
    })
    return wechat_id;
}

app.post('/login', (req, res) => {
    if (!req.body.jscode) {
        res.status(400);
        res.send('invalid data');
        return;
    }
    let wechat_id = getWechatId(req.body.jscode);
    let sql = "SELECT * FROM `user` WHERE `wechat_id` = '" + wechat_id + "'";
    connection.query(sql, function (error, result) {
        if (error) {
            res.status(500);
            res.send(error);
        } else if (result.length === 0) {
            res.status(404);
            res.send('not binded');
        } else {
            res.send({
                user_id: result[0].user_id,
                user_name: result[0].user_name,
                role: result[0].role
            });
        }
    })
})

app.post('/bind', (req, res) => {
    if (!req.body.user_id || !req.body.jscode || !req.body.role) {
        res.status(400);
        res.send('invalid data');
        return;
    }
    let wechat_id = getWechatId(req.body.jscode);
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
            connection.query(sql, function (error, result) {
                if (error) {
                    res.status(500);
                    res.send(error);
                } else {
                    res.send({
                        user_id: result[0].user_id,
                        user_name: result[0].user_name,
                        role: result[0].role
                    });
                }
            })
        } else {
            res.status(400);
            res.send('already binded');
        }
    })
})

app.get('/myCourse', (req, res) => {
    if (!req.query.user_id || (req.query.role !== 'teacher' && req.query.role !== 'student')) {
        res.status(400);
        res.send('invalid data');
        return;
    }
    if (req.query.role === 'teacher') {
        let sql = "SELECT * FROM `course` WHERE `teacher_id` = '" + req.query.user_id + "'";
        connection.query(sql, function (error, result) {
            if (error) {
                res.status(500);
                res.send(error);
            } else {
                res.send(result);
            }
        })
    } else if (req.query.role === 'student') {
        let sql = "SELECT * FROM `courseSelect` WHERE `student_id` = '" + req.query.user_id + "'";
        connection.query(sql, function (error, result) {
            if (error) {
                res.status(500);
                res.send(error);
            } else if (result.length === 0) {
                res.status(404);
                res.send('no student\'s user_id = ' + req.query.user_id);
            } else {
                sql = "SELECT * FROM `course` WHERE `course_id` = '" + result[0].course_id + "'";
                connection.query(sql, function (error, result) {
                    if (error) {
                        res.status(500);
                        res.send(error);
                    } else {
                        res.send(result);
                    }
                })
            }
        })
    }
})

app.listen(process.env.PORT || 5050);
