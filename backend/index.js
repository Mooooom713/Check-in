const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const bindRouter = require('./routes/bind');

app.use('/bind', bindRouter);

app.listen(process.env.PORT || 5050);
