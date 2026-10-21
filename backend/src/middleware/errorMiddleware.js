export const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `API Route not found: [${req.method}] ${req.originalUrl}`,
  });
};

export const errorHandler = (err, req, res, next) => {
  console.error('[Unhandled Error]', err);

  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'An unexpected internal server error occurred.',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};
