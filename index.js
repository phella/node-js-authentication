const express = require('express');
const chalk = require('chalk');
const Mongoose = require('mongoose');
const debug = require('debug')('app');
const morgan = require('morgan');
const flash = require('express-flash');
const session = require('express-session');
const bodyParser = require("body-parser");
require('dotenv').config();
const passport = require('passport');
const initializePassport=require('./passport-conf');
initializePassport(passport);
const app = express();
app.use(session({
	secret : process.env.secret,
	resave : false , 
	saveUninitialized : false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

const port = process.env.PORT || 3000;
app.use(require('./endpoints'));
app.use(morgan('tiny'));
app.use(flash());



Mongoose.connect('mongodb://localhost:27017/market',{useNewUrlParser:true , useUnifiedTopology: true },
	debug("Connected to database")
);
Mongoose.set('useCreateIndex', true);
app.listen(port, () => {
  debug(`Listenning on port ${chalk.green(port)}`);
});