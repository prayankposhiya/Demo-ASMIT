const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');

const config = require('./config');
const indexRouter = require('./routes/index');
const appointmentsRouter = require('./routes/appointments');
const customersRouter = require('./routes/customers');
const historyRouter = require('./routes/history');

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(cors({ origin: config.corsOrigin, credentials: true }));

app.use('/', indexRouter);

app.get('/api/health', function (req, res) {
  res.json({ status: 'ok' });
});

app.use('/api/appointments', appointmentsRouter);
app.use('/api/customer-history', historyRouter);
app.use('/api/customers', customersRouter);

app.use(function (req, res, next) {
  next(createError(404));
});

app.use(function (err, req, res, next) {
  var status = err.status || 500;
  res.status(status);
  if (req.path.startsWith('/api')) {
    res.json({ error: err.message || 'Internal server error' });
  } else {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    res.render('error');
  }
});

module.exports = app;
