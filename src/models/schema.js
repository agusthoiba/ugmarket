const Joi = require("joi");

const collectionsSchema = Joi.object({
  col_name: Joi.string().min(3).max(50).required(),
  col_desc: Joi.string().max(500).allow(''),
  col_banner_isdisplay_home: Joi.string().required(),
  col_is_visible: Joi.string().required(),
  col_sort: Joi.string(),
});

module.exports = { collectionsSchema };
