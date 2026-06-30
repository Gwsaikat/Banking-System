const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
const { createReactAgent } = require("@langchain/langgraph/prebuilt");
const { createAiTools } = require("./aiTools");

const createChatModel = () => new ChatGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY,
    model: "gemini-2.5-flash"
});

const askAI = async (userId, query) => {
    // 1. Get the tools specifically bound to this user
    const tools = createAiTools(userId);

    // 2. Create the agent using LangGraph's prebuilt ReactAgent
    const agent = createReactAgent({
        llm: createChatModel(),
        tools,
        messageModifier: "You are a helpful and professional banking assistant named 'Ask Your Money'. Always use the provided tools before answering any question about account balances, account details, spending, deposits, withdrawals, transfers, recent transactions, or document/semantic transaction lookups. If the user asks a broad question such as recent transactions or spending, first call get_all_recent_transactions; if they ask for balances, first call get_user_accounts; if they ask for fuzzy categories such as groceries, coffee, subscriptions, or merchant-like descriptions, call semantic_transaction_search and use recent transactions as a fallback. Answer only from tool results and clearly say when the data is unavailable."
    });

    // 3. Invoke the agent
    const result = await agent.invoke({
        messages: [{ role: "user", content: query }]
    });

    // Return the final message content
    return result.messages[result.messages.length - 1].content;
};

module.exports = { askAI };
