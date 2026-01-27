const registerSchema = joi.object({
    username: joi.string().alphanum().min(3).max(30).required(),
    email: joi.string().email({ tlds: { allow: false } }),
    password: joi.string().min(6).required(),
  });