const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const request = require('sync-request');
const webSocket = require('ws');

const mysql_config = {
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT,
    user: process.env.ACCESSKEY,
    password: process.env.SECRETKEY,
    database: 'app_' + process.env.APPNAME
}

const app = express();
const server = http.createServer(app);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var connection;
function handleDisconnection() {
    connection = mysql.createConnection(mysql_config);
    connection.connect(function (err) {
        if (err) {
            setTimeout(handleDisconnection, 2000);
        }
    });

    connection.on('error', function (err) {
        if (err.code === 'PROTOCOL_CONNECTION_LOST' || err.code === 'PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR') {
            handleDisconnection();
        } else {
            throw err;
        }
    });
}

handleDisconnection();

const wss = new webSocket.Server({ server });
var clients = [];
var teacherWs = null;
var successor = [];
var latitude = null;
var longitude = null;
var course_id = null;

wss.on('connection', function connection(ws) {
    clients.push(ws);

    // 断开连接
    ws.on('close', function close() {
        if (teacherWs && ws === teacherWs) {
            teacherWs = null;
            course_id = null;
            latitude = null;
            longitude = null;
            successor = [];
        }
        clients = clients.filter(function (item) {
            return item !== ws;
        })
    });

    // 接收消息
    ws.on('message', function message(message) {
        message = JSON.parse(message);
        if (message.role === 'teacher' && message.course_id) {
            teacherWs = ws;
            course_id = message.course_id;
            latitude = message.latitude;
            longitude = message.longitude;
            ws.send('ok');
        } else if (message.role === 'student') {
            if (!course_id || message.course_id !== course_id) {
                ws.send('no');
                return;
            }
            var bHasSigned = successor.filter(function (item) {
                return item === message.user_id;
            }).length === 0 ? false : true;
            if (bHasSigned) {
                ws.send('duplicate');
                return;
            }
            // 判断经纬度是否在有限距离内 如果在则推送给老师
            if (teacherWs) {
                teacherWs.send(JSON.stringify({
                    user_id: message.user_id,
                    user_name: message.user_name
                }))
                ws.send("ok");
                successor.push(message.user_id);
            }
        } else {
            ws.send('invalid data');
        }
    });
});

var jscode = null;
var openid = null;

function getWechatId(jscode) {
    const appid = 'wx32879baf70eb1e28';
    const secret = '8216b172029a406b3e0becc346487ceb';
    const url = 'https://api.weixin.qq.com/sns/jscode2session?appid=' + appid + '&secret=' + secret + '&js_code=' + jscode + '&grant_type=authorization_code';
    var res = request('GET', url);
    return JSON.parse(res.getBody()).openid;
}

app.post('/login', (req, res) => {
    if (!req.body.jscode) {
        res.status(400);
        res.send('invalid data');
        return;
    }
    let wechat_id = getWechatId(req.body.jscode);
    jscode = req.body.jscode;
    openid = wechat_id;
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
    let wechat_id = null;
    if (req.body.jscode === jscode) {
        wechat_id = openid;
    } else {
        jscode = req.body.jscode;
        wechat_id = getWechatId(req.body.jscode);
        openid = wechat_id;
    }
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
            sql = "UPDATE `user` SET `wechat_id`= '" + wechat_id + "' WHERE `user_id` = '" + req.body.user_id + "'";
            connection.query(sql, function (error) {
                if (error) {
                    res.status(500);
                    res.send(error);
                } else {
                    sql = "SELECT * FROM `user` WHERE `user_id` = '" + req.body.user_id + "'";
                    connection.query(sql, function (error, result) {
                        if (error) {
                            res.send('failed to load user info');
                        } else {
                            res.send({
                                user_id: result[0].user_id,
                                user_name: result[0].user_name,
                                role: result[0].role
                            });
                        }
                    })
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

server.listen(process.env.PORT || 5050);
