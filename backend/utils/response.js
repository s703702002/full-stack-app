export const sendSuccess = (
  res,
  statusCode = 200,
  data = {},
  message = 'Success',
) => {
  res.status(statusCode).json({
    success: true,
    message,
    ...data,
  });
};
