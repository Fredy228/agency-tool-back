import * as Joi from 'joi';

export const userCreateSchema = Joi.object({
  email: Joi.string().email().required(),
  firstName: Joi.string().max(100).default(null),
  lastName: Joi.string().max(100).default(null),
  password: Joi.string()
    .regex(/(?=.*\d)(?=.*[A-Z])[A-Za-z\d]{8,30}/)
    .required(),
  deviceModel: Joi.string().min(2).max(100).default(null),
});
//.options({ stripUnknown: true })
