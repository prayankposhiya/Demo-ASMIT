const sendResponse = (res, status, success, data = null, error = null, message = null) => {
    const responsePayload = { success };

    if (data !== null) responsePayload.data = data;
    if (error !== null) responsePayload.error = error;
    if (message !== null) responsePayload.message = message;

    return res.status(status).json(responsePayload);
};

module.exports = { sendResponse };
