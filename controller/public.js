


// const { spawn } = require("child_process");
// const path = require("path");
// const fs = require("fs");
// const crypto = require("crypto");

// const FFMPEG_PATH = process.env.FFMPEG_PATH || "ffmpeg";
// const YTDLP_PATH = process.env.YTDLP_PATH || "yt-dlp";

// exports.startApi = (req, res) => {
//   res.status(200).json({ message: "Welcome To Vidown Api" });
// };

// const outputDir = path.join(__dirname, "..", "downloads");
// const previewDir = path.join(__dirname, "..", "previews");

// if (!fs.existsSync(outputDir)) {
//   fs.mkdirSync(outputDir, { recursive: true });
// }

// if (!fs.existsSync(previewDir)) {
//   fs.mkdirSync(previewDir, { recursive: true });
// }

// const previewJobs = new Map();

// const sanitizeFileName = (value = "linkflow-download") => {
//   const cleaned = String(value || "linkflow-download")
//     .normalize("NFKD")
//     .replace(/[^\x20-\x7E]/g, "")
//     .replace(/[<>:"/\\|?*\x00-\x1F]/g, "")
//     .replace(/\s+/g, " ")
//     .trim()
//     .slice(0, 80);

//   return cleaned || "linkflow-download";
// };

// const encodeRFC5987ValueChars = (value) => {
//   return encodeURIComponent(value)
//     .replace(/['()*]/g, (char) =>
//       `%${char.charCodeAt(0).toString(16).toUpperCase()}`
//     )
//     .replace(/%(7C|60|5E)/g, (match) => match.toLowerCase());
// };

// const createContentDisposition = (filename) => {
//   const fallbackName = sanitizeFileName(filename || "linkflow-download");
//   const encodedName = encodeRFC5987ValueChars(filename || fallbackName);

//   return `attachment; filename="${fallbackName}"; filename*=UTF-8''${encodedName}`;
// };

// const getContentType = (filePath) => {
//   const ext = path.extname(filePath).toLowerCase();

//   if (ext === ".mp3") return "audio/mpeg";
//   if (ext === ".m4a") return "audio/mp4";
//   if (ext === ".webm") return "video/webm";
//   if (ext === ".mp4") return "video/mp4";

//   return "application/octet-stream";
// };

// const safeDeleteFile = (filePath) => {
//   if (!filePath) return;
//   fs.unlink(filePath, () => {});
// };

// const isClientDisconnected = (res) => {
//   return res.destroyed || res.writableEnded;
// };

// const sendJsonIfConnected = (res, statusCode, payload) => {
//   if (res.destroyed || res.writableEnded || res.headersSent) {
//     return;
//   }

//   return res.status(statusCode).json(payload);
// };

// const getCleanProcessError = (stderr = "") => {
//   const text = String(stderr || "").trim();

//   if (!text) return "Process stopped before completion.";

//   const lines = text
//     .split("\n")
//     .map((line) => line.trim())
//     .filter(Boolean);

//   const importantLine =
//     [...lines]
//       .reverse()
//       .find((line) =>
//         /error|failed|invalid|unable|not found|permission|denied|forbidden|too many requests|sign in|cookies|bot/i.test(
//           line
//         )
//       ) || lines[0];

//   return importantLine || "Download process failed.";
// };

// const normalizeErrorMessage = (stderr = "") => {
//   const lowerError = String(stderr || "").toLowerCase();

//   const isRateLimited =
//     lowerError.includes("429") ||
//     lowerError.includes("too many requests") ||
//     lowerError.includes("rate limit") ||
//     lowerError.includes("rate-limited") ||
//     lowerError.includes("ratelimited");

//   if (isRateLimited) {
//     return {
//       statusCode: 429,
//       code: "RATE_LIMITED",
//       error:
//         "This platform is rate-limiting the server. Please wait and try again later.",
//     };
//   }

//   const isYouTubeBlocked =
//     lowerError.includes("[youtube]") &&
//     (lowerError.includes("sign in to confirm") ||
//       lowerError.includes("not a bot") ||
//       lowerError.includes("confirm you") ||
//       lowerError.includes("cookies-from-browser") ||
//       lowerError.includes("use --cookies") ||
//       lowerError.includes("robot") ||
//       lowerError.includes("bot"));

//   if (isYouTubeBlocked) {
//     return {
//       statusCode: 403,
//       code: "YOUTUBE_BLOCKED_ON_SERVER",
//       error:
//         "YouTube blocked this server request. This usually happens on cloud/server IPs. Please try another platform for now.",
//     };
//   }

//   const isForbidden =
//     lowerError.includes("403") ||
//     lowerError.includes("forbidden") ||
//     lowerError.includes("access denied");

//   if (isForbidden) {
//     return {
//       statusCode: 403,
//       code: "PLATFORM_FORBIDDEN",
//       error:
//         "This platform blocked the server request. Please try another public video link.",
//     };
//   }

//   const isRedditError =
//     lowerError.includes("[reddit]") || lowerError.includes("reddit");

//   if (isRedditError) {
//     return {
//       statusCode: 422,
//       code: "REDDIT_EXTRACT_FAILED",
//       error:
//         "Reddit could not process this post. Try another public native Reddit video post.",
//     };
//   }

//   const isFacebookError =
//     lowerError.includes("[facebook]") ||
//     lowerError.includes("facebook") ||
//     lowerError.includes("cannot parse data");

//   if (isFacebookError) {
//     return {
//       statusCode: 422,
//       code: "FACEBOOK_EXTRACT_FAILED",
//       error:
//         "Facebook could not fully process this link. Try another public reel or video URL.",
//     };
//   }

//   const isCookieError =
//     lowerError.includes("cookies") ||
//     lowerError.includes("login") ||
//     lowerError.includes("private") ||
//     lowerError.includes("not available") ||
//     lowerError.includes("sign in") ||
//     lowerError.includes("authentication") ||
//     lowerError.includes("account");

//   if (isCookieError) {
//     return {
//       statusCode: 401,
//       code: "LOGIN_OR_COOKIES_REQUIRED",
//       error:
//         "This video may require login or cookies. Please try another public video link.",
//     };
//   }

//   const isUnsupportedError =
//     lowerError.includes("unsupported url") ||
//     lowerError.includes("no suitable extractor") ||
//     lowerError.includes("not a valid url");

//   if (isUnsupportedError) {
//     return {
//       statusCode: 400,
//       code: "UNSUPPORTED_URL",
//       error:
//         "This website or link format is not supported yet. Please try another valid public video URL.",
//     };
//   }

//   const noFormats =
//     lowerError.includes("no video formats found") ||
//     lowerError.includes("requested format is not available") ||
//     lowerError.includes("no formats found");

//   if (noFormats) {
//     return {
//       statusCode: 422,
//       code: "NO_FORMATS_FOUND",
//       error:
//         "No playable video format was found for this link. Please try another quality or another public video.",
//     };
//   }

//   return {
//     statusCode: 500,
//     code: "MEDIA_EXTRACT_FAILED",
//     error:
//       "Unable to extract this media. Please check the link or try another public video.",
//   };
// };

// const sendPreparedFile = (res, filePath, downloadName) => {
//   if (!fs.existsSync(filePath)) {
//     return sendJsonIfConnected(res, 500, {
//       status: "fail",
//       code: "PREPARED_FILE_NOT_FOUND",
//       error: "Prepared file not found.",
//     });
//   }

//   const stat = fs.statSync(filePath);
//   const finalName = downloadName || path.basename(filePath);

//   res.setHeader("Content-Type", getContentType(filePath));
//   res.setHeader("Content-Length", stat.size);
//   res.setHeader("Content-Disposition", createContentDisposition(finalName));

//   const stream = fs.createReadStream(filePath);

//   stream.pipe(res);

//   stream.on("close", () => {
//     setTimeout(() => {
//       safeDeleteFile(filePath);
//     }, 60 * 1000);
//   });

//   stream.on("error", (err) => {
//     console.log("File stream error:", err.message);

//     if (!res.headersSent) {
//       sendJsonIfConnected(res, 500, {
//         status: "fail",
//         code: "FILE_STREAM_FAILED",
//         error: "Failed to stream file.",
//       });
//     }
//   });
// };

// const getUrlHash = (value = "") => {
//   return crypto
//     .createHash("sha256")
//     .update(String(value))
//     .digest("hex")
//     .slice(0, 32);
// };

// const getPreviewPath = (url) => {
//   const hash = getUrlHash(url);
//   return path.join(previewDir, `${hash}.mp4`);
// };

// const isValidPreparedFile = (filePath) => {
//   try {
//     if (!fs.existsSync(filePath)) return false;

//     const stat = fs.statSync(filePath);
//     return stat.size > 1024;
//   } catch {
//     return false;
//   }
// };

// const getPublicPreviewUrl = (req, originalUrl) => {
//   const baseUrl = `${req.protocol}://${req.get("host")}`;

//   return `${baseUrl}/api/v1/preview?url=${encodeURIComponent(originalUrl)}`;
// };

// const sendVideoFileWithRange = (req, res, filePath) => {
//   if (!fs.existsSync(filePath)) {
//     return sendJsonIfConnected(res, 404, {
//       status: "fail",
//       code: "PREVIEW_FILE_NOT_FOUND",
//       error: "Preview file not found.",
//     });
//   }

//   const stat = fs.statSync(filePath);
//   const fileSize = stat.size;
//   const range = req.headers.range;

//   res.setHeader("Content-Type", "video/mp4");
//   res.setHeader("Accept-Ranges", "bytes");
//   res.setHeader("Cache-Control", "public, max-age=1800");
//   res.setHeader("X-Content-Type-Options", "nosniff");

//   if (!range) {
//     res.status(200);
//     res.setHeader("Content-Length", fileSize);

//     const stream = fs.createReadStream(filePath);

//     stream.on("error", (err) => {
//       console.log("Preview file stream error:", err.message);
//       if (!res.headersSent) {
//         sendJsonIfConnected(res, 500, {
//           status: "fail",
//           code: "PREVIEW_FILE_STREAM_FAILED",
//           error: "Failed to stream preview file.",
//         });
//       }
//     });

//     return stream.pipe(res);
//   }

//   const parts = range.replace(/bytes=/, "").split("-");
//   const start = Number.parseInt(parts[0], 10);
//   const end = parts[1] ? Number.parseInt(parts[1], 10) : fileSize - 1;

//   if (
//     Number.isNaN(start) ||
//     Number.isNaN(end) ||
//     start >= fileSize ||
//     end >= fileSize ||
//     start > end
//   ) {
//     res.status(416);
//     res.setHeader("Content-Range", `bytes */${fileSize}`);
//     return res.end();
//   }

//   const chunkSize = end - start + 1;

//   res.status(206);
//   res.setHeader("Content-Range", `bytes ${start}-${end}/${fileSize}`);
//   res.setHeader("Content-Length", chunkSize);

//   const stream = fs.createReadStream(filePath, { start, end });

//   stream.on("error", (err) => {
//     console.log("Preview range stream error:", err.message);
//     if (!res.headersSent) {
//       sendJsonIfConnected(res, 500, {
//         status: "fail",
//         code: "PREVIEW_RANGE_STREAM_FAILED",
//         error: "Failed to stream preview range.",
//       });
//     }
//   });

//   return stream.pipe(res);
// };

// const buildYtDlpPreviewArgs = (url, outputTemplate) => {
//   return [
//     "--no-playlist",
//     "--force-overwrites",
//     "--no-warnings",
//     "--socket-timeout",
//     "30",
//     "-N",
//     "4",
//     "-f",
//     "bestvideo[ext=mp4][vcodec^=avc1]+bestaudio[ext=m4a]/bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/bestvideo+bestaudio/best",
//     "--merge-output-format",
//     "mp4",
//     "--recode-video",
//     "mp4",
//     "--postprocessor-args",
//     "ffmpeg:-movflags +faststart",
//     "-o",
//     outputTemplate,
//     url,
//   ];
// };

// const createPlayablePreview = (url) => {
//   const outputPath = getPreviewPath(url);

//   if (isValidPreparedFile(outputPath)) {
//     return Promise.resolve(outputPath);
//   }

//   if (previewJobs.has(url)) {
//     return previewJobs.get(url);
//   }

//   const job = new Promise((resolve, reject) => {
//     const hash = getUrlHash(url);
//     const outputTemplate = path.join(previewDir, `${hash}.%(ext)s`);

//     const child = spawn(YTDLP_PATH, buildYtDlpPreviewArgs(url, outputTemplate), {
//       timeout: 600000,
//       windowsHide: true,
//     });

//     let stderr = "";

//     child.stderr.on("data", (data) => {
//       stderr += data.toString();
//     });

//     child.on("error", (err) => {
//       reject(err);
//     });

//     child.on("close", (code) => {
//       if (code !== 0) {
//         const friendly = normalizeErrorMessage(stderr);
//         return reject(
//           Object.assign(new Error(friendly.error), {
//             statusCode: friendly.statusCode,
//             code: friendly.code,
//             details: stderr,
//           })
//         );
//       }

//       const createdFile = fs
//         .readdirSync(previewDir)
//         .find((file) => file.startsWith(hash) && file.endsWith(".mp4"));

//       if (!createdFile) {
//         return reject(new Error("Playable preview file was not created."));
//       }

//       const finalPath = path.join(previewDir, createdFile);

//       if (!isValidPreparedFile(finalPath)) {
//         safeDeleteFile(finalPath);
//         return reject(new Error("Preview file is invalid or empty."));
//       }

//       resolve(finalPath);
//     });
//   });

//   previewJobs.set(url, job);

//   job.finally(() => {
//     previewJobs.delete(url);
//   });

//   return job;
// };

// const cleanupOldFiles = () => {
//   const previewMaxAgeMs = 60 * 60 * 1000;
//   const downloadMaxAgeMs = 30 * 60 * 1000;
//   const now = Date.now();

//   const cleanupDir = (dir, maxAgeMs) => {
//     try {
//       const files = fs.readdirSync(dir);

//       for (const file of files) {
//         const filePath = path.join(dir, file);
//         const stat = fs.statSync(filePath);

//         if (now - stat.mtimeMs > maxAgeMs) {
//           safeDeleteFile(filePath);
//         }
//       }
//     } catch {}
//   };

//   cleanupDir(previewDir, previewMaxAgeMs);
//   cleanupDir(outputDir, downloadMaxAgeMs);
// };

// setInterval(cleanupOldFiles, 30 * 60 * 1000);

// const isMetricOnlyTitle = (value = "") => {
//   const text = String(value).trim().toLowerCase();

//   if (!text) return true;

//   return (
//     /^\d+(\.\d+)?[kmb]?\s+(views|reactions|shares|comments)/i.test(text) ||
//     text.includes("reactions") ||
//     text.includes("shares") ||
//     text === "follow" ||
//     text === "like" ||
//     text.length < 3
//   );
// };

// const getCleanTitle = (data = {}) => {
//   const rawTitle = data.title || data.fulltitle || "";
//   const description = data.description || "";
//   const uploader = data.uploader || "";

//   const lines = description
//     .split("\n")
//     .map((line) => line.replace(/\s+/g, " ").trim())
//     .filter(Boolean);

//   let title =
//     lines.find((line) => !isMetricOnlyTitle(line)) ||
//     rawTitle ||
//     uploader ||
//     "Video";

//   title = title
//     .replace(/\s+/g, " ")
//     .replace(
//       /^\d+(\.\d+)?[KMB]?\s+views\s*·\s*\d+(\.\d+)?[KMB]?\s+reactions\s*\|\s*/i,
//       ""
//     )
//     .replace(/^\d+(\.\d+)?[KMB]?\s+views\s*\|\s*/i, "")
//     .replace(
//       /^\d+(\.\d+)?[KMB]?\s+reactions\s*·\s*\d+(\.\d+)?[KMB]?\s+shares/i,
//       ""
//     )
//     .split("Download the app")[0]
//     .split("LINK IN BIO")[0]
//     .split("Cast:")[0]
//     .split("#")[0]
//     .trim();

//   if (title.toLowerCase().includes(" is now streaming")) {
//     title = title.split(/ is now streaming/i)[0].trim();
//   }

//   if (isMetricOnlyTitle(title)) {
//     title = uploader || "Video";
//   }

//   return title.slice(0, 70) || "Video";
// };

// const formatDuration = (seconds) => {
//   if (
//     seconds === null ||
//     seconds === undefined ||
//     Number.isNaN(Number(seconds))
//   ) {
//     return null;
//   }

//   const totalSeconds = Math.floor(Number(seconds));
//   const hours = Math.floor(totalSeconds / 3600);
//   const minutes = Math.floor((totalSeconds % 3600) / 60);
//   const remainingSeconds = totalSeconds % 60;

//   if (hours > 0) {
//     return `${hours}:${String(minutes).padStart(2, "0")}:${String(
//       remainingSeconds
//     ).padStart(2, "0")}`;
//   }

//   return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
// };

// const formatSize = (bytes, estimated = false) => {
//   const size = Number(bytes);

//   if (!size || Number.isNaN(size) || size <= 0) {
//     return estimated ? "Approx. 1 MB" : "1 MB";
//   }

//   const kb = size / 1024;
//   const mb = kb / 1024;
//   const gb = mb / 1024;

//   let label = "";

//   if (gb >= 1) {
//     label = `${gb.toFixed(1)} GB`;
//   } else if (mb >= 100) {
//     label = `${Math.round(mb)} MB`;
//   } else if (mb >= 10) {
//     label = `${mb.toFixed(1)} MB`;
//   } else if (mb >= 1) {
//     label = `${mb.toFixed(1)} MB`;
//   } else {
//     label = `${Math.max(1, Math.round(kb))} KB`;
//   }

//   return estimated ? `Approx. ${label}` : label;
// };

// const getDirectSizeBytes = (item = {}) => {
//   const candidates = [
//     item.filesize,
//     item.filesize_approx,
//     item.size,
//     item.file_size,
//     item.content_length,
//   ];

//   for (const candidate of candidates) {
//     const value = Number(candidate);

//     if (value && !Number.isNaN(value) && value > 0) {
//       return value;
//     }
//   }

//   return null;
// };

// const estimateSizeFromBitrate = (item = {}, durationSeconds) => {
//   const duration = Number(durationSeconds || item.duration || 0);

//   if (!duration || Number.isNaN(duration) || duration <= 0) {
//     return null;
//   }

//   const bitrateKbps =
//     Number(item.tbr || 0) ||
//     Number(item.vbr || 0) ||
//     Number(item.abr || 0) ||
//     Number(item.bitrate || 0);

//   if (!bitrateKbps || Number.isNaN(bitrateKbps) || bitrateKbps <= 0) {
//     return null;
//   }

//   return (bitrateKbps * 1000 * duration) / 8;
// };

// const getEstimatedVideoBitrateKbps = (item = {}) => {
//   const height = Number(item.height || 0);

//   if (height >= 4320) return 35000;
//   if (height >= 2160) return 16000;
//   if (height >= 1440) return 9000;
//   if (height >= 1080) return 5200;
//   if (height >= 720) return 2800;
//   if (height >= 480) return 1300;
//   if (height >= 360) return 800;
//   if (height >= 240) return 450;

//   if (item.width && item.height) return 800;

//   return 600;
// };

// const estimateVideoSizeFromResolution = (item = {}, durationSeconds) => {
//   const duration = Number(durationSeconds || item.duration || 0);

//   if (!duration || Number.isNaN(duration) || duration <= 0) {
//     return null;
//   }

//   let bitrateKbps = getEstimatedVideoBitrateKbps(item);

//   if (String(item.ext || "").toLowerCase() === "webm") {
//     bitrateKbps *= 0.85;
//   }

//   return (bitrateKbps * 1000 * duration) / 8;
// };

// const estimateAudioSize = (item = {}, durationSeconds) => {
//   const duration = Number(durationSeconds || item.duration || 0);

//   if (!duration || Number.isNaN(duration) || duration <= 0) {
//     return null;
//   }

//   const bitrateKbps =
//     Number(item.abr || 0) ||
//     Number(item.tbr || 0) ||
//     Number(item.asr ? 128 : 0) ||
//     128;

//   return (bitrateKbps * 1000 * duration) / 8;
// };

// const getFallbackSizeBytes = (type = "video", durationSeconds) => {
//   const duration = Number(durationSeconds || 0);

//   if (duration && !Number.isNaN(duration) && duration > 0) {
//     if (type === "audio") {
//       return (128 * 1000 * duration) / 8;
//     }

//     return (900 * 1000 * duration) / 8;
//   }

//   if (type === "audio") {
//     return 512 * 1024;
//   }

//   return 2 * 1024 * 1024;
// };

// const getFormatSizeInfo = (item = {}, durationSeconds, type = "video") => {
//   const exactBytes = getDirectSizeBytes(item);

//   if (exactBytes) {
//     return {
//       size: formatSize(exactBytes, false),
//       sizeBytes: Math.round(exactBytes),
//       sizeEstimated: false,
//     };
//   }

//   const bitrateEstimate = estimateSizeFromBitrate(item, durationSeconds);

//   if (bitrateEstimate) {
//     return {
//       size: formatSize(bitrateEstimate, true),
//       sizeBytes: Math.round(bitrateEstimate),
//       sizeEstimated: true,
//     };
//   }

//   const smartEstimate =
//     type === "audio"
//       ? estimateAudioSize(item, durationSeconds)
//       : estimateVideoSizeFromResolution(item, durationSeconds);

//   if (smartEstimate) {
//     return {
//       size: formatSize(smartEstimate, true),
//       sizeBytes: Math.round(smartEstimate),
//       sizeEstimated: true,
//     };
//   }

//   const fallbackSize = getFallbackSizeBytes(type, durationSeconds);

//   return {
//     size: formatSize(fallbackSize, true),
//     sizeBytes: Math.round(fallbackSize),
//     sizeEstimated: true,
//   };
// };

// const getAspectRatio = (width, height, ytAspectRatio) => {
//   if (ytAspectRatio && Number(ytAspectRatio) < 0.8) return "portrait";
//   if (ytAspectRatio && Number(ytAspectRatio) > 1.2) return "landscape";

//   if (
//     ytAspectRatio &&
//     Number(ytAspectRatio) >= 0.8 &&
//     Number(ytAspectRatio) <= 1.2
//   ) {
//     return "square";
//   }

//   if (!width || !height) return "landscape";
//   if (height > width) return "portrait";
//   if (width === height) return "square";

//   return "landscape";
// };

// const getQualityLabel = (item) => {
//   const height = Number(item.height || 0);

//   if (height >= 4320) return "4320p (8K)";
//   if (height >= 2160) return "2160p (4K)";
//   if (height >= 1440) return "1440p (2K)";
//   if (height >= 1080) return "1080p (Full HD)";
//   if (height >= 720) return "720p (HD)";
//   if (height >= 480) return "480p (SD)";
//   if (height >= 360) return "360p";
//   if (height >= 240) return "240p";

//   if (item.width && item.height) {
//     return `${item.width}×${item.height}`;
//   }

//   return item.format_note || item.resolution || item.format_id || "Default";
// };

// const getSortHeight = (quality = "") => {
//   if (quality.includes("4320")) return 4320;
//   if (quality.includes("2160")) return 2160;
//   if (quality.includes("1440")) return 1440;
//   if (quality.includes("1080")) return 1080;
//   if (quality.includes("720")) return 720;
//   if (quality.includes("480")) return 480;
//   if (quality.includes("360")) return 360;
//   if (quality.includes("240")) return 240;

//   return Number(String(quality).match(/\d+/)?.[0]) || 0;
// };

// exports.postMedia = async (req, res, next) => {
//   try {
//     const url = req.body.urls;

//     if (
//       !url ||
//       typeof url !== "string" ||
//       (!url.startsWith("http://") && !url.startsWith("https://"))
//     ) {
//       return res.status(400).json({
//         status: "fail",
//         code: "INVALID_URL",
//         error: "Valid URL is required",
//       });
//     }

//     const ytDlp = spawn(
//       YTDLP_PATH,
//       [
//         "-J",
//         "--no-playlist",
//         "--no-warnings",
//         "--socket-timeout",
//         "20",
//         url,
//       ],
//       {
//         timeout: 60000,
//         windowsHide: true,
//       }
//     );

//     let stdout = "";
//     let stderr = "";
//     let isResponded = false;

//     ytDlp.stdout.on("data", (data) => {
//       stdout += data.toString();
//     });

//     ytDlp.stderr.on("data", (data) => {
//       stderr += data.toString();
//     });

//     ytDlp.on("error", (err) => {
//       if (isResponded) return;
//       isResponded = true;

//       console.log("yt-dlp process error:", err.message);

//       return res.status(500).json({
//         status: "fail",
//         code: "YTDLP_NOT_FOUND",
//         error:
//           "yt-dlp is not installed or failed to start. Please install or update yt-dlp on the server.",
//       });
//     });

//     ytDlp.on("close", async (code) => {
//       if (isResponded) return;

//       let data = null;

//       if (stdout) {
//         try {
//           data = JSON.parse(stdout);
//         } catch {
//           data = null;
//         }
//       }

//       if (code !== 0 && !data) {
//         isResponded = true;

//         const friendlyError = normalizeErrorMessage(stderr);

//         return res.status(friendlyError.statusCode).json({
//           status: "fail",
//           code: friendlyError.code,
//           error: friendlyError.error,
//           details: stderr || "Unknown yt-dlp error",
//         });
//       }

//       if (!data) {
//         isResponded = true;

//         return res.status(500).json({
//           status: "fail",
//           code: "INVALID_YTDLP_RESPONSE",
//           error: "Invalid yt-dlp response. Please try another video link.",
//         });
//       }

//       const allFormats = Array.isArray(data.formats) ? data.formats : [];

//       const audioFormats = allFormats
//         .filter((item) => {
//           return (
//             item.url &&
//             item.acodec &&
//             item.acodec !== "none" &&
//             (!item.vcodec || item.vcodec === "none")
//           );
//         })
//         .map((item) => {
//           const sizeInfo = getFormatSizeInfo(item, data.duration, "audio");

//           return {
//             type: "audio",
//             url: item.url,
//             quality:
//               item.abr || item.asr
//                 ? `${Math.round(item.abr || item.asr)} kbps`
//                 : item.format_note || "Audio",
//             ext: item.ext || "m4a",
//             size: sizeInfo.size,
//             sizeBytes: sizeInfo.sizeBytes,
//             sizeEstimated: sizeInfo.sizeEstimated,
//             formatId: item.format_id || "",
//             width: null,
//             height: null,
//             fps: null,
//             vcodec: item.vcodec || "",
//             acodec: item.acodec || "",
//             hasAudio: true,
//             audioUrl: "",
//             audioFormatId: item.format_id || "",
//             aspectRatio: "audio",
//           };
//         })
//         .filter(
//           (item, index, self) =>
//             index ===
//             self.findIndex(
//               (x) => x.quality === item.quality && x.ext === item.ext
//             )
//         )
//         .slice(0, 8);

//       const bestAudio =
//         audioFormats.find((item) => item.ext === "m4a") ||
//         audioFormats[0] ||
//         null;

//       const progressiveVideoFormats = allFormats
//         .filter((item) => {
//           return (
//             item.url &&
//             item.vcodec &&
//             item.vcodec !== "none" &&
//             item.acodec &&
//             item.acodec !== "none" &&
//             ["mp4", "webm"].includes(item.ext)
//           );
//         })
//         .map((item) => {
//           const sizeInfo = getFormatSizeInfo(item, data.duration, "video");

//           return {
//             type: "video",
//             url: item.url,
//             quality: getQualityLabel(item),
//             ext: item.ext || "mp4",
//             size: sizeInfo.size,
//             sizeBytes: sizeInfo.sizeBytes,
//             sizeEstimated: sizeInfo.sizeEstimated,
//             formatId: item.format_id || "",
//             width: item.width || null,
//             height: item.height || null,
//             fps: item.fps || null,
//             vcodec: item.vcodec || "",
//             acodec: item.acodec || "",
//             hasAudio: true,
//             audioUrl: "",
//             audioFormatId: "",
//             aspectRatio: getAspectRatio(
//               item.width,
//               item.height,
//               item.aspect_ratio
//             ),
//           };
//         });

//       const dashVideoFormats = allFormats
//         .filter((item) => {
//           return (
//             item.url &&
//             item.vcodec &&
//             item.vcodec !== "none" &&
//             (!item.acodec || item.acodec === "none") &&
//             ["mp4", "webm"].includes(item.ext)
//           );
//         })
//         .map((item) => {
//           const sizeInfo = getFormatSizeInfo(item, data.duration, "video");

//           return {
//             type: "video",
//             url: item.url,
//             quality: getQualityLabel(item),
//             ext: item.ext || "mp4",
//             size: sizeInfo.size,
//             sizeBytes: sizeInfo.sizeBytes,
//             sizeEstimated: sizeInfo.sizeEstimated,
//             formatId: item.format_id || "",
//             width: item.width || null,
//             height: item.height || null,
//             fps: item.fps || null,
//             vcodec: item.vcodec || "",
//             acodec: item.acodec || "none",
//             hasAudio: false,
//             audioUrl: bestAudio?.url || "",
//             audioFormatId: bestAudio?.formatId || "",
//             aspectRatio: getAspectRatio(
//               item.width,
//               item.height,
//               item.aspect_ratio
//             ),
//           };
//         });

//       const videoFormats = [...progressiveVideoFormats, ...dashVideoFormats]
//         .filter(
//           (item, index, self) =>
//             index ===
//             self.findIndex(
//               (x) =>
//                 x.quality === item.quality &&
//                 x.ext === item.ext &&
//                 x.aspectRatio === item.aspectRatio
//             )
//         )
//         .sort((a, b) => {
//           const byHeight = getSortHeight(b.quality) - getSortHeight(a.quality);

//           if (byHeight !== 0) return byHeight;

//           if (a.ext === "mp4" && b.ext !== "mp4") return -1;
//           if (a.ext !== "mp4" && b.ext === "mp4") return 1;

//           if (a.hasAudio && !b.hasAudio) return -1;
//           if (!a.hasAudio && b.hasAudio) return 1;

//           return Number(b.sizeBytes || 0) - Number(a.sizeBytes || 0);
//         })
//         .slice(0, 10);

//       const bestPreview =
//         videoFormats.find((item) => item.hasAudio && item.ext === "mp4") ||
//         videoFormats.find((item) => item.ext === "mp4") ||
//         videoFormats[0] ||
//         null;

//       const originalPageUrl = data.webpage_url || url;
//       const playablePreviewUrl = getPublicPreviewUrl(req, originalPageUrl);

//       isResponded = true;

//       res.status(200).json({
//         status: "success",
//         platform: data.extractor_key || data.extractor || "unknown",
//         title: getCleanTitle(data),
//         originalTitle: data.title || data.fulltitle || "Media",
//         uploader: data.uploader || "",
//         thumb: data.thumbnail || "",
//         duration: data.duration || null,
//         durationText:
//           formatDuration(data.duration) || data.duration_string || "--",
//         viewCount: data.view_count || null,
//         webpage_url: originalPageUrl,
//         aspectRatio: bestPreview?.aspectRatio || "landscape",

//         previewUrl: playablePreviewUrl,
//         previewMode: "server-prepared",
//         previewHasAudio: true,
//         previewAudioUrl: "",

//         rawPreviewUrl: bestPreview?.url || "",
//         rawPreviewHasAudio: Boolean(bestPreview?.hasAudio),
//         rawPreviewAudioUrl:
//           bestPreview && !bestPreview.hasAudio ? bestPreview.audioUrl : "",

//         video: videoFormats,
//         audio: audioFormats,
//         urls: [...videoFormats, ...audioFormats],
//       });

//       if (req.users) {
//         req.users.addActivity({ mediaUrl: url }).catch((err) => {
//           console.log("Activity save error:", err.message);
//         });
//       }
//     });
//   } catch (err) {
//     console.log("Media API error:", err.message);

//     if (!res.headersSent) {
//       res.status(500).json({
//         status: "fail",
//         code: "SERVER_ERROR",
//         error: "Download failed. Please try again.",
//       });
//     }

//     next(err);
//   }
// };

// exports.previewMedia = async (req, res) => {
//   try {
//     const url = req.query.url;

//     if (
//       !url ||
//       typeof url !== "string" ||
//       (!url.startsWith("http://") && !url.startsWith("https://"))
//     ) {
//       return res.status(400).json({
//         status: "fail",
//         code: "INVALID_PREVIEW_URL",
//         error: "Valid preview URL is required.",
//       });
//     }

//     const previewPath = await createPlayablePreview(url);

//     return sendVideoFileWithRange(req, res, previewPath);
//   } catch (err) {
//     console.log("Preview prepare error:", err.message);

//     if (res.headersSent || res.destroyed || res.writableEnded) {
//       return;
//     }

//     return sendJsonIfConnected(res, err.statusCode || 500, {
//       status: "fail",
//       code: err.code || "PREVIEW_STREAM_FAILED",
//       error:
//         err.message ||
//         "Preview could not be prepared. This video may be restricted.",
//       details: err.details || err.message,
//     });
//   }
// };

// exports.downloadDirectMedia = async (req, res) => {
//   let childProcess = null;
//   let hasFinished = false;
//   let clientCancelled = false;
//   let outputPathToClean = "";

//   const cleanupProcess = () => {
//     clientCancelled = true;

//     if (childProcess && !childProcess.killed) {
//       try {
//         childProcess.kill("SIGKILL");
//       } catch {}
//     }

//     if (outputPathToClean) {
//       safeDeleteFile(outputPathToClean);
//     }
//   };

//   req.on("aborted", cleanupProcess);

//   res.on("close", () => {
//     if (!hasFinished) {
//       cleanupProcess();
//     }
//   });

//   try {
//     const {
//       type,
//       title,
//       originalUrl,
//       videoUrl,
//       audioUrl,
//       videoFormatId,
//       audioFormatId,
//       hasAudio,
//     } = req.body;

//     const safeTitle = sanitizeFileName(title || "linkflow-download");
//     const timestamp = Date.now();
//     const extension = type === "audio" ? "mp3" : "mp4";

//     const outputPath = path.join(
//       outputDir,
//       `${safeTitle}-${timestamp}.${extension}`
//     );

//     outputPathToClean = outputPath;

//     const originalUrlValue = String(originalUrl || "");

//     const shouldUseYtDlp = Boolean(originalUrlValue);

//     if (shouldUseYtDlp) {
//       const outputTemplate = path.join(
//         outputDir,
//         `${safeTitle}-${timestamp}.%(ext)s`
//       );

//       const args = [
//         "--no-playlist",
//         "--newline",
//         "--force-overwrites",
//         "--no-warnings",
//         "--socket-timeout",
//         "30",
//         "-N",
//         "4",
//       ];

//       if (type === "audio") {
//         args.push(
//           "-f",
//           audioFormatId || "bestaudio/best",
//           "-x",
//           "--audio-format",
//           "mp3",
//           "--audio-quality",
//           "0",
//           "-o",
//           outputTemplate,
//           originalUrlValue
//         );
//       } else {
//         let formatSpec =
//           "bestvideo[ext=mp4][vcodec^=avc1]+bestaudio[ext=m4a]/bestvideo[ext=mp4]+bestaudio[ext=m4a]/bestvideo+bestaudio/best";

//         if (videoFormatId && audioFormatId) {
//           formatSpec = `${videoFormatId}+${audioFormatId}/${videoFormatId}+bestaudio/bestvideo+bestaudio/best`;
//         } else if (videoFormatId) {
//           formatSpec = `${videoFormatId}+bestaudio/${videoFormatId}/bestvideo+bestaudio/best`;
//         } else if (hasAudio === true || hasAudio === "true") {
//           formatSpec =
//             "best[ext=mp4]/bestvideo[ext=mp4]+bestaudio[ext=m4a]/bestvideo+bestaudio/best";
//         }

//         args.push(
//           "-f",
//           formatSpec,
//           "--merge-output-format",
//           "mp4",
//           "--recode-video",
//           "mp4",
//           "--postprocessor-args",
//           "ffmpeg:-movflags +faststart",
//           "-o",
//           outputTemplate,
//           originalUrlValue
//         );
//       }

//       childProcess = spawn(YTDLP_PATH, args, {
//         timeout: 600000,
//         windowsHide: true,
//       });

//       let stderr = "";
//       let isResponded = false;

//       childProcess.stderr.on("data", (data) => {
//         stderr += data.toString();
//       });

//       childProcess.on("error", (err) => {
//         if (isResponded || clientCancelled || isClientDisconnected(res)) return;

//         isResponded = true;
//         hasFinished = true;

//         console.log("yt-dlp start error:", err.message);

//         return sendJsonIfConnected(res, 500, {
//           status: "fail",
//           code: "YTDLP_DOWNLOAD_START_FAILED",
//           error: "Download engine failed to start.",
//           details: err.message,
//         });
//       });

//       childProcess.on("close", (code, signal) => {
//         if (isResponded) return;

//         if (
//           clientCancelled ||
//           signal === "SIGKILL" ||
//           isClientDisconnected(res)
//         ) {
//           hasFinished = true;
//           safeDeleteFile(outputPathToClean);
//           return;
//         }

//         if (code !== 0) {
//           isResponded = true;
//           hasFinished = true;

//           const friendly = normalizeErrorMessage(stderr);
//           const cleanError = getCleanProcessError(stderr);

//           console.log("yt-dlp download failed:", cleanError);

//           return sendJsonIfConnected(res, friendly.statusCode || 500, {
//             status: "fail",
//             code: friendly.code || "YTDLP_DOWNLOAD_FAILED",
//             error: friendly.error || "Download was not completed.",
//             details: cleanError,
//           });
//         }

//         const files = fs
//           .readdirSync(outputDir)
//           .filter((file) => file.startsWith(`${safeTitle}-${timestamp}`));

//         if (!files.length) {
//           isResponded = true;
//           hasFinished = true;

//           return sendJsonIfConnected(res, 500, {
//             status: "fail",
//             code: "DOWNLOADED_FILE_NOT_FOUND",
//             error: "Prepared file not found.",
//           });
//         }

//         const preferredExt = type === "audio" ? ".mp3" : ".mp4";

//         const selectedFile =
//           files.find((file) => file.endsWith(preferredExt)) || files[0];

//         const filePath = path.join(outputDir, selectedFile);

//         if (!isValidPreparedFile(filePath)) {
//           safeDeleteFile(filePath);

//           isResponded = true;
//           hasFinished = true;

//           return sendJsonIfConnected(res, 500, {
//             status: "fail",
//             code: "DOWNLOADED_FILE_INVALID",
//             error: "Downloaded file is invalid or empty.",
//           });
//         }

//         const finalName = `${safeTitle}.${type === "audio" ? "mp3" : "mp4"}`;

//         outputPathToClean = filePath;
//         isResponded = true;
//         hasFinished = true;

//         return sendPreparedFile(res, filePath, finalName);
//       });

//       return;
//     }

//     if (type === "video" && !videoUrl) {
//       hasFinished = true;

//       return sendJsonIfConnected(res, 400, {
//         status: "fail",
//         code: "VIDEO_URL_REQUIRED",
//         error: "Video URL is required.",
//       });
//     }

//     if (type === "audio" && !audioUrl && !videoUrl) {
//       hasFinished = true;

//       return sendJsonIfConnected(res, 400, {
//         status: "fail",
//         code: "AUDIO_URL_REQUIRED",
//         error: "Audio URL is required.",
//       });
//     }

//     const args = ["-hide_banner", "-loglevel", "error", "-nostdin"];

//     if (type === "audio") {
//       args.push(
//         "-y",
//         "-i",
//         audioUrl || videoUrl,
//         "-vn",
//         "-codec:a",
//         "libmp3lame",
//         "-b:a",
//         "192k",
//         outputPath
//       );
//     } else if (audioUrl) {
//       args.push(
//         "-y",
//         "-i",
//         videoUrl,
//         "-i",
//         audioUrl,
//         "-map",
//         "0:v:0",
//         "-map",
//         "1:a:0",
//         "-c:v",
//         "copy",
//         "-c:a",
//         "aac",
//         "-b:a",
//         "192k",
//         "-movflags",
//         "+faststart",
//         "-shortest",
//         outputPath
//       );
//     } else {
//       args.push(
//         "-y",
//         "-i",
//         videoUrl,
//         "-i",
//         "anullsrc=channel_layout=stereo:sample_rate=44100",
//         "-f",
//         "lavfi",
//         "-shortest",
//         "-c:v",
//         "copy",
//         "-c:a",
//         "aac",
//         "-movflags",
//         "+faststart",
//         outputPath
//       );
//     }

//     childProcess = spawn(FFMPEG_PATH, args, {
//       timeout: 600000,
//       windowsHide: true,
//     });

//     let stderr = "";
//     let isResponded = false;

//     childProcess.stderr.on("data", (data) => {
//       stderr += data.toString();
//     });

//     childProcess.on("error", (err) => {
//       if (isResponded || clientCancelled || isClientDisconnected(res)) return;

//       isResponded = true;
//       hasFinished = true;

//       console.log("FFmpeg start error:", err.message);

//       return sendJsonIfConnected(res, 500, {
//         status: "fail",
//         code: "FFMPEG_START_FAILED",
//         error:
//           "Download engine failed to start. Please check FFmpeg installation.",
//         details: err.message,
//       });
//     });

//     childProcess.on("close", (code, signal) => {
//       if (isResponded) return;

//       if (clientCancelled || signal === "SIGKILL" || isClientDisconnected(res)) {
//         hasFinished = true;
//         safeDeleteFile(outputPath);
//         return;
//       }

//       if (code !== 0) {
//         isResponded = true;
//         hasFinished = true;

//         safeDeleteFile(outputPath);

//         const cleanError = getCleanProcessError(stderr);
//         console.log("FFmpeg merge failed:", cleanError);

//         return sendJsonIfConnected(res, 500, {
//           status: "fail",
//           code: "FFMPEG_MERGE_FAILED",
//           error: "Download was not completed. Please try another quality.",
//           details: cleanError,
//         });
//       }

//       if (!fs.existsSync(outputPath)) {
//         isResponded = true;
//         hasFinished = true;

//         return sendJsonIfConnected(res, 500, {
//           status: "fail",
//           code: "PREPARED_FILE_NOT_FOUND",
//           error: "Prepared file not found.",
//         });
//       }

//       isResponded = true;
//       hasFinished = true;

//       return sendPreparedFile(res, outputPath, `${safeTitle}.${extension}`);
//     });
//   } catch (err) {
//     hasFinished = true;

//     if (clientCancelled || isClientDisconnected(res)) {
//       return;
//     }

//     console.log("Direct download error:", err.message);

//     return sendJsonIfConnected(res, 500, {
//       status: "fail",
//       code: "DIRECT_DOWNLOAD_FAILED",
//       error: "Download failed. Please try again.",
//     });
//   }
// };

// exports.proxyImage = async (req, res) => {
//   try {
//     const imageUrl = req.query.url;

//     if (!imageUrl) {
//       return res.status(400).json({
//         status: "fail",
//         code: "IMAGE_URL_REQUIRED",
//         error: "Image URL is required",
//       });
//     }

//     if (
//       typeof imageUrl !== "string" ||
//       (!imageUrl.startsWith("http://") && !imageUrl.startsWith("https://"))
//     ) {
//       return res.status(400).json({
//         status: "fail",
//         code: "INVALID_IMAGE_URL",
//         error: "Invalid image URL",
//       });
//     }

//     const response = await fetch(imageUrl);

//     if (!response.ok) {
//       return res.status(400).json({
//         status: "fail",
//         code: "IMAGE_FETCH_FAILED",
//         error: "Failed to fetch image",
//       });
//     }

//     const contentType = response.headers.get("content-type") || "image/jpeg";
//     res.setHeader("Content-Type", contentType);

//     const arrayBuffer = await response.arrayBuffer();
//     const buffer = Buffer.from(arrayBuffer);

//     return res.send(buffer);
//   } catch (err) {
//     console.log("Proxy image error:", err.message);

//     return res.status(500).json({
//       status: "fail",
//       code: "IMAGE_PROXY_FAILED",
//       error: "Image proxy failed",
//     });
//   }
// };





const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

const FFMPEG_PATH = process.env.FFMPEG_PATH || "ffmpeg";
const YTDLP_PATH = process.env.YTDLP_PATH || "yt-dlp";

exports.startApi = (req, res) => {
  res.status(200).json({ message: "Welcome To Vidown Api" });
};

const outputDir = path.join(__dirname, "..", "downloads");
const previewDir = path.join(__dirname, "..", "previews");

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

if (!fs.existsSync(previewDir)) {
  fs.mkdirSync(previewDir, { recursive: true });
}

/**
 * Change this whenever preview logic changes.
 * This avoids old cached silent/broken preview files.
 */
const PREVIEW_CACHE_VERSION = "v7-stable-audio-preview";

const previewJobs = new Map();

const sanitizeFileName = (value = "linkflow-download") => {
  const cleaned = String(value || "linkflow-download")
    .normalize("NFKD")
    .replace(/[^\x20-\x7E]/g, "")
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80);

  return cleaned || "linkflow-download";
};

const encodeRFC5987ValueChars = (value) => {
  return encodeURIComponent(value)
    .replace(/['()*]/g, (char) =>
      `%${char.charCodeAt(0).toString(16).toUpperCase()}`
    )
    .replace(/%(7C|60|5E)/g, (match) => match.toLowerCase());
};

const createContentDisposition = (filename) => {
  const fallbackName = sanitizeFileName(filename || "linkflow-download");
  const encodedName = encodeRFC5987ValueChars(filename || fallbackName);

  return `attachment; filename="${fallbackName}"; filename*=UTF-8''${encodedName}`;
};

const safeDeleteFile = (filePath) => {
  if (!filePath) return;
  fs.unlink(filePath, () => {});
};

const getContentType = (filePath) => {
  const ext = path.extname(filePath).toLowerCase();

  if (ext === ".mp3") return "audio/mpeg";
  if (ext === ".m4a") return "audio/mp4";
  if (ext === ".webm") return "video/webm";
  if (ext === ".mp4") return "video/mp4";

  return "application/octet-stream";
};

const isClientDisconnected = (res) => {
  return res.destroyed || res.writableEnded;
};

const sendJsonIfConnected = (res, statusCode, payload) => {
  if (res.destroyed || res.writableEnded || res.headersSent) {
    return;
  }

  return res.status(statusCode).json(payload);
};

const getCleanProcessError = (stderr = "") => {
  const text = String(stderr || "").trim();

  if (!text) return "Process stopped before completion.";

  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const importantLine =
    [...lines]
      .reverse()
      .find((line) =>
        /error|failed|invalid|unable|not found|permission|denied|forbidden|too many requests|sign in|cookies|bot|rate/i.test(
          line
        )
      ) || lines[0];

  return importantLine || "Download process failed.";
};

const normalizeErrorMessage = (stderr = "") => {
  const lowerError = String(stderr || "").toLowerCase();

  const isRateLimited =
    lowerError.includes("429") ||
    lowerError.includes("too many requests") ||
    lowerError.includes("rate limit") ||
    lowerError.includes("rate-limit") ||
    lowerError.includes("rate-limited") ||
    lowerError.includes("ratelimited");

  if (isRateLimited) {
    return {
      statusCode: 429,
      code: "RATE_LIMITED",
      error:
        "This platform is rate-limiting the server. Please wait and try again later.",
    };
  }

  const isYouTubeBlocked =
    lowerError.includes("[youtube]") &&
    (lowerError.includes("sign in to confirm") ||
      lowerError.includes("not a bot") ||
      lowerError.includes("confirm you") ||
      lowerError.includes("cookies-from-browser") ||
      lowerError.includes("use --cookies") ||
      lowerError.includes("robot") ||
      lowerError.includes("bot"));

  if (isYouTubeBlocked) {
    return {
      statusCode: 403,
      code: "YOUTUBE_BLOCKED_ON_SERVER",
      error:
        "YouTube blocked this server request. This usually happens on cloud/server IPs. Please try another platform for now.",
    };
  }

  const isInstagramError =
    lowerError.includes("[instagram]") || lowerError.includes("instagram");

  if (isInstagramError) {
    if (
      lowerError.includes("rate-limit") ||
      lowerError.includes("rate limit") ||
      lowerError.includes("too many requests")
    ) {
      return {
        statusCode: 429,
        code: "INSTAGRAM_RATE_LIMITED",
        error:
          "Instagram is rate-limiting the server. Please wait and try again later, or try another public reel.",
      };
    }

    if (
      lowerError.includes("login") ||
      lowerError.includes("cookies") ||
      lowerError.includes("not available") ||
      lowerError.includes("requested content is not available") ||
      lowerError.includes("private")
    ) {
      return {
        statusCode: 401,
        code: "INSTAGRAM_LOGIN_REQUIRED",
        error:
          "Instagram could not access this content. It may be private, unavailable, rate-limited, or require login/cookies.",
      };
    }
  }

  const isForbidden =
    lowerError.includes("403") ||
    lowerError.includes("forbidden") ||
    lowerError.includes("access denied");

  if (isForbidden) {
    return {
      statusCode: 403,
      code: "PLATFORM_FORBIDDEN",
      error:
        "This platform blocked the server request. Please try another public video link.",
    };
  }

  const isRedditError =
    lowerError.includes("[reddit]") || lowerError.includes("reddit");

  if (isRedditError) {
    return {
      statusCode: 422,
      code: "REDDIT_EXTRACT_FAILED",
      error:
        "Reddit could not process this post. Try another public native Reddit video post.",
    };
  }

  const isFacebookError =
    lowerError.includes("[facebook]") ||
    lowerError.includes("facebook") ||
    lowerError.includes("cannot parse data");

  if (isFacebookError) {
    return {
      statusCode: 422,
      code: "FACEBOOK_EXTRACT_FAILED",
      error:
        "Facebook could not fully process this link. Try another public reel or video URL.",
    };
  }

  const isCookieError =
    lowerError.includes("cookies") ||
    lowerError.includes("login") ||
    lowerError.includes("private") ||
    lowerError.includes("not available") ||
    lowerError.includes("sign in") ||
    lowerError.includes("authentication") ||
    lowerError.includes("account");

  if (isCookieError) {
    return {
      statusCode: 401,
      code: "LOGIN_OR_COOKIES_REQUIRED",
      error:
        "This video may require login or cookies. Please try another public video link.",
    };
  }

  const isUnsupportedError =
    lowerError.includes("unsupported url") ||
    lowerError.includes("no suitable extractor") ||
    lowerError.includes("not a valid url");

  if (isUnsupportedError) {
    return {
      statusCode: 400,
      code: "UNSUPPORTED_URL",
      error:
        "This website or link format is not supported yet. Please try another valid public video URL.",
    };
  }

  const noFormats =
    lowerError.includes("no video formats found") ||
    lowerError.includes("requested format is not available") ||
    lowerError.includes("no formats found");

  if (noFormats) {
    return {
      statusCode: 422,
      code: "NO_FORMATS_FOUND",
      error:
        "No playable video format was found for this link. Please try another quality or another public video.",
    };
  }

  return {
    statusCode: 500,
    code: "MEDIA_EXTRACT_FAILED",
    error:
      "Unable to extract this media. Please check the link or try another public video.",
  };
};

const getUrlHash = (value = "") => {
  return crypto
    .createHash("sha256")
    .update(`${PREVIEW_CACHE_VERSION}:${String(value)}`)
    .digest("hex")
    .slice(0, 32);
};

const getPreviewPath = (url) => {
  const hash = getUrlHash(url);
  return path.join(previewDir, `${hash}.mp4`);
};

const isValidPreparedFile = (filePath) => {
  try {
    if (!fs.existsSync(filePath)) return false;

    const stat = fs.statSync(filePath);
    return stat.size > 1024;
  } catch {
    return false;
  }
};

const getPublicPreviewUrl = (req, originalUrl) => {
  const baseUrl = `${req.protocol}://${req.get("host")}`;

  return `${baseUrl}/api/v1/preview?url=${encodeURIComponent(originalUrl)}`;
};

const sendPreparedFile = (res, filePath, downloadName) => {
  if (!fs.existsSync(filePath)) {
    return sendJsonIfConnected(res, 500, {
      status: "fail",
      code: "PREPARED_FILE_NOT_FOUND",
      error: "Prepared file not found.",
    });
  }

  const stat = fs.statSync(filePath);
  const finalName = downloadName || path.basename(filePath);

  res.setHeader("Content-Type", getContentType(filePath));
  res.setHeader("Content-Length", stat.size);
  res.setHeader("Content-Disposition", createContentDisposition(finalName));

  const stream = fs.createReadStream(filePath);

  stream.pipe(res);

  stream.on("close", () => {
    setTimeout(() => {
      safeDeleteFile(filePath);
    }, 60 * 1000);
  });

  stream.on("error", (err) => {
    console.log("File stream error:", err.message);

    if (!res.headersSent) {
      sendJsonIfConnected(res, 500, {
        status: "fail",
        code: "FILE_STREAM_FAILED",
        error: "Failed to stream file.",
      });
    }
  });
};

const sendVideoFileWithRange = (req, res, filePath) => {
  if (!fs.existsSync(filePath)) {
    return sendJsonIfConnected(res, 404, {
      status: "fail",
      code: "PREVIEW_FILE_NOT_FOUND",
      error: "Preview file not found.",
    });
  }

  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;

  res.setHeader("Content-Type", "video/mp4");
  res.setHeader("Accept-Ranges", "bytes");
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  res.setHeader("Surrogate-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");

  if (!range) {
    res.status(200);
    res.setHeader("Content-Length", fileSize);

    const stream = fs.createReadStream(filePath);

    stream.on("error", (err) => {
      console.log("Preview file stream error:", err.message);

      if (!res.headersSent) {
        sendJsonIfConnected(res, 500, {
          status: "fail",
          code: "PREVIEW_FILE_STREAM_FAILED",
          error: "Failed to stream preview file.",
        });
      }
    });

    return stream.pipe(res);
  }

  const parts = range.replace(/bytes=/, "").split("-");
  const start = Number.parseInt(parts[0], 10);
  const end = parts[1] ? Number.parseInt(parts[1], 10) : fileSize - 1;

  if (
    Number.isNaN(start) ||
    Number.isNaN(end) ||
    start >= fileSize ||
    end >= fileSize ||
    start > end
  ) {
    res.status(416);
    res.setHeader("Content-Range", `bytes */${fileSize}`);
    return res.end();
  }

  const chunkSize = end - start + 1;

  res.status(206);
  res.setHeader("Content-Range", `bytes ${start}-${end}/${fileSize}`);
  res.setHeader("Content-Length", chunkSize);

  const stream = fs.createReadStream(filePath, { start, end });

  stream.on("error", (err) => {
    console.log("Preview range stream error:", err.message);

    if (!res.headersSent) {
      sendJsonIfConnected(res, 500, {
        status: "fail",
        code: "PREVIEW_RANGE_STREAM_FAILED",
        error: "Failed to stream preview range.",
      });
    }
  });

  return stream.pipe(res);
};

const buildYtDlpPreviewArgs = (url, outputTemplate) => {
  return [
    "--no-playlist",
    "--force-overwrites",
    "--no-warnings",
    "--socket-timeout",
    "30",
    "-N",
    "4",

    /**
     * Preview should have sound:
     * 1. Prefer complete MP4 with audio.
     * 2. Then complete best with audio.
     * 3. Then merge video + audio.
     */
    "-f",
    "b[ext=mp4][acodec!=none]/b[acodec!=none]/bv*[ext=mp4]+ba[ext=m4a]/bv*+ba/b",

    "--merge-output-format",
    "mp4",
    "--recode-video",
    "mp4",
    "--postprocessor-args",
    "ffmpeg:-movflags +faststart",
    "-o",
    outputTemplate,
    url,
  ];
};

const createPlayablePreview = (url) => {
  const outputPath = getPreviewPath(url);

  if (isValidPreparedFile(outputPath)) {
    return Promise.resolve(outputPath);
  }

  if (previewJobs.has(url)) {
    return previewJobs.get(url);
  }

  const job = new Promise((resolve, reject) => {
    const hash = getUrlHash(url);
    const outputTemplate = path.join(previewDir, `${hash}.%(ext)s`);

    const child = spawn(YTDLP_PATH, buildYtDlpPreviewArgs(url, outputTemplate), {
      timeout: 600000,
      windowsHide: true,
    });

    let stderr = "";

    child.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    child.on("error", (err) => {
      reject(err);
    });

    child.on("close", (code) => {
      if (code !== 0) {
        const friendly = normalizeErrorMessage(stderr);

        return reject(
          Object.assign(new Error(friendly.error), {
            statusCode: friendly.statusCode,
            code: friendly.code,
            details: stderr,
          })
        );
      }

      const createdFiles = fs
        .readdirSync(previewDir)
        .filter((file) => file.startsWith(hash) && file.endsWith(".mp4"));

      if (!createdFiles.length) {
        return reject(new Error("Playable preview file was not created."));
      }

      const createdFile = createdFiles
        .map((file) => {
          const filePath = path.join(previewDir, file);
          const stat = fs.statSync(filePath);

          return {
            file,
            size: stat.size,
          };
        })
        .sort((a, b) => b.size - a.size)[0]?.file;

      const finalPath = path.join(previewDir, createdFile);

      if (!isValidPreparedFile(finalPath)) {
        safeDeleteFile(finalPath);
        return reject(new Error("Preview file is invalid or empty."));
      }

      resolve(finalPath);
    });
  });

  previewJobs.set(url, job);

  job.finally(() => {
    previewJobs.delete(url);
  });

  return job;
};

const cleanupOldFiles = () => {
  const previewMaxAgeMs = 60 * 60 * 1000;
  const downloadMaxAgeMs = 30 * 60 * 1000;
  const now = Date.now();

  const cleanupDir = (dir, maxAgeMs) => {
    try {
      const files = fs.readdirSync(dir);

      for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (now - stat.mtimeMs > maxAgeMs) {
          safeDeleteFile(filePath);
        }
      }
    } catch {}
  };

  cleanupDir(previewDir, previewMaxAgeMs);
  cleanupDir(outputDir, downloadMaxAgeMs);
};

setInterval(cleanupOldFiles, 30 * 60 * 1000);

const isMetricOnlyTitle = (value = "") => {
  const text = String(value).trim().toLowerCase();

  if (!text) return true;

  return (
    /^\d+(\.\d+)?[kmb]?\s+(views|reactions|shares|comments)/i.test(text) ||
    text.includes("reactions") ||
    text.includes("shares") ||
    text === "follow" ||
    text === "like" ||
    text.length < 3
  );
};

const getCleanTitle = (data = {}) => {
  const rawTitle = data.title || data.fulltitle || "";
  const description = data.description || "";
  const uploader = data.uploader || "";

  const lines = String(description || "")
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean);

  let title =
    lines.find((line) => !isMetricOnlyTitle(line)) ||
    rawTitle ||
    uploader ||
    "Video";

  title = String(title)
    .replace(/\s+/g, " ")
    .replace(
      /^\d+(\.\d+)?[KMB]?\s+views\s*·\s*\d+(\.\d+)?[KMB]?\s+reactions\s*\|\s*/i,
      ""
    )
    .replace(/^\d+(\.\d+)?[KMB]?\s+views\s*\|\s*/i, "")
    .replace(
      /^\d+(\.\d+)?[KMB]?\s+reactions\s*·\s*\d+(\.\d+)?[KMB]?\s+shares/i,
      ""
    )
    .split("Download the app")[0]
    .split("LINK IN BIO")[0]
    .split("Cast:")[0]
    .split("#")[0]
    .trim();

  if (title.toLowerCase().includes(" is now streaming")) {
    title = title.split(/ is now streaming/i)[0].trim();
  }

  if (isMetricOnlyTitle(title)) {
    title = uploader || "Video";
  }

  return title.slice(0, 70) || "Video";
};

const formatDuration = (seconds) => {
  if (
    seconds === null ||
    seconds === undefined ||
    Number.isNaN(Number(seconds))
  ) {
    return null;
  }

  const totalSeconds = Math.floor(Number(seconds));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const remainingSeconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds
    ).padStart(2, "0")}`;
  }

  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
};

const formatSize = (bytes, estimated = false) => {
  const size = Number(bytes);

  if (!size || Number.isNaN(size) || size <= 0) {
    return estimated ? "Approx. 1 MB" : "1 MB";
  }

  const kb = size / 1024;
  const mb = kb / 1024;
  const gb = mb / 1024;

  let label = "";

  if (gb >= 1) {
    label = `${gb.toFixed(1)} GB`;
  } else if (mb >= 100) {
    label = `${Math.round(mb)} MB`;
  } else if (mb >= 10) {
    label = `${mb.toFixed(1)} MB`;
  } else if (mb >= 1) {
    label = `${mb.toFixed(1)} MB`;
  } else {
    label = `${Math.max(1, Math.round(kb))} KB`;
  }

  return estimated ? `Approx. ${label}` : label;
};

const getDirectSizeBytes = (item = {}) => {
  const candidates = [
    item.filesize,
    item.filesize_approx,
    item.size,
    item.file_size,
    item.content_length,
  ];

  for (const candidate of candidates) {
    const value = Number(candidate);

    if (value && !Number.isNaN(value) && value > 0) {
      return value;
    }
  }

  return null;
};

const estimateSizeFromBitrate = (item = {}, durationSeconds) => {
  const duration = Number(durationSeconds || item.duration || 0);

  if (!duration || Number.isNaN(duration) || duration <= 0) {
    return null;
  }

  const bitrateKbps =
    Number(item.tbr || 0) ||
    Number(item.vbr || 0) ||
    Number(item.abr || 0) ||
    Number(item.bitrate || 0);

  if (!bitrateKbps || Number.isNaN(bitrateKbps) || bitrateKbps <= 0) {
    return null;
  }

  return (bitrateKbps * 1000 * duration) / 8;
};

const getEstimatedVideoBitrateKbps = (item = {}) => {
  const height = Number(item.height || 0);

  if (height >= 4320) return 35000;
  if (height >= 2160) return 16000;
  if (height >= 1440) return 9000;
  if (height >= 1080) return 5200;
  if (height >= 720) return 2800;
  if (height >= 480) return 1300;
  if (height >= 360) return 800;
  if (height >= 240) return 450;

  if (item.width && item.height) return 800;

  return 600;
};

const estimateVideoSizeFromResolution = (item = {}, durationSeconds) => {
  const duration = Number(durationSeconds || item.duration || 0);

  if (!duration || Number.isNaN(duration) || duration <= 0) {
    return null;
  }

  let bitrateKbps = getEstimatedVideoBitrateKbps(item);

  if (String(item.ext || "").toLowerCase() === "webm") {
    bitrateKbps *= 0.85;
  }

  return (bitrateKbps * 1000 * duration) / 8;
};

const estimateAudioSize = (item = {}, durationSeconds) => {
  const duration = Number(durationSeconds || item.duration || 0);

  if (!duration || Number.isNaN(duration) || duration <= 0) {
    return null;
  }

  const bitrateKbps =
    Number(item.abr || 0) ||
    Number(item.tbr || 0) ||
    Number(item.asr ? 128 : 0) ||
    128;

  return (bitrateKbps * 1000 * duration) / 8;
};

const getFallbackSizeBytes = (type = "video", durationSeconds) => {
  const duration = Number(durationSeconds || 0);

  if (duration && !Number.isNaN(duration) && duration > 0) {
    if (type === "audio") {
      return (128 * 1000 * duration) / 8;
    }

    return (900 * 1000 * duration) / 8;
  }

  if (type === "audio") {
    return 512 * 1024;
  }

  return 2 * 1024 * 1024;
};

const getFormatSizeInfo = (item = {}, durationSeconds, type = "video") => {
  const exactBytes = getDirectSizeBytes(item);

  if (exactBytes) {
    return {
      size: formatSize(exactBytes, false),
      sizeBytes: Math.round(exactBytes),
      sizeEstimated: false,
    };
  }

  const bitrateEstimate = estimateSizeFromBitrate(item, durationSeconds);

  if (bitrateEstimate) {
    return {
      size: formatSize(bitrateEstimate, true),
      sizeBytes: Math.round(bitrateEstimate),
      sizeEstimated: true,
    };
  }

  const smartEstimate =
    type === "audio"
      ? estimateAudioSize(item, durationSeconds)
      : estimateVideoSizeFromResolution(item, durationSeconds);

  if (smartEstimate) {
    return {
      size: formatSize(smartEstimate, true),
      sizeBytes: Math.round(smartEstimate),
      sizeEstimated: true,
    };
  }

  const fallbackSize = getFallbackSizeBytes(type, durationSeconds);

  return {
    size: formatSize(fallbackSize, true),
    sizeBytes: Math.round(fallbackSize),
    sizeEstimated: true,
  };
};

const getAspectRatio = (width, height, ytAspectRatio) => {
  if (ytAspectRatio && Number(ytAspectRatio) < 0.8) return "portrait";
  if (ytAspectRatio && Number(ytAspectRatio) > 1.2) return "landscape";

  if (
    ytAspectRatio &&
    Number(ytAspectRatio) >= 0.8 &&
    Number(ytAspectRatio) <= 1.2
  ) {
    return "square";
  }

  if (!width || !height) return "landscape";
  if (height > width) return "portrait";
  if (width === height) return "square";

  return "landscape";
};

const getQualityLabel = (item = {}) => {
  const height = Number(item.height || 0);

  if (height >= 4320) return "4320p (8K)";
  if (height >= 2160) return "2160p (4K)";
  if (height >= 1440) return "1440p (2K)";
  if (height >= 1080) return "1080p (Full HD)";
  if (height >= 720) return "720p (HD)";
  if (height >= 480) return "480p (SD)";
  if (height >= 360) return "360p";
  if (height >= 240) return "240p";

  if (item.width && item.height) {
    return `${item.width}×${item.height}`;
  }

  return item.format_note || item.resolution || item.format_id || "Default";
};

const getSortHeight = (quality = "") => {
  if (quality.includes("4320")) return 4320;
  if (quality.includes("2160")) return 2160;
  if (quality.includes("1440")) return 1440;
  if (quality.includes("1080")) return 1080;
  if (quality.includes("720")) return 720;
  if (quality.includes("480")) return 480;
  if (quality.includes("360")) return 360;
  if (quality.includes("240")) return 240;

  return Number(String(quality).match(/\d+/)?.[0]) || 0;
};

exports.postMedia = async (req, res, next) => {
  try {
    const url = req.body.urls;

    if (
      !url ||
      typeof url !== "string" ||
      (!url.startsWith("http://") && !url.startsWith("https://"))
    ) {
      return res.status(400).json({
        status: "fail",
        code: "INVALID_URL",
        error: "Valid URL is required",
      });
    }

    const ytDlp = spawn(
      YTDLP_PATH,
      ["-J", "--no-playlist", "--no-warnings", "--socket-timeout", "20", url],
      {
        timeout: 60000,
        windowsHide: true,
      }
    );

    let stdout = "";
    let stderr = "";
    let isResponded = false;

    ytDlp.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    ytDlp.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    ytDlp.on("error", (err) => {
      if (isResponded) return;
      isResponded = true;

      console.log("yt-dlp process error:", err.message);

      return res.status(500).json({
        status: "fail",
        code: "YTDLP_NOT_FOUND",
        error:
          "yt-dlp is not installed or failed to start. Please install or update yt-dlp on the server.",
      });
    });

    ytDlp.on("close", async (code) => {
      if (isResponded) return;

      let data = null;

      if (stdout) {
        try {
          data = JSON.parse(stdout);
        } catch {
          data = null;
        }
      }

      if (code !== 0 && !data) {
        isResponded = true;

        const friendlyError = normalizeErrorMessage(stderr);

        return res.status(friendlyError.statusCode).json({
          status: "fail",
          code: friendlyError.code,
          error: friendlyError.error,
          details: stderr || "Unknown yt-dlp error",
        });
      }

      if (!data) {
        isResponded = true;

        return res.status(500).json({
          status: "fail",
          code: "INVALID_YTDLP_RESPONSE",
          error: "Invalid yt-dlp response. Please try another video link.",
        });
      }

      const allFormats = Array.isArray(data.formats) ? data.formats : [];

      const audioFormats = allFormats
        .filter((item) => {
          return (
            item.url &&
            item.acodec &&
            item.acodec !== "none" &&
            (!item.vcodec || item.vcodec === "none")
          );
        })
        .map((item) => {
          const sizeInfo = getFormatSizeInfo(item, data.duration, "audio");

          return {
            type: "audio",
            url: item.url,
            quality:
              item.abr || item.asr
                ? `${Math.round(item.abr || item.asr)} kbps`
                : item.format_note || "Audio",
            ext: item.ext || "m4a",
            size: sizeInfo.size,
            sizeBytes: sizeInfo.sizeBytes,
            sizeEstimated: sizeInfo.sizeEstimated,
            formatId: item.format_id || "",
            width: null,
            height: null,
            fps: null,
            vcodec: item.vcodec || "",
            acodec: item.acodec || "",
            hasAudio: true,
            audioUrl: "",
            audioFormatId: item.format_id || "",
            aspectRatio: "audio",
          };
        })
        .filter(
          (item, index, self) =>
            index ===
            self.findIndex(
              (x) => x.quality === item.quality && x.ext === item.ext
            )
        )
        .slice(0, 8);

      const bestAudio =
        audioFormats.find((item) => item.ext === "m4a") ||
        audioFormats[0] ||
        null;

      const progressiveVideoFormats = allFormats
        .filter((item) => {
          return (
            item.url &&
            item.vcodec &&
            item.vcodec !== "none" &&
            item.acodec &&
            item.acodec !== "none" &&
            ["mp4", "webm"].includes(item.ext)
          );
        })
        .map((item) => {
          const sizeInfo = getFormatSizeInfo(item, data.duration, "video");

          return {
            type: "video",
            url: item.url,
            quality: getQualityLabel(item),
            ext: item.ext || "mp4",
            size: sizeInfo.size,
            sizeBytes: sizeInfo.sizeBytes,
            sizeEstimated: sizeInfo.sizeEstimated,
            formatId: item.format_id || "",
            width: item.width || null,
            height: item.height || null,
            fps: item.fps || null,
            vcodec: item.vcodec || "",
            acodec: item.acodec || "",
            hasAudio: true,
            audioUrl: "",
            audioFormatId: "",
            aspectRatio: getAspectRatio(
              item.width,
              item.height,
              item.aspect_ratio
            ),
          };
        });

      const dashVideoFormats = allFormats
        .filter((item) => {
          return (
            item.url &&
            item.vcodec &&
            item.vcodec !== "none" &&
            (!item.acodec || item.acodec === "none") &&
            ["mp4", "webm"].includes(item.ext)
          );
        })
        .map((item) => {
          const sizeInfo = getFormatSizeInfo(item, data.duration, "video");

          return {
            type: "video",
            url: item.url,
            quality: getQualityLabel(item),
            ext: item.ext || "mp4",
            size: sizeInfo.size,
            sizeBytes: sizeInfo.sizeBytes,
            sizeEstimated: sizeInfo.sizeEstimated,
            formatId: item.format_id || "",
            width: item.width || null,
            height: item.height || null,
            fps: item.fps || null,
            vcodec: item.vcodec || "",
            acodec: item.acodec || "none",
            hasAudio: false,
            audioUrl: bestAudio?.url || "",
            audioFormatId: bestAudio?.formatId || "",
            aspectRatio: getAspectRatio(
              item.width,
              item.height,
              item.aspect_ratio
            ),
          };
        });

      const videoFormats = [...progressiveVideoFormats, ...dashVideoFormats]
        .filter(
          (item, index, self) =>
            index ===
            self.findIndex(
              (x) =>
                x.quality === item.quality &&
                x.ext === item.ext &&
                x.aspectRatio === item.aspectRatio
            )
        )
        .sort((a, b) => {
          const byHeight = getSortHeight(b.quality) - getSortHeight(a.quality);

          if (byHeight !== 0) return byHeight;

          if (a.ext === "mp4" && b.ext !== "mp4") return -1;
          if (a.ext !== "mp4" && b.ext === "mp4") return 1;

          if (a.hasAudio && !b.hasAudio) return -1;
          if (!a.hasAudio && b.hasAudio) return 1;

          return Number(b.sizeBytes || 0) - Number(a.sizeBytes || 0);
        })
        .slice(0, 10);

      const bestPreview =
        videoFormats.find((item) => item.hasAudio && item.ext === "mp4") ||
        videoFormats.find((item) => item.ext === "mp4") ||
        videoFormats[0] ||
        null;

      const originalPageUrl = data.webpage_url || url;
      const playablePreviewUrl = getPublicPreviewUrl(req, originalPageUrl);

      isResponded = true;

      res.status(200).json({
        status: "success",
        platform: data.extractor_key || data.extractor || "unknown",
        title: getCleanTitle(data),
        originalTitle: data.title || data.fulltitle || "Media",
        uploader: data.uploader || "",
        thumb: data.thumbnail || "",
        duration: data.duration || null,
        durationText:
          formatDuration(data.duration) || data.duration_string || "--",
        viewCount: data.view_count || null,
        webpage_url: originalPageUrl,
        aspectRatio: bestPreview?.aspectRatio || "landscape",

        previewUrl: playablePreviewUrl,
        previewMode: "server-prepared",
        previewHasAudio: true,
        previewAudioUrl: "",

        rawPreviewUrl: bestPreview?.url || "",
        rawPreviewHasAudio: Boolean(bestPreview?.hasAudio),
        rawPreviewAudioUrl:
          bestPreview && !bestPreview.hasAudio ? bestPreview.audioUrl : "",

        video: videoFormats,
        audio: audioFormats,
        urls: [...videoFormats, ...audioFormats],
      });

      if (req.users) {
        req.users.addActivity({ mediaUrl: url }).catch((err) => {
          console.log("Activity save error:", err.message);
        });
      }
    });
  } catch (err) {
    console.log("Media API error:", err.message);

    if (!res.headersSent) {
      res.status(500).json({
        status: "fail",
        code: "SERVER_ERROR",
        error: "Download failed. Please try again.",
      });
    }

    next(err);
  }
};

exports.previewMedia = async (req, res) => {
  try {
    const url = req.query.url;

    if (
      !url ||
      typeof url !== "string" ||
      (!url.startsWith("http://") && !url.startsWith("https://"))
    ) {
      return res.status(400).json({
        status: "fail",
        code: "INVALID_PREVIEW_URL",
        error: "Valid preview URL is required.",
      });
    }

    const previewPath = await createPlayablePreview(url);

    return sendVideoFileWithRange(req, res, previewPath);
  } catch (err) {
    console.log("Preview prepare error:", err.message);

    if (res.headersSent || res.destroyed || res.writableEnded) {
      return;
    }

    return sendJsonIfConnected(res, err.statusCode || 500, {
      status: "fail",
      code: err.code || "PREVIEW_STREAM_FAILED",
      error:
        err.message ||
        "Preview could not be prepared. This video may be restricted.",
      details: err.details || err.message,
    });
  }
};

exports.downloadDirectMedia = async (req, res) => {
  let childProcess = null;
  let hasFinished = false;
  let clientCancelled = false;
  let outputPathToClean = "";

  const cleanupProcess = () => {
    clientCancelled = true;

    if (childProcess && !childProcess.killed) {
      try {
        childProcess.kill("SIGKILL");
      } catch {}
    }

    if (outputPathToClean) {
      safeDeleteFile(outputPathToClean);
    }
  };

  req.on("aborted", cleanupProcess);

  res.on("close", () => {
    if (!hasFinished) {
      cleanupProcess();
    }
  });

  try {
    const {
      type,
      title,
      originalUrl,
      videoUrl,
      audioUrl,
      videoFormatId,
      audioFormatId,
      hasAudio,
    } = req.body;

    const safeTitle = sanitizeFileName(title || "linkflow-download");
    const timestamp = Date.now();
    const extension = type === "audio" ? "mp3" : "mp4";

    const outputPath = path.join(
      outputDir,
      `${safeTitle}-${timestamp}.${extension}`
    );

    outputPathToClean = outputPath;

    const originalUrlValue = String(originalUrl || "");

    /**
     * Main path:
     * Use yt-dlp with original page URL. This is required for X.com,
     * Instagram, TikTok, Facebook, Reddit, etc.
     */
    if (originalUrlValue) {
      const outputTemplate = path.join(
        outputDir,
        `${safeTitle}-${timestamp}.%(ext)s`
      );

      const args = [
        "--no-playlist",
        "--newline",
        "--force-overwrites",
        "--no-warnings",
        "--socket-timeout",
        "30",
        "-N",
        "4",
      ];

      if (type === "audio") {
        args.push(
          "-f",
          audioFormatId || "ba/bestaudio/best",
          "-x",
          "--audio-format",
          "mp3",
          "--audio-quality",
          "0",
          "-o",
          outputTemplate,
          originalUrlValue
        );
      } else {
        let formatSpec =
          "b[ext=mp4][acodec!=none]/b[acodec!=none]/bv*[ext=mp4]+ba[ext=m4a]/bv*+ba/b";

        if (videoFormatId && audioFormatId) {
          formatSpec = `${videoFormatId}+${audioFormatId}/b[ext=mp4][acodec!=none]/bv*+ba/b`;
        } else if (videoFormatId && (hasAudio === true || hasAudio === "true")) {
          formatSpec = `${videoFormatId}/b[ext=mp4][acodec!=none]/bv*+ba/b`;
        } else if (videoFormatId) {
          formatSpec = `${videoFormatId}+ba/${videoFormatId}+bestaudio/bv*+ba/b[acodec!=none]/b`;
        }

        args.push(
          "-f",
          formatSpec,
          "--merge-output-format",
          "mp4",
          "--recode-video",
          "mp4",
          "--postprocessor-args",
          "ffmpeg:-movflags +faststart",
          "-o",
          outputTemplate,
          originalUrlValue
        );
      }

      childProcess = spawn(YTDLP_PATH, args, {
        timeout: 600000,
        windowsHide: true,
      });

      let stderr = "";
      let isResponded = false;

      childProcess.stderr.on("data", (data) => {
        stderr += data.toString();
      });

      childProcess.on("error", (err) => {
        if (isResponded || clientCancelled || isClientDisconnected(res)) return;

        isResponded = true;
        hasFinished = true;

        console.log("yt-dlp start error:", err.message);

        return sendJsonIfConnected(res, 500, {
          status: "fail",
          code: "YTDLP_DOWNLOAD_START_FAILED",
          error: "Download engine failed to start.",
          details: err.message,
        });
      });

      childProcess.on("close", (code, signal) => {
        if (isResponded) return;

        if (
          clientCancelled ||
          signal === "SIGKILL" ||
          isClientDisconnected(res)
        ) {
          hasFinished = true;
          safeDeleteFile(outputPathToClean);
          return;
        }

        if (code !== 0) {
          isResponded = true;
          hasFinished = true;

          const friendly = normalizeErrorMessage(stderr);
          const cleanError = getCleanProcessError(stderr);

          console.log("yt-dlp download failed:", cleanError);

          return sendJsonIfConnected(res, friendly.statusCode || 500, {
            status: "fail",
            code: friendly.code || "YTDLP_DOWNLOAD_FAILED",
            error: friendly.error || "Download was not completed.",
            details: cleanError,
          });
        }

        const files = fs
          .readdirSync(outputDir)
          .filter((file) => file.startsWith(`${safeTitle}-${timestamp}`));

        if (!files.length) {
          isResponded = true;
          hasFinished = true;

          return sendJsonIfConnected(res, 500, {
            status: "fail",
            code: "DOWNLOADED_FILE_NOT_FOUND",
            error: "Prepared file not found.",
          });
        }

        const preferredExt = type === "audio" ? ".mp3" : ".mp4";

        const selectedFile =
          files.find((file) => file.endsWith(preferredExt)) || files[0];

        const filePath = path.join(outputDir, selectedFile);

        if (!isValidPreparedFile(filePath)) {
          safeDeleteFile(filePath);

          isResponded = true;
          hasFinished = true;

          return sendJsonIfConnected(res, 500, {
            status: "fail",
            code: "DOWNLOADED_FILE_INVALID",
            error: "Downloaded file is invalid or empty.",
          });
        }

        const finalName = `${safeTitle}.${type === "audio" ? "mp3" : "mp4"}`;

        outputPathToClean = filePath;
        isResponded = true;
        hasFinished = true;

        return sendPreparedFile(res, filePath, finalName);
      });

      return;
    }

    /**
     * Fallback path:
     * Only used if frontend sends direct video/audio URLs.
     */
    if (type === "video" && !videoUrl) {
      hasFinished = true;

      return sendJsonIfConnected(res, 400, {
        status: "fail",
        code: "VIDEO_URL_REQUIRED",
        error: "Video URL is required.",
      });
    }

    if (type === "audio" && !audioUrl && !videoUrl) {
      hasFinished = true;

      return sendJsonIfConnected(res, 400, {
        status: "fail",
        code: "AUDIO_URL_REQUIRED",
        error: "Audio URL is required.",
      });
    }

    if (type === "video" && !audioUrl) {
      hasFinished = true;

      return sendJsonIfConnected(res, 422, {
        status: "fail",
        code: "AUDIO_URL_REQUIRED_FOR_VIDEO",
        error:
          "This selected video quality does not include audio. Please choose another quality.",
      });
    }

    const args = ["-hide_banner", "-loglevel", "error", "-nostdin"];

    if (type === "audio") {
      args.push(
        "-y",
        "-i",
        audioUrl || videoUrl,
        "-vn",
        "-codec:a",
        "libmp3lame",
        "-b:a",
        "192k",
        outputPath
      );
    } else {
      args.push(
        "-y",
        "-i",
        videoUrl,
        "-i",
        audioUrl,
        "-map",
        "0:v:0",
        "-map",
        "1:a:0",
        "-c:v",
        "copy",
        "-c:a",
        "aac",
        "-b:a",
        "192k",
        "-movflags",
        "+faststart",
        "-shortest",
        outputPath
      );
    }

    childProcess = spawn(FFMPEG_PATH, args, {
      timeout: 600000,
      windowsHide: true,
    });

    let stderr = "";
    let isResponded = false;

    childProcess.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    childProcess.on("error", (err) => {
      if (isResponded || clientCancelled || isClientDisconnected(res)) return;

      isResponded = true;
      hasFinished = true;

      console.log("FFmpeg start error:", err.message);

      return sendJsonIfConnected(res, 500, {
        status: "fail",
        code: "FFMPEG_START_FAILED",
        error:
          "Download engine failed to start. Please check FFmpeg installation.",
        details: err.message,
      });
    });

    childProcess.on("close", (code, signal) => {
      if (isResponded) return;

      if (clientCancelled || signal === "SIGKILL" || isClientDisconnected(res)) {
        hasFinished = true;
        safeDeleteFile(outputPath);
        return;
      }

      if (code !== 0) {
        isResponded = true;
        hasFinished = true;

        safeDeleteFile(outputPath);

        const cleanError = getCleanProcessError(stderr);
        console.log("FFmpeg merge failed:", cleanError);

        return sendJsonIfConnected(res, 500, {
          status: "fail",
          code: "FFMPEG_MERGE_FAILED",
          error: "Download was not completed. Please try another quality.",
          details: cleanError,
        });
      }

      if (!fs.existsSync(outputPath)) {
        isResponded = true;
        hasFinished = true;

        return sendJsonIfConnected(res, 500, {
          status: "fail",
          code: "PREPARED_FILE_NOT_FOUND",
          error: "Prepared file not found.",
        });
      }

      isResponded = true;
      hasFinished = true;

      return sendPreparedFile(res, outputPath, `${safeTitle}.${extension}`);
    });
  } catch (err) {
    hasFinished = true;

    if (clientCancelled || isClientDisconnected(res)) {
      return;
    }

    console.log("Direct download error:", err.message);

    return sendJsonIfConnected(res, 500, {
      status: "fail",
      code: "DIRECT_DOWNLOAD_FAILED",
      error: "Download failed. Please try again.",
    });
  }
};

exports.proxyImage = async (req, res) => {
  try {
    const imageUrl = req.query.url;

    if (!imageUrl) {
      return res.status(400).json({
        status: "fail",
        code: "IMAGE_URL_REQUIRED",
        error: "Image URL is required",
      });
    }

    if (
      typeof imageUrl !== "string" ||
      (!imageUrl.startsWith("http://") && !imageUrl.startsWith("https://"))
    ) {
      return res.status(400).json({
        status: "fail",
        code: "INVALID_IMAGE_URL",
        error: "Invalid image URL",
      });
    }

    const response = await fetch(imageUrl);

    if (!response.ok) {
      return res.status(400).json({
        status: "fail",
        code: "IMAGE_FETCH_FAILED",
        error: "Failed to fetch image",
      });
    }

    const contentType = response.headers.get("content-type") || "image/jpeg";
    res.setHeader("Content-Type", contentType);

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return res.send(buffer);
  } catch (err) {
    console.log("Proxy image error:", err.message);

    return res.status(500).json({
      status: "fail",
      code: "IMAGE_PROXY_FAILED",
      error: "Image proxy failed",
    });
  }
};