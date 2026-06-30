const { askAI } = require("../services/AiService");

/**
 * @desc    Ask the AI a question about user's accounts/transactions
 * @route   POST /api/ai/ask
 * @access  Private
 */
const askQuestion = async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ message: "Please provide a message to ask." });
    }

    // req.user._id is populated by the auth middleware
    const reply = await askAI(req.user._id, message);
    
    res.json({ reply });
  } catch (error) {
    console.error("AI Error:", error);
    res.status(500).json({ message: "Something went wrong while talking to the AI." });
  }
};

module.exports = { askQuestion };
