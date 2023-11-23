import Joi from 'joi';

export const userCreateSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string()
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,30}$/)
    .required(),
  firstName: Joi.string()
    .pattern(/^[A-Za-zА-Яа-я]+$/u)
    .min(1)
    .max(50)
    .required(),
}).options({ stripUnknown: true });
