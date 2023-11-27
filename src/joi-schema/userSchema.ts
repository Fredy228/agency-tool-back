import * as Joi from 'joi';

export const userCreateSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string()
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,30}$/)
    .required(),
  deviceModel: Joi.string().min(2).max(100).default(null),
});
//.options({ stripUnknown: true })
