const Joi = require('joi');

const certificadoSchema = Joi.object({
  matricula: Joi.string().required(),
  estudiante: Joi.string().required(),
  tipo: Joi.string().required(),
  fechaEmision: Joi.string().required()
});

module.exports = {
  certificadoSchema
};
