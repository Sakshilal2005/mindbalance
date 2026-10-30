import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Smartphone, Moon, Brain, Bot } from 'lucide-react'
import { PieChart, Pie, Cell } from 'recharts'
import client from '../api/client'

const riskPillClass = (label) => `pill pill-${label.toLowerCase()}`

function Gauge({ score }) {
  const data = [
    { value: score },
    { value: 100 - score },
  ]
  return (
    <div style={{ position: 'relative', width: 200, height: 120 }}>
      <PieChart width={200} height={120}>
        <Pie
          data={data}
          startAngle={180}
          endAngle={0}
          innerRadius={70}
          outerRadius={92}
          dataKey="value"
          stroke="none"
        >
          <Cell fill="var(--primary)" />
          <Cell fill="var(--surface-tint)" />
        </Pie>
      </PieChart>
      <div className="gauge-center">
        <div className="gauge-score">{score}</div>
        <div className="gauge-max">/100</div>
      </div>
    </div>
  )
}

export default function Results() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    client.get('/assessment/latest')
      .then((res) => setData(res.data))
      .catch(() => setError('Could not load your results.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p>Loading your results…</p>
  if (error) return <p className="error-text">{error}</p>

  if (!data?.assessment) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: 40 }}>
        <h2 style={{ marginTop: 0 }}>No results yet</h2>
        <p style={{ color: 'var(--ink-soft)' }}>Take the assessment first to see your digital wellness overview.</p>
        <Link to="/assessment" className="btn btn-primary">Start Assessment</Link>
      </div>
    )
  }

  const a = data.assessment

  const riskCards = [
    { label: 'Phone Addiction Risk', value: a.phone_risk_label, icon: Smartphone },
    { label: 'Sleep Disorder Risk', value: a.sleep_risk_label, icon: Moon },
    { label: 'Focus & Mental State', value: a.focus_label, icon: Brain },
  ]

  return (
    <div>
      <div className="page-header">
        <h1>Your Results</h1>
        <p>Here's your digital wellness overview.</p>
      </div>

      <div className="results-grid">
        <div className="card score-card">
          <h3>Digital Wellness Score</h3>
          <Gauge score={a.wellness_score} />
          <div className="score-label">{a.wellness_label}</div>
        </div>

        <div className="risk-cards">
          {riskCards.map(({ label, value, icon: Icon }) => (
            <div className="card risk-card" key={label}>
              <div className="risk-icon"><Icon size={18} color="var(--primary)" /></div>
              <div>
                <div className="risk-label">{label}</div>
                <span className={riskPillClass(value)}>{value}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      

      <style>{`
        .results-grid { display: grid; grid-template-columns: 300px 1fr; gap: 16px; margin-bottom: 16px; }
        .score-card { display: flex; flex-direction: column; align-items: center; text-align: center; }
        .score-card h3 { margin: 0 0 10px; font-size: 15px; }
        .gauge-center { position: absolute; top: 50px; left: 0; right: 0; text-align: center; }
        .gauge-score { font-size: 34px; font-weight: 800; font-family: var(--font-display); }
        .gauge-max { font-size: 12px; color: var(--ink-faint); }
        .score-label { color: var(--primary); font-weight: 700; font-size: 14px; margin-top: 4px; }
        .risk-cards { display: flex; flex-direction: column; gap: 12px; }
        .risk-card { display: flex; align-items: center; gap: 14px; }
        .risk-icon { width: 40px; height: 40px; border-radius: 10px; background: var(--primary-tint); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .risk-label { font-size: 13px; color: var(--ink-soft); margin-bottom: 4px; }
        .ai-box { display: flex; gap: 14px; background: var(--primary-tint); border: none; }
        .ai-icon { width: 40px; height: 40px; border-radius: 10px; background: var(--surface); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .ai-title { font-weight: 700; margin-bottom: 6px; color: var(--primary-dark); }
        .ai-box p { margin: 0; font-size: 14px; line-height: 1.6; color: var(--ink); }
        @media (max-width: 800px) { .results-grid { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  )
}
