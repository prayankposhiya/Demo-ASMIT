const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const historyController = require('../controllers/historyController');
const validateRequest = require('../middleware/validateRequest');
const historySchemas = require('../validators/historyValidator');

router.use(requireAuth);

router.get('/:customerId', validateRequest(historySchemas.customerIdParam, 'params'), validateRequest(historySchemas.pagination, 'query'), historyController.getCustomerHistory);

router.post('/:customerId', validateRequest(historySchemas.customerIdParam, 'params'), validateRequest(historySchemas.create, 'body'), historyController.addHistoryEntry);

router.put('/:id', validateRequest(historySchemas.idParam, 'params'), validateRequest(historySchemas.update, 'body'), historyController.updateHistoryEntry);

router.delete('/:id', validateRequest(historySchemas.idParam, 'params'), historyController.deleteHistoryEntry);

module.exports = router;
