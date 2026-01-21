// middlewares/validate.js
const { body, validationResult } = require('express-validator');

const validateRegistration =  [
  body('email').isEmail().withMessage('صيغة البريد الإلكتروني غير صحيحة'),
  body('password').isLength({ min: 6 }).withMessage('يجب أن تكون كلمة المرور 6 أحرف على الأقل'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // إعادة الأخطاء إن وجدت
      return res.status(400).json({ errors: errors.array().map(e => e.msg) });
    }
    next();
  }
];

module.exports = { validateRegistration };
