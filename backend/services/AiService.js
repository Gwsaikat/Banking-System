const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");

const chat = new ChatGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY,
    model: "gemini-2.5-flash"
});

const askgemini = async (query) => {
    const result = await chat.invoke(query);
    return result.text;
}

module.exports = askgemini;