/**
 * Appointments API: list (merge customer + history, art=appointment, not completed)
 * and mark appointment as completed. Completion is done by setting completed=1,
 * not by deleting the record (per TASKOVERVIEW section 4).
 */

const express = require('express');
const router = express.Router();
const { query } = require('../db/connection');
const { requireAuth } = require('../middleware/auth');
const { requireStaff } = require('../middleware/roles');

// All routes require auth and Admin or Staff
router.use(requireAuth);
router.use(requireStaff);

/**
 * GET /api/appointments
 * Returns appointments for list page: join customers + history, art='appointment', completed=0.
 * Frontend will color rows by past/today/future.
 */
router.get('/', async (req, res, next) => {
  try {
    const [rows] = await query(
      `SELECT h.id AS history_id, c.id AS customer_id, c.first_name, c.last_name, h.date, h.time, h.description
       FROM history h
       INNER JOIN customers c ON c.id = h.customer_id
       WHERE h.art = 'appointment' AND h.completed = 0
       ORDER BY h.date, h.time`
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /api/appointments/:id/complete
 * Mark appointment as completed (set completed=1). Record stays in DB for History tab.
 */
router.patch('/:id/complete', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid appointment id' });
    const [result] = await query(
      'UPDATE history SET completed = 1 WHERE id = ? AND art = ?',
      [id, 'appointment']
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
