









// const { spawn } = require("child_process");
// const path = require("path");
// const fs = require("fs");
// const crypto = require("crypto");

// const FFMPEG_PATH = process.env.FFMPEG_PATH || "ffmpeg";
// const YTDLP_PATH = process.env.YTDLP_PATH || "yt-dlp";

// const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || "";
// const RAPIDAPI_ALL_SOCIAL_HOST =
//   process.env.RAPIDAPI_ALL_SOCIAL_HOST || "auto-download-all-in-one.p.rapidapi.com";
// const RAPIDAPI_ALL_SOCIAL_METHOD =
//   process.env.RAPIDAPI_ALL_SOCIAL_METHOD || "POST";
// const RAPIDAPI_ALL_SOCIAL_URL =
//   process.env.RAPIDAPI_ALL_SOCIAL_URL ||
//   "https://auto-download-all-in-one.p.rapidapi.com/v1/social/autolink";
// const RAPIDAPI_ALL_SOCIAL_URL_PARAM =
//   process.env.RAPIDAPI_ALL_SOCIAL_URL_PARAM || "url";

// const outputDir = path.join(__dirname, "..", "downloads");
// const previewDir = path.join(__dirname, "..", "previews");

// if (!fs.existsSync(outputDir)) {
//   fs.mkdirSync(outputDir, { recursive: true });
// }

// if (!fs.existsSync(previewDir)) {
//   fs.mkdirSync(previewDir, { recursive: true });
// }

// exports.startApi = (req, res) => {
//   res.status(200).json({
//     status: "success",
//     message: "Welcome To Vidown Api",
//   });
// };

// const isValidHttpUrl = (value = "") => {
//   try {
//     const parsed = new URL(String(value));
//     return parsed.protocol === "http:" || parsed.protocol === "https:";
//   } catch {
//     return false;
//   }
// };

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
//   return res.destroyed || res.writableEnded || res.headersSent;
// };

// const sendJsonIfConnected = (res, statusCode, payload) => {
//   if (res.destroyed || res.writableEnded || res.headersSent) return;
//   return res.status(statusCode).json(payload);
// };

// const getUrlHash = (value = "") => {
//   return crypto
//     .createHash("sha256")
//     .update(String(value))
//     .digest("hex")
//     .slice(0, 32);
// };

// const hasConfirmedAudio = (item = {}) => {
//   const acodec = String(item.acodec || "").toLowerCase();
//   return Boolean(acodec && acodec !== "none" && acodec !== "unknown");
// };

// const getCleanProcessError = (stderr = "") => {
//   const text = String(stderr || "").trim();

//   if (!text) return "Process stopped before completion.";

//   const lines = text
//     .split("\n")
//     .map((line) => line.trim())
//     .filter(Boolean);

//   const importantLine =
//     lines
//       .reverse()
//       .find((line) =>
//         /error|failed|invalid|unable|not found|permission|denied|login|cookies|private|forbidden|unauthorized|blocked|too many requests|429/i.test(
//           line
//         )
//       ) || lines[0];

//   return importantLine || "Download process failed.";
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
//   const uploader = data.uploader || data.author || data.unique_id || "";

//   const lines = String(description || "")
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

// const normalizeDurationSeconds = (value) => {
//   if (value === null || value === undefined || Number.isNaN(Number(value))) {
//     return null;
//   }

//   const numeric = Number(value);

//   if (numeric > 1000) {
//     return numeric / 1000;
//   }

//   return numeric;
// };

// const formatDuration = (seconds) => {
//   const normalized = normalizeDurationSeconds(seconds);

//   if (normalized === null) return null;

//   const totalSeconds = Math.floor(Number(normalized));
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
//     item.data_size,
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
//   const duration = normalizeDurationSeconds(durationSeconds || item.duration || 0);

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
//   const duration = normalizeDurationSeconds(durationSeconds || item.duration || 0);

//   if (!duration || Number.isNaN(duration) || duration <= 0) {
//     return null;
//   }

//   let bitrateKbps = getEstimatedVideoBitrateKbps(item);

//   if (String(item.ext || item.extension || "").toLowerCase() === "webm") {
//     bitrateKbps *= 0.85;
//   }

//   return (bitrateKbps * 1000 * duration) / 8;
// };

// const estimateAudioSize = (item = {}, durationSeconds) => {
//   const duration = normalizeDurationSeconds(durationSeconds || item.duration || 0);

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
//   const duration = normalizeDurationSeconds(durationSeconds || 0);

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

//   if (item.quality && !String(item.quality).includes("_")) {
//     return String(item.quality);
//   }

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

//   return item.format_note || item.resolution || item.format_id || item.quality || "Default";
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

// const normalizeErrorMessage = (stderr = "") => {
//   const lowerError = stderr.toLowerCase();

//   const isFacebookError =
//     lowerError.includes("[facebook]") ||
//     lowerError.includes("facebook") ||
//     lowerError.includes("cannot parse data");

//   const isCookieError =
//     lowerError.includes("cookies") ||
//     lowerError.includes("login") ||
//     lowerError.includes("private") ||
//     lowerError.includes("not available") ||
//     lowerError.includes("sign in");

//   const isRateLimitOrBlockError =
//     lowerError.includes("429") ||
//     lowerError.includes("too many requests") ||
//     lowerError.includes("blocked") ||
//     lowerError.includes("forbidden") ||
//     lowerError.includes("http error 403");

//   const isUnsupportedError =
//     lowerError.includes("unsupported url") ||
//     lowerError.includes("no suitable extractor");

//   if (isFacebookError) {
//     return {
//       statusCode: 422,
//       code: "FACEBOOK_EXTRACT_FAILED",
//       error:
//         "Facebook could not fully process this link. Trying fallback extractor may help.",
//     };
//   }

//   if (isCookieError) {
//     return {
//       statusCode: 401,
//       code: "LOGIN_OR_COOKIES_REQUIRED",
//       error:
//         "This video may require login or cookies. Trying fallback extractor may help.",
//     };
//   }

//   if (isRateLimitOrBlockError) {
//     return {
//       statusCode: 429,
//       code: "YTDLP_BLOCKED_OR_RATE_LIMITED",
//       error:
//         "The primary extractor appears blocked or rate limited. Trying fallback extractor may help.",
//     };
//   }

//   if (isUnsupportedError) {
//     return {
//       statusCode: 400,
//       code: "UNSUPPORTED_URL",
//       error:
//         "This website or link format is not supported by the primary extractor.",
//     };
//   }

//   return {
//     statusCode: 500,
//     code: "MEDIA_EXTRACT_FAILED",
//     error:
//       "Unable to extract this media with the primary extractor.",
//   };
// };

// const getPublicPreviewUrl = (req, originalUrl) => {
//   const baseUrl = `${req.protocol}://${req.get("host")}`;
//   return `${baseUrl}/api/v1/preview?url=${encodeURIComponent(originalUrl)}`;
// };

// const normalizeFormats = (data = {}, originalUrl = "") => {
//   let allFormats = Array.isArray(data.formats) ? data.formats : [];

//   if (!allFormats.length && data.url) {
//     allFormats = [
//       {
//         url: data.url,
//         ext: data.ext || "mp4",
//         format_id: data.format_id || "fallback-direct",
//         format_note: data.format_note || data.resolution || "Default",
//         width: data.width || null,
//         height: data.height || null,
//         fps: data.fps || null,
//         vcodec: data.vcodec || "unknown",
//         acodec: data.acodec || "unknown",
//         filesize: data.filesize || data.filesize_approx || null,
//         filesize_approx: data.filesize_approx || null,
//         tbr: data.tbr || null,
//         abr: data.abr || null,
//         duration: data.duration || null,
//       },
//     ];
//   }

//   if (
//     !allFormats.length &&
//     Array.isArray(data.requested_downloads) &&
//     data.requested_downloads.length
//   ) {
//     allFormats = data.requested_downloads
//       .filter((item) => item.url)
//       .map((item) => ({
//         url: item.url,
//         ext: item.ext || data.ext || "mp4",
//         format_id: item.format_id || data.format_id || "fallback-requested",
//         format_note:
//           item.format_note || item.resolution || data.resolution || "Default",
//         width: item.width || data.width || null,
//         height: item.height || data.height || null,
//         fps: item.fps || data.fps || null,
//         vcodec: item.vcodec || data.vcodec || "unknown",
//         acodec: item.acodec || data.acodec || "unknown",
//         filesize:
//           item.filesize ||
//           item.filesize_approx ||
//           data.filesize ||
//           data.filesize_approx ||
//           null,
//         filesize_approx: item.filesize_approx || data.filesize_approx || null,
//         tbr: item.tbr || data.tbr || null,
//         abr: item.abr || data.abr || null,
//         duration: item.duration || data.duration || null,
//       }));
//   }

//   if (!allFormats.length && isValidHttpUrl(originalUrl)) {
//     allFormats = [
//       {
//         url: originalUrl,
//         ext: "mp4",
//         format_id: "best",
//         format_note: "Default",
//         width: data.width || null,
//         height: data.height || null,
//         fps: data.fps || null,
//         vcodec: "unknown",
//         acodec: "unknown",
//         filesize: null,
//         filesize_approx: null,
//         tbr: null,
//         abr: null,
//         duration: data.duration || null,
//         isOriginalUrlFallback: true,
//       },
//     ];
//   }

//   return allFormats;
// };

// const buildYtDlpPayload = (data = {}, req, originalUrl) => {
//   const originalPageUrl = data.webpage_url || originalUrl;
//   const allFormats = normalizeFormats(data, originalPageUrl);
//   const durationSeconds = normalizeDurationSeconds(data.duration);

//   const audioFormats = allFormats
//     .filter((item) => {
//       const acodec = String(item.acodec || "").toLowerCase();
//       const vcodec = String(item.vcodec || "").toLowerCase();

//       return (
//         item.url &&
//         acodec &&
//         acodec !== "none" &&
//         acodec !== "unknown" &&
//         (!vcodec || vcodec === "none")
//       );
//     })
//     .map((item) => {
//       const sizeInfo = getFormatSizeInfo(item, durationSeconds, "audio");

//       return {
//         type: "audio",
//         url: item.url,
//         quality:
//           item.abr || item.asr
//             ? `${Math.round(item.abr || item.asr)} kbps`
//             : item.format_note || "Audio",
//         ext: String(item.ext || "m4a").toLowerCase(),
//         size: sizeInfo.size,
//         sizeBytes: sizeInfo.sizeBytes,
//         sizeEstimated: sizeInfo.sizeEstimated,
//         formatId: item.format_id || "",
//         width: null,
//         height: null,
//         fps: null,
//         vcodec: item.vcodec || "",
//         acodec: item.acodec || "",
//         hasAudio: true,
//         audioUrl: "",
//         audioFormatId: item.format_id || "",
//         aspectRatio: "audio",
//         sourceEngine: "yt-dlp",
//       };
//     })
//     .filter(
//       (item, index, self) =>
//         index ===
//         self.findIndex((x) => x.quality === item.quality && x.ext === item.ext)
//     )
//     .slice(0, 8);

//   const bestAudio =
//     audioFormats.find((item) => item.ext === "m4a") || audioFormats[0] || null;

//   const progressiveVideoFormats = allFormats
//     .filter((item) => {
//       const ext = String(item.ext || "mp4").toLowerCase();
//       const vcodec = String(item.vcodec || "unknown").toLowerCase();
//       const acodec = String(item.acodec || "unknown").toLowerCase();

//       return (
//         item.url &&
//         ["mp4", "webm", "mov"].includes(ext) &&
//         vcodec !== "none" &&
//         acodec !== "none"
//       );
//     })
//     .map((item) => {
//       const sizeInfo = getFormatSizeInfo(item, durationSeconds, "video");
//       const confirmedAudio = hasConfirmedAudio(item);

//       return {
//         type: "video",
//         url: item.url,
//         quality: getQualityLabel(item),
//         ext: String(item.ext || "mp4").toLowerCase(),
//         size: sizeInfo.size,
//         sizeBytes: sizeInfo.sizeBytes,
//         sizeEstimated: sizeInfo.sizeEstimated,
//         formatId: item.format_id || "best",
//         width: item.width || null,
//         height: item.height || null,
//         fps: item.fps || null,
//         vcodec: item.vcodec || "unknown",
//         acodec: item.acodec || "unknown",
//         hasAudio: confirmedAudio,
//         audioUrl: confirmedAudio ? "" : bestAudio?.url || "",
//         audioFormatId: confirmedAudio ? "" : bestAudio?.formatId || "",
//         aspectRatio: getAspectRatio(item.width, item.height, item.aspect_ratio),
//         isOriginalUrlFallback: Boolean(item.isOriginalUrlFallback),
//         sourceEngine: "yt-dlp",
//       };
//     });

//   const dashVideoFormats = allFormats
//     .filter((item) => {
//       const ext = String(item.ext || "mp4").toLowerCase();
//       const vcodec = String(item.vcodec || "").toLowerCase();
//       const acodec = String(item.acodec || "").toLowerCase();

//       return (
//         item.url &&
//         vcodec &&
//         vcodec !== "none" &&
//         (!acodec || acodec === "none") &&
//         ["mp4", "webm", "mov"].includes(ext)
//       );
//     })
//     .map((item) => {
//       const sizeInfo = getFormatSizeInfo(item, durationSeconds, "video");

//       return {
//         type: "video",
//         url: item.url,
//         quality: getQualityLabel(item),
//         ext: String(item.ext || "mp4").toLowerCase(),
//         size: sizeInfo.size,
//         sizeBytes: sizeInfo.sizeBytes,
//         sizeEstimated: sizeInfo.sizeEstimated,
//         formatId: item.format_id || "",
//         width: item.width || null,
//         height: item.height || null,
//         fps: item.fps || null,
//         vcodec: item.vcodec || "",
//         acodec: item.acodec || "none",
//         hasAudio: false,
//         audioUrl: bestAudio?.url || "",
//         audioFormatId: bestAudio?.formatId || "",
//         aspectRatio: getAspectRatio(item.width, item.height, item.aspect_ratio),
//         sourceEngine: "yt-dlp",
//       };
//     });

//   const videoFormats = [...progressiveVideoFormats, ...dashVideoFormats]
//     .filter(
//       (item, index, self) =>
//         index ===
//         self.findIndex(
//           (x) =>
//             x.quality === item.quality &&
//             x.ext === item.ext &&
//             x.aspectRatio === item.aspectRatio
//         )
//     )
//     .sort((a, b) => {
//       const byHeight = getSortHeight(b.quality) - getSortHeight(a.quality);

//       if (byHeight !== 0) return byHeight;

//       if (a.ext === "mp4" && b.ext !== "mp4") return -1;
//       if (a.ext !== "mp4" && b.ext === "mp4") return 1;

//       if (a.hasAudio && !b.hasAudio) return -1;
//       if (!a.hasAudio && b.hasAudio) return 1;

//       return Number(b.sizeBytes || 0) - Number(a.sizeBytes || 0);
//     })
//     .slice(0, 10);

//   const bestPreview =
//     videoFormats.find((item) => item.hasAudio && item.ext === "mp4") ||
//     videoFormats.find((item) => item.ext === "mp4") ||
//     videoFormats[0] ||
//     null;

//   return {
//     status: "success",
//     platform: data.extractor_key || data.extractor || "unknown",
//     title: getCleanTitle(data),
//     originalTitle: data.title || data.fulltitle || "Media",
//     uploader: data.uploader || "",
//     thumb: data.thumbnail || "",
//     duration: durationSeconds,
//     durationText: formatDuration(durationSeconds) || data.duration_string || "--",
//     viewCount: data.view_count || null,
//     webpage_url: originalPageUrl,
//     aspectRatio: bestPreview?.aspectRatio || "landscape",

//     previewUrl: getPublicPreviewUrl(req, originalPageUrl),
//     previewMode: "server",
//     previewHasAudio: true,
//     previewAudioUrl: "",

//     rawPreviewUrl:
//       bestPreview && !bestPreview.isOriginalUrlFallback ? bestPreview.url : "",
//     rawPreviewHasAudio: Boolean(bestPreview?.hasAudio),
//     rawPreviewAudioUrl:
//       bestPreview && !bestPreview.hasAudio ? bestPreview.audioUrl : "",

//     video: videoFormats,
//     audio: audioFormats,
//     urls: [...videoFormats, ...audioFormats],
//     sourceEngine: "yt-dlp",
//   };
// };

// const shouldUseFallbackApi = (payload) => {
//   if (!payload || payload.status !== "success") return true;

//   const videos = Array.isArray(payload.video) ? payload.video : [];
//   const audios = Array.isArray(payload.audio) ? payload.audio : [];

//   if (!videos.length && !audios.length) return true;

//   const hasProperVideo = videos.some((item) => {
//     const ext = String(item.ext || "").toLowerCase();
//     return item.url && ["mp4", "webm", "mov"].includes(ext);
//   });

//   if (!hasProperVideo) return true;

//   const hasConfirmedVideoAudio = videos.some((item) => item.hasAudio === true);
//   const hasSeparateAudio = audios.length > 0 || videos.some((item) => item.audioUrl);

//   /**
//    * If yt-dlp gives only video with unknown/none audio and no separate audio,
//    * fallback API is more likely to return usable video+audio links.
//    */
//   if (!hasConfirmedVideoAudio && !hasSeparateAudio) return true;

//   return false;
// };

// const callRapidApiFallback = async (url) => {
//   if (!RAPIDAPI_KEY || !RAPIDAPI_ALL_SOCIAL_URL || !RAPIDAPI_ALL_SOCIAL_HOST) {
//     throw new Error("RapidAPI fallback is not configured.");
//   }

//   const method = String(RAPIDAPI_ALL_SOCIAL_METHOD || "POST").toUpperCase();
//   const urlParam = RAPIDAPI_ALL_SOCIAL_URL_PARAM || "url";

//   const abortController = new AbortController();
//   const timeout = setTimeout(() => abortController.abort(), 45000);

//   let requestUrl = RAPIDAPI_ALL_SOCIAL_URL;
//   const headers = {
//     "x-rapidapi-key": RAPIDAPI_KEY,
//     "x-rapidapi-host": RAPIDAPI_ALL_SOCIAL_HOST,
//   };

//   const options = {
//     method,
//     headers,
//     signal: abortController.signal,
//   };

//   if (method === "GET") {
//     const parsed = new URL(requestUrl);
//     parsed.searchParams.set(urlParam, url);
//     requestUrl = parsed.toString();
//   } else {
//     headers["content-type"] = "application/json";
//     options.body = JSON.stringify({
//       [urlParam]: url,
//     });
//   }

//   try {
//     const response = await fetch(requestUrl, options);
//     const text = await response.text();

//     let data = null;

//     try {
//       data = JSON.parse(text);
//     } catch {
//       data = null;
//     }

//     if (!response.ok) {
//       throw new Error(
//         data?.message ||
//           data?.error ||
//           `RapidAPI fallback failed with status ${response.status}`
//       );
//     }

//     if (!data || data.error === true) {
//       throw new Error(data?.message || data?.error || "RapidAPI fallback failed.");
//     }

//     return data;
//   } finally {
//     clearTimeout(timeout);
//   }
// };

// const getRapidApiMedias = (data = {}) => {
//   if (Array.isArray(data.medias)) return data.medias;
//   if (Array.isArray(data.media)) return data.media;
//   if (Array.isArray(data.links)) return data.links;
//   if (Array.isArray(data.urls)) return data.urls;
//   return [];
// };

// const buildRapidApiPayload = (data = {}, req, originalUrl) => {
//   const medias = getRapidApiMedias(data);
//   const durationSeconds = normalizeDurationSeconds(data.duration);
//   const pageUrl = data.url || data.webpage_url || originalUrl;

//   const rawAudioItems = medias.filter((item) => {
//     const type = String(item.type || "").toLowerCase();
//     const ext = String(item.extension || item.ext || "").toLowerCase();
//     return type === "audio" || ["mp3", "m4a", "aac", "wav"].includes(ext);
//   });

//   const audioFormats = rawAudioItems
//     .filter((item) => isValidHttpUrl(item.url))
//     .map((item, index) => {
//       const normalized = {
//         ...item,
//         ext: item.extension || item.ext || "mp3",
//         filesize: item.data_size || item.filesize || item.size || null,
//         abr: item.abr || item.bitrate || null,
//         duration: item.duration || durationSeconds,
//       };

//       const sizeInfo = getFormatSizeInfo(normalized, durationSeconds, "audio");

//       return {
//         type: "audio",
//         url: item.url,
//         quality: item.quality || "Audio",
//         ext: String(item.extension || item.ext || "mp3").toLowerCase(),
//         size: sizeInfo.size,
//         sizeBytes: sizeInfo.sizeBytes,
//         sizeEstimated: sizeInfo.sizeEstimated,
//         formatId: `rapidapi-audio-${index}`,
//         width: null,
//         height: null,
//         fps: null,
//         vcodec: "none",
//         acodec: "unknown",
//         hasAudio: true,
//         audioUrl: "",
//         audioFormatId: `rapidapi-audio-${index}`,
//         aspectRatio: "audio",
//         sourceEngine: "rapidapi",
//       };
//     });

//   const bestAudio = audioFormats[0] || null;

//   const rawVideoItems = medias.filter((item) => {
//     const type = String(item.type || "").toLowerCase();
//     const ext = String(item.extension || item.ext || "").toLowerCase();
//     return type === "video" || ["mp4", "webm", "mov"].includes(ext);
//   });

//   const videoFormats = rawVideoItems
//     .filter((item) => isValidHttpUrl(item.url))
//     .map((item, index) => {
//       const normalized = {
//         ...item,
//         ext: item.extension || item.ext || "mp4",
//         filesize: item.data_size || item.filesize || item.size || null,
//         duration: durationSeconds,
//       };

//       const sizeInfo = getFormatSizeInfo(normalized, durationSeconds, "video");
//       const hasSeparateAudio = Boolean(bestAudio?.url);

//       return {
//         type: "video",
//         url: item.url,
//         quality: item.quality || getQualityLabel(item),
//         ext: String(item.extension || item.ext || "mp4").toLowerCase(),
//         size: sizeInfo.size,
//         sizeBytes: sizeInfo.sizeBytes,
//         sizeEstimated: sizeInfo.sizeEstimated,
//         formatId: `rapidapi-video-${index}`,
//         width: item.width || null,
//         height: item.height || null,
//         fps: item.fps || null,
//         vcodec: "unknown",
//         acodec: hasSeparateAudio ? "none" : "unknown",
//         hasAudio: !hasSeparateAudio,
//         audioUrl: hasSeparateAudio ? bestAudio.url : "",
//         audioFormatId: hasSeparateAudio ? bestAudio.formatId : "",
//         aspectRatio: getAspectRatio(item.width, item.height, item.aspect_ratio),
//         sourceEngine: "rapidapi",
//       };
//     })
//     .sort((a, b) => {
//       if (a.quality?.includes("no_watermark") && !b.quality?.includes("no_watermark")) return -1;
//       if (!a.quality?.includes("no_watermark") && b.quality?.includes("no_watermark")) return 1;
//       return Number(b.sizeBytes || 0) - Number(a.sizeBytes || 0);
//     })
//     .slice(0, 10);

//   const bestPreview = videoFormats[0] || null;

//   return {
//     status: "success",
//     platform: data.source || data.platform || "fallback",
//     title: sanitizeFileName(data.title || data.caption || data.desc || "Video"),
//     originalTitle: data.title || data.caption || data.desc || "Media",
//     uploader: data.author || data.unique_id || data.uploader || "",
//     thumb: data.thumbnail || data.thumb || data.cover || "",
//     duration: durationSeconds,
//     durationText: formatDuration(durationSeconds) || "--",
//     viewCount: data.statistics?.play_count || data.view_count || null,
//     webpage_url: pageUrl,
//     aspectRatio: bestPreview?.aspectRatio || "landscape",

//     previewUrl: getPublicPreviewUrl(req, pageUrl),
//     previewMode: "raw_or_server",
//     previewHasAudio: Boolean(bestPreview?.hasAudio),
//     previewAudioUrl: bestPreview?.audioUrl || "",

//     rawPreviewUrl: bestPreview?.url || "",
//     rawPreviewHasAudio: Boolean(bestPreview?.hasAudio),
//     rawPreviewAudioUrl: bestPreview?.audioUrl || "",

//     video: videoFormats,
//     audio: audioFormats,
//     urls: [...videoFormats, ...audioFormats],
//     sourceEngine: "rapidapi",
//     fallbackUsed: true,
//   };
// };

// exports.postMedia = async (req, res, next) => {
//   try {
//     const url = req.body.urls;

//     if (!isValidHttpUrl(url)) {
//       return res.status(400).json({
//         status: "fail",
//         code: "INVALID_URL",
//         error: "Valid URL is required",
//       });
//     }

//     let ytDlpPayload = null;
//     let ytDlpError = null;

//     try {
//       const ytDlp = spawn(
//         YTDLP_PATH,
//         [
//           "-J",
//           "--no-playlist",
//           "--no-warnings",
//           "--socket-timeout",
//           "30",
//           url,
//         ],
//         {
//           timeout: 60000,
//           windowsHide: true,
//         }
//       );

//       let stdout = "";
//       let stderr = "";

//       ytDlp.stdout.on("data", (data) => {
//         stdout += data.toString();
//       });

//       ytDlp.stderr.on("data", (data) => {
//         stderr += data.toString();
//       });

//       const ytDlpResult = await new Promise((resolve, reject) => {
//         ytDlp.on("error", reject);

//         ytDlp.on("close", (code) => {
//           let data = null;

//           if (stdout) {
//             try {
//               data = JSON.parse(stdout);
//             } catch {
//               data = null;
//             }
//           }

//           if (code !== 0 && !data) {
//             const friendlyError = normalizeErrorMessage(stderr);
//             const error = new Error(friendlyError.error);
//             error.code = friendlyError.code;
//             error.statusCode = friendlyError.statusCode;
//             error.details = stderr;
//             reject(error);
//             return;
//           }

//           if (!data) {
//             const error = new Error("Invalid yt-dlp response.");
//             error.code = "INVALID_YTDLP_RESPONSE";
//             error.statusCode = 500;
//             error.details = stderr;
//             reject(error);
//             return;
//           }

//           resolve(data);
//         });
//       });

//       ytDlpPayload = buildYtDlpPayload(ytDlpResult, req, url);
//     } catch (err) {
//       ytDlpError = err;
//       console.log("yt-dlp extraction failed, trying fallback:", err.message);
//     }

//     if (!shouldUseFallbackApi(ytDlpPayload)) {
//       if (req.users) {
//         req.users.addActivity({ mediaUrl: url }).catch((err) => {
//           console.log("Activity save error:", err.message);
//         });
//       }

//       return res.status(200).json(ytDlpPayload);
//     }

//     try {
//       const fallbackData = await callRapidApiFallback(url);
//       const fallbackPayload = buildRapidApiPayload(fallbackData, req, url);

//       if (fallbackPayload.video.length || fallbackPayload.audio.length) {
//         if (req.users) {
//           req.users.addActivity({ mediaUrl: url }).catch((err) => {
//             console.log("Activity save error:", err.message);
//           });
//         }

//         return res.status(200).json({
//           ...fallbackPayload,
//           primaryExtractorError: ytDlpError
//             ? {
//                 code: ytDlpError.code || "YTDLP_FAILED",
//                 message: ytDlpError.message,
//               }
//             : undefined,
//         });
//       }
//     } catch (fallbackErr) {
//       console.log("RapidAPI fallback failed:", fallbackErr.message);

//       if (ytDlpPayload && (ytDlpPayload.video.length || ytDlpPayload.audio.length)) {
//         return res.status(200).json({
//           ...ytDlpPayload,
//           fallbackError: fallbackErr.message,
//         });
//       }

//       return res.status(502).json({
//         status: "fail",
//         code: "ALL_EXTRACTORS_FAILED",
//         error:
//           "Both primary extractor and fallback extractor failed. Please try another public video link.",
//         primaryError: ytDlpError?.message || "Primary extractor failed.",
//         fallbackError: fallbackErr.message,
//       });
//     }

//     return res.status(502).json({
//       status: "fail",
//       code: "NO_FORMATS_FOUND",
//       error: "No downloadable video or audio formats found.",
//       primaryError: ytDlpError?.message || "Primary extractor returned no usable formats.",
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

// const streamYtDlpPreview = (url, req, res) => {
//   return new Promise((resolve, reject) => {
//     let started = false;
//     let settled = false;
//     let cleanedUp = false;
//     let ytDlpStderr = "";
//     let ffmpegStderr = "";

//     const finish = () => {
//       if (settled) return;
//       settled = true;
//       resolve();
//     };

//     const fail = (err) => {
//       if (settled) return;
//       settled = true;
//       reject(err);
//     };

//     const ytDlp = spawn(
//       YTDLP_PATH,
//       [
//         "--no-playlist",
//         "--no-warnings",
//         "--socket-timeout",
//         "30",
//         "-f",
//         "best[ext=mp4]/best",
//         "-o",
//         "-",
//         url,
//       ],
//       {
//         windowsHide: true,
//       }
//     );

//     const ffmpeg = spawn(
//       FFMPEG_PATH,
//       [
//         "-hide_banner",
//         "-loglevel",
//         "error",
//         "-nostdin",
//         "-i",
//         "pipe:0",
//         "-map",
//         "0:v:0?",
//         "-map",
//         "0:a:0?",
//         "-c:v",
//         "libx264",
//         "-preset",
//         "veryfast",
//         "-tune",
//         "zerolatency",
//         "-c:a",
//         "aac",
//         "-b:a",
//         "128k",
//         "-movflags",
//         "frag_keyframe+empty_moov+default_base_moof",
//         "-f",
//         "mp4",
//         "pipe:1",
//       ],
//       {
//         windowsHide: true,
//       }
//     );

//     const cleanup = () => {
//       if (cleanedUp) return;
//       cleanedUp = true;

//       try {
//         ytDlp.stdout.unpipe(ffmpeg.stdin);
//       } catch {}

//       try {
//         if (ffmpeg.stdin && !ffmpeg.stdin.destroyed) {
//           ffmpeg.stdin.end();
//         }
//       } catch {}

//       try {
//         if (!ytDlp.killed) ytDlp.kill("SIGKILL");
//       } catch {}

//       try {
//         if (!ffmpeg.killed) ffmpeg.kill("SIGKILL");
//       } catch {}
//     };

//     req.on("aborted", () => {
//       cleanup();
//       finish();
//     });

//     res.on("close", () => {
//       cleanup();
//       finish();
//     });

//     res.on("error", () => {
//       cleanup();
//       finish();
//     });

//     ytDlp.stdout.on("error", (err) => {
//       if (err.code !== "EPIPE") {
//         console.log("yt-dlp stdout error:", err.message);
//       }

//       cleanup();

//       if (!started) fail(err);
//       else finish();
//     });

//     ffmpeg.stdin.on("error", (err) => {
//       if (err.code !== "EPIPE") {
//         console.log("ffmpeg stdin error:", err.message);
//       }

//       cleanup();

//       if (!started) fail(err);
//       else finish();
//     });

//     ffmpeg.stdout.on("error", (err) => {
//       if (err.code !== "EPIPE") {
//         console.log("ffmpeg stdout error:", err.message);
//       }

//       cleanup();

//       if (!started) fail(err);
//       else finish();
//     });

//     ytDlp.stderr.on("data", (data) => {
//       ytDlpStderr += data.toString();
//     });

//     ffmpeg.stderr.on("data", (data) => {
//       ffmpegStderr += data.toString();
//     });

//     ytDlp.on("error", (err) => {
//       cleanup();

//       if (!started) fail(err);
//       else finish();
//     });

//     ffmpeg.on("error", (err) => {
//       cleanup();

//       if (!started) fail(err);
//       else finish();
//     });

//     res.setHeader("Content-Type", "video/mp4");
//     res.setHeader("Cache-Control", "no-store");
//     res.setHeader("X-Accel-Buffering", "no");

//     ytDlp.stdout.pipe(ffmpeg.stdin);

//     ffmpeg.stdout.on("data", (chunk) => {
//       started = true;

//       if (res.destroyed || res.writableEnded) {
//         cleanup();
//         finish();
//         return;
//       }

//       const canContinue = res.write(chunk);

//       if (!canContinue) {
//         ffmpeg.stdout.pause();

//         res.once("drain", () => {
//           if (!res.destroyed && !res.writableEnded) {
//             ffmpeg.stdout.resume();
//           }
//         });
//       }
//     });

//     ffmpeg.stdout.on("end", () => {
//       if (!res.destroyed && !res.writableEnded) {
//         try {
//           res.end();
//         } catch {}
//       }

//       cleanup();
//       finish();
//     });

//     ytDlp.on("close", (code, signal) => {
//       if (cleanedUp || settled) return;

//       if (code !== 0 && signal !== "SIGKILL" && !started) {
//         cleanup();
//         fail(new Error(getCleanProcessError(ytDlpStderr)));
//       }
//     });

//     ffmpeg.on("close", (code, signal) => {
//       if (settled) return;

//       if (code !== 0 && signal !== "SIGKILL" && !started) {
//         cleanup();
//         fail(new Error(getCleanProcessError(ffmpegStderr)));
//         return;
//       }

//       if (!res.destroyed && !res.writableEnded) {
//         try {
//           res.end();
//         } catch {}
//       }

//       cleanup();
//       finish();
//     });
//   });
// };

// exports.previewMedia = async (req, res) => {
//   try {
//     const url = req.query.url;

//     if (!isValidHttpUrl(url)) {
//       return res.status(400).json({
//         status: "fail",
//         code: "INVALID_PREVIEW_URL",
//         error: "Valid preview URL is required.",
//       });
//     }

//     await streamYtDlpPreview(url, req, res);
//   } catch (err) {
//     console.log("Preview stream error:", err.message);

//     if (res.headersSent || res.destroyed || res.writableEnded) {
//       return;
//     }

//     return sendJsonIfConnected(res, 500, {
//       status: "fail",
//       code: "PREVIEW_STREAM_FAILED",
//       error:
//         "Preview could not be streamed. Use rawPreviewUrl/audioUrl from /api/v1/media when available.",
//       details: err.message,
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
//     if (!hasFinished) cleanupProcess();
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

//     if (!["audio", "video"].includes(type)) {
//       hasFinished = true;

//       return sendJsonIfConnected(res, 400, {
//         status: "fail",
//         code: "INVALID_DOWNLOAD_TYPE",
//         error: "Download type must be audio or video.",
//       });
//     }

//     const safeTitle = sanitizeFileName(title || "linkflow-download");
//     const timestamp = Date.now();
//     const extension = type === "audio" ? "mp3" : "mp4";

//     const originalUrlValue = String(originalUrl || "");
//     const hash = getUrlHash(originalUrlValue || videoUrl || audioUrl || timestamp);

//     const outputPath = path.join(
//       outputDir,
//       `${safeTitle}-${timestamp}-${hash}.${extension}`
//     );

//     outputPathToClean = outputPath;

//     const isRapidApiMedia =
//       String(videoFormatId || "").startsWith("rapidapi-") ||
//       String(audioFormatId || "").startsWith("rapidapi-");

//     const runDirectDownload = () => {
//       if (type === "video" && !isValidHttpUrl(videoUrl)) {
//         hasFinished = true;

//         return sendJsonIfConnected(res, 400, {
//           status: "fail",
//           code: "VIDEO_URL_REQUIRED",
//           error: "Valid video URL is required.",
//         });
//       }

//       if (
//         type === "audio" &&
//         !isValidHttpUrl(audioUrl) &&
//         !isValidHttpUrl(videoUrl)
//       ) {
//         hasFinished = true;

//         return sendJsonIfConnected(res, 400, {
//           status: "fail",
//           code: "AUDIO_URL_REQUIRED",
//           error: "Valid audio URL is required.",
//         });
//       }

//       const args = ["-hide_banner", "-loglevel", "error", "-nostdin"];

//       if (type === "audio") {
//         args.push(
//           "-y",
//           "-i",
//           audioUrl || videoUrl,
//           "-vn",
//           "-codec:a",
//           "libmp3lame",
//           "-b:a",
//           "192k",
//           outputPath
//         );
//       } else if (audioUrl) {
//         args.push(
//           "-y",
//           "-i",
//           videoUrl,
//           "-i",
//           audioUrl,
//           "-map",
//           "0:v:0",
//           "-map",
//           "1:a:0",
//           "-c:v",
//           "copy",
//           "-c:a",
//           "aac",
//           "-b:a",
//           "192k",
//           "-movflags",
//           "+faststart",
//           "-shortest",
//           outputPath
//         );
//       } else {
//         args.push(
//           "-y",
//           "-i",
//           videoUrl,
//           "-c",
//           "copy",
//           "-movflags",
//           "+faststart",
//           outputPath
//         );
//       }

//       childProcess = spawn(FFMPEG_PATH, args, {
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

//         console.log("FFmpeg start error:", err.message);

//         return sendJsonIfConnected(res, 500, {
//           status: "fail",
//           code: "FFMPEG_START_FAILED",
//           error:
//             "Download engine failed to start. Please check FFmpeg installation.",
//           details: err.message,
//         });
//       });

//       childProcess.on("close", (code, signal) => {
//         if (isResponded) return;

//         if (clientCancelled || signal === "SIGKILL" || isClientDisconnected(res)) {
//           hasFinished = true;
//           safeDeleteFile(outputPath);
//           return;
//         }

//         if (code !== 0) {
//           isResponded = true;
//           hasFinished = true;

//           safeDeleteFile(outputPath);

//           const cleanError = getCleanProcessError(stderr);
//           console.log("FFmpeg merge failed:", cleanError);

//           return sendJsonIfConnected(res, 500, {
//             status: "fail",
//             code: "FFMPEG_MERGE_FAILED",
//             error: "Download was not completed. Please try another quality.",
//             details: cleanError,
//           });
//         }

//         if (!fs.existsSync(outputPath)) {
//           isResponded = true;
//           hasFinished = true;

//           return sendJsonIfConnected(res, 500, {
//             status: "fail",
//             code: "PREPARED_FILE_NOT_FOUND",
//             error: "Prepared file not found.",
//           });
//         }

//         isResponded = true;
//         hasFinished = true;

//         return sendPreparedFile(res, outputPath, `${safeTitle}.${extension}`);
//       });
//     };

//     const shouldUseYtDlp =
//       isValidHttpUrl(originalUrlValue) && !isRapidApiMedia;

//     if (shouldUseYtDlp) {
//       const outputTemplate = path.join(
//         outputDir,
//         `${safeTitle}-${timestamp}-${hash}.%(ext)s`
//       );

//       const selectedHasAudio = hasAudio === true || hasAudio === "true";

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
//           "-o",
//           outputTemplate,
//           originalUrlValue
//         );
//       } else {
//         let formatSpec =
//           "bestvideo[ext=mp4]+bestaudio[ext=m4a]/bestvideo+bestaudio/best[ext=mp4]/best";

//         if (
//           videoFormatId &&
//           videoFormatId !== "best" &&
//           videoFormatId !== "0" &&
//           selectedHasAudio
//         ) {
//           formatSpec = `${videoFormatId}/best[ext=mp4]/best`;
//         } else if (
//           videoFormatId &&
//           videoFormatId !== "best" &&
//           videoFormatId !== "0" &&
//           audioFormatId
//         ) {
//           formatSpec = `${videoFormatId}+${audioFormatId}/${videoFormatId}+bestaudio/best`;
//         }

//         args.push(
//           "-f",
//           formatSpec,
//           "--merge-output-format",
//           "mp4",
//           "--recode-video",
//           "mp4",
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

//         if (isValidHttpUrl(videoUrl)) {
//           console.log("yt-dlp failed to start, falling back to direct media URL.");
//           isResponded = false;
//           hasFinished = false;
//           return runDirectDownload();
//         }

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
//           if (isValidHttpUrl(videoUrl)) {
//             console.log("yt-dlp download failed, falling back to direct media URL.");
//             return runDirectDownload();
//           }

//           isResponded = true;
//           hasFinished = true;

//           const cleanError = getCleanProcessError(stderr);
//           console.log("yt-dlp download failed:", cleanError);

//           return sendJsonIfConnected(res, 500, {
//             status: "fail",
//             code: "YTDLP_DOWNLOAD_FAILED",
//             error: "Download was not completed. Please try again.",
//             details: cleanError,
//           });
//         }

//         const files = fs
//           .readdirSync(outputDir)
//           .filter((file) =>
//             file.startsWith(`${safeTitle}-${timestamp}-${hash}`)
//           );

//         if (!files.length) {
//           if (isValidHttpUrl(videoUrl)) {
//             console.log("yt-dlp file missing, falling back to direct media URL.");
//             return runDirectDownload();
//           }

//           isResponded = true;
//           hasFinished = true;

//           return sendJsonIfConnected(res, 500, {
//             status: "fail",
//             code: "DOWNLOADED_FILE_NOT_FOUND",
//             error: "Prepared file not found.",
//           });
//         }

//         const filePath = path.join(outputDir, files[0]);
//         const finalName = `${safeTitle}.${type === "audio" ? "mp3" : "mp4"}`;

//         outputPathToClean = filePath;
//         isResponded = true;
//         hasFinished = true;

//         return sendPreparedFile(res, filePath, finalName);
//       });

//       return;
//     }

//     return runDirectDownload();
//   } catch (err) {
//     hasFinished = true;

//     if (clientCancelled || isClientDisconnected(res)) return;

//     console.log("Direct download error:", err.message);

//     return sendJsonIfConnected(res, 500, {
//       status: "fail",
//       code: "DIRECT_DOWNLOAD_FAILED",
//       error: "Download failed. Please try again.",
//     });
//   }
// };

// exports.proxyImage = async (req, res) => {
//   let timeout = null;

//   try {
//     const imageUrl = req.query.url;

//     if (!isValidHttpUrl(imageUrl)) {
//       return res.status(400).json({
//         status: "fail",
//         code: "INVALID_IMAGE_URL",
//         error: "Valid image URL is required",
//       });
//     }

//     const parsedUrl = new URL(imageUrl);
//     const hostname = parsedUrl.hostname.toLowerCase();

//     const blockedHosts = ["localhost", "127.0.0.1", "0.0.0.0", "::1"];

//     if (
//       blockedHosts.includes(hostname) ||
//       hostname.endsWith(".local") ||
//       hostname.startsWith("10.") ||
//       hostname.startsWith("192.168.") ||
//       /^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname)
//     ) {
//       return res.status(400).json({
//         status: "fail",
//         code: "BLOCKED_IMAGE_HOST",
//         error: "This image host is not allowed",
//       });
//     }

//     const abortController = new AbortController();

//     timeout = setTimeout(() => {
//       abortController.abort();
//     }, 15000);

//     const response = await fetch(imageUrl, {
//       signal: abortController.signal,
//       headers: {
//         "User-Agent":
//           "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
//       },
//     });

//     clearTimeout(timeout);

//     if (!response.ok) {
//       return res.status(400).json({
//         status: "fail",
//         code: "IMAGE_FETCH_FAILED",
//         error: "Failed to fetch image",
//       });
//     }

//     const contentType = response.headers.get("content-type") || "";

//     if (!contentType.startsWith("image/")) {
//       return res.status(400).json({
//         status: "fail",
//         code: "INVALID_IMAGE_TYPE",
//         error: "URL does not point to a valid image",
//       });
//     }

//     const contentLength = Number(response.headers.get("content-length") || 0);
//     const maxImageSize = 5 * 1024 * 1024;

//     if (contentLength && contentLength > maxImageSize) {
//       return res.status(413).json({
//         status: "fail",
//         code: "IMAGE_TOO_LARGE",
//         error: "Image is too large",
//       });
//     }

//     const arrayBuffer = await response.arrayBuffer();
//     const buffer = Buffer.from(arrayBuffer);

//     if (buffer.length > maxImageSize) {
//       return res.status(413).json({
//         status: "fail",
//         code: "IMAGE_TOO_LARGE",
//         error: "Image is too large",
//       });
//     }

//     res.setHeader("Content-Type", contentType);
//     res.setHeader("Cache-Control", "public, max-age=86400");

//     return res.send(buffer);
//   } catch (err) {
//     if (timeout) clearTimeout(timeout);

//     console.log("Proxy image error:", err.message);

//     return res.status(500).json({
//       status: "fail",
//       code: "IMAGE_PROXY_FAILED",
//       error: "Image proxy failed",
//     });
//   }
// };

// const cleanupTempFolders = () => {
//   try {
//     for (const dir of [outputDir, previewDir]) {
//       if (!fs.existsSync(dir)) continue;

//       const files = fs.readdirSync(dir);

//       for (const file of files) {
//         safeDeleteFile(path.join(dir, file));
//       }
//     }
//   } catch {}
// };

// process.on("SIGTERM", cleanupTempFolders);
// process.on("SIGINT", cleanupTempFolders);


{ spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

const FFMPEG_PATH = process.env.FFMPEG_PATH || "ffmpeg";
const YTDLP_PATH = process.env.YTDLP_PATH || "yt-dlp";

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || "";
const RAPIDAPI_ALL_SOCIAL_HOST =
  process.env.RAPIDAPI_ALL_SOCIAL_HOST || "auto-download-all-in-one.p.rapidapi.com";
const RAPIDAPI_ALL_SOCIAL_METHOD =
  process.env.RAPIDAPI_ALL_SOCIAL_METHOD || "POST";
const RAPIDAPI_ALL_SOCIAL_URL =
  process.env.RAPIDAPI_ALL_SOCIAL_URL ||
  "https://auto-download-all-in-one.p.rapidapi.com/v1/social/autolink";
const RAPIDAPI_ALL_SOCIAL_URL_PARAM =
  process.env.RAPIDAPI_ALL_SOCIAL_URL_PARAM || "url";

const outputDir = path.join(__dirname, "..", "downloads");
const previewDir = path.join(__dirname, "..", "previews");

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

if (!fs.existsSync(previewDir)) {
  fs.mkdirSync(previewDir, { recursive: true });
}

exports.startApi = (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Welcome To Vidown Api",
  });
};

const isValidHttpUrl = (value = "") => {
  try {
    const parsed = new URL(String(value));
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
};

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

const getContentType = (filePath) => {
  const ext = path.extname(filePath).toLowerCase();

  if (ext === ".mp3") return "audio/mpeg";
  if (ext === ".m4a") return "audio/mp4";
  if (ext === ".webm") return "video/webm";
  if (ext === ".mp4") return "video/mp4";

  return "application/octet-stream";
};

const safeDeleteFile = (filePath) => {
  if (!filePath) return;
  fs.unlink(filePath, () => {});
};

const isClientDisconnected = (res) => {
  return res.destroyed || res.writableEnded || res.headersSent;
};

const sendJsonIfConnected = (res, statusCode, payload) => {
  if (res.destroyed || res.writableEnded || res.headersSent) return;
  return res.status(statusCode).json(payload);
};

const getUrlHash = (value = "") => {
  return crypto
    .createHash("sha256")
    .update(String(value))
    .digest("hex")
    .slice(0, 32);
};

const hasConfirmedAudio = (item = {}) => {
  const acodec = String(item.acodec || "").toLowerCase();
  return Boolean(acodec && acodec !== "none" && acodec !== "unknown");
};

const getCleanProcessError = (stderr = "") => {
  const text = String(stderr || "").trim();

  if (!text) return "Process stopped before completion.";

  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const importantLine =
    lines
      .reverse()
      .find((line) =>
        /error|failed|invalid|unable|not found|permission|denied|login|cookies|private|forbidden|unauthorized|blocked|too many requests|429/i.test(
          line
        )
      ) || lines[0];

  return importantLine || "Download process failed.";
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
  const uploader = data.uploader || data.author || data.unique_id || "";

  const lines = String(description || "")
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean);

  let title =
    lines.find((line) => !isMetricOnlyTitle(line)) ||
    rawTitle ||
    uploader ||
    "Video";

  title = title
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

const normalizeDurationSeconds = (value) => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return null;
  }

  const numeric = Number(value);

  if (numeric > 1000) {
    return numeric / 1000;
  }

  return numeric;
};

const formatDuration = (seconds) => {
  const normalized = normalizeDurationSeconds(seconds);

  if (normalized === null) return null;

  const totalSeconds = Math.floor(Number(normalized));
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
    item.data_size,
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
  const duration = normalizeDurationSeconds(durationSeconds || item.duration || 0);

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
  const duration = normalizeDurationSeconds(durationSeconds || item.duration || 0);

  if (!duration || Number.isNaN(duration) || duration <= 0) {
    return null;
  }

  let bitrateKbps = getEstimatedVideoBitrateKbps(item);

  if (String(item.ext || item.extension || "").toLowerCase() === "webm") {
    bitrateKbps *= 0.85;
  }

  return (bitrateKbps * 1000 * duration) / 8;
};

const estimateAudioSize = (item = {}, durationSeconds) => {
  const duration = normalizeDurationSeconds(durationSeconds || item.duration || 0);

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
  const duration = normalizeDurationSeconds(durationSeconds || 0);

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

const getQualityLabel = (item) => {
  const height = Number(item.height || 0);

  if (item.quality && !String(item.quality).includes("_")) {
    return String(item.quality);
  }

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

  return item.format_note || item.resolution || item.format_id || item.quality || "Default";
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

const normalizeErrorMessage = (stderr = "") => {
  const lowerError = stderr.toLowerCase();

  const isFacebookError =
    lowerError.includes("[facebook]") ||
    lowerError.includes("facebook") ||
    lowerError.includes("cannot parse data");

  const isCookieError =
    lowerError.includes("cookies") ||
    lowerError.includes("login") ||
    lowerError.includes("private") ||
    lowerError.includes("not available") ||
    lowerError.includes("sign in");

  const isRateLimitOrBlockError =
    lowerError.includes("429") ||
    lowerError.includes("too many requests") ||
    lowerError.includes("blocked") ||
    lowerError.includes("forbidden") ||
    lowerError.includes("http error 403");

  const isUnsupportedError =
    lowerError.includes("unsupported url") ||
    lowerError.includes("no suitable extractor");

  if (isFacebookError) {
    return {
      statusCode: 422,
      code: "FACEBOOK_EXTRACT_FAILED",
      error:
        "Facebook could not fully process this link. Trying fallback extractor may help.",
    };
  }

  if (isCookieError) {
    return {
      statusCode: 401,
      code: "LOGIN_OR_COOKIES_REQUIRED",
      error:
        "This video may require login or cookies. Trying fallback extractor may help.",
    };
  }

  if (isRateLimitOrBlockError) {
    return {
      statusCode: 429,
      code: "YTDLP_BLOCKED_OR_RATE_LIMITED",
      error:
        "The primary extractor appears blocked or rate limited. Trying fallback extractor may help.",
    };
  }

  if (isUnsupportedError) {
    return {
      statusCode: 400,
      code: "UNSUPPORTED_URL",
      error:
        "This website or link format is not supported by the primary extractor.",
    };
  }

  return {
    statusCode: 500,
    code: "MEDIA_EXTRACT_FAILED",
    error:
      "Unable to extract this media with the primary extractor.",
  };
};

const getPublicPreviewUrl = (req, originalUrl) => {
  const baseUrl = `${req.protocol}://${req.get("host")}`;
  return `${baseUrl}/api/v1/preview?url=${encodeURIComponent(originalUrl)}`;
};

const normalizeFormats = (data = {}, originalUrl = "") => {
  let allFormats = Array.isArray(data.formats) ? data.formats : [];

  if (!allFormats.length && data.url) {
    allFormats = [
      {
        url: data.url,
        ext: data.ext || "mp4",
        format_id: data.format_id || "fallback-direct",
        format_note: data.format_note || data.resolution || "Default",
        width: data.width || null,
        height: data.height || null,
        fps: data.fps || null,
        vcodec: data.vcodec || "unknown",
        acodec: data.acodec || "unknown",
        filesize: data.filesize || data.filesize_approx || null,
        filesize_approx: data.filesize_approx || null,
        tbr: data.tbr || null,
        abr: data.abr || null,
        duration: data.duration || null,
      },
    ];
  }

  if (
    !allFormats.length &&
    Array.isArray(data.requested_downloads) &&
    data.requested_downloads.length
  ) {
    allFormats = data.requested_downloads
      .filter((item) => item.url)
      .map((item) => ({
        url: item.url,
        ext: item.ext || data.ext || "mp4",
        format_id: item.format_id || data.format_id || "fallback-requested",
        format_note:
          item.format_note || item.resolution || data.resolution || "Default",
        width: item.width || data.width || null,
        height: item.height || data.height || null,
        fps: item.fps || data.fps || null,
        vcodec: item.vcodec || data.vcodec || "unknown",
        acodec: item.acodec || data.acodec || "unknown",
        filesize:
          item.filesize ||
          item.filesize_approx ||
          data.filesize ||
          data.filesize_approx ||
          null,
        filesize_approx: item.filesize_approx || data.filesize_approx || null,
        tbr: item.tbr || data.tbr || null,
        abr: item.abr || data.abr || null,
        duration: item.duration || data.duration || null,
      }));
  }

  if (!allFormats.length && isValidHttpUrl(originalUrl)) {
    allFormats = [
      {
        url: originalUrl,
        ext: "mp4",
        format_id: "best",
        format_note: "Default",
        width: data.width || null,
        height: data.height || null,
        fps: data.fps || null,
        vcodec: "unknown",
        acodec: "unknown",
        filesize: null,
        filesize_approx: null,
        tbr: null,
        abr: null,
        duration: data.duration || null,
        isOriginalUrlFallback: true,
      },
    ];
  }

  return allFormats;
};

const buildYtDlpPayload = (data = {}, req, originalUrl) => {
  const originalPageUrl = data.webpage_url || originalUrl;
  const allFormats = normalizeFormats(data, originalPageUrl);
  const durationSeconds = normalizeDurationSeconds(data.duration);

  const audioFormats = allFormats
    .filter((item) => {
      const acodec = String(item.acodec || "").toLowerCase();
      const vcodec = String(item.vcodec || "").toLowerCase();

      return (
        item.url &&
        acodec &&
        acodec !== "none" &&
        acodec !== "unknown" &&
        (!vcodec || vcodec === "none")
      );
    })
    .map((item) => {
      const sizeInfo = getFormatSizeInfo(item, durationSeconds, "audio");

      return {
        type: "audio",
        url: item.url,
        quality:
          item.abr || item.asr
            ? `${Math.round(item.abr || item.asr)} kbps`
            : item.format_note || "Audio",
        ext: String(item.ext || "m4a").toLowerCase(),
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
        sourceEngine: "yt-dlp",
      };
    })
    .filter(
      (item, index, self) =>
        index ===
        self.findIndex((x) => x.quality === item.quality && x.ext === item.ext)
    )
    .slice(0, 8);

  const bestAudio =
    audioFormats.find((item) => item.ext === "m4a") || audioFormats[0] || null;

  const progressiveVideoFormats = allFormats
    .filter((item) => {
      const ext = String(item.ext || "mp4").toLowerCase();
      const vcodec = String(item.vcodec || "unknown").toLowerCase();
      const acodec = String(item.acodec || "unknown").toLowerCase();

      return (
        item.url &&
        ["mp4", "webm", "mov"].includes(ext) &&
        vcodec !== "none" &&
        acodec !== "none"
      );
    })
    .map((item) => {
      const sizeInfo = getFormatSizeInfo(item, durationSeconds, "video");
      const confirmedAudio = hasConfirmedAudio(item);

      return {
        type: "video",
        url: item.url,
        quality: getQualityLabel(item),
        ext: String(item.ext || "mp4").toLowerCase(),
        size: sizeInfo.size,
        sizeBytes: sizeInfo.sizeBytes,
        sizeEstimated: sizeInfo.sizeEstimated,
        formatId: item.format_id || "best",
        width: item.width || null,
        height: item.height || null,
        fps: item.fps || null,
        vcodec: item.vcodec || "unknown",
        acodec: item.acodec || "unknown",
        hasAudio: confirmedAudio,
        audioUrl: confirmedAudio ? "" : bestAudio?.url || "",
        audioFormatId: confirmedAudio ? "" : bestAudio?.formatId || "",
        aspectRatio: getAspectRatio(item.width, item.height, item.aspect_ratio),
        isOriginalUrlFallback: Boolean(item.isOriginalUrlFallback),
        sourceEngine: "yt-dlp",
      };
    });

  const dashVideoFormats = allFormats
    .filter((item) => {
      const ext = String(item.ext || "mp4").toLowerCase();
      const vcodec = String(item.vcodec || "").toLowerCase();
      const acodec = String(item.acodec || "").toLowerCase();

      return (
        item.url &&
        vcodec &&
        vcodec !== "none" &&
        (!acodec || acodec === "none") &&
        ["mp4", "webm", "mov"].includes(ext)
      );
    })
    .map((item) => {
      const sizeInfo = getFormatSizeInfo(item, durationSeconds, "video");

      return {
        type: "video",
        url: item.url,
        quality: getQualityLabel(item),
        ext: String(item.ext || "mp4").toLowerCase(),
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
        aspectRatio: getAspectRatio(item.width, item.height, item.aspect_ratio),
        sourceEngine: "yt-dlp",
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

  return {
    status: "success",
    platform: data.extractor_key || data.extractor || "unknown",
    title: getCleanTitle(data),
    originalTitle: data.title || data.fulltitle || "Media",
    uploader: data.uploader || "",
    thumb: data.thumbnail || "",
    duration: durationSeconds,
    durationText: formatDuration(durationSeconds) || data.duration_string || "--",
    viewCount: data.view_count || null,
    webpage_url: originalPageUrl,
    aspectRatio: bestPreview?.aspectRatio || "landscape",

    previewUrl: getPublicPreviewUrl(req, originalPageUrl),
    previewMode: "server",
    previewHasAudio: true,
    previewAudioUrl: "",

    rawPreviewUrl:
      bestPreview && !bestPreview.isOriginalUrlFallback ? bestPreview.url : "",
    rawPreviewHasAudio: Boolean(bestPreview?.hasAudio),
    rawPreviewAudioUrl:
      bestPreview && !bestPreview.hasAudio ? bestPreview.audioUrl : "",

    video: videoFormats,
    audio: audioFormats,
    urls: [...videoFormats, ...audioFormats],
    sourceEngine: "yt-dlp",
  };
};

const shouldUseFallbackApi = (payload) => {
  if (!payload || payload.status !== "success") return true;

  const videos = Array.isArray(payload.video) ? payload.video : [];
  const audios = Array.isArray(payload.audio) ? payload.audio : [];

  if (!videos.length && !audios.length) return true;

  const hasProperVideo = videos.some((item) => {
    const ext = String(item.ext || "").toLowerCase();
    return item.url && ["mp4", "webm", "mov"].includes(ext);
  });

  if (!hasProperVideo) return true;

  const hasConfirmedVideoAudio = videos.some((item) => item.hasAudio === true);
  const hasSeparateAudio = audios.length > 0 || videos.some((item) => item.audioUrl);

  /**
   * If yt-dlp gives only video with unknown/none audio and no separate audio,
   * fallback API is more likely to return usable video+audio links.
   */
  if (!hasConfirmedVideoAudio && !hasSeparateAudio) return true;

  return false;
};

const callRapidApiFallback = async (url) => {
  if (!RAPIDAPI_KEY || !RAPIDAPI_ALL_SOCIAL_URL || !RAPIDAPI_ALL_SOCIAL_HOST) {
    throw new Error("RapidAPI fallback is not configured.");
  }

  const method = String(RAPIDAPI_ALL_SOCIAL_METHOD || "POST").toUpperCase();
  const urlParam = RAPIDAPI_ALL_SOCIAL_URL_PARAM || "url";

  const abortController = new AbortController();
  const timeout = setTimeout(() => abortController.abort(), 45000);

  let requestUrl = RAPIDAPI_ALL_SOCIAL_URL;
  const headers = {
    "x-rapidapi-key": RAPIDAPI_KEY,
    "x-rapidapi-host": RAPIDAPI_ALL_SOCIAL_HOST,
  };

  const options = {
    method,
    headers,
    signal: abortController.signal,
  };

  if (method === "GET") {
    const parsed = new URL(requestUrl);
    parsed.searchParams.set(urlParam, url);
    requestUrl = parsed.toString();
  } else {
    headers["content-type"] = "application/json";
    options.body = JSON.stringify({
      [urlParam]: url,
    });
  }

  try {
    const response = await fetch(requestUrl, options);
    const text = await response.text();

    let data = null;

    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }

    if (!response.ok) {
      throw new Error(
        data?.message ||
          data?.error ||
          `RapidAPI fallback failed with status ${response.status}`
      );
    }

    if (!data || data.error === true) {
      throw new Error(data?.message || data?.error || "RapidAPI fallback failed.");
    }

    return data;
  } finally {
    clearTimeout(timeout);
  }
};

const getRapidApiMedias = (data = {}) => {
  if (Array.isArray(data.medias)) return data.medias;
  if (Array.isArray(data.media)) return data.media;
  if (Array.isArray(data.links)) return data.links;
  if (Array.isArray(data.urls)) return data.urls;
  return [];
};

const buildRapidApiPayload = (data = {}, req, originalUrl) => {
  const medias = getRapidApiMedias(data);
  const durationSeconds = normalizeDurationSeconds(data.duration);
  const pageUrl = data.url || data.webpage_url || originalUrl;

  const rawAudioItems = medias.filter((item) => {
    const type = String(item.type || "").toLowerCase();
    const ext = String(item.extension || item.ext || "").toLowerCase();
    return type === "audio" || ["mp3", "m4a", "aac", "wav"].includes(ext);
  });

  const audioFormats = rawAudioItems
    .filter((item) => isValidHttpUrl(item.url))
    .map((item, index) => {
      const normalized = {
        ...item,
        ext: item.extension || item.ext || "mp3",
        filesize: item.data_size || item.filesize || item.size || null,
        abr: item.abr || item.bitrate || null,
        duration: item.duration || durationSeconds,
      };

      const sizeInfo = getFormatSizeInfo(normalized, durationSeconds, "audio");

      return {
        type: "audio",
        url: item.url,
        quality: item.quality || "Audio",
        ext: String(item.extension || item.ext || "mp3").toLowerCase(),
        size: sizeInfo.size,
        sizeBytes: sizeInfo.sizeBytes,
        sizeEstimated: sizeInfo.sizeEstimated,
        formatId: `rapidapi-audio-${index}`,
        width: null,
        height: null,
        fps: null,
        vcodec: "none",
        acodec: "unknown",
        hasAudio: true,
        audioUrl: "",
        audioFormatId: `rapidapi-audio-${index}`,
        aspectRatio: "audio",
        sourceEngine: "rapidapi",
      };
    });

  const bestAudio = audioFormats[0] || null;

  const rawVideoItems = medias.filter((item) => {
    const type = String(item.type || "").toLowerCase();
    const ext = String(item.extension || item.ext || "").toLowerCase();
    return type === "video" || ["mp4", "webm", "mov"].includes(ext);
  });

  const videoFormats = rawVideoItems
    .filter((item) => isValidHttpUrl(item.url))
    .map((item, index) => {
      const normalized = {
        ...item,
        ext: item.extension || item.ext || "mp4",
        filesize: item.data_size || item.filesize || item.size || null,
        duration: durationSeconds,
      };

      const sizeInfo = getFormatSizeInfo(normalized, durationSeconds, "video");
      const hasSeparateAudio = Boolean(bestAudio?.url);

      return {
        type: "video",
        url: item.url,
        quality: item.quality || getQualityLabel(item),
        ext: String(item.extension || item.ext || "mp4").toLowerCase(),
        size: sizeInfo.size,
        sizeBytes: sizeInfo.sizeBytes,
        sizeEstimated: sizeInfo.sizeEstimated,
        formatId: `rapidapi-video-${index}`,
        width: item.width || null,
        height: item.height || null,
        fps: item.fps || null,
        vcodec: "unknown",
        acodec: hasSeparateAudio ? "none" : "unknown",
        hasAudio: !hasSeparateAudio,
        audioUrl: hasSeparateAudio ? bestAudio.url : "",
        audioFormatId: hasSeparateAudio ? bestAudio.formatId : "",
        aspectRatio: getAspectRatio(item.width, item.height, item.aspect_ratio),
        sourceEngine: "rapidapi",
      };
    })
    .sort((a, b) => {
      if (a.quality?.includes("no_watermark") && !b.quality?.includes("no_watermark")) return -1;
      if (!a.quality?.includes("no_watermark") && b.quality?.includes("no_watermark")) return 1;
      return Number(b.sizeBytes || 0) - Number(a.sizeBytes || 0);
    })
    .slice(0, 10);

  const bestPreview = videoFormats[0] || null;

  return {
    status: "success",
    platform: data.source || data.platform || "fallback",
    title: sanitizeFileName(data.title || data.caption || data.desc || "Video"),
    originalTitle: data.title || data.caption || data.desc || "Media",
    uploader: data.author || data.unique_id || data.uploader || "",
    thumb: data.thumbnail || data.thumb || data.cover || "",
    duration: durationSeconds,
    durationText: formatDuration(durationSeconds) || "--",
    viewCount: data.statistics?.play_count || data.view_count || null,
    webpage_url: pageUrl,
    aspectRatio: bestPreview?.aspectRatio || "landscape",

    previewUrl: getPublicPreviewUrl(req, pageUrl),
    previewMode: "raw_or_server",
    previewHasAudio: Boolean(bestPreview?.hasAudio),
    previewAudioUrl: bestPreview?.audioUrl || "",

    rawPreviewUrl: bestPreview?.url || "",
    rawPreviewHasAudio: Boolean(bestPreview?.hasAudio),
    rawPreviewAudioUrl: bestPreview?.audioUrl || "",

    video: videoFormats,
    audio: audioFormats,
    urls: [...videoFormats, ...audioFormats],
    sourceEngine: "rapidapi",
    fallbackUsed: true,
  };
};


const getBestRapidApiMediaPair = async (originalUrlValue) => {
  console.log("[DOWNLOAD] RapidAPI fallback requested for:", originalUrlValue);

  const fallbackData = await callRapidApiFallback(originalUrlValue);
  const medias = getRapidApiMedias(fallbackData);

  const audioItems = medias.filter((item) => {
    const type = String(item.type || "").toLowerCase();
    const ext = String(item.extension || item.ext || "").toLowerCase();

    return type === "audio" || ["mp3", "m4a", "aac", "wav"].includes(ext);
  });

  const videoItems = medias.filter((item) => {
    const type = String(item.type || "").toLowerCase();
    const ext = String(item.extension || item.ext || "").toLowerCase();

    return type === "video" || ["mp4", "webm", "mov"].includes(ext);
  });

  const sortedVideos = videoItems
    .filter((item) => isValidHttpUrl(item.url))
    .sort((a, b) => {
      const aQuality = String(a.quality || "").toLowerCase();
      const bQuality = String(b.quality || "").toLowerCase();

      if (aQuality.includes("hd") && !bQuality.includes("hd")) return -1;
      if (!aQuality.includes("hd") && bQuality.includes("hd")) return 1;

      if (
        aQuality.includes("no_watermark") &&
        !bQuality.includes("no_watermark")
      ) {
        return -1;
      }

      if (
        !aQuality.includes("no_watermark") &&
        bQuality.includes("no_watermark")
      ) {
        return 1;
      }

      const aHeight = Number(a.height || 0);
      const bHeight = Number(b.height || 0);

      if (bHeight !== aHeight) return bHeight - aHeight;

      return Number(b.data_size || b.size || 0) - Number(a.data_size || a.size || 0);
    });

  const bestVideo = sortedVideos[0] || null;
  const bestAudio = audioItems.find((item) => isValidHttpUrl(item.url)) || null;

  if (!bestVideo?.url) {
    throw new Error("RapidAPI fallback returned no downloadable video.");
  }

  console.log(
    "[DOWNLOAD] RapidAPI fallback selected:",
    JSON.stringify({
      videoQuality: bestVideo.quality || "video",
      videoSize: bestVideo.data_size || bestVideo.size || null,
      hasSeparateAudio: Boolean(bestAudio?.url),
      audioQuality: bestAudio?.quality || null,
    })
  );

  return {
    videoUrl: bestVideo.url,
    audioUrl: bestAudio?.url || "",
    sourceEngine: "rapidapi",
  };
};


exports.postMedia = async (req, res, next) => {
  try {
    const url = req.body.urls;

    if (!isValidHttpUrl(url)) {
      return res.status(400).json({
        status: "fail",
        code: "INVALID_URL",
        error: "Valid URL is required",
      });
    }

    let ytDlpPayload = null;
    let ytDlpError = null;

    try {
      const ytDlp = spawn(
        YTDLP_PATH,
        [
          "-J",
          "--no-playlist",
          "--no-warnings",
          "--socket-timeout",
          "30",
          url,
        ],
        {
          timeout: 60000,
          windowsHide: true,
        }
      );

      let stdout = "";
      let stderr = "";

      ytDlp.stdout.on("data", (data) => {
        stdout += data.toString();
      });

      ytDlp.stderr.on("data", (data) => {
        stderr += data.toString();
      });

      const ytDlpResult = await new Promise((resolve, reject) => {
        ytDlp.on("error", reject);

        ytDlp.on("close", (code) => {
          let data = null;

          if (stdout) {
            try {
              data = JSON.parse(stdout);
            } catch {
              data = null;
            }
          }

          if (code !== 0 && !data) {
            const friendlyError = normalizeErrorMessage(stderr);
            const error = new Error(friendlyError.error);
            error.code = friendlyError.code;
            error.statusCode = friendlyError.statusCode;
            error.details = stderr;
            reject(error);
            return;
          }

          if (!data) {
            const error = new Error("Invalid yt-dlp response.");
            error.code = "INVALID_YTDLP_RESPONSE";
            error.statusCode = 500;
            error.details = stderr;
            reject(error);
            return;
          }

          resolve(data);
        });
      });

      ytDlpPayload = buildYtDlpPayload(ytDlpResult, req, url);
      console.log("[MEDIA] yt-dlp extracted:", JSON.stringify({ video: ytDlpPayload.video.length, audio: ytDlpPayload.audio.length }));
    } catch (err) {
      ytDlpError = err;
      console.log("yt-dlp extraction failed, trying fallback:", err.message);
    }

    if (!shouldUseFallbackApi(ytDlpPayload)) {
      if (req.users) {
        req.users.addActivity({ mediaUrl: url }).catch((err) => {
          console.log("Activity save error:", err.message);
        });
      }

      console.log("[MEDIA] using yt-dlp response");
      return res.status(200).json({
        ...ytDlpPayload,
        sourceEngine: "yt-dlp",
        fallbackUsed: false,
      });
    }

    try {
      const fallbackData = await callRapidApiFallback(url);
      const fallbackPayload = buildRapidApiPayload(fallbackData, req, url);

      if (fallbackPayload.video.length || fallbackPayload.audio.length) {
        if (req.users) {
          req.users.addActivity({ mediaUrl: url }).catch((err) => {
            console.log("Activity save error:", err.message);
          });
        }

        console.log("[MEDIA] using RapidAPI fallback response");
        return res.status(200).json({
          ...fallbackPayload,
          primaryExtractorError: ytDlpError
            ? {
                code: ytDlpError.code || "YTDLP_FAILED",
                message: ytDlpError.message,
              }
            : undefined,
        });
      }
    } catch (fallbackErr) {
      console.log("RapidAPI fallback failed:", fallbackErr.message);

      if (ytDlpPayload && (ytDlpPayload.video.length || ytDlpPayload.audio.length)) {
        return res.status(200).json({
          ...ytDlpPayload,
          fallbackError: fallbackErr.message,
        });
      }

      return res.status(502).json({
        status: "fail",
        code: "ALL_EXTRACTORS_FAILED",
        error:
          "Both primary extractor and fallback extractor failed. Please try another public video link.",
        primaryError: ytDlpError?.message || "Primary extractor failed.",
        fallbackError: fallbackErr.message,
      });
    }

    return res.status(502).json({
      status: "fail",
      code: "NO_FORMATS_FOUND",
      error: "No downloadable video or audio formats found.",
      primaryError: ytDlpError?.message || "Primary extractor returned no usable formats.",
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

const streamYtDlpPreview = (url, req, res) => {
  return new Promise((resolve, reject) => {
    let started = false;
    let settled = false;
    let cleanedUp = false;
    let ytDlpStderr = "";
    let ffmpegStderr = "";

    const finish = () => {
      if (settled) return;
      settled = true;
      resolve();
    };

    const fail = (err) => {
      if (settled) return;
      settled = true;
      reject(err);
    };

    const ytDlp = spawn(
      YTDLP_PATH,
      [
        "--no-playlist",
        "--no-warnings",
        "--socket-timeout",
        "30",
        "-f",
        "best[ext=mp4]/best",
        "-o",
        "-",
        url,
      ],
      {
        windowsHide: true,
      }
    );

    const ffmpeg = spawn(
      FFMPEG_PATH,
      [
        "-hide_banner",
        "-loglevel",
        "error",
        "-nostdin",
        "-i",
        "pipe:0",
        "-map",
        "0:v:0?",
        "-map",
        "0:a:0?",
        "-c:v",
        "libx264",
        "-preset",
        "veryfast",
        "-tune",
        "zerolatency",
        "-c:a",
        "aac",
        "-b:a",
        "128k",
        "-movflags",
        "frag_keyframe+empty_moov+default_base_moof",
        "-f",
        "mp4",
        "pipe:1",
      ],
      {
        windowsHide: true,
      }
    );

    const cleanup = () => {
      if (cleanedUp) return;
      cleanedUp = true;

      try {
        ytDlp.stdout.unpipe(ffmpeg.stdin);
      } catch {}

      try {
        if (ffmpeg.stdin && !ffmpeg.stdin.destroyed) {
          ffmpeg.stdin.end();
        }
      } catch {}

      try {
        if (!ytDlp.killed) ytDlp.kill("SIGKILL");
      } catch {}

      try {
        if (!ffmpeg.killed) ffmpeg.kill("SIGKILL");
      } catch {}
    };

    req.on("aborted", () => {
      cleanup();
      finish();
    });

    res.on("close", () => {
      cleanup();
      finish();
    });

    res.on("error", () => {
      cleanup();
      finish();
    });

    ytDlp.stdout.on("error", (err) => {
      if (err.code !== "EPIPE") {
        console.log("yt-dlp stdout error:", err.message);
      }

      cleanup();

      if (!started) fail(err);
      else finish();
    });

    ffmpeg.stdin.on("error", (err) => {
      if (err.code !== "EPIPE") {
        console.log("ffmpeg stdin error:", err.message);
      }

      cleanup();

      if (!started) fail(err);
      else finish();
    });

    ffmpeg.stdout.on("error", (err) => {
      if (err.code !== "EPIPE") {
        console.log("ffmpeg stdout error:", err.message);
      }

      cleanup();

      if (!started) fail(err);
      else finish();
    });

    ytDlp.stderr.on("data", (data) => {
      ytDlpStderr += data.toString();
    });

    ffmpeg.stderr.on("data", (data) => {
      ffmpegStderr += data.toString();
    });

    ytDlp.on("error", (err) => {
      cleanup();

      if (!started) fail(err);
      else finish();
    });

    ffmpeg.on("error", (err) => {
      cleanup();

      if (!started) fail(err);
      else finish();
    });

    res.setHeader("Content-Type", "video/mp4");
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("X-Accel-Buffering", "no");

    ytDlp.stdout.pipe(ffmpeg.stdin);

    ffmpeg.stdout.on("data", (chunk) => {
      started = true;

      if (res.destroyed || res.writableEnded) {
        cleanup();
        finish();
        return;
      }

      const canContinue = res.write(chunk);

      if (!canContinue) {
        ffmpeg.stdout.pause();

        res.once("drain", () => {
          if (!res.destroyed && !res.writableEnded) {
            ffmpeg.stdout.resume();
          }
        });
      }
    });

    ffmpeg.stdout.on("end", () => {
      if (!res.destroyed && !res.writableEnded) {
        try {
          res.end();
        } catch {}
      }

      cleanup();
      finish();
    });

    ytDlp.on("close", (code, signal) => {
      if (cleanedUp || settled) return;

      if (code !== 0 && signal !== "SIGKILL" && !started) {
        cleanup();
        fail(new Error(getCleanProcessError(ytDlpStderr)));
      }
    });

    ffmpeg.on("close", (code, signal) => {
      if (settled) return;

      if (code !== 0 && signal !== "SIGKILL" && !started) {
        cleanup();
        fail(new Error(getCleanProcessError(ffmpegStderr)));
        return;
      }

      if (!res.destroyed && !res.writableEnded) {
        try {
          res.end();
        } catch {}
      }

      cleanup();
      finish();
    });
  });
};

exports.previewMedia = async (req, res) => {
  try {
    const url = req.query.url;

    if (!isValidHttpUrl(url)) {
      return res.status(400).json({
        status: "fail",
        code: "INVALID_PREVIEW_URL",
        error: "Valid preview URL is required.",
      });
    }

    await streamYtDlpPreview(url, req, res);
  } catch (err) {
    console.log("Preview stream error:", err.message);

    if (res.headersSent || res.destroyed || res.writableEnded) {
      return;
    }

    return sendJsonIfConnected(res, 500, {
      status: "fail",
      code: "PREVIEW_STREAM_FAILED",
      error:
        "Preview could not be streamed. Use rawPreviewUrl/audioUrl from /api/v1/media when available.",
      details: err.message,
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
    if (!hasFinished) cleanupProcess();
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

    if (!["audio", "video"].includes(type)) {
      hasFinished = true;

      return sendJsonIfConnected(res, 400, {
        status: "fail",
        code: "INVALID_DOWNLOAD_TYPE",
        error: "Download type must be audio or video.",
      });
    }

    const safeTitle = sanitizeFileName(title || "linkflow-download");
    const timestamp = Date.now();
    const extension = type === "audio" ? "mp3" : "mp4";

    const originalUrlValue = String(originalUrl || "");
    const hash = getUrlHash(originalUrlValue || videoUrl || audioUrl || timestamp);

    const outputPath = path.join(
      outputDir,
      `${safeTitle}-${timestamp}-${hash}.${extension}`
    );

    outputPathToClean = outputPath;

    const isRapidApiMedia =
      String(videoFormatId || "").startsWith("rapidapi-") ||
      String(audioFormatId || "").startsWith("rapidapi-");

    const runDirectDownload = (engineName = "direct") => {
      const currentVideoUrl = req.body.videoUrl || videoUrl;
      const currentAudioUrl = req.body.audioUrl || audioUrl;

      console.log("[DOWNLOAD] using engine:", engineName);

      if (type === "video" && !isValidHttpUrl(currentVideoUrl)) {
        hasFinished = true;

        return sendJsonIfConnected(res, 400, {
          status: "fail",
          code: "VIDEO_URL_REQUIRED",
          error: "Valid video URL is required.",
        });
      }

      if (
        type === "audio" &&
        !isValidHttpUrl(currentAudioUrl) &&
        !isValidHttpUrl(currentVideoUrl)
      ) {
        hasFinished = true;

        return sendJsonIfConnected(res, 400, {
          status: "fail",
          code: "AUDIO_URL_REQUIRED",
          error: "Valid audio URL is required.",
        });
      }

      const args = ["-hide_banner", "-loglevel", "error", "-nostdin"];

      if (type === "audio") {
        args.push(
          "-y",
          "-i",
          currentAudioUrl || currentVideoUrl,
          "-vn",
          "-codec:a",
          "libmp3lame",
          "-b:a",
          "192k",
          outputPath
        );
      } else if (audioUrl) {
        args.push(
          "-y",
          "-i",
          currentVideoUrl,
          "-i",
          currentAudioUrl,
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
      } else {
        args.push(
          "-y",
          "-i",
          currentVideoUrl,
          "-c",
          "copy",
          "-movflags",
          "+faststart",
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

        res.setHeader("X-Download-Engine", engineName);
        res.setHeader("X-Fallback-Used", engineName.includes("rapidapi") ? "true" : "false");

        return sendPreparedFile(res, outputPath, `${safeTitle}.${extension}`);
      });
    };

    const shouldUseYtDlp =
      isValidHttpUrl(originalUrlValue) && !isRapidApiMedia;

    if (shouldUseYtDlp) {
      const outputTemplate = path.join(
        outputDir,
        `${safeTitle}-${timestamp}-${hash}.%(ext)s`
      );

      const selectedHasAudio = hasAudio === true || hasAudio === "true";

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
          audioFormatId || "bestaudio/best",
          "-x",
          "--audio-format",
          "mp3",
          "-o",
          outputTemplate,
          originalUrlValue
        );
      } else {
        let formatSpec =
          "bestvideo[ext=mp4]+bestaudio[ext=m4a]/bestvideo+bestaudio/best[ext=mp4]/best";

        if (
          videoFormatId &&
          videoFormatId !== "best" &&
          videoFormatId !== "0" &&
          selectedHasAudio
        ) {
          formatSpec = `${videoFormatId}/best[ext=mp4]/best`;
        } else if (
          videoFormatId &&
          videoFormatId !== "best" &&
          videoFormatId !== "0" &&
          audioFormatId
        ) {
          formatSpec = `${videoFormatId}+${audioFormatId}/${videoFormatId}+bestaudio/best`;
        }

        args.push(
          "-f",
          formatSpec,
          "--merge-output-format",
          "mp4",
          "--recode-video",
          "mp4",
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

      childProcess.on("error", async (err) => {
        if (isResponded || clientCancelled || isClientDisconnected(res)) return;

        isResponded = true;
        hasFinished = true;

        console.log("yt-dlp start error:", err.message);

        try {
          console.log("[DOWNLOAD] yt-dlp failed to start, trying RapidAPI fallback...");

          const fallbackPair = await getBestRapidApiMediaPair(originalUrlValue);

          req.body.videoUrl = fallbackPair.videoUrl;
          req.body.audioUrl = fallbackPair.audioUrl;
          req.body.videoFormatId = "rapidapi-video-auto";
          req.body.audioFormatId = fallbackPair.audioUrl ? "rapidapi-audio-auto" : "";
          req.body.hasAudio = !fallbackPair.audioUrl;

          isResponded = true;
          hasFinished = false;

          return runDirectDownload("rapidapi-fallback-after-ytdlp-start-error");
        } catch (fallbackErr) {
          console.log("[DOWNLOAD] RapidAPI fallback after start error failed:", fallbackErr.message);

          isResponded = true;
          hasFinished = true;

          return sendJsonIfConnected(res, 500, {
            status: "fail",
            code: "YTDLP_DOWNLOAD_START_FAILED",
            error: "Download engine failed to start and fallback failed.",
            details: err.message,
            fallbackError: fallbackErr.message,
            downloadEngine: "yt-dlp",
            fallbackUsed: true,
          });
        }
      });

      childProcess.on("close", async (code, signal) => {
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
          const cleanError = getCleanProcessError(stderr);
          console.log("[DOWNLOAD] yt-dlp download failed:", cleanError);

          try {
            console.log("[DOWNLOAD] trying RapidAPI fallback after yt-dlp failure...");

            const fallbackPair = await getBestRapidApiMediaPair(originalUrlValue);

            req.body.videoUrl = fallbackPair.videoUrl;
            req.body.audioUrl = fallbackPair.audioUrl;
            req.body.videoFormatId = "rapidapi-video-auto";
            req.body.audioFormatId = fallbackPair.audioUrl ? "rapidapi-audio-auto" : "";
            req.body.hasAudio = !fallbackPair.audioUrl;

            isResponded = true;
            hasFinished = false;

            return runDirectDownload("rapidapi-fallback-after-ytdlp");
          } catch (fallbackErr) {
            console.log("[DOWNLOAD] RapidAPI fallback download failed:", fallbackErr.message);

            isResponded = true;
            hasFinished = true;

            return sendJsonIfConnected(res, 500, {
              status: "fail",
              code: "ALL_DOWNLOAD_ENGINES_FAILED",
              error: "Download failed with yt-dlp and fallback API.",
              ytDlpError: cleanError,
              fallbackError: fallbackErr.message,
              downloadEngine: "yt-dlp",
              fallbackUsed: true,
            });
          }
        }

        const files = fs
          .readdirSync(outputDir)
          .filter((file) =>
            file.startsWith(`${safeTitle}-${timestamp}-${hash}`)
          );

        if (!files.length) {
          console.log("[DOWNLOAD] yt-dlp file missing, trying RapidAPI fallback...");

          try {
            const fallbackPair = await getBestRapidApiMediaPair(originalUrlValue);

            req.body.videoUrl = fallbackPair.videoUrl;
            req.body.audioUrl = fallbackPair.audioUrl;
            req.body.videoFormatId = "rapidapi-video-auto";
            req.body.audioFormatId = fallbackPair.audioUrl ? "rapidapi-audio-auto" : "";
            req.body.hasAudio = !fallbackPair.audioUrl;

            isResponded = true;
            hasFinished = false;

            return runDirectDownload("rapidapi-fallback-after-ytdlp-missing-file");
          } catch (fallbackErr) {
            isResponded = true;
            hasFinished = true;

            return sendJsonIfConnected(res, 500, {
              status: "fail",
              code: "DOWNLOADED_FILE_NOT_FOUND",
              error: "Prepared file not found and fallback failed.",
              fallbackError: fallbackErr.message,
            });
          }
        }

        const filePath = path.join(outputDir, files[0]);
        const finalName = `${safeTitle}.${type === "audio" ? "mp3" : "mp4"}`;

        outputPathToClean = filePath;
        isResponded = true;
        hasFinished = true;

        res.setHeader("X-Download-Engine", "yt-dlp");
        res.setHeader("X-Fallback-Used", "false");
        console.log("[DOWNLOAD] using engine: yt-dlp");

        return sendPreparedFile(res, filePath, finalName);
      });

      return;
    }

    return runDirectDownload(isRapidApiMedia ? "rapidapi-direct" : "direct");
  } catch (err) {
    hasFinished = true;

    if (clientCancelled || isClientDisconnected(res)) return;

    console.log("Direct download error:", err.message);

    return sendJsonIfConnected(res, 500, {
      status: "fail",
      code: "DIRECT_DOWNLOAD_FAILED",
      error: "Download failed. Please try again.",
    });
  }
};

exports.proxyImage = async (req, res) => {
  let timeout = null;

  try {
    const imageUrl = req.query.url;

    if (!isValidHttpUrl(imageUrl)) {
      return res.status(400).json({
        status: "fail",
        code: "INVALID_IMAGE_URL",
        error: "Valid image URL is required",
      });
    }

    const parsedUrl = new URL(imageUrl);
    const hostname = parsedUrl.hostname.toLowerCase();

    const blockedHosts = ["localhost", "127.0.0.1", "0.0.0.0", "::1"];

    if (
      blockedHosts.includes(hostname) ||
      hostname.endsWith(".local") ||
      hostname.startsWith("10.") ||
      hostname.startsWith("192.168.") ||
      /^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname)
    ) {
      return res.status(400).json({
        status: "fail",
        code: "BLOCKED_IMAGE_HOST",
        error: "This image host is not allowed",
      });
    }

    const abortController = new AbortController();

    timeout = setTimeout(() => {
      abortController.abort();
    }, 15000);

    const response = await fetch(imageUrl, {
      signal: abortController.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    clearTimeout(timeout);

    if (!response.ok) {
      return res.status(400).json({
        status: "fail",
        code: "IMAGE_FETCH_FAILED",
        error: "Failed to fetch image",
      });
    }

    const contentType = response.headers.get("content-type") || "";

    if (!contentType.startsWith("image/")) {
      return res.status(400).json({
        status: "fail",
        code: "INVALID_IMAGE_TYPE",
        error: "URL does not point to a valid image",
      });
    }

    const contentLength = Number(response.headers.get("content-length") || 0);
    const maxImageSize = 5 * 1024 * 1024;

    if (contentLength && contentLength > maxImageSize) {
      return res.status(413).json({
        status: "fail",
        code: "IMAGE_TOO_LARGE",
        error: "Image is too large",
      });
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (buffer.length > maxImageSize) {
      return res.status(413).json({
        status: "fail",
        code: "IMAGE_TOO_LARGE",
        error: "Image is too large",
      });
    }

    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=86400");

    return res.send(buffer);
  } catch (err) {
    if (timeout) clearTimeout(timeout);

    console.log("Proxy image error:", err.message);

    return res.status(500).json({
      status: "fail",
      code: "IMAGE_PROXY_FAILED",
      error: "Image proxy failed",
    });
  }
};

const cleanupTempFolders = () => {
  try {
    for (const dir of [outputDir, previewDir]) {
      if (!fs.existsSync(dir)) continue;

      const files = fs.readdirSync(dir);

      for (const file of files) {
        safeDeleteFile(path.join(dir, file));
      }
    }
  } catch {}
};

process.on("SIGTERM", cleanupTempFolders);
process.on("SIGINT", cleanupTempFolders);
