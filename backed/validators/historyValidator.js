const Joi = require('joi');

const historySchemas = {
    create: Joi.object({
        subject: Joi.string().trim().required().max(255),
        art: Joi.string().valid('appointment', 'service', 'other').required(),
        date: Joi.date().required(),
        time: Joi.string().regex(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/).required(),
        description: Joi.string().trim().allow(null, ''),
    }),

    update: Joi.object({
        subject: Joi.string().trim().max(255),
        art: Joi.string().valid('appointment', 'service', 'other'),
        date: Joi.date(),
        time: Joi.string().regex(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/),
        description: Joi.string().trim().allow(null, ''),
    }).min(1),

    customerIdParam: Joi.object({
        customerId: Joi.number().integer().positive().required(),
    }),

    idParam: Joi.object({
        id: Joi.number().integer().positive().required(),
    }),

    pagination: Joi.object({
        page: Joi.number().integer().positive().default(1),
        pageSize: Joi.number().integer().positive().default(10),
    }),
};

module.exports = historySchemas;
