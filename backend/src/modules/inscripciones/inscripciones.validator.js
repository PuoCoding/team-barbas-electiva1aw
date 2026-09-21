const Joi = require('joi');

const inscripcionSchema = Joi.object({
  matricula: Joi.string().required(),
  estudiante: Joi.string().required(),
  acudiente: Joi.string().required(),
  fechaInscripcion: Joi.string().required()
});

module.exports = {
  inscripcionSchema
};
