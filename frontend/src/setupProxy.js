const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  // Mounted with no Express path prefix (app.use(middleware) instead of
  // app.use(path, middleware)) so req.url is never truncated before it
  // reaches http-proxy-middleware -- pathFilter alone decides which
  // requests get proxied, and the full original path (e.g. /auth/login)
  // is forwarded to the backend unchanged.
  app.use(
    createProxyMiddleware({
      target: "http://localhost:8000",
      changeOrigin: true,
      pathFilter: ["/auth", "/api", "/health"],
    })
  );
};
