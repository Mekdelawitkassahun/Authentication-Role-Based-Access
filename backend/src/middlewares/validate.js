const AppError = require("../utils/AppError");

const validate = (schema) => (req, _res, next) => {
  const { error } = schema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const message = error.details.map((d) => d.message).join(", ");
    return next(new AppError(message, 400));
  }

  return next();
};

module.exports = validate;
