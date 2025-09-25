// middlewares/validate.js
const Joi = require("joi");

function validate(schema) {
  return (req, res, next) => {
    const options = { abortEarly: false, allowUnknown: true, stripUnknown: true };
    const { error, value } = schema.validate(req.body, options);
    console.log('Validation result:', { error, value }); // Debugging line

    if (error) {
      console.log(error.details)
      return res.status(400).json({
        error: error.details.map(d => d.message),
      });
    }

    req.body = value; // sanitized
    next();
  };
}

module.exports = validate;
