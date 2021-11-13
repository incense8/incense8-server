const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
const cookie_parser = require('cookie-parser');
const api = require('./routes');

const app = express();

require('dotenv').config();
app.use(cors());

const { isAuthenticated } = require('./middlewares');

require('./services/passport');

app.use(morgan('dev'));
app.use(cookie_parser());

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(helmet());

mongoose
	.connect(process.env.DB)
	.then(() => {
		console.log('successful connected to mongoose deb');
	})
	.catch((err) => console.log(err));

app.use('/api/vi', api);
app.get('/', (req, res) => {
	Message: 'hello';
});

app.get(isAuthenticated);

module.exports = app;
