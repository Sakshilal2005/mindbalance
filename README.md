# MindBalance — Digital Wellness App

A full-stack digital wellness tracker: users take a habits assessment, get a
computed wellness score + personalized recommendations, log daily screen
time/sleep to see progress charts, and write journal notes that are analyzed
for sentiment/topics/suggestions by the **Claude API**.

- **Backend:** Flask + SQLAlchemy (SQLite) + JWT auth + Anthropic SDK
- **Frontend:** React (Vite) + React Router + Recharts + Axios

---

## 1. Backend setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# then edit .env and paste your real Anthropic API key into ANTHROPIC_API_KEY
```

Get a Claude API key at https://console.anthropic.com/ (this powers the
**AI Insights** journal analysis feature — every other page works without it).

Run the server:

```bash
python app.py
```

The API runs at `http://localhost:5000`. On first run it auto-creates
`mindbalance.db` (SQLite) with all tables.

## 2. Frontend setup

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. The Vite dev server proxies `/api/*` requests
to the Flask backend on port 5000 (see `vite.config.js`), so no CORS
headaches during development.

## 3. Using the app

1. Sign up for an account (stored in the local database, password hashed with bcrypt).
2. Take the 3-step **Assessment** (phone usage, sleep, mental/focus questions).
3. View your **Results** — a computed Digital Wellness Score plus Phone
   Addiction / Sleep Disorder / Focus risk levels.
4. Check **Recommendations** — tips generated from your specific risk levels.
5. Log daily screen time & sleep hours on the **Progress** page to build up
   a 7-day trend chart.
6. Write a short note on the **AI Insights** page — it's sent to Claude,
   which returns sentiment, key topics, and a suggestion, all shown live.

## 4. How the scoring works

See `backend/scoring.py`. Each answer maps to a 0–100 sub-score; the three
categories (phone, sleep, focus) are averages of their sub-scores, and the
overall Digital Wellness Score is `100 - weighted average risk`. This is
transparent and explainable — good to point to in a project report/viva,
since you can walk through exactly how any score was derived.

## 5. Project structure

```
mindbalance/
├── backend/
│   ├── app.py              # Flask app factory + entrypoint
│   ├── config.py           # env-based configuration
│   ├── extensions.py       # db, bcrypt, jwt singletons
│   ├── models.py           # User, AssessmentResult, ProgressLog, JournalEntry
│   ├── scoring.py          # assessment scoring + recommendation engine
│   ├── requirements.txt
│   ├── .env.example
│   └── routes/
│       ├── auth.py         # /api/auth/register, /login, /me
│       ├── assessment.py   # /api/assessment/submit, /latest, /history
│       ├── progress.py     # /api/progress/log, /weekly
│       └── insights.py     # /api/insights/analyze (Claude API), /history
└── frontend/
    └── src/
        ├── api/client.js       # axios instance with JWT interceptor
        ├── context/AuthContext.jsx
        ├── components/Sidebar.jsx, Layout.jsx
        └── pages/
            ├── Login.jsx, Signup.jsx
            ├── Home.jsx
            ├── Assessment.jsx
            ├── Results.jsx
            ├── Recommendations.jsx
            ├── Progress.jsx
            └── Insights.jsx
```

## 6. For your project report

Good things to mention:
- **Auth:** bcrypt password hashing + JWT bearer tokens (7-day expiry).
- **Persistence:** SQLite via SQLAlchemy ORM, one row per assessment
  submission so score history is kept (not just overwritten).
- **AI integration:** real call to Anthropic's Claude API with a strict
  JSON-only system prompt, parsed and stored server-side.
- **Possible extensions:** deploy backend on Render/Railway, frontend on
  Vercel/Netlify, switch SQLite → PostgreSQL, add password reset via email,
  add push/email reminders, add a comparison-to-average-user chart.
