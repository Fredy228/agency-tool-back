import * as Joi from 'joi';

export const collectionCreateSchema = Joi.object()
  .keys({
    name: Joi.string().min(2).max(30).required().messages({
      'string.empty': 'name|The name is empty.',
      'string.min': 'name|The name cannot be less than 2 characters',
      'string.max': 'name|The name cannot be more than 30 characters',
    }),
    imageUrl: Joi.string().min(1).max(250).required().messages({
      'string.empty': 'image-url|The image-url is empty.',
      'string.min': 'image-url|The image-url cannot be less than 1 characters',
      'string.max':
        'image-url|The image-url cannot be more than 250 characters',
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
    imageUrl: Joi.string().min(1).max(250).messages({
      'string.empty': 'image-url|The image-url is empty.',
      'string.min': 'image-url|The image-url cannot be less than 1 characters',
      'string.max':
        'image-url|The image-url cannot be more than 250 characters',
    }),
  })
  .options({ stripUnknown: true });
