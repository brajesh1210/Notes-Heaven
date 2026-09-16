import { badRequest } from '../utils/ApiError.js';

const emailRe = /^\S+@\S+\.\S+$/;

/** Body validator: simple API like body('email').isEmail().required() */
export const body = (field) => {
  const rule = { field, value: undefined };
  const api = {
    required: (message) => {
      rule.required = true;
      if (message) rule.message = message;
      return api;
    },
    min: (n, message) => {
      rule.min = n;
      if (message) rule.message = message;
      return api;
    },
    max: (n) => {
      rule.max = n;
      return api;
    },
    isEmail: () => {
      rule.email = true;
      return api;
    },
    _rule: rule,
  };
  return api;
};

export const validate = (...apis) => {
  const rules = apis.map((a) => ({ ...a._rule }));
  return (req, _res, next) => {
    const errors = [];
    for (const rule of rules) {
      const value = req.body?.[rule.field];
      if (rule.required && (value === undefined || value === null || String(value).trim() === '')) {
        errors.push({ field: rule.field, message: rule.message || `${rule.field} is required` });
        continue;
      }
      if (value === undefined || value === null || value === '') continue;
      if (rule.min && String(value).length < rule.min) {
        errors.push({ field: rule.field, message: rule.message || `${rule.field} must be at least ${rule.min} characters` });
      }
      if (rule.max && String(value).length > rule.max) {
        errors.push({ field: rule.field, message: `${rule.field} max ${rule.max} characters` });
      }
      if (rule.email && !emailRe.test(String(value))) {
        errors.push({ field: rule.field, message: 'Please enter a valid email address' });
      }
    }
    if (errors.length) return next(badRequest(errors[0].message, errors));
    return next();
  };
};

export default validate;
