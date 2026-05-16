const express = require("express");
const cors = require("cors");
const requestIp = require("request-ip");
const mongoose = require("mongoose");
const UAParser = require("ua-parser-js");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const app = express();

const PORT_NO = process.env.PORT || 3030;
const MONGO_CONNECT = process.env.MONGO_URI;

const User = require("./models/user");
const publicRoutes = require("./routes/public");

if (!MONGO_CONNECT) {
  console.error("MONGO_URI is missing in environment variables.");
  process.exit(1);
}

/**
 * Required when deploying behind Render/Railway/Nginx/Cloudflare/etc.
 * Helps request-ip and Express read the correct client IP.
 */
app.set("trust proxy", true);

/**
 * Basic production security headers.
 */
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

/**
 * CORS setup.
 * In production, only allow your frontend URL.
 * In development, allow localhost too.
 */
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:3000",
  "http://localhost:5173",
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow server-to-server tools, Postman, curl, and same-origin requests
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Range"],
    credentials: true,
  })
);

/**
 * Body parser with limit to prevent very large JSON payloads.
 */
app.use(express.json({ limit: "1mb" }));

/**
 * General API rate limit.
 * Heavy media routes have stricter limits inside routes/public.js.
 */
app.use(
  rateLimit({
    windowMs: 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      status: "fail",
      error: "Too many requests. Please try again later.",
    },
  })
);

app.use(requestIp.mw());

/**
 * Create or attach visitor record.
 */
app.use(async (req, res, next) => {
  try {
    const clientIp =
      req.clientIp ||
      req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
      req.socket.remoteAddress ||
      "unknown";

    let user = await User.findOne({ ip: clientIp });

    if (!user) {
      const useragent = req.headers["user-agent"] || "";
      const parser = new UAParser(useragent);
      const parserResults = parser.getResult();

      user = await User.create({
        ip: clientIp,
        deviceInfo: parserResults,
        activity: [],
      });
    }

    req.users = user;
    next();
  } catch (err) {
    console.log("User middleware error:", err.message);

    /**
     * Do not block main API if user tracking fails.
     */
    next();
  }
});

app.use(publicRoutes);

/**
 * 404 handler.
 */
app.use((req, res) => {
  res.status(404).json({
    status: "fail",
    error: "Route not found",
  });
});

/**
 * Global error handler.
 */
app.use((err, req, res, next) => {
  console.log("Global error:", err.message);

  if (res.headersSent) {
    return next(err);
  }

  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({
      status: "fail",
      error: "CORS blocked this request.",
    });
  }

  res.status(500).json({
    status: "fail",
    error: "Internal server error",
  });
});

mongoose
  .connect(MONGO_CONNECT)
  .then(() => {
    app.listen(PORT_NO, () => {
      console.log(`Server running on port ${PORT_NO}`);
    });
  })
  .catch((err) => {
    console.log("MongoDB connection error:", err.message);
    process.exit(1);
  });

process.on("SIGTERM", async () => {
  console.log("SIGTERM received. Closing MongoDB connection...");
  await mongoose.connection.close();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("SIGINT received. Closing MongoDB connection...");
  await mongoose.connection.close();
  process.exit(0);
});