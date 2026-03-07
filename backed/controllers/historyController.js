const { query } = require('../db/connection');
const { ADMIN } = require('../config/constants');
const { sendResponse } = require('../utils/response');
const { formatPaginatedResponse } = require('../utils/pagination');

const VALID_ART = ['appointment', 'service', 'other'];

function canModify(historyRow, user) {
    if (user.role === ADMIN) return true;
    return historyRow.created_by === user.sub;
}

exports.getCustomerHistory = async (req, res, next) => {
    try {
        const customerId = parseInt(req.params.customerId, 10);
        if (isNaN(customerId)) return sendResponse(res, 400, false, null, 'Invalid customer id');

        const page = parseInt(req.query.page, 10) || 1;
        const pageSize = parseInt(req.query.pageSize, 10) || 10;
        const offset = (page - 1) * pageSize;

        const [countResult] = await query('SELECT COUNT(*) as total FROM history WHERE customer_id = ?', [customerId]);
        const totalData = countResult[0].total;

        const [rows] = await query(
            'SELECT id, customer_id, subject, art, description, date, time, created_by, created_at, completed FROM history WHERE customer_id = ? ORDER BY date DESC, time DESC LIMIT ? OFFSET ?',
            [customerId, pageSize, offset]
        );

        const paginatedData = formatPaginatedResponse(rows, totalData, page, pageSize);
        sendResponse(res, 200, true, paginatedData);
    } catch (err) {
        next(err);
    }
};

exports.addHistoryEntry = async (req, res, next) => {
    try {
        const customerId = parseInt(req.params.customerId, 10);
        if (isNaN(customerId)) return sendResponse(res, 400, false, null, 'Invalid customer id');
        const { subject, art, date, time, description } = req.body || {};
        if (!art || !VALID_ART.includes(art)) {
            return sendResponse(res, 400, false, null, 'art must be one of: appointment, service, other');
        }
        const [cust] = await query('SELECT id FROM customers WHERE id = ?', [customerId]);
        if (cust.length === 0) return sendResponse(res, 404, false, null, 'Customer not found');
        const [result] = await query(
            'INSERT INTO history (customer_id, subject, art, description, date, time, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [customerId, subject ? String(subject).trim() : null, art, description ? String(description).trim() : null, date || null, time || null, req.user.sub]
        );
        const [rows] = await query(
            'SELECT id, customer_id, subject, art, description, date, time, created_by, created_at, completed FROM history WHERE id = ?',
            [result.insertId]
        );
        sendResponse(res, 201, true, rows[0], null, 'History entry added successfully');
    } catch (err) {
        next(err);
    }
};

exports.updateHistoryEntry = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) return sendResponse(res, 400, false, null, 'Invalid id');
        const [rows] = await query(
            'SELECT id, customer_id, created_by FROM history WHERE id = ?',
            [id]
        );
        if (rows.length === 0) return sendResponse(res, 404, false, null, 'History entry not found');
        if (!canModify(rows[0], req.user)) {
            return sendResponse(res, 403, false, null, 'Forbidden: you can only edit your own entries');
        }
        const { subject, art, date, time, description } = req.body || {};
        const updates = [];
        const params = [];
        if (subject !== undefined) { updates.push('subject = ?'); params.push(String(subject).trim()); }
        if (art !== undefined) {
            if (!VALID_ART.includes(art)) return sendResponse(res, 400, false, null, 'art must be appointment, service, or other');
            updates.push('art = ?'); params.push(art);
        }
        if (description !== undefined) { updates.push('description = ?'); params.push(String(description).trim()); }
        if (date !== undefined) { updates.push('date = ?'); params.push(date || null); }
        if (time !== undefined) { updates.push('time = ?'); params.push(time || null); }
        if (updates.length === 0) {
            const [r] = await query('SELECT id, customer_id, subject, art, description, date, time, created_by, created_at, completed FROM history WHERE id = ?', [id]);
            return sendResponse(res, 200, true, r[0]);
        }
        params.push(id);
        await query(`UPDATE history SET ${updates.join(', ')} WHERE id = ?`, params);
        const [updated] = await query('SELECT id, customer_id, subject, art, description, date, time, created_by, created_at, completed FROM history WHERE id = ?', [id]);
        sendResponse(res, 200, true, updated[0], null, 'History entry updated successfully');
    } catch (err) {
        next(err);
    }
};

exports.deleteHistoryEntry = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) return sendResponse(res, 400, false, null, 'Invalid id');
        const [rows] = await query(
            'SELECT id, customer_id, created_by FROM history WHERE id = ?',
            [id]
        );
        if (rows.length === 0) return sendResponse(res, 404, false, null, 'History entry not found');
        if (!canModify(rows[0], req.user)) {
            return sendResponse(res, 403, false, null, 'Forbidden: you can only delete your own entries');
        }
        await query('DELETE FROM history WHERE id = ?', [id]);
        sendResponse(res, 200, true, null, null, 'History entry deleted successfully');
    } catch (err) {
        next(err);
    }
};
