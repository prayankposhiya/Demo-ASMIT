const { query } = require('../db/connection');
const { ADMIN } = require('../config/constants');
const { sendResponse } = require('../utils/response');
const { formatPaginatedResponse } = require('../utils/pagination');

exports.getAllCustomers = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const pageSize = parseInt(req.query.pageSize, 10) || 10;
        const offset = (page - 1) * pageSize;

        const [countResult] = await query('SELECT COUNT(*) as total FROM customers');
        const totalData = countResult[0].total;

        const [rows] = await query(
            'SELECT id, first_name, last_name, email, phone, created_at FROM customers ORDER BY id LIMIT ? OFFSET ?',
            [pageSize, offset]
        );

        const paginatedData = formatPaginatedResponse(rows, totalData, page, pageSize);
        sendResponse(res, 200, true, paginatedData);
    } catch (err) {
        console.log(err);
        next(err);
    }
};

exports.getCustomerById = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) return sendResponse(res, 400, false, null, 'Invalid customer id');
        const [rows] = await query(
            'SELECT id, first_name, last_name, email, phone, created_at FROM customers WHERE id = ?',
            [id]
        );
        if (rows.length === 0) return sendResponse(res, 404, false, null, 'Customer not found');
        sendResponse(res, 200, true, rows[0]);
    } catch (err) {
        next(err);
    }
};

exports.createCustomer = async (req, res, next) => {
    try {
        const { first_name, last_name, email, phone } = req.body || {};
        if (!first_name || !last_name) {
            return sendResponse(res, 400, false, null, 'first_name and last_name are required');
        }
        const [result] = await query(
            'INSERT INTO customers (first_name, last_name, email, phone) VALUES (?, ?, ?, ?)',
            [String(first_name).trim(), String(last_name).trim(), email ? String(email).trim() : null, phone ? String(phone).trim() : null]
        );
        const [rows] = await query('SELECT id, first_name, last_name, email, phone, created_at FROM customers WHERE id = ?', [result.insertId]);
        sendResponse(res, 201, true, rows[0], null, 'Customer created successfully');
    } catch (err) {
        next(err);
    }
};

exports.updateCustomer = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) return sendResponse(res, 400, false, null, 'Invalid customer id');

        const { first_name, last_name, email, phone } = req.body || {};
        const updates = [];
        const params = [];

        if (first_name !== undefined) { updates.push('first_name = ?'); params.push(String(first_name).trim()); }
        if (last_name !== undefined) { updates.push('last_name = ?'); params.push(String(last_name).trim()); }
        if (email !== undefined) { updates.push('email = ?'); params.push(email ? String(email).trim() : null); }
        if (phone !== undefined) { updates.push('phone = ?'); params.push(phone ? String(phone).trim() : null); }

        if (updates.length === 0) {
            const [rows] = await query('SELECT id, first_name, last_name, email, phone, created_at FROM customers WHERE id = ?', [id]);
            return sendResponse(res, 200, true, rows[0]);
        }

        params.push(id);
        await query(`UPDATE customers SET ${updates.join(', ')} WHERE id = ?`, params);
        const [rows] = await query('SELECT id, first_name, last_name, email, phone, created_at FROM customers WHERE id = ?', [id]);
        sendResponse(res, 200, true, rows[0], null, 'Customer updated successfully');
    } catch (err) {
        next(err);
    }
};

exports.deleteCustomer = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) return sendResponse(res, 400, false, null, 'Invalid customer id');

        const [result] = await query('DELETE FROM customers WHERE id = ?', [id]);
        if (result.affectedRows === 0) return sendResponse(res, 404, false, null, 'Customer not found');
        sendResponse(res, 200, true, null, null, 'Customer deleted successfully');
    } catch (err) {
        next(err);
    }
};
