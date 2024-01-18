import * as Joi from 'joi';

export const organizationCreateSchema = Joi.object({
  name: Joi.string()
    .min(1)
    .max(30)
    .message('The name is incorrect or empty.')
    .required(),
}).options({ stripUnknown: true });
