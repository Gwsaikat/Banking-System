const { GoogleGenerativeAIEmbeddings } = require("@langchain/google-genai");
const { RecursiveCharacterTextSplitter } = require("@langchain/textsplitters");
const DocumentModel = require("../models/document");
const Transaction = require("../models/transaction");
const Account = require("../models/account");

const getEmbeddings = () => new GoogleGenerativeAIEmbeddings({
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY,
  model: "text-embedding-004",
});

const processAndStoreDocument = async (fileBuffer, fileName, userId) => {
  try {
    const pdfParse = require("pdf-parse");
    const pdfData = await pdfParse(fileBuffer);
    const text = pdfData.text;

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
    
    // We split into chunks and save directly to our Mongoose model
    const chunks = await splitter.createDocuments([text]);
    
    // We embed manually and save to Mongo to avoid using the underlying driver manually
    let savedCount = 0;
    for (const chunk of chunks) {
      const vector = await getEmbeddings().embedQuery(chunk.pageContent);
      await DocumentModel.create({
        user: userId,
        fileName: fileName,
        text: chunk.pageContent,
        embedding: vector
      });
      savedCount++;
    }
    
    return { success: true, chunks: savedCount };
  } catch (error) {
    console.error("Error storing document:", error);
    throw error;
  }
};

const searchDocuments = async (query, userId) => {
  try {
    // Requires an Atlas Vector Search index named "vector_index" on the `documents` collection
    const vector = await getEmbeddings().embedQuery(query);
    
    const results = await DocumentModel.aggregate([
      {
        $vectorSearch: {
          index: "vector_index",
          path: "embedding",
          queryVector: vector,
          numCandidates: 10,
          limit: 3,
          filter: { user: userId } // Filter by user!
        }
      },
      {
        $project: {
          _id: 0,
          fileName: 1,
          text: 1,
          score: { $meta: "vectorSearchScore" }
        }
      }
    ]);
    
    return results;
  } catch (error) {
    console.error("Error searching documents:", error);
    return [];
  }
};

// --- FEATURE C: SEMANTIC TRANSACTION SEARCH ---

const embedTransaction = async (transactionId, text, userId) => {
  try {
    const vector = await getEmbeddings().embedQuery(text);
    
    // Simply update the existing mongoose document
    await Transaction.findByIdAndUpdate(transactionId, {
      embedding: vector
    });
  } catch (error) {
    console.error("Error embedding transaction:", error);
  }
};

const searchSemanticTransactions = async (query, userId) => {
  try {
    const vector = await getEmbeddings().embedQuery(query);
    const userAccounts = await Account.find({ user: userId }).select("_id");
    const userAccountIds = new Set(userAccounts.map((account) => account._id.toString()));

    if (userAccountIds.size === 0) {
      return [];
    }
    
    // Requires an Atlas Vector Search index named "txn_vector_index" on the `transactions` collection
    const results = await Transaction.aggregate([
      {
        $vectorSearch: {
          index: "txn_vector_index",
          path: "embedding",
          queryVector: vector,
          numCandidates: 50,
          limit: 20
        }
      },
      {
        $project: {
          _id: 1,
          account: 1,
          amount: 1,
          type: 1,
          description: 1,
          createdAt: 1,
          referenceId: 1,
          score: { $meta: "vectorSearchScore" }
        }
      }
    ]);
    return results
      .filter((transaction) => userAccountIds.has(transaction.account?.toString()))
      .slice(0, 5);
  } catch (error) {
    console.error("Error in semantic search:", error);
    return [];
  }
};

module.exports = { processAndStoreDocument, searchDocuments, embedTransaction, searchSemanticTransactions };
