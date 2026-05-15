// // const { spawn } = require("child_process");
// // const path = require("path");
// // const fs = require("fs");

// // const FFMPEG_PATH = process.env.FFMPEG_PATH || "ffmpeg";
// // const FFPROBE_PATH = process.env.FFPROBE_PATH || "ffprobe";
// // const YTDLP_PATH = process.env.YTDLP_PATH || "yt-dlp";

// // const outputDir = path.join(__dirname, "..", "downloads");

// // if (!fs.existsSync(outputDir)) {
// //   fs.mkdirSync(outputDir, { recursive: true });
// // }

// // const PREVIEW_MODE = "raw-preview-download-audio-v18";

// // exports.startApi = (req, res) => {
// //   res.status(200).json({
// //     status: "success",
// //     message: "Welcome To Vidown Api",
// //   });
// // };

// // const sanitizeFileName = (value = "linkflow-download") => {
// //   const cleaned = String(value || "linkflow-download")
// //     .normalize("NFKD")
// //     .replace(/[^\x20-\x7E]/g, "")
// //     .replace(/[<>:"/\\|?*\x00-\x1F]/g, "")
// //     .replace(/\s+/g, " ")
// //     .trim()
// //     .slice(0, 80);

// //   return cleaned || "linkflow-download";
// // };

// // const encodeRFC5987ValueChars = (value) => {
// //   return encodeURIComponent(value)
// //     .replace(/['()*]/g, (char) =>
// //       `%${char.charCodeAt(0).toString(16).toUpperCase()}`
// //     )
// //     .replace(/%(7C|60|5E)/g, (match) => match.toLowerCase());
// // };

// // const createContentDisposition = (filename) => {
// //   const fallbackName = sanitizeFileName(filename || "linkflow-download");
// //   const encodedName = encodeRFC5987ValueChars(filename || fallbackName);

// //   return `attachment; filename="${fallbackName}"; filename*=UTF-8''${encodedName}`;
// // };

// // const getContentType = (filePath) => {
// //   const ext = path.extname(filePath).toLowerCase();

// //   if (ext === ".mp3") return "audio/mpeg";
// //   if (ext === ".m4a") return "audio/mp4";
// //   if (ext === ".webm") return "video/webm";
// //   if (ext === ".mp4") return "video/mp4";

// //   return "application/octet-stream";
// // };

// // const safeDeleteFile = (filePath) => {
// //   if (!filePath) return;
// //   fs.unlink(filePath, () => {});
// // };

// // const safeDeleteFiles = (filePaths = []) => {
// //   for (const filePath of filePaths) {
// //     safeDeleteFile(filePath);
// //   }
// // };

// // const isClientDisconnected = (res) => {
// //   return res.destroyed || res.writableEnded;
// // };

// // const sendJsonIfConnected = (res, statusCode, payload) => {
// //   if (res.destroyed || res.writableEnded || res.headersSent) return;
// //   return res.status(statusCode).json(payload);
// // };

// // const isValidPreparedFile = (filePath) => {
// //   try {
// //     if (!fs.existsSync(filePath)) return false;
// //     return fs.statSync(filePath).size > 1024;
// //   } catch {
// //     return false;
// //   }
// // };

// // const getCleanProcessError = (stderr = "") => {
// //   const text = String(stderr || "").trim();

// //   if (!text) return "Process stopped before completion.";

// //   const lines = text
// //     .split("\n")
// //     .map((line) => line.trim())
// //     .filter(Boolean);

// //   return (
// //     [...lines]
// //       .reverse()
// //       .find((line) =>
// //         /error|failed|invalid|unable|not found|permission|denied|forbidden|too many requests|sign in|cookies|bot|rate|ffmpeg|ffprobe|codec|libx264|conversion|killed|memory|timeout|audio/i.test(
// //           line
// //         )
// //       ) ||
// //     lines[0] ||
// //     "Download process failed."
// //   );
// // };

// // const normalizeErrorMessage = (stderr = "") => {
// //   const lowerError = String(stderr || "").toLowerCase();

// //   if (
// //     lowerError.includes("429") ||
// //     lowerError.includes("too many requests") ||
// //     lowerError.includes("rate limit") ||
// //     lowerError.includes("rate-limit") ||
// //     lowerError.includes("rate-limited") ||
// //     lowerError.includes("ratelimited")
// //   ) {
// //     return {
// //       statusCode: 429,
// //       code: "RATE_LIMITED",
// //       error:
// //         "This platform is rate-limiting the server. Please wait and try again later.",
// //     };
// //   }

// //   if (
// //     lowerError.includes("[youtube]") &&
// //     (lowerError.includes("sign in to confirm") ||
// //       lowerError.includes("not a bot") ||
// //       lowerError.includes("cookies-from-browser") ||
// //       lowerError.includes("use --cookies") ||
// //       lowerError.includes("robot") ||
// //       lowerError.includes("bot"))
// //   ) {
// //     return {
// //       statusCode: 403,
// //       code: "YOUTUBE_BLOCKED_ON_SERVER",
// //       error:
// //         "YouTube blocked this server request. This usually happens on cloud/server IPs. Please try another platform for now.",
// //     };
// //   }

// //   if (lowerError.includes("[instagram]") || lowerError.includes("instagram")) {
// //     if (
// //       lowerError.includes("rate-limit") ||
// //       lowerError.includes("rate limit") ||
// //       lowerError.includes("too many requests")
// //     ) {
// //       return {
// //         statusCode: 429,
// //         code: "INSTAGRAM_RATE_LIMITED",
// //         error:
// //           "Instagram is rate-limiting the server. Please wait and try another public reel.",
// //       };
// //     }

// //     if (
// //       lowerError.includes("login") ||
// //       lowerError.includes("cookies") ||
// //       lowerError.includes("not available") ||
// //       lowerError.includes("private")
// //     ) {
// //       return {
// //         statusCode: 401,
// //         code: "INSTAGRAM_LOGIN_REQUIRED",
// //         error:
// //           "Instagram could not access this content. It may be private, unavailable, rate-limited, or require login/cookies.",
// //       };
// //     }
// //   }

// //   if (
// //     lowerError.includes("403") ||
// //     lowerError.includes("forbidden") ||
// //     lowerError.includes("access denied")
// //   ) {
// //     return {
// //       statusCode: 403,
// //       code: "PLATFORM_FORBIDDEN",
// //       error:
// //         "This platform blocked the server request. Please try another public video link.",
// //     };
// //   }

// //   if (lowerError.includes("[reddit]") || lowerError.includes("reddit")) {
// //     return {
// //       statusCode: 422,
// //       code: "REDDIT_EXTRACT_FAILED",
// //       error:
// //         "Reddit could not process this post. Try another public native Reddit video post.",
// //     };
// //   }

// //   if (
// //     lowerError.includes("[facebook]") ||
// //     lowerError.includes("facebook") ||
// //     lowerError.includes("cannot parse data")
// //   ) {
// //     return {
// //       statusCode: 422,
// //       code: "FACEBOOK_EXTRACT_FAILED",
// //       error:
// //         "Facebook could not fully process this link. Try another public reel or video URL.",
// //     };
// //   }

// //   if (
// //     lowerError.includes("cookies") ||
// //     lowerError.includes("login") ||
// //     lowerError.includes("private") ||
// //     lowerError.includes("not available") ||
// //     lowerError.includes("sign in") ||
// //     lowerError.includes("authentication")
// //   ) {
// //     return {
// //       statusCode: 401,
// //       code: "LOGIN_OR_COOKIES_REQUIRED",
// //       error:
// //         "This video may require login or cookies. Please try another public video link.",
// //     };
// //   }

// //   if (
// //     lowerError.includes("unsupported url") ||
// //     lowerError.includes("no suitable extractor") ||
// //     lowerError.includes("not a valid url")
// //   ) {
// //     return {
// //       statusCode: 400,
// //       code: "UNSUPPORTED_URL",
// //       error:
// //         "This website or link format is not supported yet. Please try another valid public video URL.",
// //     };
// //   }

// //   if (
// //     lowerError.includes("no video formats found") ||
// //     lowerError.includes("requested format is not available") ||
// //     lowerError.includes("no formats found")
// //   ) {
// //     return {
// //       statusCode: 422,
// //       code: "NO_FORMATS_FOUND",
// //       error:
// //         "No playable video format was found for this link. Please try another quality or another public video.",
// //     };
// //   }

// //   if (
// //     lowerError.includes("unknown encoder") ||
// //     lowerError.includes("libx264") ||
// //     lowerError.includes("encoder not found")
// //   ) {
// //     return {
// //       statusCode: 500,
// //       code: "FFMPEG_CODEC_NOT_AVAILABLE",
// //       error:
// //         "FFmpeg on this server does not support H.264 encoding. Please check Render FFmpeg installation.",
// //     };
// //   }

// //   return {
// //     statusCode: 500,
// //     code: "MEDIA_EXTRACT_FAILED",
// //     error:
// //       "Unable to extract this media. Please check the link or try another public video.",
// //   };
// // };

// // const hasStream = (filePath, streamType) => {
// //   return new Promise((resolve) => {
// //     const selector = streamType === "audio" ? "a:0" : "v:0";

// //     const child = spawn(
// //       FFPROBE_PATH,
// //       [
// //         "-v",
// //         "error",
// //         "-select_streams",
// //         selector,
// //         "-show_entries",
// //         "stream=codec_type",
// //         "-of",
// //         "csv=p=0",
// //         filePath,
// //       ],
// //       {
// //         timeout: 30000,
// //         windowsHide: true,
// //       }
// //     );

// //     let stdout = "";

// //     child.stdout.on("data", (data) => {
// //       stdout += data.toString();
// //     });

// //     child.on("close", () => {
// //       resolve(stdout.trim().includes(streamType));
// //     });

// //     child.on("error", () => {
// //       resolve(false);
// //     });
// //   });
// // };

// // const validateVideoHasAudio = async (filePath) => {
// //   const [videoOk, audioOk] = await Promise.all([
// //     hasStream(filePath, "video"),
// //     hasStream(filePath, "audio"),
// //   ]);

// //   return videoOk && audioOk;
// // };

// // const sendPreparedFile = (res, filePath, downloadName) => {
// //   if (!fs.existsSync(filePath)) {
// //     return sendJsonIfConnected(res, 500, {
// //       status: "fail",
// //       code: "PREPARED_FILE_NOT_FOUND",
// //       error: "Prepared file not found.",
// //     });
// //   }

// //   const stat = fs.statSync(filePath);

// //   res.setHeader("Content-Type", getContentType(filePath));
// //   res.setHeader("Content-Length", stat.size);
// //   res.setHeader(
// //     "Content-Disposition",
// //     createContentDisposition(downloadName || path.basename(filePath))
// //   );

// //   const stream = fs.createReadStream(filePath);
// //   stream.pipe(res);

// //   stream.on("close", () => {
// //     setTimeout(() => safeDeleteFile(filePath), 60 * 1000);
// //   });

// //   stream.on("error", (err) => {
// //     console.log("File stream error:", err.message);

// //     if (!res.headersSent) {
// //       sendJsonIfConnected(res, 500, {
// //         status: "fail",
// //         code: "FILE_STREAM_FAILED",
// //         error: "Failed to stream file.",
// //       });
// //     }
// //   });
// // };

// // const formatDuration = (seconds) => {
// //   if (
// //     seconds === null ||
// //     seconds === undefined ||
// //     Number.isNaN(Number(seconds))
// //   ) {
// //     return null;
// //   }

// //   const totalSeconds = Math.floor(Number(seconds));
// //   const hours = Math.floor(totalSeconds / 3600);
// //   const minutes = Math.floor((totalSeconds % 3600) / 60);
// //   const remainingSeconds = totalSeconds % 60;

// //   if (hours > 0) {
// //     return `${hours}:${String(minutes).padStart(2, "0")}:${String(
// //       remainingSeconds
// //     ).padStart(2, "0")}`;
// //   }

// //   return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
// // };

// // const formatSize = (bytes, estimated = false) => {
// //   const size = Number(bytes);

// //   if (!size || Number.isNaN(size) || size <= 0) {
// //     return estimated ? "Approx. 1 MB" : "1 MB";
// //   }

// //   const kb = size / 1024;
// //   const mb = kb / 1024;
// //   const gb = mb / 1024;

// //   let label = "";

// //   if (gb >= 1) label = `${gb.toFixed(1)} GB`;
// //   else if (mb >= 100) label = `${Math.round(mb)} MB`;
// //   else if (mb >= 10) label = `${mb.toFixed(1)} MB`;
// //   else if (mb >= 1) label = `${mb.toFixed(1)} MB`;
// //   else label = `${Math.max(1, Math.round(kb))} KB`;

// //   return estimated ? `Approx. ${label}` : label;
// // };

// // const getDirectSizeBytes = (item = {}) => {
// //   const candidates = [
// //     item.filesize,
// //     item.filesize_approx,
// //     item.size,
// //     item.file_size,
// //     item.content_length,
// //   ];

// //   for (const candidate of candidates) {
// //     const value = Number(candidate);
// //     if (value && !Number.isNaN(value) && value > 0) return value;
// //   }

// //   return null;
// // };

// // const estimateSizeFromBitrate = (item = {}, durationSeconds) => {
// //   const duration = Number(durationSeconds || item.duration || 0);
// //   if (!duration || Number.isNaN(duration) || duration <= 0) return null;

// //   const bitrateKbps =
// //     Number(item.tbr || 0) ||
// //     Number(item.vbr || 0) ||
// //     Number(item.abr || 0) ||
// //     Number(item.bitrate || 0);

// //   if (!bitrateKbps || Number.isNaN(bitrateKbps) || bitrateKbps <= 0) {
// //     return null;
// //   }

// //   return (bitrateKbps * 1000 * duration) / 8;
// // };

// // const getEstimatedVideoBitrateKbps = (item = {}) => {
// //   const height = Number(item.height || 0);

// //   if (height >= 4320) return 35000;
// //   if (height >= 2160) return 16000;
// //   if (height >= 1440) return 9000;
// //   if (height >= 1080) return 5200;
// //   if (height >= 720) return 2800;
// //   if (height >= 480) return 1300;
// //   if (height >= 360) return 800;
// //   if (height >= 240) return 450;

// //   if (item.width && item.height) return 800;

// //   return 600;
// // };

// // const estimateVideoSizeFromResolution = (item = {}, durationSeconds) => {
// //   const duration = Number(durationSeconds || item.duration || 0);
// //   if (!duration || Number.isNaN(duration) || duration <= 0) return null;

// //   let bitrateKbps = getEstimatedVideoBitrateKbps(item);

// //   if (String(item.ext || "").toLowerCase() === "webm") {
// //     bitrateKbps *= 0.85;
// //   }

// //   return (bitrateKbps * 1000 * duration) / 8;
// // };

// // const estimateAudioSize = (item = {}, durationSeconds) => {
// //   const duration = Number(durationSeconds || item.duration || 0);
// //   if (!duration || Number.isNaN(duration) || duration <= 0) return null;

// //   const bitrateKbps =
// //     Number(item.abr || 0) ||
// //     Number(item.tbr || 0) ||
// //     Number(item.asr ? 128 : 0) ||
// //     128;

// //   return (bitrateKbps * 1000 * duration) / 8;
// // };

// // const getFallbackSizeBytes = (type = "video", durationSeconds) => {
// //   const duration = Number(durationSeconds || 0);

// //   if (duration && !Number.isNaN(duration) && duration > 0) {
// //     if (type === "audio") return (128 * 1000 * duration) / 8;
// //     return (900 * 1000 * duration) / 8;
// //   }

// //   if (type === "audio") return 512 * 1024;

// //   return 2 * 1024 * 1024;
// // };

// // const getFormatSizeInfo = (item = {}, durationSeconds, type = "video") => {
// //   const exactBytes = getDirectSizeBytes(item);

// //   if (exactBytes) {
// //     return {
// //       size: formatSize(exactBytes, false),
// //       sizeBytes: Math.round(exactBytes),
// //       sizeEstimated: false,
// //     };
// //   }

// //   const bitrateEstimate = estimateSizeFromBitrate(item, durationSeconds);

// //   if (bitrateEstimate) {
// //     return {
// //       size: formatSize(bitrateEstimate, true),
// //       sizeBytes: Math.round(bitrateEstimate),
// //       sizeEstimated: true,
// //     };
// //   }

// //   const smartEstimate =
// //     type === "audio"
// //       ? estimateAudioSize(item, durationSeconds)
// //       : estimateVideoSizeFromResolution(item, durationSeconds);

// //   if (smartEstimate) {
// //     return {
// //       size: formatSize(smartEstimate, true),
// //       sizeBytes: Math.round(smartEstimate),
// //       sizeEstimated: true,
// //     };
// //   }

// //   const fallbackSize = getFallbackSizeBytes(type, durationSeconds);

// //   return {
// //     size: formatSize(fallbackSize, true),
// //     sizeBytes: Math.round(fallbackSize),
// //     sizeEstimated: true,
// //   };
// // };

// // const getAspectRatio = (width, height, ytAspectRatio) => {
// //   if (ytAspectRatio && Number(ytAspectRatio) < 0.8) return "portrait";
// //   if (ytAspectRatio && Number(ytAspectRatio) > 1.2) return "landscape";

// //   if (
// //     ytAspectRatio &&
// //     Number(ytAspectRatio) >= 0.8 &&
// //     Number(ytAspectRatio) <= 1.2
// //   ) {
// //     return "square";
// //   }

// //   if (!width || !height) return "landscape";
// //   if (height > width) return "portrait";
// //   if (width === height) return "square";

// //   return "landscape";
// // };

// // const getQualityLabel = (item = {}) => {
// //   const height = Number(item.height || 0);

// //   if (height >= 4320) return "4320p (8K)";
// //   if (height >= 2160) return "2160p (4K)";
// //   if (height >= 1440) return "1440p (2K)";
// //   if (height >= 1080) return "1080p (Full HD)";
// //   if (height >= 720) return "720p (HD)";
// //   if (height >= 480) return "480p (SD)";
// //   if (height >= 360) return "360p";
// //   if (height >= 240) return "240p";

// //   if (item.width && item.height) return `${item.width}×${item.height}`;

// //   return item.format_note || item.resolution || item.format_id || "Default";
// // };

// // const getSortHeight = (quality = "") => {
// //   if (quality.includes("4320")) return 4320;
// //   if (quality.includes("2160")) return 2160;
// //   if (quality.includes("1440")) return 1440;
// //   if (quality.includes("1080")) return 1080;
// //   if (quality.includes("720")) return 720;
// //   if (quality.includes("480")) return 480;
// //   if (quality.includes("360")) return 360;
// //   if (quality.includes("240")) return 240;

// //   return Number(String(quality).match(/\d+/)?.[0]) || 0;
// // };

// // const isMetricOnlyTitle = (value = "") => {
// //   const text = String(value).trim().toLowerCase();

// //   if (!text) return true;

// //   return (
// //     /^\d+(\.\d+)?[kmb]?\s+(views|reactions|shares|comments)/i.test(text) ||
// //     text.includes("reactions") ||
// //     text.includes("shares") ||
// //     text === "follow" ||
// //     text === "like" ||
// //     text.length < 3
// //   );
// // };

// // const getCleanTitle = (data = {}) => {
// //   const rawTitle = data.title || data.fulltitle || "";
// //   const description = data.description || "";
// //   const uploader = data.uploader || "";

// //   const lines = String(description || "")
// //     .split("\n")
// //     .map((line) => line.replace(/\s+/g, " ").trim())
// //     .filter(Boolean);

// //   let title =
// //     lines.find((line) => !isMetricOnlyTitle(line)) ||
// //     rawTitle ||
// //     uploader ||
// //     "Video";

// //   title = String(title)
// //     .replace(/\s+/g, " ")
// //     .replace(
// //       /^\d+(\.\d+)?[KMB]?\s+views\s*·\s*\d+(\.\d+)?[KMB]?\s+reactions\s*\|\s*/i,
// //       ""
// //     )
// //     .replace(/^\d+(\.\d+)?[KMB]?\s+views\s*\|\s*/i, "")
// //     .replace(
// //       /^\d+(\.\d+)?[KMB]?\s+reactions\s*·\s*\d+(\.\d+)?[KMB]?\s+shares/i,
// //       ""
// //     )
// //     .split("Download the app")[0]
// //     .split("LINK IN BIO")[0]
// //     .split("Cast:")[0]
// //     .split("#")[0]
// //     .trim();

// //   if (title.toLowerCase().includes(" is now streaming")) {
// //     title = title.split(/ is now streaming/i)[0].trim();
// //   }

// //   if (isMetricOnlyTitle(title)) {
// //     title = uploader || "Video";
// //   }

// //   return title.slice(0, 70) || "Video";
// // };

// // const chooseStrictAudioVideoFormatSpec = ({
// //   videoFormatId,
// //   audioFormatId,
// //   hasAudio,
// // } = {}) => {
// //   const fallback =
// //     "bestvideo[height<=720][ext=mp4]+bestaudio[ext=m4a]/bestvideo[height<=720]+bestaudio/best[height<=720][acodec!=none]/best[acodec!=none]";

// //   if (videoFormatId && audioFormatId) {
// //     return `${videoFormatId}+${audioFormatId}/${fallback}`;
// //   }

// //   if (videoFormatId && hasAudio) {
// //     return `${videoFormatId}/${fallback}`;
// //   }

// //   return fallback;
// // };

// // const transcodeToBrowserMp4 = (inputPath, outputPath) => {
// //   return new Promise((resolve, reject) => {
// //     const child = spawn(
// //       FFMPEG_PATH,
// //       [
// //         "-y",
// //         "-hide_banner",
// //         "-loglevel",
// //         "error",
// //         "-i",
// //         inputPath,

// //         "-map",
// //         "0:v:0",
// //         "-map",
// //         "0:a:0",

// //         "-c:v",
// //         "libx264",
// //         "-preset",
// //         "ultrafast",
// //         "-crf",
// //         "26",
// //         "-pix_fmt",
// //         "yuv420p",
// //         "-profile:v",
// //         "main",

// //         "-c:a",
// //         "aac",
// //         "-b:a",
// //         "160k",

// //         "-movflags",
// //         "+faststart",

// //         outputPath,
// //       ],
// //       {
// //         timeout: 900000,
// //         windowsHide: true,
// //       }
// //     );

// //     let stderr = "";

// //     child.stderr.on("data", (data) => {
// //       stderr += data.toString();
// //     });

// //     child.on("error", (err) => {
// //       reject(
// //         Object.assign(new Error("FFmpeg failed to start."), {
// //           details: err.message,
// //         })
// //       );
// //     });

// //     child.on("close", (code) => {
// //       if (code !== 0) {
// //         return reject(
// //           Object.assign(new Error("FFmpeg H.264/AAC conversion failed."), {
// //             details: stderr,
// //           })
// //         );
// //       }

// //       if (!isValidPreparedFile(outputPath)) {
// //         return reject(new Error("Converted MP4 file is invalid or empty."));
// //       }

// //       resolve(outputPath);
// //     });
// //   });
// // };

// // const cleanupOldFiles = () => {
// //   const maxAgeMs = 60 * 60 * 1000;
// //   const now = Date.now();

// //   try {
// //     const files = fs.readdirSync(outputDir);

// //     for (const file of files) {
// //       const filePath = path.join(outputDir, file);
// //       const stat = fs.statSync(filePath);

// //       if (now - stat.mtimeMs > maxAgeMs) {
// //         safeDeleteFile(filePath);
// //       }
// //     }
// //   } catch {}
// // };

// // setInterval(cleanupOldFiles, 30 * 60 * 1000);

// // exports.postMedia = async (req, res, next) => {
// //   try {
// //     const url = req.body.urls;

// //     if (
// //       !url ||
// //       typeof url !== "string" ||
// //       (!url.startsWith("http://") && !url.startsWith("https://"))
// //     ) {
// //       return res.status(400).json({
// //         status: "fail",
// //         code: "INVALID_URL",
// //         error: "Valid URL is required",
// //       });
// //     }

// //     const ytDlp = spawn(
// //       YTDLP_PATH,
// //       ["-J", "--no-playlist", "--no-warnings", "--socket-timeout", "20", url],
// //       {
// //         timeout: 60000,
// //         windowsHide: true,
// //       }
// //     );

// //     let stdout = "";
// //     let stderr = "";
// //     let isResponded = false;

// //     ytDlp.stdout.on("data", (data) => {
// //       stdout += data.toString();
// //     });

// //     ytDlp.stderr.on("data", (data) => {
// //       stderr += data.toString();
// //     });

// //     ytDlp.on("error", (err) => {
// //       if (isResponded) return;
// //       isResponded = true;

// //       console.log("yt-dlp process error:", err.message);

// //       return res.status(500).json({
// //         status: "fail",
// //         code: "YTDLP_NOT_FOUND",
// //         error:
// //           "yt-dlp is not installed or failed to start. Please install or update yt-dlp on the server.",
// //       });
// //     });

// //     ytDlp.on("close", async (code) => {
// //       if (isResponded) return;

// //       let data = null;

// //       if (stdout) {
// //         try {
// //           data = JSON.parse(stdout);
// //         } catch {
// //           data = null;
// //         }
// //       }

// //       if (code !== 0 && !data) {
// //         isResponded = true;

// //         const friendlyError = normalizeErrorMessage(stderr);

// //         return res.status(friendlyError.statusCode).json({
// //           status: "fail",
// //           code: friendlyError.code,
// //           error: friendlyError.error,
// //           details: stderr || "Unknown yt-dlp error",
// //         });
// //       }

// //       if (!data) {
// //         isResponded = true;

// //         return res.status(500).json({
// //           status: "fail",
// //           code: "INVALID_YTDLP_RESPONSE",
// //           error: "Invalid yt-dlp response. Please try another video link.",
// //         });
// //       }

// //       const allFormats = Array.isArray(data.formats) ? data.formats : [];

// //       const audioFormats = allFormats
// //         .filter((item) => {
// //           return (
// //             item.url &&
// //             item.acodec &&
// //             item.acodec !== "none" &&
// //             (!item.vcodec || item.vcodec === "none")
// //           );
// //         })
// //         .map((item) => {
// //           const sizeInfo = getFormatSizeInfo(item, data.duration, "audio");

// //           return {
// //             type: "audio",
// //             url: item.url,
// //             quality:
// //               item.abr || item.asr
// //                 ? `${Math.round(item.abr || item.asr)} kbps`
// //                 : item.format_note || "Audio",
// //             ext: item.ext || "m4a",
// //             size: sizeInfo.size,
// //             sizeBytes: sizeInfo.sizeBytes,
// //             sizeEstimated: sizeInfo.sizeEstimated,
// //             formatId: item.format_id || "",
// //             width: null,
// //             height: null,
// //             fps: null,
// //             vcodec: item.vcodec || "",
// //             acodec: item.acodec || "",
// //             hasAudio: true,
// //             audioUrl: "",
// //             audioFormatId: item.format_id || "",
// //             aspectRatio: "audio",
// //           };
// //         })
// //         .sort((a, b) => Number(b.sizeBytes || 0) - Number(a.sizeBytes || 0))
// //         .slice(0, 8);

// //       const bestAudio =
// //         audioFormats.find((item) => item.ext === "m4a") ||
// //         audioFormats[0] ||
// //         null;

// //       /**
// //        * IMPORTANT FIX:
// //        * Facebook often gives "sd" / "hd" MP4 formats with vcodec/acodec = unknown.
// //        * Those can be combined video+audio and worked in your older version.
// //        * So we keep them as progressive combined preview candidates.
// //        */
// //       const progressiveVideoFormats = allFormats
// //         .filter((item) => {
// //           const ext = String(item.ext || "").toLowerCase();
// //           const formatId = String(item.format_id || "").toLowerCase();
// //           const formatNote = String(item.format_note || "").toLowerCase();

// //           const hasKnownVideo =
// //             item.vcodec && item.vcodec !== "none" && item.vcodec !== "unknown";

// //           const hasKnownAudio =
// //             item.acodec && item.acodec !== "none" && item.acodec !== "unknown";

// //           const isLikelyFacebookCombined =
// //             item.url &&
// //             ext === "mp4" &&
// //             (formatId === "sd" ||
// //               formatId === "hd" ||
// //               formatNote === "sd" ||
// //               formatNote === "hd") &&
// //             (!item.vcodec || item.vcodec === "unknown") &&
// //             (!item.acodec || item.acodec === "unknown");

// //           return (
// //             item.url &&
// //             ["mp4", "webm"].includes(ext) &&
// //             ((hasKnownVideo && hasKnownAudio) || isLikelyFacebookCombined)
// //           );
// //         })
// //         .map((item) => {
// //           const sizeInfo = getFormatSizeInfo(item, data.duration, "video");
// //           const ext = item.ext || "mp4";
// //           const formatId = String(item.format_id || "").toLowerCase();
// //           const formatNote = String(item.format_note || "").toLowerCase();

// //           const hasKnownAudio =
// //             item.acodec && item.acodec !== "none" && item.acodec !== "unknown";

// //           const isLikelyCombinedUnknown =
// //             String(ext).toLowerCase() === "mp4" &&
// //             (formatId === "sd" ||
// //               formatId === "hd" ||
// //               formatNote === "sd" ||
// //               formatNote === "hd") &&
// //             (!item.vcodec || item.vcodec === "unknown") &&
// //             (!item.acodec || item.acodec === "unknown");

// //           return {
// //             type: "video",
// //             url: item.url,
// //             quality:
// //               formatId === "sd" || formatNote === "sd"
// //                 ? "SD"
// //                 : formatId === "hd" || formatNote === "hd"
// //                 ? "HD"
// //                 : getQualityLabel(item),
// //             ext,
// //             size: sizeInfo.size,
// //             sizeBytes: sizeInfo.sizeBytes,
// //             sizeEstimated: sizeInfo.sizeEstimated,
// //             formatId: item.format_id || "",
// //             width: item.width || null,
// //             height: item.height || null,
// //             fps: item.fps || null,
// //             vcodec: item.vcodec || "",
// //             acodec: item.acodec || "",
// //             hasAudio: Boolean(hasKnownAudio || isLikelyCombinedUnknown),
// //             audioUrl: "",
// //             audioFormatId: "",
// //             aspectRatio: getAspectRatio(
// //               item.width,
// //               item.height,
// //               item.aspect_ratio
// //             ),
// //           };
// //         });

// //       const dashVideoFormats = allFormats
// //         .filter((item) => {
// //           return (
// //             item.url &&
// //             item.vcodec &&
// //             item.vcodec !== "none" &&
// //             item.vcodec !== "unknown" &&
// //             ["mp4", "webm"].includes(item.ext) &&
// //             (!item.acodec ||
// //               item.acodec === "none" ||
// //               item.acodec === "unknown")
// //           );
// //         })
// //         .map((item) => {
// //           const sizeInfo = getFormatSizeInfo(item, data.duration, "video");

// //           return {
// //             type: "video",
// //             url: item.url,
// //             quality: getQualityLabel(item),
// //             ext: item.ext || "mp4",
// //             size: sizeInfo.size,
// //             sizeBytes: sizeInfo.sizeBytes,
// //             sizeEstimated: sizeInfo.sizeEstimated,
// //             formatId: item.format_id || "",
// //             width: item.width || null,
// //             height: item.height || null,
// //             fps: item.fps || null,
// //             vcodec: item.vcodec || "",
// //             acodec: item.acodec || "none",
// //             hasAudio: false,
// //             audioUrl: bestAudio?.url || "",
// //             audioFormatId: bestAudio?.formatId || "",
// //             aspectRatio: getAspectRatio(
// //               item.width,
// //               item.height,
// //               item.aspect_ratio
// //             ),
// //           };
// //         });

// //       const videoFormats = [...progressiveVideoFormats, ...dashVideoFormats]
// //         .filter(
// //           (item, index, self) =>
// //             index ===
// //             self.findIndex(
// //               (x) =>
// //                 x.quality === item.quality &&
// //                 x.ext === item.ext &&
// //                 x.aspectRatio === item.aspectRatio
// //             )
// //         )
// //         .sort((a, b) => {
// //           const aFormat = String(a.formatId || "").toLowerCase();
// //           const bFormat = String(b.formatId || "").toLowerCase();

// //           /**
// //            * Prefer Facebook combined SD/HD first for preview.
// //            */
// //           const aCombinedFacebook =
// //             a.hasAudio && a.ext === "mp4" && ["sd", "hd"].includes(aFormat);
// //           const bCombinedFacebook =
// //             b.hasAudio && b.ext === "mp4" && ["sd", "hd"].includes(bFormat);

// //           if (aCombinedFacebook && !bCombinedFacebook) return -1;
// //           if (!aCombinedFacebook && bCombinedFacebook) return 1;

// //           if (a.hasAudio && !b.hasAudio) return -1;
// //           if (!a.hasAudio && b.hasAudio) return 1;

// //           const byHeight = getSortHeight(b.quality) - getSortHeight(a.quality);
// //           if (byHeight !== 0) return byHeight;

// //           if (a.ext === "mp4" && b.ext !== "mp4") return -1;
// //           if (a.ext !== "mp4" && b.ext === "mp4") return 1;

// //           return Number(b.sizeBytes || 0) - Number(a.sizeBytes || 0);
// //         })
// //         .slice(0, 10);

// //       const bestPreview =
// //         videoFormats.find(
// //           (item) =>
// //             item.hasAudio &&
// //             item.ext === "mp4" &&
// //             ["sd", "hd"].includes(String(item.formatId || "").toLowerCase())
// //         ) ||
// //         videoFormats.find((item) => item.hasAudio && item.ext === "mp4") ||
// //         videoFormats.find((item) => item.ext === "mp4") ||
// //         videoFormats[0] ||
// //         null;

// //       const originalPageUrl = data.webpage_url || url;

// //       isResponded = true;

// //       res.status(200).json({
// //         status: "success",
// //         platform: data.extractor_key || data.extractor || "unknown",
// //         title: getCleanTitle(data),
// //         originalTitle: data.title || data.fulltitle || "Media",
// //         uploader: data.uploader || "",
// //         thumb: data.thumbnail || "",
// //         duration: data.duration || null,
// //         durationText:
// //           formatDuration(data.duration) || data.duration_string || "--",
// //         viewCount: data.view_count || null,
// //         webpage_url: originalPageUrl,
// //         aspectRatio: bestPreview?.aspectRatio || "landscape",

// //         previewUrl: bestPreview?.url || "",
// //         previewMode: PREVIEW_MODE,
// //         previewHasAudio: Boolean(bestPreview?.hasAudio),
// //         previewAudioUrl:
// //           bestPreview && !bestPreview.hasAudio ? bestPreview.audioUrl : "",

// //         rawPreviewUrl: bestPreview?.url || "",
// //         rawPreviewHasAudio: Boolean(bestPreview?.hasAudio),
// //         rawPreviewAudioUrl:
// //           bestPreview && !bestPreview.hasAudio ? bestPreview.audioUrl : "",

// //         video: videoFormats,
// //         audio: audioFormats,
// //         urls: [...videoFormats, ...audioFormats],
// //       });

// //       if (req.users) {
// //         req.users.addActivity({ mediaUrl: url }).catch((err) => {
// //           console.log("Activity save error:", err.message);
// //         });
// //       }
// //     });
// //   } catch (err) {
// //     console.log("Media API error:", err.message);

// //     if (!res.headersSent) {
// //       res.status(500).json({
// //         status: "fail",
// //         code: "SERVER_ERROR",
// //         error: "Download failed. Please try again.",
// //       });
// //     }

// //     next(err);
// //   }
// // };

// // exports.previewMedia = async (req, res) => {
// //   return res.status(422).json({
// //     status: "fail",
// //     code: "PREVIEW_NOT_AVAILABLE",
// //     error:
// //       "Server preview is disabled on this server. The app uses raw preview instead.",
// //   });
// // };

// // exports.downloadDirectMedia = async (req, res) => {
// //   let childProcess = null;
// //   let hasFinished = false;
// //   let clientCancelled = false;
// //   let outputPathToClean = "";
// //   const filesToClean = [];

// //   const cleanupProcess = () => {
// //     clientCancelled = true;

// //     if (childProcess && !childProcess.killed) {
// //       try {
// //         childProcess.kill("SIGKILL");
// //       } catch {}
// //     }

// //     safeDeleteFiles(filesToClean);

// //     if (outputPathToClean) {
// //       safeDeleteFile(outputPathToClean);
// //     }
// //   };

// //   req.on("aborted", cleanupProcess);

// //   res.on("close", () => {
// //     if (!hasFinished) cleanupProcess();
// //   });

// //   try {
// //     req.setTimeout?.(0);
// //     res.setTimeout?.(0);

// //     const {
// //       type,
// //       title,
// //       originalUrl,
// //       videoUrl,
// //       audioUrl,
// //       videoFormatId,
// //       audioFormatId,
// //       hasAudio,
// //     } = req.body;

// //     const safeTitle = sanitizeFileName(title || "linkflow-download");
// //     const timestamp = Date.now();
// //     const extension = type === "audio" ? "mp3" : "mp4";

// //     const outputPath = path.join(
// //       outputDir,
// //       `${safeTitle}-${timestamp}.${extension}`
// //     );

// //     outputPathToClean = outputPath;

// //     const originalUrlValue = String(originalUrl || "");

// //     if (originalUrlValue) {
// //       const sourcePrefix = `${safeTitle}-${timestamp}-source`;
// //       const outputTemplate = path.join(outputDir, `${sourcePrefix}.%(ext)s`);

// //       const args = [
// //         "--no-playlist",
// //         "--newline",
// //         "--force-overwrites",
// //         "--no-warnings",
// //         "--socket-timeout",
// //         "30",
// //         "-N",
// //         "4",
// //         "--ffmpeg-location",
// //         FFMPEG_PATH,
// //       ];

// //       if (type === "audio") {
// //         args.push(
// //           "-f",
// //           audioFormatId || "bestaudio/best",
// //           "-x",
// //           "--audio-format",
// //           "mp3",
// //           "--audio-quality",
// //           "0",
// //           "-o",
// //           outputTemplate,
// //           originalUrlValue
// //         );
// //       } else {
// //         const formatSpec = chooseStrictAudioVideoFormatSpec({
// //           videoFormatId,
// //           audioFormatId,
// //           hasAudio,
// //         });

// //         args.push(
// //           "-f",
// //           formatSpec,
// //           "--merge-output-format",
// //           "mp4",
// //           "-o",
// //           outputTemplate,
// //           originalUrlValue
// //         );
// //       }

// //       childProcess = spawn(YTDLP_PATH, args, {
// //         timeout: 900000,
// //         windowsHide: true,
// //       });

// //       let stderr = "";
// //       let isResponded = false;

// //       childProcess.stderr.on("data", (data) => {
// //         stderr += data.toString();
// //       });

// //       childProcess.on("error", (err) => {
// //         if (isResponded || clientCancelled || isClientDisconnected(res)) return;

// //         isResponded = true;
// //         hasFinished = true;

// //         console.log("yt-dlp start error:", err.message);

// //         return sendJsonIfConnected(res, 500, {
// //           status: "fail",
// //           code: "YTDLP_DOWNLOAD_START_FAILED",
// //           error: "Download engine failed to start.",
// //           details: err.message,
// //         });
// //       });

// //       childProcess.on("close", async (code, signal) => {
// //         if (isResponded) return;

// //         let sourcePath = "";

// //         try {
// //           if (
// //             clientCancelled ||
// //             signal === "SIGKILL" ||
// //             isClientDisconnected(res)
// //           ) {
// //             hasFinished = true;
// //             safeDeleteFiles(filesToClean);
// //             return;
// //           }

// //           if (code !== 0) {
// //             isResponded = true;
// //             hasFinished = true;

// //             const friendly = normalizeErrorMessage(stderr);
// //             const cleanError = getCleanProcessError(stderr);

// //             console.log("yt-dlp download failed:", cleanError);

// //             return sendJsonIfConnected(res, friendly.statusCode || 500, {
// //               status: "fail",
// //               code: friendly.code || "YTDLP_DOWNLOAD_FAILED",
// //               error: friendly.error || "Download was not completed.",
// //               details: cleanError,
// //             });
// //           }

// //           const files = fs
// //             .readdirSync(outputDir)
// //             .filter((file) => file.startsWith(sourcePrefix));

// //           if (!files.length) {
// //             isResponded = true;
// //             hasFinished = true;

// //             return sendJsonIfConnected(res, 500, {
// //               status: "fail",
// //               code: "DOWNLOADED_FILE_NOT_FOUND",
// //               error: "Prepared file not found.",
// //             });
// //           }

// //           const preferredExt = type === "audio" ? ".mp3" : ".mp4";
// //           const selectedFile =
// //             files.find((file) => file.endsWith(preferredExt)) || files[0];

// //           sourcePath = path.join(outputDir, selectedFile);
// //           filesToClean.push(sourcePath);

// //           if (!isValidPreparedFile(sourcePath)) {
// //             safeDeleteFile(sourcePath);

// //             isResponded = true;
// //             hasFinished = true;

// //             return sendJsonIfConnected(res, 500, {
// //               status: "fail",
// //               code: "DOWNLOADED_FILE_INVALID",
// //               error: "Downloaded file is invalid or empty.",
// //             });
// //           }

// //           if (type === "video") {
// //             await transcodeToBrowserMp4(sourcePath, outputPath);
// //             safeDeleteFile(sourcePath);
// //             outputPathToClean = outputPath;
// //           } else {
// //             outputPathToClean = sourcePath;
// //           }

// //           const finalPath = type === "video" ? outputPath : sourcePath;
// //           const finalName = `${safeTitle}.${type === "audio" ? "mp3" : "mp4"}`;

// //           if (type === "video") {
// //             const hasVideoAndAudio = await validateVideoHasAudio(finalPath);

// //             if (!hasVideoAndAudio) {
// //               safeDeleteFile(finalPath);

// //               isResponded = true;
// //               hasFinished = true;

// //               return sendJsonIfConnected(res, 422, {
// //                 status: "fail",
// //                 code: "NO_AUDIO_IN_OUTPUT",
// //                 error:
// //                   "This video was processed but no audio track was found. Please try another quality or another public link.",
// //               });
// //             }
// //           }

// //           isResponded = true;
// //           hasFinished = true;

// //           return sendPreparedFile(res, finalPath, finalName);
// //         } catch (err) {
// //           isResponded = true;
// //           hasFinished = true;

// //           console.log("Final media processing failed:", err.message);
// //           console.log("Final media processing details:", err.details || "");

// //           safeDeleteFile(sourcePath);
// //           safeDeleteFile(outputPath);

// //           return sendJsonIfConnected(res, 500, {
// //             status: "fail",
// //             code: "FINAL_MEDIA_PROCESSING_FAILED",
// //             error:
// //               "Video was downloaded but could not be converted to a browser-compatible MP4 with audio.",
// //             details: err.details || err.message,
// //           });
// //         }
// //       });

// //       return;
// //     }

// //     if (type === "video" && !videoUrl) {
// //       hasFinished = true;

// //       return sendJsonIfConnected(res, 400, {
// //         status: "fail",
// //         code: "VIDEO_URL_REQUIRED",
// //         error: "Video URL is required.",
// //       });
// //     }

// //     if (type === "audio" && !audioUrl && !videoUrl) {
// //       hasFinished = true;

// //       return sendJsonIfConnected(res, 400, {
// //         status: "fail",
// //         code: "AUDIO_URL_REQUIRED",
// //         error: "Audio URL is required.",
// //       });
// //     }

// //     if (type === "video" && !audioUrl) {
// //       hasFinished = true;

// //       return sendJsonIfConnected(res, 422, {
// //         status: "fail",
// //         code: "AUDIO_URL_REQUIRED_FOR_VIDEO",
// //         error:
// //           "This selected video quality does not include audio. Please choose another quality.",
// //       });
// //     }

// //     const args = ["-hide_banner", "-loglevel", "error", "-nostdin"];

// //     if (type === "audio") {
// //       args.push(
// //         "-y",
// //         "-i",
// //         audioUrl || videoUrl,
// //         "-vn",
// //         "-codec:a",
// //         "libmp3lame",
// //         "-b:a",
// //         "192k",
// //         outputPath
// //       );
// //     } else {
// //       args.push(
// //         "-y",
// //         "-i",
// //         videoUrl,
// //         "-i",
// //         audioUrl,
// //         "-map",
// //         "0:v:0",
// //         "-map",
// //         "1:a:0",
// //         "-c:v",
// //         "libx264",
// //         "-preset",
// //         "ultrafast",
// //         "-crf",
// //         "26",
// //         "-pix_fmt",
// //         "yuv420p",
// //         "-profile:v",
// //         "main",
// //         "-c:a",
// //         "aac",
// //         "-b:a",
// //         "160k",
// //         "-movflags",
// //         "+faststart",
// //         "-shortest",
// //         outputPath
// //       );
// //     }

// //     childProcess = spawn(FFMPEG_PATH, args, {
// //       timeout: 900000,
// //       windowsHide: true,
// //     });

// //     let stderr = "";
// //     let isResponded = false;

// //     childProcess.stderr.on("data", (data) => {
// //       stderr += data.toString();
// //     });

// //     childProcess.on("error", (err) => {
// //       if (isResponded || clientCancelled || isClientDisconnected(res)) return;

// //       isResponded = true;
// //       hasFinished = true;

// //       console.log("FFmpeg start error:", err.message);

// //       return sendJsonIfConnected(res, 500, {
// //         status: "fail",
// //         code: "FFMPEG_START_FAILED",
// //         error:
// //           "Download engine failed to start. Please check FFmpeg installation.",
// //         details: err.message,
// //       });
// //     });

// //     childProcess.on("close", async (code, signal) => {
// //       if (isResponded) return;

// //       if (clientCancelled || signal === "SIGKILL" || isClientDisconnected(res)) {
// //         hasFinished = true;
// //         safeDeleteFile(outputPath);
// //         return;
// //       }

// //       if (code !== 0) {
// //         isResponded = true;
// //         hasFinished = true;

// //         safeDeleteFile(outputPath);

// //         const cleanError = getCleanProcessError(stderr);
// //         console.log("FFmpeg merge failed:", cleanError);

// //         return sendJsonIfConnected(res, 500, {
// //           status: "fail",
// //           code: "FFMPEG_MERGE_FAILED",
// //           error: "Download was not completed. Please try another quality.",
// //           details: cleanError,
// //         });
// //       }

// //       if (!fs.existsSync(outputPath)) {
// //         isResponded = true;
// //         hasFinished = true;

// //         return sendJsonIfConnected(res, 500, {
// //           status: "fail",
// //           code: "PREPARED_FILE_NOT_FOUND",
// //           error: "Prepared file not found.",
// //         });
// //       }

// //       if (type === "video") {
// //         const hasVideoAndAudio = await validateVideoHasAudio(outputPath);

// //         if (!hasVideoAndAudio) {
// //           safeDeleteFile(outputPath);

// //           isResponded = true;
// //           hasFinished = true;

// //           return sendJsonIfConnected(res, 422, {
// //             status: "fail",
// //             code: "NO_AUDIO_IN_OUTPUT",
// //             error:
// //               "This video was processed but no audio track was found. Please try another quality or another public link.",
// //           });
// //         }
// //       }

// //       isResponded = true;
// //       hasFinished = true;

// //       return sendPreparedFile(res, outputPath, `${safeTitle}.${extension}`);
// //     });
// //   } catch (err) {
// //     hasFinished = true;

// //     if (clientCancelled || isClientDisconnected(res)) return;

// //     console.log("Direct download error:", err.message);

// //     return sendJsonIfConnected(res, 500, {
// //       status: "fail",
// //       code: "DIRECT_DOWNLOAD_FAILED",
// //       error: "Download failed. Please try again.",
// //     });
// //   }
// // };

// // exports.proxyImage = async (req, res) => {
// //   try {
// //     const imageUrl = req.query.url;

// //     if (!imageUrl) {
// //       return res.status(400).json({
// //         status: "fail",
// //         code: "IMAGE_URL_REQUIRED",
// //         error: "Image URL is required",
// //       });
// //     }

// //     if (
// //       typeof imageUrl !== "string" ||
// //       (!imageUrl.startsWith("http://") && !imageUrl.startsWith("https://"))
// //     ) {
// //       return res.status(400).json({
// //         status: "fail",
// //         code: "INVALID_IMAGE_URL",
// //         error: "Invalid image URL",
// //       });
// //     }

// //     const response = await fetch(imageUrl);

// //     if (!response.ok) {
// //       return res.status(400).json({
// //         status: "fail",
// //         code: "IMAGE_FETCH_FAILED",
// //         error: "Failed to fetch image",
// //       });
// //     }

// //     const contentType = response.headers.get("content-type") || "image/jpeg";
// //     res.setHeader("Content-Type", contentType);

// //     const arrayBuffer = await response.arrayBuffer();
// //     const buffer = Buffer.from(arrayBuffer);

// //     return res.send(buffer);
// //   } catch (err) {
// //     console.log("Proxy image error:", err.message);

// //     return res.status(500).json({
// //       status: "fail",
// //       code: "IMAGE_PROXY_FAILED",
// //       error: "Image proxy failed",
// //     });
// //   }
// // };




// const { spawn } = require("child_process");
// const path = require("path");
// const fs = require("fs");
// const net = require("net");
// const dns = require("dns").promises;

// const FFMPEG_PATH = process.env.FFMPEG_PATH || "ffmpeg";
// const FFPROBE_PATH = process.env.FFPROBE_PATH || "ffprobe";
// const YTDLP_PATH = process.env.YTDLP_PATH || "yt-dlp";

// const outputDir = path.join(__dirname, "..", "downloads");

// if (!fs.existsSync(outputDir)) {
//   fs.mkdirSync(outputDir, { recursive: true });
// }

// const PREVIEW_MODE = "raw-preview-download-audio-v19";

// exports.startApi = (req, res) => {
//   res.status(200).json({
//     status: "success",
//     message: "Welcome To Vidown Api",
//   });
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
//   const safeName = sanitizeFileName(filename || "linkflow-download");
//   const encodedName = encodeRFC5987ValueChars(safeName);

//   return `attachment; filename="${safeName}"; filename*=UTF-8''${encodedName}`;
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

// const safeDeleteFiles = (filePaths = []) => {
//   for (const filePath of filePaths) {
//     safeDeleteFile(filePath);
//   }
// };

// const isClientDisconnected = (res) => {
//   return res.destroyed || res.writableEnded;
// };

// const sendJsonIfConnected = (res, statusCode, payload) => {
//   if (res.destroyed || res.writableEnded || res.headersSent) return;
//   return res.status(statusCode).json(payload);
// };

// const isValidPreparedFile = (filePath) => {
//   try {
//     if (!fs.existsSync(filePath)) return false;
//     return fs.statSync(filePath).size > 1024;
//   } catch {
//     return false;
//   }
// };

// const getCleanProcessError = (stderr = "") => {
//   const text = String(stderr || "").trim();

//   if (!text) return "Process stopped before completion.";

//   const lines = text
//     .split("\n")
//     .map((line) => line.trim())
//     .filter(Boolean);

//   return (
//     [...lines]
//       .reverse()
//       .find((line) =>
//         /error|failed|invalid|unable|not found|permission|denied|forbidden|too many requests|sign in|cookies|bot|rate|ffmpeg|ffprobe|codec|libx264|conversion|killed|memory|timeout|audio/i.test(
//           line
//         )
//       ) ||
//     lines[0] ||
//     "Download process failed."
//   );
// };

// const normalizeErrorMessage = (stderr = "") => {
//   const lowerError = String(stderr || "").toLowerCase();

//   if (
//     lowerError.includes("429") ||
//     lowerError.includes("too many requests") ||
//     lowerError.includes("rate limit") ||
//     lowerError.includes("rate-limit") ||
//     lowerError.includes("rate-limited") ||
//     lowerError.includes("ratelimited")
//   ) {
//     return {
//       statusCode: 429,
//       code: "RATE_LIMITED",
//       error:
//         "This platform is rate-limiting the server. Please wait and try again later.",
//     };
//   }

//   if (
//     lowerError.includes("[youtube]") &&
//     (lowerError.includes("sign in to confirm") ||
//       lowerError.includes("not a bot") ||
//       lowerError.includes("cookies-from-browser") ||
//       lowerError.includes("use --cookies") ||
//       lowerError.includes("robot") ||
//       lowerError.includes("bot"))
//   ) {
//     return {
//       statusCode: 403,
//       code: "YOUTUBE_BLOCKED_ON_SERVER",
//       error:
//         "YouTube blocked this server request. This usually happens on cloud/server IPs. Please try another platform for now.",
//     };
//   }

//   if (lowerError.includes("[instagram]") || lowerError.includes("instagram")) {
//     if (
//       lowerError.includes("rate-limit") ||
//       lowerError.includes("rate limit") ||
//       lowerError.includes("too many requests")
//     ) {
//       return {
//         statusCode: 429,
//         code: "INSTAGRAM_RATE_LIMITED",
//         error:
//           "Instagram is rate-limiting the server. Please wait and try another public reel.",
//       };
//     }

//     if (
//       lowerError.includes("login") ||
//       lowerError.includes("cookies") ||
//       lowerError.includes("not available") ||
//       lowerError.includes("private")
//     ) {
//       return {
//         statusCode: 401,
//         code: "INSTAGRAM_LOGIN_REQUIRED",
//         error:
//           "Instagram could not access this content. It may be private, unavailable, rate-limited, or require login/cookies.",
//       };
//     }
//   }

//   if (
//     lowerError.includes("403") ||
//     lowerError.includes("forbidden") ||
//     lowerError.includes("access denied")
//   ) {
//     return {
//       statusCode: 403,
//       code: "PLATFORM_FORBIDDEN",
//       error:
//         "This platform blocked the server request. Please try another public video link.",
//     };
//   }

//   if (lowerError.includes("[reddit]") || lowerError.includes("reddit")) {
//     return {
//       statusCode: 422,
//       code: "REDDIT_EXTRACT_FAILED",
//       error:
//         "Reddit could not process this post. Try another public native Reddit video post.",
//     };
//   }

//   if (
//     lowerError.includes("[facebook]") ||
//     lowerError.includes("facebook") ||
//     lowerError.includes("cannot parse data")
//   ) {
//     return {
//       statusCode: 422,
//       code: "FACEBOOK_EXTRACT_FAILED",
//       error:
//         "Facebook could not fully process this link. Try another public reel or video URL.",
//     };
//   }

//   if (
//     lowerError.includes("cookies") ||
//     lowerError.includes("login") ||
//     lowerError.includes("private") ||
//     lowerError.includes("not available") ||
//     lowerError.includes("sign in") ||
//     lowerError.includes("authentication")
//   ) {
//     return {
//       statusCode: 401,
//       code: "LOGIN_OR_COOKIES_REQUIRED",
//       error:
//         "This video may require login or cookies. Please try another public video link.",
//     };
//   }

//   if (
//     lowerError.includes("unsupported url") ||
//     lowerError.includes("no suitable extractor") ||
//     lowerError.includes("not a valid url")
//   ) {
//     return {
//       statusCode: 400,
//       code: "UNSUPPORTED_URL",
//       error:
//         "This website or link format is not supported yet. Please try another valid public video URL.",
//     };
//   }

//   if (
//     lowerError.includes("no video formats found") ||
//     lowerError.includes("requested format is not available") ||
//     lowerError.includes("no formats found")
//   ) {
//     return {
//       statusCode: 422,
//       code: "NO_FORMATS_FOUND",
//       error:
//         "No playable video format was found for this link. Please try another quality or another public video.",
//     };
//   }

//   if (
//     lowerError.includes("unknown encoder") ||
//     lowerError.includes("libx264") ||
//     lowerError.includes("encoder not found")
//   ) {
//     return {
//       statusCode: 500,
//       code: "FFMPEG_CODEC_NOT_AVAILABLE",
//       error:
//         "FFmpeg on this server does not support H.264 encoding. Please check Render FFmpeg installation.",
//     };
//   }

//   return {
//     statusCode: 500,
//     code: "MEDIA_EXTRACT_FAILED",
//     error:
//       "Unable to extract this media. Please check the link or try another public video.",
//   };
// };

// const isPrivateIp = (ip) => {
//   if (!ip) return true;

//   if (net.isIPv4(ip)) {
//     const parts = ip.split(".").map(Number);
//     const [a, b] = parts;

//     return (
//       a === 10 ||
//       a === 127 ||
//       a === 0 ||
//       (a === 169 && b === 254) ||
//       (a === 172 && b >= 16 && b <= 31) ||
//       (a === 192 && b === 168)
//     );
//   }

//   if (net.isIPv6(ip)) {
//     const value = ip.toLowerCase();
//     return (
//       value === "::1" ||
//       value.startsWith("fc") ||
//       value.startsWith("fd") ||
//       value.startsWith("fe80")
//     );
//   }

//   return true;
// };

// const assertPublicHttpUrl = async (value, label = "URL") => {
//   let parsed;

//   try {
//     parsed = new URL(String(value || ""));
//   } catch {
//     const err = new Error(`${label} is invalid.`);
//     err.statusCode = 400;
//     err.code = "INVALID_URL";
//     throw err;
//   }

//   if (!["http:", "https:"].includes(parsed.protocol)) {
//     const err = new Error(`${label} must be an HTTP or HTTPS URL.`);
//     err.statusCode = 400;
//     err.code = "INVALID_URL_PROTOCOL";
//     throw err;
//   }

//   const hostname = parsed.hostname.toLowerCase();

//   if (hostname === "localhost" || hostname.endsWith(".localhost")) {
//     const err = new Error(`${label} cannot use a private host.`);
//     err.statusCode = 400;
//     err.code = "PRIVATE_URL_BLOCKED";
//     throw err;
//   }

//   if (net.isIP(hostname) && isPrivateIp(hostname)) {
//     const err = new Error(`${label} cannot use a private IP address.`);
//     err.statusCode = 400;
//     err.code = "PRIVATE_URL_BLOCKED";
//     throw err;
//   }

//   try {
//     const records = await dns.lookup(hostname, { all: true, verbatim: true });
//     if (!records.length || records.some((record) => isPrivateIp(record.address))) {
//       const err = new Error(`${label} resolves to a private address.`);
//       err.statusCode = 400;
//       err.code = "PRIVATE_URL_BLOCKED";
//       throw err;
//     }
//   } catch (err) {
//     if (err.code === "PRIVATE_URL_BLOCKED") throw err;

//     const lookupErr = new Error(`${label} host could not be verified.`);
//     lookupErr.statusCode = 400;
//     lookupErr.code = "URL_HOST_VERIFY_FAILED";
//     throw lookupErr;
//   }

//   return parsed.toString();
// };

// const hasStream = (filePath, streamType) => {
//   return new Promise((resolve) => {
//     const selector = streamType === "audio" ? "a:0" : "v:0";

//     const child = spawn(
//       FFPROBE_PATH,
//       [
//         "-v",
//         "error",
//         "-select_streams",
//         selector,
//         "-show_entries",
//         "stream=codec_type",
//         "-of",
//         "csv=p=0",
//         filePath,
//       ],
//       {
//         timeout: 30000,
//         windowsHide: true,
//       }
//     );

//     let stdout = "";

//     child.stdout.on("data", (data) => {
//       stdout += data.toString();
//     });

//     child.on("close", () => {
//       resolve(stdout.trim().includes(streamType));
//     });

//     child.on("error", () => {
//       resolve(false);
//     });
//   });
// };

// const validateVideoHasAudio = async (filePath) => {
//   const [videoOk, audioOk] = await Promise.all([
//     hasStream(filePath, "video"),
//     hasStream(filePath, "audio"),
//   ]);

//   return videoOk && audioOk;
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

//   res.setHeader("Content-Type", getContentType(filePath));
//   res.setHeader("Content-Length", stat.size);
//   res.setHeader(
//     "Content-Disposition",
//     createContentDisposition(downloadName || path.basename(filePath))
//   );

//   const stream = fs.createReadStream(filePath);
//   stream.pipe(res);

//   const cleanupLater = () => {
//     setTimeout(() => safeDeleteFile(filePath), 60 * 1000);
//   };

//   res.on("finish", cleanupLater);
//   res.on("close", cleanupLater);

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

//   if (gb >= 1) label = `${gb.toFixed(1)} GB`;
//   else if (mb >= 100) label = `${Math.round(mb)} MB`;
//   else if (mb >= 10) label = `${mb.toFixed(1)} MB`;
//   else if (mb >= 1) label = `${mb.toFixed(1)} MB`;
//   else label = `${Math.max(1, Math.round(kb))} KB`;

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
//     if (value && !Number.isNaN(value) && value > 0) return value;
//   }

//   return null;
// };

// const getFormatHeight = (item = {}) => {
//   const formatId = String(item.format_id || "").toLowerCase();
//   const formatNote = String(item.format_note || "").toLowerCase();
//   const quality = String(item.quality || "").toLowerCase();
//   const resolution = String(item.resolution || "").toLowerCase();

//   const directHeight = Number(item.height || 0);
//   if (directHeight > 0) return directHeight;

//   const text = `${formatId} ${formatNote} ${quality} ${resolution}`;

//   if (/4320|8k/.test(text)) return 4320;
//   if (/2160|4k|uhd/.test(text)) return 2160;
//   if (/1440|2k/.test(text)) return 1440;
//   if (/1080|full\s*hd|fhd/.test(text)) return 1080;
//   if (/720|\bhd\b/.test(text)) return 720;
//   if (/480|\bsd\b/.test(text)) return 480;
//   if (/360/.test(text)) return 360;
//   if (/240/.test(text)) return 240;
//   if (/144/.test(text)) return 144;

//   if (item.width && item.height) return Number(item.height);

//   return 0;
// };

// const getQualityRank = (item = {}) => {
//   const height = getFormatHeight(item);
//   if (height >= 4320) return 4320;
//   if (height >= 2160) return 2160;
//   if (height >= 1440) return 1440;
//   if (height >= 1080) return 1080;
//   if (height >= 720) return 720;
//   if (height >= 480) return 480;
//   if (height >= 360) return 360;
//   if (height >= 240) return 240;
//   if (height >= 144) return 144;
//   return 0;
// };

// const getEstimatedVideoBitrateKbps = (item = {}) => {
//   const height = getFormatHeight(item);
//   const ext = String(item.ext || "").toLowerCase();
//   const fps = Number(item.fps || 30);
//   const isShortOrReel =
//     getAspectRatio(item.width, item.height, item.aspect_ratio) === "portrait";

//   let bitrateKbps;

//   if (height >= 4320) bitrateKbps = 45000;
//   else if (height >= 2160) bitrateKbps = 18000;
//   else if (height >= 1440) bitrateKbps = 10000;
//   else if (height >= 1080) bitrateKbps = 5500;
//   else if (height >= 720) bitrateKbps = 3000;
//   else if (height >= 480) bitrateKbps = 1500;
//   else if (height >= 360) bitrateKbps = 900;
//   else if (height >= 240) bitrateKbps = 500;
//   else bitrateKbps = 900;

//   if (fps >= 50) bitrateKbps *= 1.35;
//   if (ext === "webm") bitrateKbps *= 0.85;
//   if (isShortOrReel) bitrateKbps *= 0.8;

//   return bitrateKbps;
// };

// const estimateVideoSizeFromResolution = (item = {}, durationSeconds) => {
//   const duration = Number(durationSeconds || item.duration || 0);
//   if (!duration || Number.isNaN(duration) || duration <= 0) return null;

//   const bitrateKbps = getEstimatedVideoBitrateKbps(item);
//   const audioKbps = item.hasAudio === false ? 0 : 128;

//   return ((bitrateKbps + audioKbps) * 1000 * duration) / 8;
// };

// const estimateAudioSize = (item = {}, durationSeconds) => {
//   const duration = Number(durationSeconds || item.duration || 0);
//   if (!duration || Number.isNaN(duration) || duration <= 0) return null;

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
//     if (type === "audio") return (128 * 1000 * duration) / 8;
//     return (900 * 1000 * duration) / 8;
//   }

//   if (type === "audio") return 512 * 1024;

//   return 2 * 1024 * 1024;
// };

// const isDirectSizeReasonable = (exactBytes, estimatedBytes) => {
//   if (!exactBytes || !estimatedBytes) return Boolean(exactBytes);

//   const ratio = exactBytes / estimatedBytes;
//   return ratio >= 0.2 && ratio <= 5;
// };

// const getFormatSizeInfo = (item = {}, durationSeconds, type = "video") => {
//   const exactBytes = getDirectSizeBytes(item);
//   const smartEstimate =
//     type === "audio"
//       ? estimateAudioSize(item, durationSeconds)
//       : estimateVideoSizeFromResolution(item, durationSeconds);

//   if (exactBytes && isDirectSizeReasonable(exactBytes, smartEstimate)) {
//     return {
//       size: formatSize(exactBytes, false),
//       sizeBytes: Math.round(exactBytes),
//       sizeEstimated: false,
//     };
//   }

//   if (smartEstimate) {
//     return {
//       size: formatSize(smartEstimate, true),
//       sizeBytes: Math.round(smartEstimate),
//       sizeEstimated: true,
//     };
//   }

//   if (exactBytes) {
//     return {
//       size: formatSize(exactBytes, false),
//       sizeBytes: Math.round(exactBytes),
//       sizeEstimated: false,
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

// const getQualityLabel = (item = {}) => {
//   const height = getFormatHeight(item);

//   if (height >= 4320) return "4320p (8K)";
//   if (height >= 2160) return "2160p (4K)";
//   if (height >= 1440) return "1440p (2K)";
//   if (height >= 1080) return "1080p (Full HD)";
//   if (height >= 720) return "720p (HD)";
//   if (height >= 480) return "480p (SD)";
//   if (height >= 360) return "360p";
//   if (height >= 240) return "240p";
//   if (height >= 144) return "144p";

//   if (item.width && item.height) return `${item.width}×${item.height}`;

//   return item.format_note || item.resolution || item.format_id || "Default";
// };

// const getSortHeight = (value = "") => {
//   const text = String(value || "").toLowerCase();

//   if (text.includes("4320") || text.includes("8k")) return 4320;
//   if (text.includes("2160") || text.includes("4k")) return 2160;
//   if (text.includes("1440") || text.includes("2k")) return 1440;
//   if (text.includes("1080") || text.includes("full hd") || text.includes("fhd")) return 1080;
//   if (text.includes("720") || /\bhd\b/.test(text)) return 720;
//   if (text.includes("480") || /\bsd\b/.test(text)) return 480;
//   if (text.includes("360")) return 360;
//   if (text.includes("240")) return 240;
//   if (text.includes("144")) return 144;

//   return Number(String(value).match(/\d+/)?.[0]) || 0;
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
//   const uploader = data.uploader || "";

//   const lines = String(description || "")
//     .split("\n")
//     .map((line) => line.replace(/\s+/g, " ").trim())
//     .filter(Boolean);

//   let title =
//     lines.find((line) => !isMetricOnlyTitle(line)) ||
//     rawTitle ||
//     uploader ||
//     "Video";

//   title = String(title)
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

// const chooseStrictAudioVideoFormatSpec = ({
//   videoFormatId,
//   audioFormatId,
//   hasAudio,
// } = {}) => {
//   const fallback =
//     "bestvideo[height<=720][ext=mp4]+bestaudio[ext=m4a]/bestvideo[height<=720]+bestaudio/best[height<=720][acodec!=none]/best[acodec!=none]";

//   if (videoFormatId && audioFormatId) {
//     return `${videoFormatId}+${audioFormatId}/${fallback}`;
//   }

//   if (videoFormatId && hasAudio) {
//     return `${videoFormatId}/${fallback}`;
//   }

//   return fallback;
// };

// const transcodeToBrowserMp4 = (inputPath, outputPath) => {
//   return new Promise((resolve, reject) => {
//     const child = spawn(
//       FFMPEG_PATH,
//       [
//         "-y",
//         "-hide_banner",
//         "-loglevel",
//         "error",
//         "-i",
//         inputPath,

//         "-map",
//         "0:v:0",
//         "-map",
//         "0:a:0",

//         "-c:v",
//         "libx264",
//         "-preset",
//         "ultrafast",
//         "-crf",
//         "26",
//         "-pix_fmt",
//         "yuv420p",
//         "-profile:v",
//         "main",

//         "-c:a",
//         "aac",
//         "-b:a",
//         "160k",

//         "-movflags",
//         "+faststart",

//         outputPath,
//       ],
//       {
//         timeout: 900000,
//         windowsHide: true,
//       }
//     );

//     let stderr = "";

//     child.stderr.on("data", (data) => {
//       stderr += data.toString();
//     });

//     child.on("error", (err) => {
//       reject(
//         Object.assign(new Error("FFmpeg failed to start."), {
//           details: err.message,
//         })
//       );
//     });

//     child.on("close", (code) => {
//       if (code !== 0) {
//         return reject(
//           Object.assign(new Error("FFmpeg H.264/AAC conversion failed."), {
//             details: stderr,
//           })
//         );
//       }

//       if (!isValidPreparedFile(outputPath)) {
//         return reject(new Error("Converted MP4 file is invalid or empty."));
//       }

//       resolve(outputPath);
//     });
//   });
// };

// const cleanupOldFiles = () => {
//   const maxAgeMs = 60 * 60 * 1000;
//   const now = Date.now();

//   try {
//     const files = fs.readdirSync(outputDir);

//     for (const file of files) {
//       const filePath = path.join(outputDir, file);
//       const stat = fs.statSync(filePath);

//       if (!stat.isFile()) continue;

//       if (now - stat.mtimeMs > maxAgeMs) {
//         safeDeleteFile(filePath);
//       }
//     }
//   } catch {}
// };

// setInterval(cleanupOldFiles, 30 * 60 * 1000);

// const buildAudioFormats = (allFormats = [], duration) => {
//   return allFormats
//     .filter((item) => {
//       return (
//         item.url &&
//         item.acodec &&
//         item.acodec !== "none" &&
//         (!item.vcodec || item.vcodec === "none")
//       );
//     })
//     .map((item) => {
//       const sizeInfo = getFormatSizeInfo(item, duration, "audio");

//       return {
//         type: "audio",
//         url: item.url,
//         quality:
//           item.abr || item.asr
//             ? `${Math.round(item.abr || item.asr)} kbps`
//             : item.format_note || "Audio",
//         ext: item.ext || "m4a",
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
//         qualityRank: 0,
//       };
//     })
//     .sort((a, b) => Number(b.sizeBytes || 0) - Number(a.sizeBytes || 0))
//     .slice(0, 8);
// };

// const buildVideoFormats = (allFormats = [], duration, bestAudio = null) => {
//   const progressiveVideoFormats = allFormats
//     .filter((item) => {
//       const ext = String(item.ext || "").toLowerCase();
//       const formatId = String(item.format_id || "").toLowerCase();
//       const formatNote = String(item.format_note || "").toLowerCase();

//       const hasKnownVideo =
//         item.vcodec && item.vcodec !== "none" && item.vcodec !== "unknown";

//       const hasKnownAudio =
//         item.acodec && item.acodec !== "none" && item.acodec !== "unknown";

//       const isLikelyFacebookCombined =
//         item.url &&
//         ext === "mp4" &&
//         (formatId === "sd" ||
//           formatId === "hd" ||
//           formatNote === "sd" ||
//           formatNote === "hd") &&
//         (!item.vcodec || item.vcodec === "unknown") &&
//         (!item.acodec || item.acodec === "unknown");

//       return (
//         item.url &&
//         ["mp4", "webm"].includes(ext) &&
//         ((hasKnownVideo && hasKnownAudio) || isLikelyFacebookCombined)
//       );
//     })
//     .map((item) => {
//       const ext = item.ext || "mp4";
//       const formatId = String(item.format_id || "").toLowerCase();
//       const formatNote = String(item.format_note || "").toLowerCase();

//       const hasKnownAudio =
//         item.acodec && item.acodec !== "none" && item.acodec !== "unknown";

//       const isLikelyCombinedUnknown =
//         String(ext).toLowerCase() === "mp4" &&
//         (formatId === "sd" ||
//           formatId === "hd" ||
//           formatNote === "sd" ||
//           formatNote === "hd") &&
//         (!item.vcodec || item.vcodec === "unknown") &&
//         (!item.acodec || item.acodec === "unknown");

//       const normalizedItem = {
//         ...item,
//         hasAudio: Boolean(hasKnownAudio || isLikelyCombinedUnknown),
//       };

//       const sizeInfo = getFormatSizeInfo(normalizedItem, duration, "video");
//       const qualityRank = getQualityRank(item);

//       return {
//         type: "video",
//         url: item.url,
//         quality: getQualityLabel(item),
//         ext,
//         size: sizeInfo.size,
//         sizeBytes: sizeInfo.sizeBytes,
//         sizeEstimated: sizeInfo.sizeEstimated,
//         formatId: item.format_id || "",
//         width: item.width || null,
//         height: getFormatHeight(item) || item.height || null,
//         fps: item.fps || null,
//         vcodec: item.vcodec || "",
//         acodec: item.acodec || "",
//         hasAudio: Boolean(hasKnownAudio || isLikelyCombinedUnknown),
//         audioUrl: "",
//         audioFormatId: "",
//         aspectRatio: getAspectRatio(item.width, item.height, item.aspect_ratio),
//         qualityRank,
//         sourceKind: "progressive",
//       };
//     });

//   const dashVideoFormats = allFormats
//     .filter((item) => {
//       return (
//         item.url &&
//         item.vcodec &&
//         item.vcodec !== "none" &&
//         item.vcodec !== "unknown" &&
//         ["mp4", "webm"].includes(String(item.ext || "").toLowerCase()) &&
//         (!item.acodec || item.acodec === "none" || item.acodec === "unknown")
//       );
//     })
//     .map((item) => {
//       const normalizedItem = {
//         ...item,
//         hasAudio: Boolean(bestAudio),
//       };
//       const sizeInfo = getFormatSizeInfo(normalizedItem, duration, "video");
//       const qualityRank = getQualityRank(item);

//       return {
//         type: "video",
//         url: item.url,
//         quality: getQualityLabel(item),
//         ext: item.ext || "mp4",
//         size: sizeInfo.size,
//         sizeBytes: sizeInfo.sizeBytes,
//         sizeEstimated: sizeInfo.sizeEstimated,
//         formatId: item.format_id || "",
//         width: item.width || null,
//         height: getFormatHeight(item) || item.height || null,
//         fps: item.fps || null,
//         vcodec: item.vcodec || "",
//         acodec: item.acodec || "none",
//         hasAudio: false,
//         audioUrl: bestAudio?.url || "",
//         audioFormatId: bestAudio?.formatId || "",
//         aspectRatio: getAspectRatio(item.width, item.height, item.aspect_ratio),
//         qualityRank,
//         sourceKind: "dash",
//       };
//     });

//   const byQuality = new Map();

//   for (const item of [...progressiveVideoFormats, ...dashVideoFormats]) {
//     const qualityKey = `${item.qualityRank || getSortHeight(item.quality)}-${item.ext}-${item.aspectRatio}`;
//     const existing = byQuality.get(qualityKey);

//     if (!existing) {
//       byQuality.set(qualityKey, item);
//       continue;
//     }

//     const existingScore =
//       (existing.hasAudio ? 100000 : 0) +
//       (existing.ext === "mp4" ? 10000 : 0) +
//       Number(existing.sizeBytes || 0) / 100000000;

//     const itemScore =
//       (item.hasAudio ? 100000 : 0) +
//       (item.ext === "mp4" ? 10000 : 0) +
//       Number(item.sizeBytes || 0) / 100000000;

//     if (itemScore > existingScore) {
//       byQuality.set(qualityKey, item);
//     }
//   }

//   return [...byQuality.values()]
//     .sort((a, b) => {
//       const aHeight = a.qualityRank || getSortHeight(a.quality);
//       const bHeight = b.qualityRank || getSortHeight(b.quality);

//       if (bHeight !== aHeight) return bHeight - aHeight;

//       if (a.ext === "mp4" && b.ext !== "mp4") return -1;
//       if (a.ext !== "mp4" && b.ext === "mp4") return 1;

//       if (a.hasAudio && !b.hasAudio) return -1;
//       if (!a.hasAudio && b.hasAudio) return 1;

//       return Number(b.sizeBytes || 0) - Number(a.sizeBytes || 0);
//     })
//     .slice(0, 10);
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
//       ["-J", "--no-playlist", "--no-warnings", "--socket-timeout", "20", url],
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
//       const audioFormats = buildAudioFormats(allFormats, data.duration);

//       const bestAudio =
//         audioFormats.find((item) => item.ext === "m4a") ||
//         audioFormats[0] ||
//         null;

//       const videoFormats = buildVideoFormats(allFormats, data.duration, bestAudio);

//       const bestPreview =
//         videoFormats.find((item) => item.hasAudio && item.ext === "mp4") ||
//         videoFormats.find((item) => item.ext === "mp4") ||
//         videoFormats[0] ||
//         null;

//       const originalPageUrl = data.webpage_url || url;

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

//         previewUrl: bestPreview?.url || "",
//         previewMode: PREVIEW_MODE,
//         previewHasAudio: Boolean(bestPreview?.hasAudio),
//         previewAudioUrl:
//           bestPreview && !bestPreview.hasAudio ? bestPreview.audioUrl : "",

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
//   return res.status(422).json({
//     status: "fail",
//     code: "PREVIEW_NOT_AVAILABLE",
//     error:
//       "Server preview is disabled on this server. The app uses raw preview instead.",
//   });
// };

// exports.downloadDirectMedia = async (req, res) => {
//   let childProcess = null;
//   let hasFinished = false;
//   let clientCancelled = false;
//   let outputPathToClean = "";
//   const filesToClean = [];

//   const cleanupProcess = () => {
//     clientCancelled = true;

//     if (childProcess && !childProcess.killed) {
//       try {
//         childProcess.kill("SIGKILL");
//       } catch {}
//     }

//     safeDeleteFiles(filesToClean);

//     if (outputPathToClean) {
//       safeDeleteFile(outputPathToClean);
//     }
//   };

//   req.on("aborted", cleanupProcess);

//   res.on("close", () => {
//     if (!hasFinished) cleanupProcess();
//   });

//   try {
//     req.setTimeout?.(0);
//     res.setTimeout?.(0);

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

//     if (originalUrlValue) {
//       const sourcePrefix = `${safeTitle}-${timestamp}-source`;
//       const outputTemplate = path.join(outputDir, `${sourcePrefix}.%(ext)s`);

//       const args = [
//         "--no-playlist",
//         "--newline",
//         "--force-overwrites",
//         "--no-warnings",
//         "--socket-timeout",
//         "30",
//         "-N",
//         "4",
//         "--ffmpeg-location",
//         FFMPEG_PATH,
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
//         const formatSpec = chooseStrictAudioVideoFormatSpec({
//           videoFormatId,
//           audioFormatId,
//           hasAudio,
//         });

//         args.push(
//           "-f",
//           formatSpec,
//           "--merge-output-format",
//           "mp4",
//           "-o",
//           outputTemplate,
//           originalUrlValue
//         );
//       }

//       childProcess = spawn(YTDLP_PATH, args, {
//         timeout: 900000,
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

//       childProcess.on("close", async (code, signal) => {
//         if (isResponded) return;

//         let sourcePath = "";

//         try {
//           if (
//             clientCancelled ||
//             signal === "SIGKILL" ||
//             isClientDisconnected(res)
//           ) {
//             hasFinished = true;
//             safeDeleteFiles(filesToClean);
//             return;
//           }

//           if (code !== 0) {
//             isResponded = true;
//             hasFinished = true;

//             const friendly = normalizeErrorMessage(stderr);
//             const cleanError = getCleanProcessError(stderr);

//             console.log("yt-dlp download failed:", cleanError);

//             return sendJsonIfConnected(res, friendly.statusCode || 500, {
//               status: "fail",
//               code: friendly.code || "YTDLP_DOWNLOAD_FAILED",
//               error: friendly.error || "Download was not completed.",
//               details: cleanError,
//             });
//           }

//           const files = fs
//             .readdirSync(outputDir)
//             .filter((file) => file.startsWith(sourcePrefix));

//           if (!files.length) {
//             isResponded = true;
//             hasFinished = true;

//             return sendJsonIfConnected(res, 500, {
//               status: "fail",
//               code: "DOWNLOADED_FILE_NOT_FOUND",
//               error: "Prepared file not found.",
//             });
//           }

//           const preferredExt = type === "audio" ? ".mp3" : ".mp4";
//           const selectedFile =
//             files.find((file) => file.endsWith(preferredExt)) || files[0];

//           sourcePath = path.join(outputDir, selectedFile);
//           filesToClean.push(sourcePath);

//           if (!isValidPreparedFile(sourcePath)) {
//             safeDeleteFile(sourcePath);

//             isResponded = true;
//             hasFinished = true;

//             return sendJsonIfConnected(res, 500, {
//               status: "fail",
//               code: "DOWNLOADED_FILE_INVALID",
//               error: "Downloaded file is invalid or empty.",
//             });
//           }

//           if (type === "video") {
//             await transcodeToBrowserMp4(sourcePath, outputPath);
//             safeDeleteFile(sourcePath);
//             outputPathToClean = outputPath;
//           } else {
//             outputPathToClean = sourcePath;
//           }

//           const finalPath = type === "video" ? outputPath : sourcePath;
//           const finalName = `${safeTitle}.${type === "audio" ? "mp3" : "mp4"}`;

//           if (type === "video") {
//             const hasVideoAndAudio = await validateVideoHasAudio(finalPath);

//             if (!hasVideoAndAudio) {
//               safeDeleteFile(finalPath);

//               isResponded = true;
//               hasFinished = true;

//               return sendJsonIfConnected(res, 422, {
//                 status: "fail",
//                 code: "NO_AUDIO_IN_OUTPUT",
//                 error:
//                   "This video was processed but no audio track was found. Please try another quality or another public link.",
//               });
//             }
//           }

//           isResponded = true;
//           hasFinished = true;

//           return sendPreparedFile(res, finalPath, finalName);
//         } catch (err) {
//           isResponded = true;
//           hasFinished = true;

//           console.log("Final media processing failed:", err.message);
//           console.log("Final media processing details:", err.details || "");

//           safeDeleteFile(sourcePath);
//           safeDeleteFile(outputPath);

//           return sendJsonIfConnected(res, 500, {
//             status: "fail",
//             code: "FINAL_MEDIA_PROCESSING_FAILED",
//             error:
//               "Video was downloaded but could not be converted to a browser-compatible MP4 with audio.",
//             details: err.details || err.message,
//           });
//         }
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

//     if (type === "video" && !audioUrl && !hasAudio) {
//       hasFinished = true;

//       return sendJsonIfConnected(res, 422, {
//         status: "fail",
//         code: "AUDIO_URL_REQUIRED_FOR_VIDEO",
//         error:
//           "This selected video quality does not include audio. Please choose another quality.",
//       });
//     }

//     const safeVideoUrl = videoUrl ? await assertPublicHttpUrl(videoUrl, "Video URL") : "";
//     const safeAudioUrl = audioUrl ? await assertPublicHttpUrl(audioUrl, "Audio URL") : "";

//     const args = ["-hide_banner", "-loglevel", "error", "-nostdin"];

//     if (type === "audio") {
//       args.push(
//         "-y",
//         "-i",
//         safeAudioUrl || safeVideoUrl,
//         "-vn",
//         "-codec:a",
//         "libmp3lame",
//         "-b:a",
//         "192k",
//         outputPath
//       );
//     } else if (hasAudio && !safeAudioUrl) {
//       args.push(
//         "-y",
//         "-i",
//         safeVideoUrl,
//         "-map",
//         "0:v:0",
//         "-map",
//         "0:a:0",
//         "-c:v",
//         "libx264",
//         "-preset",
//         "ultrafast",
//         "-crf",
//         "26",
//         "-pix_fmt",
//         "yuv420p",
//         "-profile:v",
//         "main",
//         "-c:a",
//         "aac",
//         "-b:a",
//         "160k",
//         "-movflags",
//         "+faststart",
//         outputPath
//       );
//     } else {
//       args.push(
//         "-y",
//         "-i",
//         safeVideoUrl,
//         "-i",
//         safeAudioUrl,
//         "-map",
//         "0:v:0",
//         "-map",
//         "1:a:0",
//         "-c:v",
//         "libx264",
//         "-preset",
//         "ultrafast",
//         "-crf",
//         "26",
//         "-pix_fmt",
//         "yuv420p",
//         "-profile:v",
//         "main",
//         "-c:a",
//         "aac",
//         "-b:a",
//         "160k",
//         "-movflags",
//         "+faststart",
//         "-shortest",
//         outputPath
//       );
//     }

//     childProcess = spawn(FFMPEG_PATH, args, {
//       timeout: 900000,
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

//     childProcess.on("close", async (code, signal) => {
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

//       if (type === "video") {
//         const hasVideoAndAudio = await validateVideoHasAudio(outputPath);

//         if (!hasVideoAndAudio) {
//           safeDeleteFile(outputPath);

//           isResponded = true;
//           hasFinished = true;

//           return sendJsonIfConnected(res, 422, {
//             status: "fail",
//             code: "NO_AUDIO_IN_OUTPUT",
//             error:
//               "This video was processed but no audio track was found. Please try another quality or another public link.",
//           });
//         }
//       }

//       isResponded = true;
//       hasFinished = true;

//       return sendPreparedFile(res, outputPath, `${safeTitle}.${extension}`);
//     });
//   } catch (err) {
//     hasFinished = true;

//     if (clientCancelled || isClientDisconnected(res)) return;

//     console.log("Direct download error:", err.message);

//     return sendJsonIfConnected(res, err.statusCode || 500, {
//       status: "fail",
//       code: err.code || "DIRECT_DOWNLOAD_FAILED",
//       error: err.message || "Download failed. Please try again.",
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

//     const safeImageUrl = await assertPublicHttpUrl(imageUrl, "Image URL");
//     const response = await fetch(safeImageUrl, {
//       redirect: "follow",
//       headers: {
//         "User-Agent":
//           "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
//       },
//     });

//     if (!response.ok) {
//       return res.status(400).json({
//         status: "fail",
//         code: "IMAGE_FETCH_FAILED",
//         error: "Failed to fetch image",
//       });
//     }

//     const contentType = response.headers.get("content-type") || "image/jpeg";

//     if (!contentType.toLowerCase().startsWith("image/")) {
//       return res.status(400).json({
//         status: "fail",
//         code: "INVALID_IMAGE_CONTENT_TYPE",
//         error: "URL does not point to an image.",
//       });
//     }

//     res.setHeader("Content-Type", contentType);

//     const arrayBuffer = await response.arrayBuffer();
//     const buffer = Buffer.from(arrayBuffer);

//     return res.send(buffer);
//   } catch (err) {
//     console.log("Proxy image error:", err.message);

//     return res.status(err.statusCode || 500).json({
//       status: "fail",
//       code: err.code || "IMAGE_PROXY_FAILED",
//       error: err.message || "Image proxy failed",
//     });
//   }
// };










const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
const { fetchMediaFromFallbackLayers } = require("../services/socialFallbackLayers.service");

const FFMPEG_PATH = process.env.FFMPEG_PATH || "ffmpeg";
const FFPROBE_PATH = process.env.FFPROBE_PATH || "ffprobe";
const YTDLP_PATH = process.env.YTDLP_PATH || "yt-dlp";

const outputDir = path.join(__dirname, "..", "downloads");

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const PREVIEW_MODE = "raw-preview-download-audio-v25";

const tryFallbackLayers = async (url, reason = "YTDLP_FAILED") => {
  const fallbackData = await fetchMediaFromFallbackLayers(url, { reason });

  return {
    ...fallbackData,
    fallbackUsed: true,
    fallbackReason: reason,
  };
};

exports.startApi = (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Welcome To Vidown Api",
  });
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
  const safeName = sanitizeFileName(filename || "linkflow-download");
  const encodedName = encodeRFC5987ValueChars(safeName);

  return `attachment; filename="${safeName}"; filename*=UTF-8''${encodedName}`;
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

const safeDeleteFiles = (filePaths = []) => {
  for (const filePath of filePaths) {
    safeDeleteFile(filePath);
  }
};

const isClientDisconnected = (res) => {
  return res.destroyed || res.writableEnded;
};

const sendJsonIfConnected = (res, statusCode, payload) => {
  if (res.destroyed || res.writableEnded || res.headersSent) return;
  return res.status(statusCode).json(payload);
};

const isValidPreparedFile = (filePath) => {
  try {
    if (!fs.existsSync(filePath)) return false;
    return fs.statSync(filePath).size > 1024;
  } catch {
    return false;
  }
};

const getCleanProcessError = (stderr = "") => {
  const text = String(stderr || "").trim();

  if (!text) return "Process stopped before completion.";

  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return (
    [...lines]
      .reverse()
      .find((line) =>
        /error|failed|invalid|unable|not found|permission|denied|forbidden|too many requests|sign in|cookies|bot|rate|ffmpeg|ffprobe|codec|libx264|conversion|killed|memory|timeout|audio/i.test(
          line
        )
      ) ||
    lines[0] ||
    "Download process failed."
  );
};

const normalizeErrorMessage = (stderr = "") => {
  const lowerError = String(stderr || "").toLowerCase();

  if (
    lowerError.includes("429") ||
    lowerError.includes("too many requests") ||
    lowerError.includes("rate limit") ||
    lowerError.includes("rate-limit") ||
    lowerError.includes("rate-limited") ||
    lowerError.includes("ratelimited")
  ) {
    return {
      statusCode: 429,
      code: "RATE_LIMITED",
      error:
        "This platform is rate-limiting the server. Please wait and try again later.",
    };
  }

  if (
    lowerError.includes("[youtube]") &&
    (lowerError.includes("sign in to confirm") ||
      lowerError.includes("not a bot") ||
      lowerError.includes("cookies-from-browser") ||
      lowerError.includes("use --cookies") ||
      lowerError.includes("robot") ||
      lowerError.includes("bot"))
  ) {
    return {
      statusCode: 403,
      code: "YOUTUBE_BLOCKED_ON_SERVER",
      error:
        "YouTube blocked this server request. This usually happens on cloud/server IPs. Please try another platform for now.",
    };
  }

  if (lowerError.includes("[instagram]") || lowerError.includes("instagram")) {
    if (
      lowerError.includes("rate-limit") ||
      lowerError.includes("rate limit") ||
      lowerError.includes("too many requests")
    ) {
      return {
        statusCode: 429,
        code: "INSTAGRAM_RATE_LIMITED",
        error:
          "Instagram is rate-limiting the server. Please wait and try another public reel.",
      };
    }

    if (
      lowerError.includes("login") ||
      lowerError.includes("cookies") ||
      lowerError.includes("not available") ||
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

  if (
    lowerError.includes("403") ||
    lowerError.includes("forbidden") ||
    lowerError.includes("access denied")
  ) {
    return {
      statusCode: 403,
      code: "PLATFORM_FORBIDDEN",
      error:
        "This platform blocked the server request. Please try another public video link.",
    };
  }

  if (lowerError.includes("[reddit]") || lowerError.includes("reddit")) {
    return {
      statusCode: 422,
      code: "REDDIT_EXTRACT_FAILED",
      error:
        "Reddit could not process this post. Try another public native Reddit video post.",
    };
  }

  if (
    lowerError.includes("[facebook]") ||
    lowerError.includes("facebook") ||
    lowerError.includes("cannot parse data")
  ) {
    return {
      statusCode: 422,
      code: "FACEBOOK_EXTRACT_FAILED",
      error:
        "Facebook could not fully process this link. Try another public reel or video URL.",
    };
  }

  if (
    lowerError.includes("cookies") ||
    lowerError.includes("login") ||
    lowerError.includes("private") ||
    lowerError.includes("not available") ||
    lowerError.includes("sign in") ||
    lowerError.includes("authentication")
  ) {
    return {
      statusCode: 401,
      code: "LOGIN_OR_COOKIES_REQUIRED",
      error:
        "This video may require login or cookies. Please try another public video link.",
    };
  }

  if (
    lowerError.includes("unsupported url") ||
    lowerError.includes("no suitable extractor") ||
    lowerError.includes("not a valid url")
  ) {
    return {
      statusCode: 400,
      code: "UNSUPPORTED_URL",
      error:
        "This website or link format is not supported yet. Please try another valid public video URL.",
    };
  }

  if (
    lowerError.includes("no video formats found") ||
    lowerError.includes("requested format is not available") ||
    lowerError.includes("no formats found")
  ) {
    return {
      statusCode: 422,
      code: "NO_FORMATS_FOUND",
      error:
        "No playable video format was found for this link. Please try another quality or another public video.",
    };
  }

  if (
    lowerError.includes("unknown encoder") ||
    lowerError.includes("libx264") ||
    lowerError.includes("encoder not found")
  ) {
    return {
      statusCode: 500,
      code: "FFMPEG_CODEC_NOT_AVAILABLE",
      error:
        "FFmpeg on this server does not support H.264 encoding. Please check Render FFmpeg installation.",
    };
  }

  return {
    statusCode: 500,
    code: "MEDIA_EXTRACT_FAILED",
    error:
      "Unable to extract this media. Please check the link or try another public video.",
  };
};

const hasStream = (filePath, streamType) => {
  return new Promise((resolve) => {
    const selector = streamType === "audio" ? "a:0" : "v:0";

    const child = spawn(
      FFPROBE_PATH,
      [
        "-v",
        "error",
        "-select_streams",
        selector,
        "-show_entries",
        "stream=codec_type",
        "-of",
        "csv=p=0",
        filePath,
      ],
      {
        timeout: 30000,
        windowsHide: true,
      }
    );

    let stdout = "";

    child.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    child.on("close", () => {
      resolve(stdout.trim().includes(streamType));
    });

    child.on("error", () => {
      resolve(false);
    });
  });
};

const validateVideoHasAudio = async (filePath) => {
  const [videoOk, audioOk] = await Promise.all([
    hasStream(filePath, "video"),
    hasStream(filePath, "audio"),
  ]);

  return videoOk && audioOk;
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

  res.setHeader("Content-Type", getContentType(filePath));
  res.setHeader("Content-Length", stat.size);
  res.setHeader(
    "Content-Disposition",
    createContentDisposition(downloadName || path.basename(filePath))
  );

  const stream = fs.createReadStream(filePath);
  stream.pipe(res);

  stream.on("close", () => {
    setTimeout(() => safeDeleteFile(filePath), 60 * 1000);
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

  if (gb >= 1) label = `${gb.toFixed(1)} GB`;
  else if (mb >= 100) label = `${Math.round(mb)} MB`;
  else if (mb >= 10) label = `${mb.toFixed(1)} MB`;
  else if (mb >= 1) label = `${mb.toFixed(1)} MB`;
  else label = `${Math.max(1, Math.round(kb))} KB`;

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
    if (value && !Number.isNaN(value) && value > 0) return value;
  }

  return null;
};

const estimateSizeFromBitrate = (item = {}, durationSeconds) => {
  const duration = Number(durationSeconds || item.duration || 0);
  if (!duration || Number.isNaN(duration) || duration <= 0) return null;

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

const getRotationDegrees = (item = {}) => {
  const candidates = [
    item.rotation,
    item.rotate,
    item.display_rotation,
    item.video_rotation,
    item.tags?.rotate,
    item.meta?.rotation,
  ];

  for (const candidate of candidates) {
    const value = Math.abs(Number(candidate || 0));

    if (!Number.isNaN(value) && value % 180 === 90) {
      return 90;
    }
  }

  return 0;
};

const getNormalizedDimensions = (item = {}) => {
  const width = Number(item.width || 0);
  const height = Number(item.height || 0);
  const rotation = getRotationDegrees(item);

  if (rotation === 90 && width && height) {
    return {
      width: height,
      height: width,
      rotation,
    };
  }

  return {
    width: width || null,
    height: height || null,
    rotation,
  };
};

const getFormatHeight = (item = {}) => {
  const formatId = String(item.format_id || "").toLowerCase();
  const formatNote = String(item.format_note || "").toLowerCase();
  const quality = String(item.quality || "").toLowerCase();
  const resolution = String(item.resolution || "").toLowerCase();

  const normalized = getNormalizedDimensions(item);
  const directHeight = Number(normalized.height || 0);

  if (directHeight > 0) return directHeight;

  const text = `${formatId} ${formatNote} ${quality} ${resolution}`;

  if (/4320|8k/.test(text)) return 4320;
  if (/2160|4k|uhd/.test(text)) return 2160;
  if (/1440|2k/.test(text)) return 1440;
  if (/1080|full\s*hd|fhd/.test(text)) return 1080;
  if (/720|\bhd\b/.test(text)) return 720;
  if (/480|\bsd\b/.test(text)) return 480;
  if (/360/.test(text)) return 360;
  if (/240/.test(text)) return 240;
  if (/144/.test(text)) return 144;

  return 0;
};

const getEstimatedVideoBitrateKbps = (item = {}) => {
  const height = getFormatHeight(item);
  const fps = Number(item.fps || 30);
  const normalized = getNormalizedDimensions(item);

  const isShortOrReel =
    getAspectRatio(
      item.width,
      item.height,
      item.aspect_ratio,
      normalized.rotation
    ) === "portrait";

  let bitrateKbps;

  if (height >= 4320) bitrateKbps = 35000;
  else if (height >= 2160) bitrateKbps = 16000;
  else if (height >= 1440) bitrateKbps = 9000;
  else if (height >= 1080) bitrateKbps = 5200;
  else if (height >= 720) bitrateKbps = 2800;
  else if (height >= 480) bitrateKbps = 1300;
  else if (height >= 360) bitrateKbps = 800;
  else if (height >= 240) bitrateKbps = 450;
  else bitrateKbps = normalized.width && normalized.height ? 800 : 600;

  if (fps >= 50) bitrateKbps *= 1.35;
  if (isShortOrReel) bitrateKbps *= 0.8;

  return bitrateKbps;
};

const estimateVideoSizeFromResolution = (item = {}, durationSeconds) => {
  const duration = Number(durationSeconds || item.duration || 0);
  if (!duration || Number.isNaN(duration) || duration <= 0) return null;

  let bitrateKbps = getEstimatedVideoBitrateKbps(item);

  if (String(item.ext || "").toLowerCase() === "webm") {
    bitrateKbps *= 0.85;
  }

  return (bitrateKbps * 1000 * duration) / 8;
};

const estimateAudioSize = (item = {}, durationSeconds) => {
  const duration = Number(durationSeconds || item.duration || 0);
  if (!duration || Number.isNaN(duration) || duration <= 0) return null;

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
    if (type === "audio") return (128 * 1000 * duration) / 8;
    return (900 * 1000 * duration) / 8;
  }

  if (type === "audio") return 512 * 1024;

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

const getAspectRatio = (width, height, ytAspectRatio, rotation = 0) => {
  let normalizedWidth = Number(width || 0);
  let normalizedHeight = Number(height || 0);

  if (
    Math.abs(Number(rotation || 0)) % 180 === 90 &&
    normalizedWidth &&
    normalizedHeight
  ) {
    [normalizedWidth, normalizedHeight] = [normalizedHeight, normalizedWidth];
  }

  if (normalizedWidth && normalizedHeight) {
    const ratio = normalizedWidth / normalizedHeight;

    if (ratio < 0.8) return "portrait";
    if (ratio > 1.2) return "landscape";

    return "square";
  }

  if (ytAspectRatio && Number(ytAspectRatio) < 0.8) return "portrait";
  if (ytAspectRatio && Number(ytAspectRatio) > 1.2) return "landscape";

  if (
    ytAspectRatio &&
    Number(ytAspectRatio) >= 0.8 &&
    Number(ytAspectRatio) <= 1.2
  ) {
    return "square";
  }

  return "landscape";
};

const getThumbnailAspectRatio = (data = {}) => {
  const thumbnails = [];

  if (data.thumbnail_width || data.thumbnail_height) {
    thumbnails.push({ width: data.thumbnail_width, height: data.thumbnail_height });
  }

  if (Array.isArray(data.thumbnails)) {
    thumbnails.push(...data.thumbnails);
  }

  const validThumbnails = thumbnails
    .map((item) => ({
      width: Number(item.width || 0),
      height: Number(item.height || 0),
    }))
    .filter((item) => item.width > 0 && item.height > 0)
    .sort((a, b) => b.width * b.height - a.width * a.height);

  for (const item of validThumbnails) {
    const detected = getAspectRatio(item.width, item.height);
    if (detected) return detected;
  }

  return null;
};

const getQualityLabel = (item = {}) => {
  const height = getFormatHeight(item);

  if (height >= 4320) return "4320p (8K)";
  if (height >= 2160) return "2160p (4K)";
  if (height >= 1440) return "1440p (2K)";
  if (height >= 1080) return "1080p (Full HD)";
  if (height >= 720) return "720p (HD)";
  if (height >= 480) return "480p (SD)";
  if (height >= 360) return "360p";
  if (height >= 240) return "240p";

  if (item.width && item.height) return `${item.width}×${item.height}`;

  return item.format_note || item.resolution || item.format_id || "Default";
};

const getSortHeight = (quality = "") => {
  const text = String(quality || "").toLowerCase();

  if (text.includes("4320") || text.includes("8k")) return 4320;
  if (text.includes("2160") || text.includes("4k")) return 2160;
  if (text.includes("1440") || text.includes("2k")) return 1440;
  if (text.includes("1080") || text.includes("full hd") || text.includes("fhd")) return 1080;
  if (text.includes("720") || /^hd$/.test(text) || text.includes(" hd")) return 720;
  if (text.includes("480") || /^sd$/.test(text) || text.includes(" sd")) return 480;
  if (text.includes("360")) return 360;
  if (text.includes("240")) return 240;
  if (text.includes("144")) return 144;

  return Number(text.match(/\d+/)?.[0]) || 0;
};

const getQualityRank = (item = {}) => {
  return Number(item.qualityRank || 0) || getFormatHeight(item) || getSortHeight(item.quality);
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

const chooseStrictAudioVideoFormatSpec = ({
  videoFormatId,
  audioFormatId,
  hasAudio,
} = {}) => {
  const fallback =
    "bestvideo[height<=720][ext=mp4]+bestaudio[ext=m4a]/bestvideo[height<=720]+bestaudio/best[height<=720][acodec!=none]/best[acodec!=none]";

  if (videoFormatId && audioFormatId) {
    return `${videoFormatId}+${audioFormatId}/${videoFormatId}+bestaudio[ext=m4a]/${videoFormatId}+bestaudio/${fallback}`;
  }

  if (videoFormatId && hasAudio) {
    return `${videoFormatId}/${fallback}`;
  }

  if (videoFormatId) {
    return `${videoFormatId}+bestaudio[ext=m4a]/${videoFormatId}+bestaudio/${fallback}`;
  }

  return fallback;
};

const transcodeToBrowserMp4 = (inputPath, outputPath) => {
  return new Promise((resolve, reject) => {
    const child = spawn(
      FFMPEG_PATH,
      [
        "-y",
        "-hide_banner",
        "-loglevel",
        "error",
        "-i",
        inputPath,

        "-map",
        "0:v:0",
        "-map",
        "0:a:0",

        "-c:v",
        "libx264",
        "-preset",
        "ultrafast",
        "-crf",
        "26",
        "-pix_fmt",
        "yuv420p",
        "-profile:v",
        "main",

        "-c:a",
        "aac",
        "-b:a",
        "160k",

        "-movflags",
        "+faststart",

        outputPath,
      ],
      {
        timeout: 900000,
        windowsHide: true,
      }
    );

    let stderr = "";

    child.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    child.on("error", (err) => {
      reject(
        Object.assign(new Error("FFmpeg failed to start."), {
          details: err.message,
        })
      );
    });

    child.on("close", (code) => {
      if (code !== 0) {
        return reject(
          Object.assign(new Error("FFmpeg H.264/AAC conversion failed."), {
            details: stderr,
          })
        );
      }

      if (!isValidPreparedFile(outputPath)) {
        return reject(new Error("Converted MP4 file is invalid or empty."));
      }

      resolve(outputPath);
    });
  });
};

const cleanupOldFiles = () => {
  const maxAgeMs = 60 * 60 * 1000;
  const now = Date.now();

  try {
    const files = fs.readdirSync(outputDir);

    for (const file of files) {
      const filePath = path.join(outputDir, file);
      const stat = fs.statSync(filePath);

      if (!stat.isFile()) continue;

      if (now - stat.mtimeMs > maxAgeMs) {
        safeDeleteFile(filePath);
      }
    }
  } catch {}
};

setInterval(cleanupOldFiles, 30 * 60 * 1000);

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
        try {
          const fallbackData = await tryFallbackLayers(url, "YTDLP_FAILED");

          isResponded = true;
          return res.status(200).json(fallbackData);
        } catch (fallbackError) {
          isResponded = true;

          const friendlyError = normalizeErrorMessage(stderr);

          return res.status(friendlyError.statusCode).json({
            status: "fail",
            code: friendlyError.code,
            error: friendlyError.error,
            details: stderr || "Unknown yt-dlp error",
            fallbackError: fallbackError.message,
            fallbackDetails: fallbackError.details || [],
          });
        }
      }

      if (!data) {
        try {
          const fallbackData = await tryFallbackLayers(url, "INVALID_YTDLP_RESPONSE");

          isResponded = true;
          return res.status(200).json(fallbackData);
        } catch (fallbackError) {
          isResponded = true;

          return res.status(500).json({
            status: "fail",
            code: "INVALID_YTDLP_RESPONSE",
            error: "Invalid yt-dlp response. Please try another video link.",
            fallbackError: fallbackError.message,
            fallbackDetails: fallbackError.details || [],
          });
        }
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
        .sort((a, b) => Number(b.sizeBytes || 0) - Number(a.sizeBytes || 0))
        .slice(0, 8);

      const bestAudio =
        audioFormats.find((item) => item.ext === "m4a") ||
        audioFormats[0] ||
        null;

      /**
       * IMPORTANT FIX:
       * Facebook often gives "sd" / "hd" MP4 formats with vcodec/acodec = unknown.
       * Those can be combined video+audio and worked in your older version.
       * So we keep them as progressive combined preview candidates.
       */
      const progressiveVideoFormats = allFormats
        .filter((item) => {
          const ext = String(item.ext || "").toLowerCase();
          const formatId = String(item.format_id || "").toLowerCase();
          const formatNote = String(item.format_note || "").toLowerCase();

          const hasKnownVideo =
            item.vcodec && item.vcodec !== "none" && item.vcodec !== "unknown";

          const hasKnownAudio =
            item.acodec && item.acodec !== "none" && item.acodec !== "unknown";

          const isLikelyFacebookCombined =
            item.url &&
            ext === "mp4" &&
            (formatId === "sd" ||
              formatId === "hd" ||
              formatNote === "sd" ||
              formatNote === "hd") &&
            (!item.vcodec || item.vcodec === "unknown") &&
            (!item.acodec || item.acodec === "unknown");

          return (
            item.url &&
            ["mp4", "webm"].includes(ext) &&
            ((hasKnownVideo && hasKnownAudio) || isLikelyFacebookCombined)
          );
        })
        .map((item) => {
          const normalized = getNormalizedDimensions(item);
          const ext = item.ext || "mp4";
          const formatId = String(item.format_id || "").toLowerCase();
          const formatNote = String(item.format_note || "").toLowerCase();

          const hasKnownAudio =
            item.acodec && item.acodec !== "none" && item.acodec !== "unknown";

          const isLikelyCombinedUnknown =
            String(ext).toLowerCase() === "mp4" &&
            (formatId === "sd" ||
              formatId === "hd" ||
              formatNote === "sd" ||
              formatNote === "hd") &&
            (!item.vcodec || item.vcodec === "unknown") &&
            (!item.acodec || item.acodec === "unknown");

          const normalizedItem = {
            ...item,
            width: normalized.width,
            height: normalized.height,
            hasAudio: Boolean(hasKnownAudio || isLikelyCombinedUnknown),
          };

          const sizeInfo = getFormatSizeInfo(normalizedItem, data.duration, "video");

          return {
            type: "video",
            url: item.url,
            quality: getQualityLabel(normalizedItem),
            qualityRank: getFormatHeight(normalizedItem),
            ext,
            size: sizeInfo.size,
            sizeBytes: sizeInfo.sizeBytes,
            sizeEstimated: sizeInfo.sizeEstimated,
            formatId: item.format_id || "",
            width: normalized.width || null,
            height: normalized.height || null,
            fps: item.fps || null,
            vcodec: item.vcodec || "",
            acodec: item.acodec || "",
            hasAudio: Boolean(hasKnownAudio || isLikelyCombinedUnknown),
            audioUrl: "",
            audioFormatId: "",
            aspectRatio: getAspectRatio(
              normalized.width,
              normalized.height,
              item.aspect_ratio,
              normalized.rotation
            ),
            layoutAspectRatio: getAspectRatio(
              normalized.width,
              normalized.height,
              item.aspect_ratio,
              normalized.rotation
            ),
            previewAspectRatio: getAspectRatio(
              normalized.width,
              normalized.height,
              item.aspect_ratio,
              normalized.rotation
            ),
            rotation: normalized.rotation,
          };
        });

      const dashVideoFormats = allFormats
        .filter((item) => {
          return (
            item.url &&
            item.vcodec &&
            item.vcodec !== "none" &&
            item.vcodec !== "unknown" &&
            ["mp4", "webm"].includes(item.ext) &&
            (!item.acodec ||
              item.acodec === "none" ||
              item.acodec === "unknown")
          );
        })
        .map((item) => {
          const normalized = getNormalizedDimensions(item);
          const normalizedItem = {
            ...item,
            width: normalized.width,
            height: normalized.height,
            hasAudio: Boolean(bestAudio),
          };
          const sizeInfo = getFormatSizeInfo(normalizedItem, data.duration, "video");

          return {
            type: "video",
            url: item.url,
            quality: getQualityLabel(normalizedItem),
            qualityRank: getFormatHeight(normalizedItem),
            ext: item.ext || "mp4",
            size: sizeInfo.size,
            sizeBytes: sizeInfo.sizeBytes,
            sizeEstimated: sizeInfo.sizeEstimated,
            formatId: item.format_id || "",
            width: normalized.width || null,
            height: normalized.height || null,
            fps: item.fps || null,
            vcodec: item.vcodec || "",
            acodec: item.acodec || "none",
            hasAudio: false,
            audioUrl: bestAudio?.url || "",
            audioFormatId: bestAudio?.formatId || "",
            aspectRatio: getAspectRatio(
              normalized.width,
              normalized.height,
              item.aspect_ratio,
              normalized.rotation
            ),
            layoutAspectRatio: getAspectRatio(
              normalized.width,
              normalized.height,
              item.aspect_ratio,
              normalized.rotation
            ),
            previewAspectRatio: getAspectRatio(
              normalized.width,
              normalized.height,
              item.aspect_ratio,
              normalized.rotation
            ),
            rotation: normalized.rotation,
          };
        });

      const combinedVideoFormats = [...progressiveVideoFormats, ...dashVideoFormats];
      const uniqueVideoFormatMap = new Map();

      for (const item of combinedVideoFormats) {
        const rank = getQualityRank(item);
        const key = `${rank}-${item.ext}-${item.aspectRatio}`;
        const current = uniqueVideoFormatMap.get(key);

        if (!current) {
          uniqueVideoFormatMap.set(key, item);
          continue;
        }

        const currentScore =
          (current.hasAudio ? 100000 : 0) +
          (current.ext === "mp4" ? 10000 : 0) +
          Number(current.sizeBytes || 0) / 100000000;

        const itemScore =
          (item.hasAudio ? 100000 : 0) +
          (item.ext === "mp4" ? 10000 : 0) +
          Number(item.sizeBytes || 0) / 100000000;

        if (itemScore > currentScore) {
          uniqueVideoFormatMap.set(key, item);
        }
      }

      const videoFormats = [...uniqueVideoFormatMap.values()]
        .sort((a, b) => {
          const byQuality = getQualityRank(b) - getQualityRank(a);
          if (byQuality !== 0) return byQuality;

          if (a.ext === "mp4" && b.ext !== "mp4") return -1;
          if (a.ext !== "mp4" && b.ext === "mp4") return 1;

          if (a.hasAudio && !b.hasAudio) return -1;
          if (!a.hasAudio && b.hasAudio) return 1;

          return Number(b.sizeBytes || 0) - Number(a.sizeBytes || 0);
        })
        .slice(0, 10);

      const sourceNormalized = getNormalizedDimensions(data);
      const thumbnailAspectRatio = getThumbnailAspectRatio(data);
      const sourceAspectRatio = getAspectRatio(
        sourceNormalized.width,
        sourceNormalized.height,
        data.aspect_ratio,
        sourceNormalized.rotation
      );

      const bestPreview =
        videoFormats.find((item) => item.hasAudio && item.ext === "mp4") ||
        videoFormats.find((item) => item.ext === "mp4") ||
        videoFormats.find((item) => item.hasAudio) ||
        videoFormats[0] ||
        null;

      const finalAspectRatio =
        thumbnailAspectRatio ||
        (sourceAspectRatio && sourceAspectRatio !== "landscape"
          ? sourceAspectRatio
          : bestPreview?.aspectRatio || "landscape");

      const finalVideoFormats = videoFormats.map((item) => ({
        ...item,
        aspectRatio: finalAspectRatio,
        layoutAspectRatio: finalAspectRatio,
        previewAspectRatio: finalAspectRatio,
      }));

      const originalPageUrl = data.webpage_url || url;

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
        aspectRatio: finalAspectRatio,
        layoutAspectRatio: finalAspectRatio,
        previewAspectRatio: finalAspectRatio,

        previewUrl: bestPreview?.url || "",
        previewMode: PREVIEW_MODE,
        previewHasAudio: Boolean(bestPreview?.hasAudio),
        previewAudioUrl:
          bestPreview && !bestPreview.hasAudio ? bestPreview.audioUrl : "",

        rawPreviewUrl: bestPreview?.url || "",
        rawPreviewHasAudio: Boolean(bestPreview?.hasAudio),
        rawPreviewAudioUrl:
          bestPreview && !bestPreview.hasAudio ? bestPreview.audioUrl : "",

        video: finalVideoFormats,
        audio: audioFormats,
        urls: [...finalVideoFormats, ...audioFormats],
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

exports.fallbackMedia = async (req, res) => {
  try {
    const url = req.body.urls || req.body.url;

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

    const data = await tryFallbackLayers(url, "DIRECT_FALLBACK_TEST");

    return res.status(200).json(data);
  } catch (err) {
    console.log("Fallback media error:", err.message);

    return res.status(500).json({
      status: "fail",
      code: "FALLBACK_MEDIA_FAILED",
      error: "Fallback extraction failed.",
      details: err.message,
      fallbackDetails: err.details || [],
    });
  }
};

exports.previewMedia = async (req, res) => {
  return res.status(422).json({
    status: "fail",
    code: "PREVIEW_NOT_AVAILABLE",
    error:
      "Server preview is disabled on this server. The app uses raw preview instead.",
  });
};

exports.downloadDirectMedia = async (req, res) => {
  let childProcess = null;
  let hasFinished = false;
  let clientCancelled = false;
  let outputPathToClean = "";
  const filesToClean = [];

  const cleanupProcess = () => {
    clientCancelled = true;

    if (childProcess && !childProcess.killed) {
      try {
        childProcess.kill("SIGKILL");
      } catch {}
    }

    safeDeleteFiles(filesToClean);

    if (outputPathToClean) {
      safeDeleteFile(outputPathToClean);
    }
  };

  req.on("aborted", cleanupProcess);

  res.on("close", () => {
    if (!hasFinished) cleanupProcess();
  });

  try {
    req.setTimeout?.(0);
    res.setTimeout?.(0);

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

    if (originalUrlValue) {
      const sourcePrefix = `${safeTitle}-${timestamp}-source`;
      const outputTemplate = path.join(outputDir, `${sourcePrefix}.%(ext)s`);

      const args = [
        "--no-playlist",
        "--newline",
        "--force-overwrites",
        "--no-warnings",
        "--socket-timeout",
        "30",
        "-N",
        "8",
        "--ffmpeg-location",
        FFMPEG_PATH,
      ];

      if (type === "audio") {
        args.push(
          "-f",
          audioFormatId || "bestaudio/best",
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
        const formatSpec = chooseStrictAudioVideoFormatSpec({
          videoFormatId,
          audioFormatId,
          hasAudio,
        });

        args.push(
          "-f",
          formatSpec,
          "--merge-output-format",
          "mp4",
          "-o",
          outputTemplate,
          originalUrlValue
        );
      }

      childProcess = spawn(YTDLP_PATH, args, {
        timeout: 900000,
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

      childProcess.on("close", async (code, signal) => {
        if (isResponded) return;

        let sourcePath = "";

        try {
          if (
            clientCancelled ||
            signal === "SIGKILL" ||
            isClientDisconnected(res)
          ) {
            hasFinished = true;
            safeDeleteFiles(filesToClean);
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
            .filter((file) => file.startsWith(sourcePrefix));

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

          sourcePath = path.join(outputDir, selectedFile);
          filesToClean.push(sourcePath);

          if (!isValidPreparedFile(sourcePath)) {
            safeDeleteFile(sourcePath);

            isResponded = true;
            hasFinished = true;

            return sendJsonIfConnected(res, 500, {
              status: "fail",
              code: "DOWNLOADED_FILE_INVALID",
              error: "Downloaded file is invalid or empty.",
            });
          }

          let finalPath = sourcePath;

          if (type === "video") {
            const sourceExt = path.extname(sourcePath).toLowerCase();
            const sourceHasVideoAndAudio = await validateVideoHasAudio(sourcePath);

            if (sourceExt === ".mp4" && sourceHasVideoAndAudio) {
              outputPathToClean = sourcePath;
              finalPath = sourcePath;
            } else {
              await transcodeToBrowserMp4(sourcePath, outputPath);
              safeDeleteFile(sourcePath);
              outputPathToClean = outputPath;
              finalPath = outputPath;
            }
          } else {
            outputPathToClean = sourcePath;
          }

          const finalName = `${safeTitle}.${type === "audio" ? "mp3" : "mp4"}`;

          if (type === "video") {
            const hasVideoAndAudio = await validateVideoHasAudio(finalPath);

            if (!hasVideoAndAudio) {
              safeDeleteFile(finalPath);

              isResponded = true;
              hasFinished = true;

              return sendJsonIfConnected(res, 422, {
                status: "fail",
                code: "NO_AUDIO_IN_OUTPUT",
                error:
                  "This video was processed but no audio track was found. Please try another quality or another public link.",
              });
            }
          }

          isResponded = true;
          hasFinished = true;

          return sendPreparedFile(res, finalPath, finalName);
        } catch (err) {
          isResponded = true;
          hasFinished = true;

          console.log("Final media processing failed:", err.message);
          console.log("Final media processing details:", err.details || "");

          safeDeleteFile(sourcePath);
          safeDeleteFile(outputPath);

          return sendJsonIfConnected(res, 500, {
            status: "fail",
            code: "FINAL_MEDIA_PROCESSING_FAILED",
            error:
              "Video was downloaded but could not be converted to a browser-compatible MP4 with audio.",
            details: err.details || err.message,
          });
        }
      });

      return;
    }

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

    if (type === "video" && !audioUrl && !hasAudio) {
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
    } else if (hasAudio && !audioUrl) {
      args.push(
        "-y",
        "-i",
        videoUrl,
        "-map",
        "0:v:0",
        "-map",
        "0:a:0",
        "-c:v",
        "libx264",
        "-preset",
        "ultrafast",
        "-crf",
        "26",
        "-pix_fmt",
        "yuv420p",
        "-profile:v",
        "main",
        "-c:a",
        "aac",
        "-b:a",
        "160k",
        "-movflags",
        "+faststart",
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
        "libx264",
        "-preset",
        "ultrafast",
        "-crf",
        "26",
        "-pix_fmt",
        "yuv420p",
        "-profile:v",
        "main",
        "-c:a",
        "aac",
        "-b:a",
        "160k",
        "-movflags",
        "+faststart",
        "-shortest",
        outputPath
      );
    }

    childProcess = spawn(FFMPEG_PATH, args, {
      timeout: 900000,
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

    childProcess.on("close", async (code, signal) => {
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

      if (type === "video") {
        const hasVideoAndAudio = await validateVideoHasAudio(outputPath);

        if (!hasVideoAndAudio) {
          safeDeleteFile(outputPath);

          isResponded = true;
          hasFinished = true;

          return sendJsonIfConnected(res, 422, {
            status: "fail",
            code: "NO_AUDIO_IN_OUTPUT",
            error:
              "This video was processed but no audio track was found. Please try another quality or another public link.",
          });
        }
      }

      isResponded = true;
      hasFinished = true;

      return sendPreparedFile(res, outputPath, `${safeTitle}.${extension}`);
    });
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