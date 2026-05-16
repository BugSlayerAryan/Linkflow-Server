

const express = require("express");
const routes = express.Router();

const publicController = require("../controller/public");

routes.get("/", publicController.startApi);

routes.post("/api/v1/media", publicController.postMedia);

routes.post("/api/v1/download-direct", publicController.downloadDirectMedia);

/**
 * Required for X.com/Twitter and other social media previews.
 * Frontend video tag should use this endpoint, not raw CDN URLs.
 */
routes.get("/api/v1/preview", publicController.previewMedia);

routes.get("/api/v1/proxy-image", publicController.proxyImage);

module.exports = routes;