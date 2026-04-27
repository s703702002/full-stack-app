import AppError from '../utils/AppError.js';

const validate = (schema) => {
  return (req, res, next) => {
    try {
      schema.parse(req.body);
      next();
    } catch (err) {
      const errorMessage = err.issues.map((e) => e.message).join(', ');

      // 丟給你的 Global Error Handler
      next(new AppError(`欄位驗證失敗: ${errorMessage}`, 400));
    }
  };
};

export default validate;
