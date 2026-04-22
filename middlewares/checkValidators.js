import { validationResult } from 'express-validator';

export const checkValidators = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const receivedFields = req.body && typeof req.body === 'object'
      ? Object.keys(req.body)
      : [];

    return res.status(400).json({
      success: false,
      message: 'Errores de validación',
      diagnostics: {
        contentType: req.headers['content-type'] || null,
        receivedFields,
      },
      errors: errors.array().map((err) => ({
        field: err.path || err.param,
        message: err.msg,
      })),
    });
  }

  next();
};
