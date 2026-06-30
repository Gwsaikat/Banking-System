const { StateGraph, START, END } = require("@langchain/langgraph");

// State Definition for the LangGraph
const graphState = {
  transaction: {
    value: null,
  },
  anomalyScore: {
    value: null,
  },
  decision: {
    value: null,
  },
};

// --- Nodes ---
const analyzeTransaction = async (state) => {
  const amount = state.transaction.amount;
  let score = 0;
  
  // Simple rule-based anomaly detection (can be upgraded to LLM-based)
  if (amount > 10000) {
    score = 90; // High anomaly
  } else if (amount > 5000) {
    score = 50; // Medium anomaly
  }
  
  return { anomalyScore: score };
};

const humanReview = async (state) => {
  // In a full production setup with a checkpointer, the graph would pause here.
  // For this implementation, we simulate the state transition.
  if (!state.decision) {
    return { decision: "pending_review" };
  }
  return { decision: state.decision };
};

const executeAction = async (state) => {
  if (state.decision === "rejected") {
    console.log(`[GUARDIAN] Transaction ${state.transaction._id} BLOCKED by human!`);
  } else if (state.decision === "approved") {
    console.log(`[GUARDIAN] Transaction ${state.transaction._id} APPROVED by human!`);
  } else {
    console.log(`[GUARDIAN] Transaction ${state.transaction._id} processed automatically (low risk).`);
  }
  return {};
};

// --- Edges (Routing Logic) ---
const routeReview = (state) => {
  if (state.anomalyScore > 80 && state.decision !== "approved" && state.decision !== "rejected") {
    return "human_review";
  }
  return "execute_action";
};

// --- Build Graph ---
const workflow = new StateGraph({ channels: graphState })
  .addNode("analyze_transaction", analyzeTransaction)
  .addNode("human_review", humanReview)
  .addNode("execute_action", executeAction)
  
  // Define the flow
  .addEdge(START, "analyze_transaction")
  .addConditionalEdges("analyze_transaction", routeReview)
  .addEdge("human_review", "execute_action") // After review, go to action
  .addEdge("execute_action", END);

// Compile the graph
const guardianApp = workflow.compile();

// Helper to run the graph
const checkAnomaly = async (transaction) => {
  console.log(`[GUARDIAN] Analyzing transaction: ${transaction._id} for $${transaction.amount}`);
  const result = await guardianApp.invoke({ transaction });
  return result;
};

// Helper for admin to approve/reject
const resolveAnomaly = async (transaction, decision) => {
  // We feed the state back in with the decision
  const result = await guardianApp.invoke({ transaction, anomalyScore: 90, decision });
  return result;
};

module.exports = { guardianApp, checkAnomaly, resolveAnomaly };
