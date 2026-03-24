const express = require("express");
const rateLimit = require("express-rate-limit");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();
const port = process.env.PORT || 3000;
const VIDEO_STREAMING_URL = process.env.VIDEO_STREAMING_URL || "http://localhost:4001";

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

app.use(
  "/",
  createProxyMiddleware({
    target: VIDEO_STREAMING_URL,
    changeOrigin: true,
  })
);

app.listen(port, () => {
  console.log(`Gateway listening on port ${port}`);
});