import * as Joi from 'joi';

export const linkCreateSchema = Joi.object()
  .keys({
    name: Joi.string().min(2).max(60).required().messages({
      'string.empty': 'name|The name is empty.',
      'string.min': 'name|The name cannot be less than 2 characters',
      'string.max': 'name|The name cannot be more than 60 characters',
    }),
    image: Joi.string().min(1).max(50).required().messages({
      'string.empty': 'image|The image is empty.',
      'string.min': 'image|The image cannot be less than 1 characters',
      'string.max': 'image|The image cannot be more than 50 characters',
    }),
    url: Joi.string().uri().min(8).max(500).required().messages({
      'string.empty': 'url|The url is empty.',
      'string.min': 'url|The url cannot be less than 8 characters',
      'string.max': 'url|The url cannot be more than 500 characters',
      'string.uri': 'url|The url is not valid',
    }),
    description: Joi.string().min(2).max(70).required().messages({
      'string.empty': 'description|The description is empty.',
      'string.min':
        'description|The description cannot be less than 2 characters',
      'string.max':
        'description|The description cannot be more than 70 characters',
    }),
  })
  .options({ stripUnknown: true });

export const linkUpdateSchema = Joi.object()
  .keys({
    name: Joi.string().min(2).max(60).messages({
      'string.empty': 'name|The name is empty.',
      'string.min': 'name|The name cannot be less than 2 characters',
      'string.max': 'name|The name cannot be more than 60 characters',
    }),
    image: Joi.string().min(1).max(50).messages({
      'string.empty': 'image|The image is empty.',
      'string.min': 'image|The image cannot be less than 1 characters',
      'string.max': 'image|The image cannot be more than 50 characters',
    }),
    url: Joi.string().uri().min(8).max(500).messages({
      'string.empty': 'url|The url is empty.',
      'string.min': 'url|The url cannot be less than 8 characters',
      'string.max': 'url|The url cannot be more than 500 characters',
      'string.uri': 'url|The url is not valid',
    }),
    description: Joi.string().min(2).max(70).messages({
      'string.empty': 'description|The description is empty.',
      'string.min':
        'description|The description cannot be less than 2 characters',
      'string.max':
        'description|The description cannot be more than 70 characters',
    }),
  })
  .options({ stripUnknown: true });
