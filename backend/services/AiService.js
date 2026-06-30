const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
const { createReactAgent } = require("@langchain/langgraph/prebuilt");
const { createAiTools } = require("./aiTools");

const chat = new ChatGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY,
    model: "gemini-2.5-flash"
});

const askAI = async (userId, query) => {
    // 1. Get the tools specifically bound to this user
    const tools = createAiTools(userId);

    // 2. Create the agent using LangGraph's prebuilt ReactAgent
    const agent = createReactAgent({
        llm: chat,
        tools,
        messageModifier: "You are a helpful and professional banking assistant named 'Ask Your Money'. You can help users query their account balances, recent transactions, and do semantic searches for 'groceries' or 'coffee' etc. Use the provided tools to answer the user's questions accurately based on their real data. If you don't know the answer or the tools don't return the information, say you don't know."
    });

    // 3. Invoke the agent
    const result = await agent.invoke({
        messages: [{ role: "user", content: query }]
    });

    // Return the final message content
    return result.messages[result.messages.length - 1].content;
};

module.exports = { askAI };