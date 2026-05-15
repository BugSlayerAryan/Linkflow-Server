const axios = require("axios");

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || "";

const DEFAULT_TIMEOUT = Number(process.env.RAPIDAPI_TIMEOUT || 45000);
const DEFAULT_PROGRESS_TIMEOUT = Number(
  process.env.RAPIDAPI_PROGRESS_TIMEOUT || 65000
);
const DEFAULT_PROGRESS_INTERVAL = Number(
  process.env.RAPIDAPI_PROGRESS_INTERVAL || 1800
);

const PROVIDERS = {
  youtubeSecond: {
    layer: 2,
    key: "YOUTUBE_SECOND",
    host: process.env.RAPIDAPI_YOUTUBE_SECOND_HOST,
    url: process.env.RAPIDAPI_YOUTUBE_SECOND_URL,
    method: process.env.RAPIDAPI_YOUTUBE_SECOND_METHOD || "GET",
    urlParam: process.env.RAPIDAPI_YOUTUBE_SECOND_URL_PARAM || "videoId",
  },

  youtubeThird: {
    layer: 3,
    key: "YOUTUBE_THIRD",
    host: process.env.RAPIDAPI_YOUTUBE_THIRD_HOST,
    url: process.env.RAPIDAPI_YOUTUBE_THIRD_URL,
    method: process.env.RAPIDAPI_YOUTUBE_THIRD_METHOD || "GET",
    urlParam: process.env.RAPIDAPI_YOUTUBE_THIRD_URL_PARAM || "url",
  },

  instagramSecond: {
    layer: 2,
    key: "INSTAGRAM_SECOND",
    host: process.env.RAPIDAPI_INSTAGRAM_SECOND_HOST,
    url: process.env.RAPIDAPI_INSTAGRAM_SECOND_URL,
    method: process.env.RAPIDAPI_INSTAGRAM_SECOND_METHOD || "GET",
    urlParam: process.env.RAPIDAPI_INSTAGRAM_SECOND_URL_PARAM || "url",
  },

  instagramThird: {
    layer: 3,
    key: "INSTAGRAM_THIRD",
    host: process.env.RAPIDAPI_INSTAGRAM_THIRD_HOST,
    url: process.env.RAPIDAPI_INSTAGRAM_THIRD_URL,
    method: process.env.RAPIDAPI_INSTAGRAM_THIRD_METHOD || "GET",
    urlParam: process.env.RAPIDAPI_INSTAGRAM_THIRD_URL_PARAM || "url",
  },

  allSocialLast: {
    layer: 4,
    key: "ALL_SOCIAL_LAST",
    host: process.env.RAPIDAPI_ALL_SOCIAL_HOST,
    url: process.env.RAPIDAPI_ALL_SOCIAL_URL,
    method: process.env.RAPIDAPI_ALL_SOCIAL_METHOD || "GET",
    urlParam: process.env.RAPIDAPI_ALL_SOCIAL_URL_PARAM || "url",
  },
};

function detectPlatform(urlValue = "") {
  try {
    const hostname = new URL(String(urlValue))
      .hostname.replace(/^www\./, "")
      .toLowerCase();

    if (hostname.includes("youtube.com") || hostname.includes("youtu.be")) {
      return "youtube";
    }

    if (hostname.includes("instagram.com")) return "instagram";

    if (hostname.includes("facebook.com") || hostname.includes("fb.watch")) {
      return "facebook";
    }

    if (hostname.includes("reddit.com")) return "reddit";
    if (hostname.includes("tiktok.com")) return "tiktok";

    if (hostname.includes("x.com") || hostname.includes("twitter.com")) {
      return "x";
    }

    return "generic";
  } catch {
    return "generic";
  }
}

function getYouTubeVideoId(urlValue = "") {
  try {
    const url = new URL(String(urlValue));
    const host = url.hostname.replace(/^www\./, "").toLowerCase();

    if (host === "youtu.be") {
      return url.pathname.split("/").filter(Boolean)[0] || "";
    }

    if (host.includes("youtube.com")) {
      const videoId = url.searchParams.get("v");
      if (videoId) return videoId;

      const parts = url.pathname.split("/").filter(Boolean);

      if (parts[0] === "shorts" && parts[1]) return parts[1];
      if (parts[0] === "embed" && parts[1]) return parts[1];
      if (parts[0] === "live" && parts[1]) return parts[1];
    }

    return "";
  } catch {
    return "";
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function formatDuration(seconds) {
  if (
    seconds === null ||
    seconds === undefined ||
    Number.isNaN(Number(seconds))
  ) {
    return "--";
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
}

function formatSize(bytes, estimated = true) {
  const size = Number(bytes || 0);

  if (!size || Number.isNaN(size) || size <= 0) {
    return estimated ? "Approx. 1 MB" : "1 MB";
  }

  const mb = size / 1024 / 1024;
  const gb = mb / 1024;

  let label;

  if (gb >= 1) label = `${gb.toFixed(1)} GB`;
  else if (mb >= 100) label = `${Math.round(mb)} MB`;
  else if (mb >= 1) label = `${mb.toFixed(1)} MB`;
  else label = `${Math.max(1, Math.round(size / 1024))} KB`;

  return estimated ? `Approx. ${label}` : label;
}

function parseResolution(value = "") {
  const match = String(value || "").match(/(\d{2,5})\s*[x×]\s*(\d{2,5})/i);

  if (!match) {
    return {
      width: null,
      height: null,
    };
  }

  return {
    width: Number(match[1]),
    height: Number(match[2]),
  };
}

function getAspectRatio(width, height, fallback = "landscape") {
  const safeWidth = Number(width || 0);
  const safeHeight = Number(height || 0);

  if (!safeWidth || !safeHeight) return fallback || "landscape";

  const ratio = safeWidth / safeHeight;

  if (ratio < 0.8) return "portrait";
  if (ratio > 1.2) return "landscape";

  return "square";
}

function getQualityRank(item = {}) {
  const metadata = item.metadata || {};
  const parsedResolution = parseResolution(
    item.resolution || item.quality || item.label || metadata.quality_label || ""
  );

  const height = Number(
    item.height ||
      metadata.height ||
      item.qualityHeight ||
      parsedResolution.height ||
      0
  );

  if (height > 0) return height;

  const text = String(
    item.quality_label ||
      metadata.quality_label ||
      item.label ||
      item.quality ||
      item.resolution ||
      metadata.quality ||
      ""
  ).toLowerCase();

  if (text.includes("4320") || text.includes("8k")) return 4320;
  if (text.includes("2160") || text.includes("4k")) return 2160;
  if (text.includes("1440") || text.includes("2k")) return 1440;
  if (text.includes("1080")) return 1080;
  if (text.includes("720") || text === "hd") return 720;
  if (text.includes("480") || text === "sd") return 480;
  if (text.includes("360")) return 360;
  if (text.includes("240")) return 240;
  if (text.includes("144")) return 144;

  return 0;
}

function getQualityLabel(item = {}) {
  const metadata = item.metadata || {};
  const rank = getQualityRank(item);

  if (rank >= 4320) return "4320p (8K)";
  if (rank >= 2160) return "2160p (4K)";
  if (rank >= 1440) return "1440p (2K)";
  if (rank >= 1080) return "1080p (Full HD)";
  if (rank >= 720) return "720p (HD)";
  if (rank >= 480) return "480p (SD)";
  if (rank >= 360) return "360p";
  if (rank >= 240) return "240p";
  if (rank >= 144) return "144p";

  return (
    item.label ||
    item.quality ||
    item.resolution ||
    metadata.quality_label ||
    "Default"
  );
}

function getExtension(item = {}) {
  const metadata = item.metadata || {};
  const mime = String(
    item.mimeType || item.mime_type || metadata.mime_type || ""
  ).toLowerCase();

  const explicit = String(item.extension || item.ext || "")
    .replace(".", "")
    .toLowerCase();

  if (explicit) return explicit;
  if (mime.includes("webm")) return "webm";
  if (mime.includes("mp4")) return "mp4";
  if (mime.includes("mpeg") || mime.includes("mp3")) return "mp3";
  if (mime.includes("m4a")) return "m4a";

  return "mp4";
}

function findBestAudio(audioFormats = []) {
  return (
    audioFormats.find((item) => item.ext === "m4a") ||
    audioFormats.find((item) => item.ext === "mp3") ||
    audioFormats[0] ||
    null
  );
}

function sortVideoFormats(items = []) {
  return [...items].sort((a, b) => {
    const byQuality = Number(b.qualityRank || 0) - Number(a.qualityRank || 0);
    if (byQuality !== 0) return byQuality;

    if (a.ext === "mp4" && b.ext !== "mp4") return -1;
    if (a.ext !== "mp4" && b.ext === "mp4") return 1;

    if (a.hasAudio && !b.hasAudio) return -1;
    if (!a.hasAudio && b.hasAudio) return 1;

    return Number(b.sizeBytes || 0) - Number(a.sizeBytes || 0);
  });
}

function sortAudioFormats(items = []) {
  return [...items].sort(
    (a, b) => Number(b.sizeBytes || 0) - Number(a.sizeBytes || 0)
  );
}

function normalizeMediaItem(item = {}, context = {}) {
  const metadata = item.metadata || {};

  const url =
    item.url ||
    item.link ||
    item.download_url ||
    item.downloadUrl ||
    item.src ||
    item.href ||
    "";

  if (!url || typeof url !== "string") return null;

  const parsedResolution = parseResolution(
    item.resolution || item.quality || item.label || ""
  );

  const width =
    item.width || metadata.width || parsedResolution.width || null;

  const height =
    item.height || metadata.height || parsedResolution.height || null;

  const ext = getExtension(item);
  const qualityRank = getQualityRank({ ...item, width, height });

  const sizeBytes = Number(
    item.size ||
      item.filesize ||
      item.contentLength ||
      item.content_length ||
      metadata.content_length ||
      0
  );

  const typeText = String(item.type || item.mediaType || item.kind || "")
    .toLowerCase();

  const mime = String(
    item.mimeType || item.mime_type || metadata.mime_type || ""
  ).toLowerCase();

  const isAudio =
    typeText === "audio" ||
    mime.startsWith("audio/") ||
    ["mp3", "m4a", "aac", "opus"].includes(ext) ||
    (metadata.has_audio === true && metadata.has_video === false) ||
    (item.is_audio === true && metadata.has_video === false);

  if (isAudio) {
    return {
      type: "audio",
      url,
      quality:
        item.quality ||
        item.label ||
        item.bitrate ||
        item.abr ||
        metadata.bitrate ||
        "Audio",
      ext: ext || "m4a",
      size:
        item.content_length_text ||
        metadata.content_length_text ||
        formatSize(sizeBytes, true),
      sizeBytes,
      sizeEstimated: !sizeBytes,
      formatId: String(
        item.id || item.formatId || item.itag || metadata.itag || ""
      ),
      width: null,
      height: null,
      fps: null,
      vcodec: "",
      acodec: item.codec || item.acodec || "audio",
      hasAudio: true,
      audioUrl: "",
      audioFormatId: String(
        item.id || item.formatId || item.itag || metadata.itag || ""
      ),
      aspectRatio: "audio",
      layoutAspectRatio: "audio",
      previewAspectRatio: "audio",
      qualityRank: 0,
      sourceLayer: context.layer,
      sourceProvider: context.provider,
    };
  }

  const hasAudio =
    item.hasAudio === true ||
    item.has_audio === true ||
    metadata.has_audio === true ||
    item.is_audio === true;

  const aspectRatio = getAspectRatio(
    width,
    height,
    context.aspectRatio || "landscape"
  );

  return {
    type: "video",
    url,
    quality: getQualityLabel({ ...item, width, height }),
    qualityRank,
    ext: ext || "mp4",
    size:
      item.content_length_text ||
      metadata.content_length_text ||
      formatSize(sizeBytes, true),
    sizeBytes,
    sizeEstimated: !sizeBytes,
    formatId: String(
      item.id || item.formatId || item.itag || metadata.itag || ""
    ),
    width: width || null,
    height: height || null,
    fps: item.fps || metadata.fps || null,
    vcodec: item.vcodec || item.codec || "video",
    acodec: item.acodec || "",
    hasAudio,
    audioUrl: "",
    audioFormatId: "",
    aspectRatio,
    layoutAspectRatio: aspectRatio,
    previewAspectRatio: aspectRatio,
    sourceLayer: context.layer,
    sourceProvider: context.provider,
  };
}

function collectArrays(...values) {
  const output = [];

  for (const value of values) {
    if (Array.isArray(value)) output.push(...value);
  }

  return output;
}

function getLargestImageUrl(images = []) {
  if (!Array.isArray(images)) return "";

  const sorted = [...images]
    .filter((item) => item?.url)
    .sort((a, b) => {
      const areaA = Number(a.width || 0) * Number(a.height || 0);
      const areaB = Number(b.width || 0) * Number(b.height || 0);
      return areaB - areaA;
    });

  return sorted[0]?.url || "";
}

function normalizeFallbackResponse(raw = {}, originalUrl = "", context = {}) {
  const content = Array.isArray(raw.contents) ? raw.contents[0] || {} : {};
  const root = raw.data || raw.result || content || raw.content || raw;
  const info = root.info || raw.info || content.info || {};

  const title =
    root.title ||
    info.title ||
    root.name ||
    root.caption ||
    root.description ||
    root.content ||
    "Video";

  const thumb =
    root.thumbnail ||
    root.thumb ||
    root.cover ||
    root.image ||
    info.image ||
    root.poster ||
    getLargestImageUrl(root.images?.[0] || root.images || []) ||
    "";

  const duration =
    root.duration ||
    root.duration_seconds ||
    root.lengthSeconds ||
    root.length ||
    content.duration ||
    null;

  const platform = context.platform || root.source || detectPlatform(originalUrl);

  const rawItems = collectArrays(
    root.medias,
    root.media,
    root.formats,
    root.links,
    root.downloads,
    root.videos,
    root.video,
    root.items,
    content.videos,
    content.audios,
    content.formats,
    content.medias,
    content.media,
    content.downloads
  );

  const audioFormats = [];
  const videoFormats = [];

  for (const item of rawItems) {
    const normalized = normalizeMediaItem(item, {
      ...context,
      platform,
      aspectRatio: root.aspectRatio || root.aspect_ratio,
    });

    if (!normalized) continue;

    if (normalized.type === "audio") audioFormats.push(normalized);
    else videoFormats.push(normalized);
  }

  const sortedAudio = sortAudioFormats(audioFormats).slice(0, 8);
  const bestAudio = findBestAudio(sortedAudio);

  const sortedVideo = sortVideoFormats(
    videoFormats.map((item) => {
      if (!item.hasAudio && bestAudio) {
        return {
          ...item,
          audioUrl: bestAudio.url,
          audioFormatId: bestAudio.formatId,
        };
      }

      return item;
    })
  ).slice(0, 10);

  const bestPreview =
    sortedVideo.find((item) => item.hasAudio && item.ext === "mp4") ||
    sortedVideo.find((item) => item.ext === "mp4") ||
    sortedVideo[0] ||
    null;

  const aspectRatio =
    root.aspectRatio ||
    root.aspect_ratio ||
    bestPreview?.aspectRatio ||
    getAspectRatio(root.width, root.height, "landscape");

  const finalVideo = sortedVideo.map((item) => ({
    ...item,
    aspectRatio,
    layoutAspectRatio: aspectRatio,
    previewAspectRatio: aspectRatio,
  }));

  return {
    status: "success",
    source: context.provider || "fallback",
    fallbackUsed: true,
    fallbackLayer: context.layer,
    fallbackProvider: context.provider,
    platform,
    title:
      String(title || "Video")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 90) || "Video",
    originalTitle: String(title || "Video"),
    uploader:
      root.uploader ||
      root.author ||
      root.username ||
      root.owner?.username ||
      root.owner?.full_name ||
      "",
    thumb,
    duration: duration || null,
    durationText: formatDuration(duration),
    viewCount: root.view_count || root.views || root.viewCount || null,
    webpage_url: root.webpage_url || root.url || originalUrl,
    aspectRatio,
    previewAspectRatio: aspectRatio,
    layoutAspectRatio: aspectRatio,

    previewUrl: bestPreview?.url || "",
    previewMode: `fallback-layer-${context.layer}`,
    previewHasAudio: Boolean(bestPreview?.hasAudio),
    previewAudioUrl:
      bestPreview && !bestPreview.hasAudio ? bestPreview.audioUrl || "" : "",

    rawPreviewUrl: bestPreview?.url || "",
    rawPreviewHasAudio: Boolean(bestPreview?.hasAudio),
    rawPreviewAudioUrl:
      bestPreview && !bestPreview.hasAudio ? bestPreview.audioUrl || "" : "",

    video: finalVideo,
    audio: sortedAudio,
    urls: [...finalVideo, ...sortedAudio],
  };
}

function assertProviderConfigured(provider) {
  if (!RAPIDAPI_KEY) {
    throw new Error("RAPIDAPI_KEY is missing.");
  }

  if (!provider?.host || !provider?.url) {
    throw new Error(`${provider?.key || "RapidAPI provider"} is not configured.`);
  }
}

function buildProviderParams(provider, originalUrl) {
  const urlParam = provider.urlParam || "url";
  const params = {};

  if (urlParam === "videoId") {
    const videoId = getYouTubeVideoId(originalUrl);

    if (!videoId) {
      throw new Error("Could not extract YouTube videoId from URL.");
    }

    params.videoId = videoId;
  } else {
    params[urlParam] = originalUrl;
  }

  if (provider.key === "YOUTUBE_SECOND") {
    params.urlAccess =
      process.env.RAPIDAPI_YOUTUBE_SECOND_URL_ACCESS || "normal";
    params.renderableFormats =
      process.env.RAPIDAPI_YOUTUBE_SECOND_RENDERABLE_FORMATS ||
      "720p,highres";
    params.getTranscript =
      process.env.RAPIDAPI_YOUTUBE_SECOND_GET_TRANSCRIPT || "false";
  }

  if (provider.key === "YOUTUBE_THIRD") {
    params.format = process.env.RAPIDAPI_YOUTUBE_THIRD_FORMAT || "mp4";
    params.add_info = process.env.RAPIDAPI_YOUTUBE_THIRD_ADD_INFO || "1";
    params.audio_quality =
      process.env.RAPIDAPI_YOUTUBE_THIRD_AUDIO_QUALITY || "128";
    params.allow_extended_duration =
      process.env.RAPIDAPI_YOUTUBE_THIRD_ALLOW_EXTENDED_DURATION || "false";
    params.no_merge = process.env.RAPIDAPI_YOUTUBE_THIRD_NO_MERGE || "false";
    params.audio_language =
      process.env.RAPIDAPI_YOUTUBE_THIRD_AUDIO_LANGUAGE || "en";
  }

  return params;
}

async function callRapidApiProvider(provider, originalUrl) {
  assertProviderConfigured(provider);

  const method = String(provider.method || "GET").toUpperCase();
  const payload = buildProviderParams(provider, originalUrl);

  const config = {
    method,
    url: provider.url,
    timeout: DEFAULT_TIMEOUT,
    headers: {
      "X-RapidAPI-Key": RAPIDAPI_KEY,
      "X-RapidAPI-Host": provider.host,
      "Content-Type": "application/json",
    },
  };

  if (method === "GET") {
    config.params = payload;
  } else {
    config.data = payload;
  }

  const response = await axios.request(config);
  let raw = response.data;

  const progressUrl =
    raw?.progress_url ||
    raw?.progressUrl ||
    raw?.info?.progress_url ||
    raw?.data?.progress_url;

  if (progressUrl && !hasPlayableMedia(raw)) {
    raw = await pollProgressUrl(progressUrl, provider);
  }

  return raw;
}

function hasPlayableMedia(raw = {}) {
  const content = Array.isArray(raw.contents) ? raw.contents[0] || {} : {};
  const root = raw.data || raw.result || content || raw.content || raw;

  const arrays = collectArrays(
    root.medias,
    root.media,
    root.formats,
    root.links,
    root.downloads,
    root.videos,
    root.video,
    root.items,
    content.videos,
    content.audios,
    content.formats,
    content.medias,
    content.media,
    content.downloads
  );

  return arrays.some(
    (item) =>
      item?.url ||
      item?.link ||
      item?.download_url ||
      item?.downloadUrl ||
      item?.src ||
      item?.href
  );
}

async function pollProgressUrl(progressUrl, provider) {
  const startedAt = Date.now();
  let lastPayload = null;

  while (Date.now() - startedAt < DEFAULT_PROGRESS_TIMEOUT) {
    const response = await axios.request({
      method: "GET",
      url: progressUrl,
      timeout: 20000,
      headers: {
        "X-RapidAPI-Key": RAPIDAPI_KEY,
        "X-RapidAPI-Host": provider.host,
      },
    });

    lastPayload = response.data;

    if (hasPlayableMedia(lastPayload)) return lastPayload;

    const status = String(
      lastPayload?.status || lastPayload?.state || lastPayload?.message || ""
    ).toLowerCase();

    if (status.includes("fail") || status.includes("error")) {
      throw new Error(lastPayload?.message || "RapidAPI progress failed.");
    }

    await sleep(DEFAULT_PROGRESS_INTERVAL);
  }

  throw new Error("RapidAPI progress timed out before media URLs were ready.");
}

function getProviderOrder(originalUrl) {
  const platform = detectPlatform(originalUrl);

  if (platform === "youtube") {
    return [
      PROVIDERS.youtubeSecond,
      PROVIDERS.youtubeThird,
      PROVIDERS.allSocialLast,
    ];
  }

  if (platform === "instagram") {
    return [
      PROVIDERS.instagramSecond,
      PROVIDERS.instagramThird,
      PROVIDERS.allSocialLast,
    ];
  }

  return [PROVIDERS.allSocialLast];
}

async function fetchMediaFromFallbackLayers(originalUrl, options = {}) {
  const platform = detectPlatform(originalUrl);
  const providerOrder = getProviderOrder(originalUrl);
  const errors = [];

  for (const provider of providerOrder) {
    try {
      const raw = await callRapidApiProvider(provider, originalUrl);

      const normalized = normalizeFallbackResponse(raw, originalUrl, {
        layer: provider.layer,
        provider: provider.key,
        platform,
        reason: options.reason || "EXTRACTION_FALLBACK",
      });

      if (
        normalized.video.length ||
        normalized.audio.length ||
        normalized.previewUrl
      ) {
        return {
          ...normalized,
          fallbackReason: options.reason || "EXTRACTION_FALLBACK",
        };
      }

      throw new Error(`${provider.key} returned no playable media URLs.`);
    } catch (error) {
      errors.push({
        provider: provider.key,
        layer: provider.layer,
        message: error.message,
      });

      console.log(
        `Fallback layer ${provider.layer} failed (${provider.key}):`,
        error.message
      );
    }
  }

  const err = new Error("All fallback layers failed.");
  err.details = errors;
  throw err;
}

module.exports = {
  detectPlatform,
  fetchMediaFromFallbackLayers,
  normalizeFallbackResponse,
  getYouTubeVideoId,
};