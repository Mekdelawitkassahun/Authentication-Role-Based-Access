module.exports = (err, _req, res, _next) => {
  const statusCode = err.statusCode || 500;
  const status = err.status || "error";

  return res.status(statusCode).json({
    status,
    message: err.message || "Internal Server Error",
  });
};
