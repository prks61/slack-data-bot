# 🤖 Slack AI Data Bot

A Slack bot that converts natural language questions into SQL queries using LangChain + OpenRouter (free LLM), executes them on a PostgreSQL database, and replies with formatted results — all inside Slack using a slash command.

---

## 📸 How It Works

```
User types /ask-data in Slack
        ↓
Node.js app (Slack Bolt) receives the command
        ↓
LangChain sends question to LLM (via OpenRouter - free)
        ↓
LLM returns a SQL SELECT statement
        ↓
App executes SQL on PostgreSQL
        ↓
Formatted result is sent back to Slack
```

---

## 🛠️ Tech Stack

| Tool | Purpose |
|------|---------|
| **Node.js** | Runtime environment |
| **Slack Bolt SDK** | Handles Slack events and slash commands |
| **LangChain** | Orchestrates the NL → SQL pipeline |
| **OpenRouter API** | Free LLM API (used `arcee-ai/trinity-large-preview:free`) |
| **PostgreSQL** | Database where sales data is stored |
| **ngrok** | Exposes local server to Slack via public URL |
| **dotenv** | Manages environment variables securely |

---

## 📁 Project Structure

```
slack-data-bot/
├── .env                  # Secret keys (never push to GitHub)
├── .env_sample          # Template for environment variables
├── .gitignore            # Excludes .env and node_modules
├── package.json          # Project dependencies
├── seed.sql              # Database schema and sample data
└── src/
    ├── index.js          # Slack app entry point + slash command handler
    ├── langchain.js      # NL → SQL using LangChain + OpenRouter
    └── db.js             # PostgreSQL connection and query runner
```

---

## 🗄️ Database Schema

```sql
CREATE TABLE public.sales_daily (
  date       date           NOT NULL,
  region     text           NOT NULL,
  category   text           NOT NULL,
  revenue    numeric(12,2)  NOT NULL,
  orders     integer        NOT NULL,
  created_at timestamptz    NOT NULL DEFAULT now(),
  PRIMARY KEY (date, region, category)
);
```

### Sample Data

| date | region | category | revenue | orders |
|------|--------|----------|---------|--------|
| 2025-09-01 | North | Electronics | 125000.50 | 310 |
| 2025-09-01 | South | Grocery | 54000.00 | 820 |
| 2025-09-01 | West | Fashion | 40500.00 | 190 |
| 2025-09-02 | North | Electronics | 132500.00 | 332 |
| 2025-09-02 | West | Fashion | 45500.00 | 210 |
| 2025-09-02 | East | Grocery | 62000.00 | 870 |

---

## ⚙️ Prerequisites

Before setting up, make sure you have:

- [Node.js](https://nodejs.org) v18 or higher
- [PostgreSQL](https://www.postgresql.org/download/) installed locally
- [ngrok](https://ngrok.com) account (free, sign in with GitHub)
- A [Slack workspace](https://slack.com) where you can install apps
- An [OpenRouter](https://openrouter.ai) account (free, sign in with GitHub)

---

## 🚀 Setup Instructions

### Step 1 — Clone the Repository

```bash
git clone https://github.com/prks61/slack-data-bot.git
cd slack-data-bot
```

### Step 2 — Install Dependencies

```bash
npm install
```

### Step 3 — Set Up Environment Variables

Copy the example file and fill in your credentials:

```bash
cp .env_sample
```

Open `.env` and fill in all values (see **Getting Your Tokens** section below).

### Step 4 — Set Up the Database

Open **pgAdmin 4**, connect to your PostgreSQL server, and:

1. Create a new database called `analytics`
2. Open Query Tool and run the contents of `seed.sql`

Or if `psql` is available in your terminal:

```bash
psql -U postgres -c "CREATE DATABASE analytics;"
psql -U postgres -d analytics -f seed.sql
```

### Step 5 — Start the App

```bash
node src/index.js
```

You should see: `⚡ Slack Data Bot is running on port 3000!`

### Step 6 — Start ngrok (New Terminal)

```bash
ngrok http 3000
```

Copy the HTTPS URL shown (e.g., `https://abc123.ngrok-free.app`)

### Step 7 — Configure Slack Slash Command

1. Go to [api.slack.com/apps](https://api.slack.com/apps)
2. Select your app → **Slash Commands** → **Edit `/ask-data`**
3. Set Request URL to: `https://YOUR_NGROK_URL/slack/events`
4. Save and reinstall the app to your workspace

---

## 🔑 Getting Your Tokens

### Slack Tokens
1. Go to [api.slack.com/apps](https://api.slack.com/apps) → Create New App → From Scratch
2. **Signing Secret**: Basic Information → App Credentials → Show
3. Add Bot Scopes: OAuth & Permissions → `commands`, `chat:write`
4. **Bot Token**: Install App → Bot User OAuth Token (`xoxb-...`)

### OpenRouter API Key (Free)
1. Go to [openrouter.ai](https://openrouter.ai) → Sign in with GitHub
2. Go to Settings → API Keys → Create Key
3. Copy the key (`sk-or-v1-...`)

### ngrok Auth Token
1. Go to [dashboard.ngrok.com/authtokens](https://dashboard.ngrok.com/authtokens)
2. Copy your token and run:
   ```bash
   ngrok config add-authtoken YOUR_TOKEN
   ```

---

## 🧪 Usage Examples

In any Slack channel, type:

```
/ask-data show total revenue by region
/ask-data how many orders were placed on 2025-09-01
/ask-data which category has the highest revenue
/ask-data show all data for the West region
/ask-data compare revenue between North and South
```

---

## 📋 Environment Variables

```env
SLACK_BOT_TOKEN=xoxb-your-token-here
SLACK_SIGNING_SECRET=your-signing-secret-here
OPENROUTER_API_KEY=sk-or-v1-your-key-here
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/analytics
PORT=3000
```

---

## ⚠️ Important Notes

- **Never push `.env` to GitHub** — it contains secret keys
- **ngrok URL changes** every time you restart it — update the Slack slash command URL each time
- This project uses a **free LLM** via OpenRouter — rate limits apply (200 requests/day)
- The bot only handles `SELECT` queries — no data modification

---

## 🐛 Common Errors & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| `dispatch_failed` | App not running | Run `node src/index.js` |
| `404 No endpoints found` | Wrong model name | Check model name in `langchain.js` |
| `429 Rate limit` | Too many requests | Switch to another free model on OpenRouter |
| `SASL: client password must be a string` | Wrong DB password in `.env` | Fix `DATABASE_URL` password |
| `psql not recognized` | PostgreSQL not in PATH | Add PostgreSQL `bin` folder to system PATH |

---

## 📄 License

MIT License — feel free to use and modify.

---

## 👤 Author

Built as an assignment to demonstrate NL→SQL pipeline using LangChain, Slack API, and PostgreSQL.
