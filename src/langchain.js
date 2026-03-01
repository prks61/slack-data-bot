const { ChatOpenAI } = require("@langchain/openai");
const { HumanMessage, SystemMessage } = require("@langchain/core/messages");
require("dotenv").config();

// OpenRouter use kar raha hai OpenAI ki jagah — bas baseURL change hai
const model = new ChatOpenAI({
  model: "arcee-ai/trinity-large-preview:free", // Free model
  temperature: 0,
  apiKey: process.env.OPENROUTER_API_KEY,
  configuration: {
    baseURL: "https://openrouter.ai/api/v1", // OpenRouter ka URL
    defaultHeaders: {
      "HTTP-Referer": "http://localhost:3000", // Required by OpenRouter
      "X-Title": "Slack Data Bot", // App ka naam
    },
  },
});

// Table ki description — LLM ko batata hai schema kya hai
const TABLE_DESCRIPTION = `
You are a SQL expert. You have access to one PostgreSQL table:

Table name: public.sales_daily
Columns:
- date (date): the date of sales
- region (text): sales region e.g. North, South, East, West  
- category (text): product category e.g. Electronics, Grocery, Fashion
- revenue (numeric): total revenue for that day/region/category
- orders (integer): number of orders

Rules:
- Output ONLY a single valid PostgreSQL SELECT statement
- Do NOT include backticks, markdown, or any explanation
- Just raw SQL text only
- Always use public.sales_daily as table name
`;

// Natural language ko SQL me convert karta hai
async function generateSQL(question) {
  const response = await model.invoke([
    new SystemMessage(TABLE_DESCRIPTION),
    new HumanMessage(question),
  ]);

  // Agar model ne backticks ya ```sql diya to remove karo
  let sql = response.content.trim();
  sql = sql
    .replace(/```sql/gi, "")
    .replace(/```/g, "")
    .trim();

  return sql;
}

module.exports = { generateSQL };
