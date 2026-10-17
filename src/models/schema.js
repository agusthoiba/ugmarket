const Joi = require("joi");

const { bankList } = require("../helpers/bank");
const { SELLER_TYPES } = require("../constant");

const bankCodes = bankList.map((bank) => bank.code);

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
});


const profileSchema = Joi.object({
  username: Joi.string().regex(/^[a-zA-Z0-9_.-]{3,30}$/).required().messages({
    'string.pattern.base': 'Gunakan 3-30 karakter: huruf, angka, simbol (-, _, .)',
    'any.required': 'Username wajib diisi',
    'string.empty': 'Username wajib diisi',
  }),
  name: Joi.string().required(),
  hp: Joi.string().regex(/^(\+62|62|0)[0-9]{9,12}$/).required(),
  image_ori_avatar: Joi.string().allow(''),
  gender: Joi.string().valid('m', 'f').allow('').optional(),
  bio: Joi.string().max(255).allow(''),
  address: Joi.string().allow(''),
  zipcode: Joi.string().max(5).allow(''),
  province: Joi.string().allow(''),
  city: Joi.string().allow(''),
  district: Joi.string().allow(''),
  village: Joi.string().allow(''),
  street: Joi.string().allow(''),
});

const sellerSchema = Joi.object({
  sel_type: Joi.string().valid(...SELLER_TYPES).required().messages({
    'any.required': 'Tipe seller wajib dipilih',
    'string.empty': 'Tipe seller wajib dipilih',
    'any.only': 'Tipe seller wajib dipilih dari daftar yang tersedia',
  }),
  name: Joi.string().regex(/[a-zA-Z0-9_.]/).required(),
  slug: Joi.string().regex(/^[a-z0-9-]+$/).max(100).allow('').optional(),
  hp: Joi.string().regex(/^(\+62|62|0)[0-9]{9,12}$/).required(),
  image_ori_avatar: Joi.string().allow(''),
  image_banner: Joi.string().allow(''),
  description: Joi.string().allow(''),
  province: Joi.string().regex(/[0-9]/).allow(''),
  city: Joi.string().regex(/[0-9]/).allow(''),
  district: Joi.string().regex(/[0-9]/).allow(''),
  village: Joi.string().regex(/[0-9]/).allow(''),
  street: Joi.string().allow(''),
  zipcode: Joi.string().regex(/[0-9]/).max(5).allow(''),
  // Bank data is optional: an empty value is allowed, but when it is filled
  // the value still has to match the expected format / bank list.
  bank_code: Joi.number().integer().valid(...bankCodes).allow('', null).optional().messages({
    'any.only': 'Nama bank wajib dipilih dari daftar bank yang tersedia',
  }),
  bank_account_number: Joi.string().regex(/^[0-9]{6,20}$/).allow('', null).optional().messages({
    'string.pattern.base': 'Nomor rekening harus berupa 6-20 digit angka',
  }),
  bank_account_name: Joi.string().min(3).max(100).allow('', null).optional().messages({
    'string.min': 'Nama pemilik rekening minimal 3 karakter',
    'string.max': 'Nama pemilik rekening maksimal 100 karakter',
  }),
});


module.exports = { collectionsSchema, registerSchema, profileSchema, sellerSchema };