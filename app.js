const express = require("express");
const cors = require("cors");
const requestIp = require("request-ip");
const mongoose = require("mongoose");
const UAParser = require("ua-parser-js");
require("dotenv").config();

const app = express();

const PORT_NO = process.env.PORT || 3030;
const MONGO_CONNECT = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/smvd1";

const User = require("./models/user");
const publicRoutes = require("./routes/public");

app.use(express.json());
app.use(cors());
app.use(requestIp.mw());

app.use(async (req, res, next) => {
  try {
    let user = await User.findOne({ ip: req.clientIp });

    if (!user) {
      const useragent = req.headers["user-agent"];
      const parser = new UAParser(useragent);
      const parserResults = parser.getResult();

      const newUser = new User({
        ip: req.clientIp,
        deviceInfo: parserResults,
        activity: [],
      });

      await newUser.save();
      user = await User.findOne({ ip: req.clientIp });
    }

    req.users = user;
    next();
  } catch (err) {
    console.log("User middleware error:", err.message);
    next();
  }
});

app.use(publicRoutes);

app.use((err, req, res, next) => {
  console.log("Global error:", err.message);

  if (res.headersSent) {
    return next(err);
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
      console.log(`Server Running On ${PORT_NO}`);
    });
  })
  .catch((err) => {
    console.log("MongoDB connection error:", err.message);
  });