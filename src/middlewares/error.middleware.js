const errorMiddleware = (err, req, res, next) => {
  console.error("❌ API Error");
  console.error(err);

  const statusCode = err.statusCode || 500;

  const message =
    err.message || "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    errors: err.errors || [],
    ...(process.env.NODE_ENV === "development" && {
      stack: err.stack,
    }),
  });
};

export default errorMiddleware;