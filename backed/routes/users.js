const express = require('express');
const router = express.Router();
const { sendResponse } = require('../utils/response');

/* GET users listing. */
router.get('/', function (req, res, next) {
  sendResponse(res, 200, true, null, null, 'respond with a resource');
});

module.exports = router;
