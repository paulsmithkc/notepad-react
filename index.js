const debug = require('debug')('app:server');
const config = require('config');
const express = require('express');
const helmet = require('helmet');
const path = require('path');
const db = require('./db');

// open a connection to the database
db.connect();

// inject joi-objectid
const joi = require('@hapi/joi');
joi.objectId = require('joi-objectid')(joi);

// create express app
const app = express();

// middleware
app.use(helmet());
app.use(express.urlencoded({ extended: false }));

// routes
app.get('/', (request, response) => {
  response.sendFile(path.join(__dirname, 'public/index.html'));
});
app.use('/api/note', require('./api/note'));
app.use('/dist', express.static('dist'));
app.use(express.static('public'));
app.use((request, response) => {
  response.status(404).type('text/plain').send('Page Not Found');
});
app.use(require('./middleware/error'));

// bind the server to an http port
const hostname = config.get('http.hostname');
const port = config.get('http.port');
app.listen(port, () => {
  debug(`Server running at http://${hostname}:${port}/`);
});
