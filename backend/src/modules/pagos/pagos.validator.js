const Joi = require('joi');

const pagoSchema = Joi.object({
  estudiante: Joi.string().required(),
  concepto: Joi.string().required(),
  valor: Joi.number().positive().required(),
  metodo: Joi.string().required(),
  mes: Joi.string().required()
});

module.exports = {
  pagoSchema
};
