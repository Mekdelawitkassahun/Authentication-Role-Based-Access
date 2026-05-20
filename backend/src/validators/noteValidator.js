const Joi = require("joi");

const noteSchema = Joi.object({
  title: Joi.string().max(100).required(),
  content: Joi.string().max(1000).required(),
});

module.exports = { noteSchema };
