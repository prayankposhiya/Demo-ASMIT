const Joi = require('joi');

const customerSchemas = {
    create: Joi.object({
        first_name: Joi.string().trim().required().max(100),
        last_name: Joi.string().trim().required().max(100),
        email: Joi.string().trim().email().allow(null, '').max(255),
        phone: Joi.string().trim().regex(/^[0-9+() -]*$/).allow(null, '').max(20),
    }),

    update: Joi.object({
        first_name: Joi.string().trim().max(100),
        last_name: Joi.string().trim().max(100),
        email: Joi.string().trim().email().allow(null, '').max(255),
        phone: Joi.string().trim().regex(/^[0-9+() -]*$/).allow(null, '').max(20),
    }).min(1), // Require at least one field to update

    idParam: Joi.object({
        id: Joi.number().integer().positive().required(),
    }),

    pagination: Joi.object({
        page: Joi.number().integer().positive().default(1),
        pageSize: Joi.number().integer().positive().default(10),
    }),
};

module.exports = customerSchemas;
