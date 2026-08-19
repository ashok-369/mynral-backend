const successResponse = (
  res,
  {
    statusCode = 200,
    message = "Success",
    data = null,
    meta = null,
  } = {}
) => {
  return res.status(statusCode).json({
    success: true,
    statusCode,
    message,
    data,
    ...(meta && { meta }),
  });
};

export default successResponse;