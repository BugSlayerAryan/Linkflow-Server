// const express = require("express");
// const rateLimit = require("express-rate-limit");

// const routes = express.Router();

// const publicController = require("../controller/public");

// /**
//  * Heavy routes limiter.
//  * These routes use yt-dlp/ffmpeg or proxy remote files,
//  * so they need stricter limits than normal API routes.
//  */
// const mediaLimiter = rateLimit({
//   windowMs: 60 * 1000,
//   max: 8,
//   standardHeaders: true,
//   legacyHeaders: false,
//   message: {
//     status: "fail",
//     error: "Too many media requests. Please try again later.",
//   },
// });

// /**
//  * Preview route can be hit repeatedly by video tags,
//  * so keep it slightly higher than download routes.
//  */
// const previewLimiter = rateLimit({
//   windowMs: 60 * 1000,
//   max: 20,
//   standardHeaders: true,
//   legacyHeaders: false,
//   message: {
//     status: "fail",
//     error: "Too many preview requests. Please try again later.",
//   },
// });

// routes.get("/", publicController.startApi);

// routes.get("/api/v1/media", (req, res) => {
//   res.status(200).json({
//     status: "success",
//     message: "Media API is working. Use POST method with { urls } body.",
//     method: "POST",
//     endpoint: "/api/v1/media",
//     body: {
//       urls: "https://example.com/video-url",
//     },
//   });
// });

// routes.post("/api/v1/media", mediaLimiter, publicController.postMedia);

// routes.get("/api/v1/download-direct", (req, res) => {
//   res.status(200).json({
//     status: "success",
//     message: "Download API is working. Use POST method.",
//     method: "POST",
//     endpoint: "/api/v1/download-direct",
//   });
// });

// routes.post(
//   "/api/v1/download-direct",
//   mediaLimiter,
//   publicController.downloadDirectMedia
// );

// /**
//  * Required for X.com/Twitter and other social media previews.
//  * Frontend video tag should use this endpoint, not raw CDN URLs.
//  */
// routes.get("/api/v1/preview", previewLimiter, publicController.previewMedia);

// routes.get("/api/v1/proxy-image", mediaLimiter, publicController.proxyImage);

// module.exports = routes;









const express = require("express");
const rateLimit = require("express-rate-limit");

const routes = express.Router();

const publicController = require("../controller/public");

/**
 * Heavy routes limiter.
 * These routes use yt-dlp/ffmpeg or proxy remote files,
 * so they need stricter limits than normal API routes.
 */
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

/**
 * Preview route can be hit repeatedly by video tags,
 * so keep it slightly higher than download routes.
 */
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

/**
 * Required for X.com/Twitter and other social media previews.
 * Frontend video tag should use this endpoint, not raw CDN URLs.
 */
routes.get("/api/v1/preview", previewLimiter, publicController.previewMedia);

routes.get("/api/v1/proxy-image", mediaLimiter, publicController.proxyImage);

module.exports = routes;
