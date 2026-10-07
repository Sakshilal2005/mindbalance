import { useEffect, useState } from 'react'
import { Bot, Frown, Meh, Smile, Quote } from 'lucide-react'
import client from '../api/client'

const SENTIMENT_UI = {
  Positive: { icon: Smile, color: 'var(--good)', bg: 'var(--good-tint)' },
  Neutral: { icon: Meh, color: 'var(--warn)', bg: 'var(--warn-tint)' },
  Negative: { icon: Frown, color: 'var(--danger)', bg: 'var(--danger-tint)' },
}

export default function Insights() {
  const [text, setText] = useState('')
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState('')

  const load = () => {
    client.get('/insights/history').then((res) => setEntries(res.data.entries)).finally(() => setLoading(false))
  }
  useEffect(load, [])

  const submit = async (e) => {
    e.preventDefault()
    if (!text.trim()) return
    setError('')
    setAnalyzing(true)
    try {
      await client.post('/insights/analyze', { text })
      setText('')
      load()
    } catch (err) {
      setError(err.response?.data?.error || 'Could not analyze your note right now.')
    } finally {
      setAnalyzing(false)
    }
  }

  const latest = entries[0]
  const sUi = latest ? (SENTIMENT_UI[latest.sentiment] || SENTIMENT_UI.Neutral) : null

  return (
    <div>
      <div className="page-header">
        <h1>AI Insights (NLP)</h1>
        <p>Understand your thoughts and emotions, powered by Claude.</p>
      </div>

      <form className="card journal-form" onSubmit={submit}>
        <label>Write a quick note about your day, mood, or habits</label>
        <textarea
          rows={4}
          maxLength={2000}
          placeholder="e.g. I stay up late scrolling on social media and sometimes feel tired and unmotivated in the morning."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        {error && <div className="error-text">{error}</div>}
        <button className="btn btn-primary" type="submit" disabled={analyzing || !text.trim()}>
          {analyzing ? <span className="spinner" /> : 'Analyze with AI'}
        </button>
      </form>

      {loading ? (
        <p>Loading your notes…</p>
      ) : latest ? (
        <>
          <div className="card note-card">
            <Quote size={16} color="var(--primary)" />
            <p>{latest.text}</p>
          </div>

          <div className="insights-grid">
            <div className="card">
              <h3>Sentiment Analysis</h3>
              <div className="sentiment-row" style={{ background: sUi.bg }}>
                <sUi.icon size={22} color={sUi.color} />
                <div>
                  <div style={{ color: sUi.color, fontWeight: 800 }}>{latest.sentiment}</div>
                  <div className="muted">Detected from your recent note</div>
                </div>
              </div>
            </div>

            <div className="card">
              <h3>Key Topics Detected</h3>
              <div className="topic-tags">
                {latest.key_topics.map((t) => <span className="topic-tag" key={t}>{t}</span>)}
              </div>
            </div>
          </div>

          <div className="card ai-suggestion">
            <div className="ai-icon"><Bot size={20} color="var(--primary)" /></div>
            <div>
              <div className="ai-title">AI Suggestion</div>
              <p>{latest.suggestion}</p>
            </div>
          </div>
        </>
      ) : (
        <p style={{ color: 'var(--ink-soft)' }}>Write your first note above to get an AI-powered analysis.</p>
      )}

      {entries.length > 1 && (
        <div className="card" style={{ marginTop: 16 }}>
          <h3>Past notes</h3>
          <div className="history-list">
            {entries.slice(1).map((e) => (
              <div key={e.id} className="history-row">
                <span className={`pill pill-${(e.sentiment || 'neutral').toLowerCase()}`}>{e.sentiment}</span>
                <span className="history-text">{e.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`
        .journal-form { margin-bottom: 16px; }
        .journal-form label { display: block; font-size: 13px; font-weight: 700; margin-bottom: 8px; }
        .journal-form textarea {
          width: 100%; border: 1.5px solid var(--border); border-radius: var(--radius-sm);
          padding: 12px 14px; font-size: 14px; resize: vertical; margin-bottom: 12px; outline: none;
        }
        .journal-form textarea:focus { border-color: var(--primary); }
        .note-card { display: flex; gap: 10px; margin-bottom: 16px; }
        .note-card p { margin: 0; font-style: italic; color: var(--ink-soft); line-height: 1.6; }
        .insights-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
        .insights-grid h3 { margin: 0 0 12px; font-size: 15px; }
        .sentiment-row { display: flex; align-items: center; gap: 12px; border-radius: var(--radius-sm); padding: 14px; }
        .muted { font-size: 12px; color: var(--ink-faint); }
        .topic-tags { display: flex; flex-wrap: wrap; gap: 8px; }
        .topic-tag { background: var(--primary-tint); color: var(--primary-dark); font-size: 12.5px; font-weight: 700; padding: 6px 12px; border-radius: 999px; }
        .ai-suggestion { display: flex; gap: 14px; background: var(--primary-tint); border: none; }
        .ai-icon { width: 40px; height: 40px; border-radius: 10px; background: var(--surface); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .ai-title { font-weight: 700; margin-bottom: 6px; color: var(--primary-dark); }
        .ai-suggestion p { margin: 0; font-size: 14px; line-height: 1.6; }
        .history-list { display: flex; flex-direction: column; gap: 10px; }
        .history-row { display: flex; align-items: center; gap: 10px; font-size: 13.5px; }
        .history-text { color: var(--ink-soft); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        @media (max-width: 800px) { .insights-grid { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  )
}
