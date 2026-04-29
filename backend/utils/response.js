export const sendSuccess = (
  res,
  statusCode = 200,
  payload = {},
  message = 'Success',
) => {
  res.status(statusCode).json({
    success: true,
    message,
    data: payload,
  });
};
