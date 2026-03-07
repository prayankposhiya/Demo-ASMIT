const Joi = require('joi');
const { sendResponse } = require('../utils/response');

const validateRequest = (schema, source = 'body') => {
    return (req, res, next) => {
        const data = req[source];
        const { error, value } = schema.validate(data, {
            abortEarly: false,
            allowUnknown: true,
            stripUnknown: false,
        });

        if (error) {
            const errorMessage = error.details.map((detail) => detail.message).join(', ');
            return sendResponse(res, 400, false, null, errorMessage);
        }
        req[source] = value;
        next();
    };
};

module.exports = validateRequest;
