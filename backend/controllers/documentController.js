const { processAndStoreDocument, searchDocuments } = require("../services/ragService");

const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No document provided" });
    }

    const result = await processAndStoreDocument(
      req.file.buffer,
      req.file.originalname,
      req.user._id
    );

    res.status(201).json({ message: "Document embedded successfully", chunks: result.chunks });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const queryDocuments = async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ message: "Search query is required" });
    }

    const results = await searchDocuments(query, req.user._id);
    res.json({ results });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { uploadDocument, queryDocuments };
