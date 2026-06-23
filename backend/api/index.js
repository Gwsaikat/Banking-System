const app = require("../app");
const connectDB = require("../config/db");
const mongoose = require("mongoose");

// We check if mongoose is already connected to avoid multiple connections in serverless env
if (mongoose.connection.readyState !== 1) {
  connectDB();
}

module.exports = app;
