const express = require('express');
const cors = require('cors');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Simple Logger middleware
app.use((req, res, next) => {
  res.on('finish', () => {
    console.log(
      `Finished >> ${req.method} ${req.originalUrl} ${res.statusCode} ${res.get(
        'Content-Length'
      )} - ${req.ip}`
    );
  });
  next();
});

// test route
app.get('/', (_, res) => {
  res.send('Hello World!');
});

// Routes for the app, they are post routes
const route = require('./route');
app.use('/', route);

// Simple error handler
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).send('Internal Serverless Error');
});

exports.app = app;
