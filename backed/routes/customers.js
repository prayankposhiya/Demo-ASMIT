const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/roles');
const customerController = require('../controllers/customerController');
const validateRequest = require('../middleware/validateRequest');
const customerSchemas = require('../validators/customerValidator');

router.use(requireAuth);

router.get('/', validateRequest(customerSchemas.pagination, 'query'), customerController.getAllCustomers);

router.get('/:id', validateRequest(customerSchemas.idParam, 'params'), customerController.getCustomerById);

router.post('/', requireAdmin, validateRequest(customerSchemas.create, 'body'), customerController.createCustomer);

router.put('/:id', requireAdmin, validateRequest(customerSchemas.idParam, 'params'), validateRequest(customerSchemas.update, 'body'), customerController.updateCustomer);

router.delete('/:id', requireAdmin, validateRequest(customerSchemas.idParam, 'params'), customerController.deleteCustomer);

module.exports = router;
