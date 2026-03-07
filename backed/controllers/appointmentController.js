const { query } = require('../db/connection');
const { ADMIN } = require('../config/constants');
const { sendResponse } = require('../utils/response');
const { formatPaginatedResponse } = require('../utils/pagination');

exports.getAppointments = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const pageSize = parseInt(req.query.pageSize, 10) || 10;
        const offset = (page - 1) * pageSize;

        // Get total count
        const [countResult] = await query(
            `SELECT COUNT(*) as total FROM history h 
       WHERE h.art = 'appointment' AND h.completed = 0`
        );
        const totalData = countResult[0].total;

        // Get paginated data
        const [rows] = await query(
            `SELECT h.id AS history_id, c.id AS customer_id, c.first_name, c.last_name, h.date, h.time, h.description, h.created_by
       FROM history h
       INNER JOIN customers c ON c.id = h.customer_id
       WHERE h.art = 'appointment' AND h.completed = 0
       ORDER BY h.date, h.time
       LIMIT ? OFFSET ?`,
            [pageSize, offset]
        );

        const paginatedData = formatPaginatedResponse(rows, totalData, page, pageSize);
        sendResponse(res, 200, true, paginatedData);
    } catch (err) {
        next(err);
    }
};

exports.markAppointmentComplete = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) return sendResponse(res, 400, false, null, 'Invalid appointment id');

        // Check ownership
        const [rows] = await query('SELECT created_by FROM history WHERE id = ? AND art = ?', [id, 'appointment']);
        if (rows.length === 0) return sendResponse(res, 404, false, null, 'Appointment not found');

        if (req.user.role !== ADMIN && rows[0].created_by !== req.user.sub) {
            return sendResponse(res, 403, false, null, 'Forbidden: you can only complete your own appointments');
        }

        const [result] = await query(
            'UPDATE history SET completed = 1 WHERE id = ? AND art = ?',
            [id, 'appointment']
        );
        if (result.affectedRows === 0) {
            return sendResponse(res, 404, false, null, 'Appointment not found');
        }
        sendResponse(res, 200, true, null, null, 'Appointment marked as complete');
    } catch (err) {
        next(err);
    }
};
