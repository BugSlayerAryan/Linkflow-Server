const express = require("express");
const cors = require("cors");
const requestIp = require("request-ip");
const mongoose = require("mongoose");
const UAParser = require("ua-parser-js");
require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 3030;
const MONGO_CONNECT =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/smvd1";

const User = require("./models/user");
const publicRoutes = require("./routes/public");

/**
 * Important for Render / proxy hosting.
 * This helps request-ip and Express understand the real client IP
 * behind Render's proxy.
 */
app.set("trust proxy", true);

/**
 * Body limits.
 * Your requests are small, but 10mb is safe for metadata/download payloads.
 */
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

/**
 * CORS
 *
 * For first deployment, this works with all origins.
 * Later, you can restrict it to your Vercel domain.
 */
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      /**
       * Allow requests with no origin:
       * - direct browser URL open
       * - curl/Postman
       * - video tag preview requests
       */
      if (!origin) {
        return callback(null, true);
      }

      /**
       * During development/deploy testing, allow all if FRONTEND_URL is not set.
       */
      if (!process.env.FRONTEND_URL) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  })
);

app.use(requestIp.mw());

/**
 * Health route for Render.
 */
app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Welcome To Vidown Api",
  });
});

/**
 * Optional robots.txt for backend API.
 * Prevent search engines from crawling API routes.
 */
app.get("/robots.txt", (req, res) => {
  res.type("text/plain");
  res.send(`User-agent: *
Disallow: /
`);
});

/**
 * User tracking middleware.
 * If MongoDB has any issue, API should still work.
 */
app.use(async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return next();
    }

    const ip = req.clientIp || req.ip || "unknown";
    let user = await User.findOne({ ip });

    if (!user) {
      const useragent = req.headers["user-agent"] || "";
      const parser = new UAParser(useragent);
      const parserResults = parser.getResult();

      user = await User.create({
        ip,
        deviceInfo: parserResults,
        activity: [],
      });
    }

    req.users = user;
    next();
  } catch (err) {
    console.log("User middleware error:", err.message);
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

  res.status(500).json({
    status: "fail",
    error:
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message,
  });
});

/**
 * Start server.
 * Render requires listening on process.env.PORT.
 */
const startServer = async () => {
  try {
    if (MONGO_CONNECT) {
      await mongoose.connect(MONGO_CONNECT);
      console.log("MongoDB connected");
    }

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server Running On ${PORT}`);
    });
  } catch (err) {
    console.log("MongoDB connection error:", err.message);

    /**
     * Start server even if Mongo fails.
     * This prevents Render from marking the app as crashed only because DB is unavailable.
     */
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server Running On ${PORT} without MongoDB`);
    });
  }
};

startServer();