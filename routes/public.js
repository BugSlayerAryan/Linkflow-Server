const express = require("express");
const rateLimit = require("express-rate-limit");

const routes = express.Router();

const publicController = require("../controller/public");

const mediaLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 8,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: "fail",
    error: "Too many media requests. Please try again later.",
  },
});

const previewLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: "fail",
    error: "Too many preview requests. Please try again later.",
  },
});

routes.get("/", publicController.startApi);

routes.get("/api/v1/media", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Media API is working. Use POST method with { urls } body.",
    method: "POST",
    endpoint: "/api/v1/media",
    body: {
      urls: "https://example.com/video-url",
    },
  });
});

routes.post("/api/v1/media", mediaLimiter, publicController.postMedia);

routes.get("/api/v1/download-direct", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Download API is working. Use POST method.",
    method: "POST",
    endpoint: "/api/v1/download-direct",
  });
});

routes.post(
  "/api/v1/download-direct",
  mediaLimiter,
  publicController.downloadDirectMedia
);

routes.get("/api/v1/download-fallback", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Fallback Download API is working. Use POST method.",
    method: "POST",
    endpoint: "/api/v1/download-fallback",
  });
});

routes.post(
  "/api/v1/download-fallback",
  mediaLimiter,
  publicController.downloadFallbackMedia
);

routes.get("/api/v1/download-single", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Single media download API is working. Use POST method.",
    method: "POST",
    endpoint: "/api/v1/download-single",
  });
});

routes.post(
  "/api/v1/download-single",
  mediaLimiter,
  publicController.downloadSingleMedia
);

routes.get("/api/v1/fallback-open", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Fallback Open API is working. Use POST method.",
    method: "POST",
    endpoint: "/api/v1/fallback-open",
  });
});

routes.post(
  "/api/v1/fallback-open",
  mediaLimiter,
  publicController.openFallbackMedia
);

routes.get("/api/v1/preview", previewLimiter, publicController.previewMedia);

routes.get("/api/v1/proxy-image", mediaLimiter, publicController.proxyImage);

module.exports = routes;
