/**
 * History API: list by customer, create, update, delete.
 * Ownership: Admin can edit/delete any; Staff only entries they created (created_by === token.sub).
 * TASKOVERVIEW section 7.
 */

const express = require('express');
const router = express.Router();
const { query } = require('../db/connection');
const { requireAuth } = require('../middleware/auth');
const { requireStaff } = require('../middleware/roles');

const VALID_ART = ['appointment', 'service', 'other'];

/**
 * Check if current user can edit/delete this history row (Admin = any, Staff = own only).
 */
function canModify(historyRow, user) {
  if (user.role === 'Admin') return true;
  return historyRow.created_by === user.sub;
}

/**
 * GET /api/customers/:customerId/history - All history entries for customer (any art).
 * Mounted at /api/customers/:customerId/history so req.params.customerId is set.
 */
router.get('/', requireAuth, requireStaff, async (req, res, next) => {
  try {
    const customerId = parseInt(req.params.customerId, 10);
    if (isNaN(customerId)) return res.status(400).json({ error: 'Invalid customer id' });
    const [rows] = await query(
      'SELECT id, customer_id, subject, art, description, date, time, created_by, created_at, completed FROM history WHERE customer_id = ? ORDER BY date DESC, time DESC',
      [customerId]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/customers/:customerId/history - Add history entry. created_by = token sub.
 * If art = 'appointment' it appears in Appointment List until marked completed.
 */
router.post('/:customerId/history', requireAuth, requireStaff, async (req, res, next) => {
  try {
    const customerId = parseInt(req.params.customerId, 10);
    if (isNaN(customerId)) return res.status(400).json({ error: 'Invalid customer id' });
    const { subject, art, date, time, description } = req.body || {};
    if (!art || !VALID_ART.includes(art)) {
      return res.status(400).json({ error: 'art must be one of: appointment, service, other' });
    }
    const [cust] = await query('SELECT id FROM customers WHERE id = ?', [customerId]);
    if (cust.length === 0) return res.status(404).json({ error: 'Customer not found' });
    const [result] = await query(
      'INSERT INTO history (customer_id, subject, art, description, date, time, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [customerId, subject ? String(subject).trim() : null, art, description ? String(description).trim() : null, date || null, time || null, req.user.sub]
    );
    const [rows] = await query(
      'SELECT id, customer_id, subject, art, description, date, time, created_by, created_at, completed FROM history WHERE id = ?',
      [result.insertId]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/customers/:customerId/history/:id - Update history. Ownership enforced.
 */
router.put('/:id', requireAuth, requireStaff, async (req, res, next) => {
  try {
    const customerId = parseInt(req.params.customerId, 10);
    const id = parseInt(req.params.id, 10);
    if (isNaN(customerId) || isNaN(id)) return res.status(400).json({ error: 'Invalid id' });
    const [rows] = await query(
      'SELECT id, customer_id, created_by FROM history WHERE id = ? AND customer_id = ?',
      [id, customerId]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'History entry not found' });
    if (!canModify(rows[0], req.user)) {
      return res.status(403).json({ error: 'Forbidden: you can only edit your own entries' });
    }
    const { subject, art, date, time, description } = req.body || {};
    const updates = [];
    const params = [];
    if (subject !== undefined) { updates.push('subject = ?'); params.push(String(subject).trim()); }
    if (art !== undefined) {
      if (!VALID_ART.includes(art)) return res.status(400).json({ error: 'art must be appointment, service, or other' });
      updates.push('art = ?'); params.push(art);
    }
    if (description !== undefined) { updates.push('description = ?'); params.push(String(description).trim()); }
    if (date !== undefined) { updates.push('date = ?'); params.push(date || null); }
    if (time !== undefined) { updates.push('time = ?'); params.push(time || null); }
    if (updates.length === 0) {
      const [r] = await query('SELECT id, customer_id, subject, art, description, date, time, created_by, created_at, completed FROM history WHERE id = ?', [id]);
      return res.json(r[0]);
    }
    params.push(id);
    await query(`UPDATE history SET ${updates.join(', ')} WHERE id = ?`, params);
    const [updated] = await query('SELECT id, customer_id, subject, art, description, date, time, created_by, created_at, completed FROM history WHERE id = ?', [id]);
    res.json(updated[0]);
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/customers/:customerId/history/:id - Delete history. Ownership enforced.
 */
router.delete('/:id', requireAuth, requireStaff, async (req, res, next) => {
  try {
    const customerId = parseInt(req.params.customerId, 10);
    const id = parseInt(req.params.id, 10);
    if (isNaN(customerId) || isNaN(id)) return res.status(400).json({ error: 'Invalid id' });
    const [rows] = await query(
      'SELECT id, customer_id, created_by FROM history WHERE id = ? AND customer_id = ?',
      [id, customerId]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'History entry not found' });
    if (!canModify(rows[0], req.user)) {
      return res.status(403).json({ error: 'Forbidden: you can only delete your own entries' });
    }
    await query('DELETE FROM history WHERE id = ?', [id]);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
