import * as Joi from 'joi';

export const dashboardCreateSchema = Joi.object()
  .keys({
    name: Joi.string().min(2).max(30).required().messages({
      'string.empty': 'name|The name is empty.',
      'string.min': 'name|The name cannot be less than 2 characters',
      'string.max': 'name|The name cannot be more than 30 characters',
    }),
    password: Joi.string().min(5).max(30).required().messages({
      'string.empty': 'password|The password is empty.',
      'string.min': 'password|The password cannot be less than 2 characters',
      'string.max': 'password|The password cannot be more than 30 characters',
    }),
    textOne: Joi.string().min(3).max(100).required().messages({
      'string.empty': 'textOne|The textOne is empty.',
      'string.min': 'textOne|The textOne cannot be less than 3 characters',
      'string.max': 'textOne|The textOne cannot be more than 100 characters',
    }),
    textTwo: Joi.string().min(3).max(100).required().messages({
      'string.empty': 'textTwo|The textOne is empty.',
      'string.min': 'textTwo|The textOne cannot be less than 3 characters',
      'string.max': 'textTwo|The textOne cannot be more than 100 characters',
    }),
    textThree: Joi.string().min(3).max(100).required().messages({
      'string.empty': 'textThree|The textThree is empty.',
      'string.min': 'textThree|The textThree cannot be less than 3 characters',
      'string.max':
        'textThree|The textThree cannot be more than 100 characters',
    }),
  })
  .options({ stripUnknown: true });
