/**
 * Standardized response utility for API consistency.
 * 
 * @param {Object} res - Express response object
 * @param {number} status - HTTP status code
 * @param {boolean} success - Whether the operation was successful
 * @param {Object} [data] - Data to send back to the client
 * @param {string} [error] - Error message if success is false
 * @param {string} [message] - Optional success message
 */
const sendResponse = (res, status, success, data = null, error = null, message = null) => {
    const responsePayload = { success };

    if (data !== null) responsePayload.data = data;
    if (error !== null) responsePayload.error = error;
    if (message !== null) responsePayload.message = message;

    return res.status(status).json(responsePayload);
};

module.exports = { sendResponse };
