const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const appointmentController = require('../controllers/appointmentController');
const validateRequest = require('../middleware/validateRequest');
const appointmentSchemas = require('../validators/appointmentValidator');

router.use(requireAuth);

router.get('/', validateRequest(appointmentSchemas.pagination, 'query'), appointmentController.getAppointments);

router.patch('/:id/complete', validateRequest(appointmentSchemas.idParam, 'params'), appointmentController.markAppointmentComplete);

module.exports = router;
