/**
 * CRM Backend - Express app.
 * Loads config (dotenv), mounts API routes under /api with JWT auth, health check, CORS.
 */

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');

var config = require('./config');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var appointmentsRouter = require('./routes/appointments');
var customersRouter = require('./routes/customers');
var historyRouter = require('./routes/history');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// CORS for frontend on another origin (e.g. React dev server)
app.use(cors({ origin: config.corsOrigin, credentials: true }));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// Health check (no auth) for load balancers / monitoring
app.get('/api/health', function (req, res) {
  res.json({ status: 'ok' });
});

// API routes (all protected by JWT in their routers)
// Mount history before customers so /api/customers/:id/history is not caught by customers GET /:id
app.use('/api/appointments', appointmentsRouter);
app.use('/api/customers/:customerId/history', historyRouter);
app.use('/api/customers', customersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler: JSON for /api, else render error page
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
