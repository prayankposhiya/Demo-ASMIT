/**
 * Customers API: list, get by id, create (Admin only).
 * Staff has read-only access; Admin can create new customer (TASKOVERVIEW section 3).
 */

const express = require('express');
const router = express.Router();
const { query } = require('../db/connection');
const { requireAuth } = require('../middleware/auth');
const { requireAdmin, requireStaff } = require('../middleware/roles');
const { ADMIN } = require('../config/constants');

router.use(requireAuth);

/**
 * GET /api/customers - List all customers (Admin and Staff).
 */
router.get('/', requireStaff, async (req, res, next) => {
  try {
    const [rows] = await query(
      'SELECT id, first_name, last_name, email, phone, created_at FROM customers ORDER BY id'
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/customers/:id - Customer detail (for Customer Detail page; history is separate endpoint).
 */
router.get('/:id', requireStaff, async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid customer id' });
    const [rows] = await query(
      'SELECT id, first_name, last_name, email, phone, created_at FROM customers WHERE id = ?',
      [id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Customer not found' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/customers - Create customer (Admin only).
 */
router.post('/', requireAdmin, async (req, res, next) => {
  try {
    const { first_name, last_name, email, phone } = req.body || {};
    if (req.user.role !== ADMIN) {
      return res.status(403).json({ error: 'Forbidden: Admin only' });
    }
    if (!first_name || !last_name) {
      return res.status(400).json({ error: 'first_name and last_name are required' });
    }
    const [result] = await query(
      'INSERT INTO customers (first_name, last_name, email, phone) VALUES (?, ?, ?, ?)',
      [String(first_name).trim(), String(last_name).trim(), email ? String(email).trim() : null, phone ? String(phone).trim() : null]
    );
    const [rows] = await query('SELECT id, first_name, last_name, email, phone, created_at FROM customers WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/customers/:id - Update customer (Admin only).
 */
router.put('/:id', requireAdmin, async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid customer id' });
    if (req.user.role !== ADMIN) {
      return res.status(403).json({ error: 'Forbidden: Admin only' });
    }

    const { first_name, last_name, email, phone } = req.body || {};
    const updates = [];
    const params = [];

    if (first_name !== undefined) { updates.push('first_name = ?'); params.push(String(first_name).trim()); }
    if (last_name !== undefined) { updates.push('last_name = ?'); params.push(String(last_name).trim()); }
    if (email !== undefined) { updates.push('email = ?'); params.push(email ? String(email).trim() : null); }
    if (phone !== undefined) { updates.push('phone = ?'); params.push(phone ? String(phone).trim() : null); }

    if (updates.length === 0) {
      const [rows] = await query('SELECT id, first_name, last_name, email, phone, created_at FROM customers WHERE id = ?', [id]);
      return res.json(rows[0]);
    }

    params.push(id);
    await query(`UPDATE customers SET ${updates.join(', ')} WHERE id = ?`, params);
    const [rows] = await query('SELECT id, first_name, last_name, email, phone, created_at FROM customers WHERE id = ?', [id]);
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/customers/:id - Delete customer (Admin only).
 */
router.delete('/:id', requireAdmin, async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid customer id' });
    if (req.user.role !== ADMIN) {
      return res.status(403).json({ error: 'Forbidden: Admin only' });
    }

    const [result] = await query('DELETE FROM customers WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Customer not found' });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
