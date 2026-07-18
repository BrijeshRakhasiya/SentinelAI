const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    ["/auth", "/api", "/health"],
    createProxyMiddleware({ target: "http://localhost:8000", changeOrigin: true })
  );
};
