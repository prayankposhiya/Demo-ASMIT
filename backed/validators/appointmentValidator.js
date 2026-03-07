const Joi = require('joi');

const appointmentSchemas = {
    idParam: Joi.object({
        id: Joi.number().integer().positive().required(),
    }),

    pagination: Joi.object({
        page: Joi.number().integer().positive().default(1),
        pageSize: Joi.number().integer().positive().default(10),
    }),
};

module.exports = appointmentSchemas;
