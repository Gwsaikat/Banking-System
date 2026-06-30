const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    embedding: {
      type: [Number], // The vector embedding
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// We do NOT define the vector search index here.
// MongoDB Atlas Vector Search indexes MUST be created in the Atlas UI or via the Atlas Admin API.

module.exports = mongoose.model("Document", documentSchema);
