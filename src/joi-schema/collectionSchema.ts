import * as Joi from 'joi';

export const collectionCreateSchema = Joi.object()
  .keys({
    name: Joi.string().min(2).max(30).required().messages({
      'string.empty': 'name|The name is empty.',
      'string.min': 'name|The name cannot be less than 2 characters',
      'string.max': 'name|The name cannot be more than 30 characters',
    }),
  })
  .options({ stripUnknown: true });

export const collectionUpdateSchema = Joi.object()
  .keys({
    name: Joi.string().min(2).max(30).messages({
      'string.empty': 'name|The name is empty.',
      'string.min': 'name|The name cannot be less than 2 characters',
      'string.max': 'name|The name cannot be more than 30 characters',
    }),
  })
  .options({ stripUnknown: true });
