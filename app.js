var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require("body-parser");
var logger = require('morgan');
const validateToken = require('./middlewares/validateToken');
const { connect, } = require('./utils/dbConnect');

//mongo connect
connect()
//routers
var usersRouter = require('./routes/users');
var registerRouter = require('./routes/register');
var loginRouter = require('./routes/login');
//middleware
var app = express();
//fixme SET NODE_ENV=dev && nodemon
/*if(config.util.getEnv('NODE_ENV') !== 'test') {
    app.use(logger('combined'));
}*/
// Construct a schema, using GraphQL schema language
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
//routes
app.use('/api/users', usersRouter);
app.use("/api/register", registerRouter);
app.use("/api/login", loginRouter);
app.get('/checkToken', validateToken, function(req, res) {
  res.sendStatus(200);
})

module.exports = app;
