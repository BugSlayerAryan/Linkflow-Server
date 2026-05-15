const express = require("express");
const routes = express.Router();

const publicController = require("../controller/public");

routes.get("/", publicController.startApi);

routes.post("/api/v1/media", publicController.postMedia);

routes.post("/api/v1/download-direct", publicController.downloadDirectMedia);

/**
 * Direct fallback test endpoint.
 * This does not replace /api/v1/media. It lets you test the fallback layers only.
 */
routes.post("/api/v1/fallback-media", publicController.fallbackMedia);

/**
 * Required for X.com/Twitter and other social media previews.
 * Frontend video tag should use this endpoint, not raw CDN URLs.
 */
routes.get("/api/v1/preview", publicController.previewMedia);

/**
 * HLS proxy for X.com/Twitter .m3u8 preview playback.
 */
routes.get("/api/v1/hls-proxy", publicController.hlsProxy);

routes.get("/api/v1/proxy-image", publicController.proxyImage);

module.exports = routes;
