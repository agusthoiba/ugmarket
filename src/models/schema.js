const Joi = require("joi");

const collectionsSchema = Joi.object({
  col_name: Joi.string().min(3).max(50).required(),
  col_desc: Joi.string().max(500).allow(''),
  col_banner_isdisplay_home: Joi.string().required(),
  col_is_visible: Joi.string().required(),
  col_sort: Joi.string(),
});

const registerSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(20).required(),
  confirm_password: Joi.string().min(6).max(20).required()
})


const profileSchema = Joi.object({
  name: Joi.string().required(),
  hp: Joi.string().regex(/^(\+62|62|0)[0-9]{9,12}$/).required(),
  image_ori_avatar: Joi.string().allow(''),
  gender: Joi.string().valid('1', '2').required(),
  bio: Joi.string().max(255).allow(''),
  address: Joi.string().allow(''),
  zipcode: Joi.string().max(5).allow(''),
})

module.exports = { collectionsSchema, registerSchema, profileSchema };
