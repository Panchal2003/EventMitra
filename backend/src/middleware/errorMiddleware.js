export const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found.`,
  });
};

export const errorHandler = (error, req, res, next) => {
  const statusCode = error.statusCode || 500;

  if (process.env.NODE_ENV !== "test") {
    console.error(error);
  }

  res.status(statusCode).json({
    success: false,
    message: error.message || "Something went wrong.",
    stack: process.env.NODE_ENV === "production" ? undefined : error.stack,
  });
};

