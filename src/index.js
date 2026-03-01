const { App } = require('@slack/bolt');
const { generateSQL } = require('./langchain');
const { runQuery } = require('./db');
require('dotenv').config();

// Slack App initialize
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

// /ask-data command handle karta hai
app.command('/ask-data', async ({ command, ack, respond }) => {
  // Slack ko 3 second ke andar acknowledge karna zaroori hai
  await ack();

  const question = command.text;

  // Agar user ne kuch text nahi diya
  if (!question) {
    await respond('⚠️ Please provide a question. Example: `/ask-data show revenue by region`');
    return;
  }

  try {
    // Step 1: Question ko SQL me convert karo
    const sql = await generateSQL(question);

    // Step 2: SQL Postgres pe run karo
    const rows = await runQuery(sql);

    // Step 3: Result format karo
    if (rows.length === 0) {
      await respond(`*Query ran successfully but returned no results.*\n\`\`\`${sql}\`\`\``);
      return;
    }

    // Table headers nikalo
    const headers = Object.keys(rows[0]);

    // Har row ko readable line me convert karo
    const tableLines = rows.map(row => {
      return headers.map(h => `${h}: ${row[h]}`).join(' | ');
    }).join('\n');

    // Slack me bhejo
    await respond({
      text: `✅ *Results for:* "${question}"\n\n*Generated SQL:*\n\`\`\`${sql}\`\`\`\n\n*Results (${rows.length} rows):*\n\`\`\`${tableLines}\`\`\``
    });

  } catch (error) {
    // Agar koi error aaye to Slack me dikhao
    await respond(`❌ *Error occurred:*\n\`\`\`${error.message}\`\`\``);
  }
});

// App start karo
(async () => {
  await app.start(process.env.PORT || 3000);
  console.log('⚡ Slack Data Bot is running on port 3000!');
})();
