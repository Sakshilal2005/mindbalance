import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Moon, Smartphone, Target, Check, Sprout } from 'lucide-react'
import client from '../api/client'

const ICONS = { moon: Moon, phone: Smartphone, target: Target }

export default function Recommendations() {
  const [recs, setRecs] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    client.get('/assessment/latest')
      .then((res) => setRecs(res.data.recommendations || []))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p>Loading recommendations…</p>

  if (!recs || recs.length === 0) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: 40 }}>
        <h2 style={{ marginTop: 0 }}>No recommendations yet</h2>
        <p style={{ color: 'var(--ink-soft)' }}>Complete the assessment to get personalized tips.</p>
        <Link to="/assessment" className="btn btn-primary">Start Assessment</Link>
      </div>
    )
  }

  return (
    <div>
      <div className="page-header">
        <h1>Personalized Recommendations</h1>
        <p>Simple steps to improve your digital and sleep habits.</p>
      </div>

      <div className="rec-grid">
        {recs.map((rec) => {
          const Icon = ICONS[rec.icon] || Target
          return (
            <div className="card rec-card" key={rec.title}>
              <div className="rec-icon"><Icon size={20} color="var(--primary)" /></div>
              <h3>{rec.title}</h3>
              <ul>
                {rec.tips.map((tip) => (
                  <li key={tip}><Check size={14} color="var(--good)" /> {tip}</li>
                ))}
              </ul>
            </div>
          )
        })}
      </div>

      <div className="card footer-note">
        <Sprout size={20} color="var(--primary)" />
        <span><strong>Remember:</strong> Progress, not perfection. Keep going, every small step counts.</span>
      </div>

      <style>{`
        .rec-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 16px; }
        .rec-icon { width: 44px; height: 44px; border-radius: 12px; background: var(--primary-tint); display: flex; align-items: center; justify-content: center; margin-bottom: 12px; }
        .rec-card h3 { font-size: 16px; margin: 0 0 12px; }
        .rec-card ul { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 10px; }
        .rec-card li { display: flex; align-items: flex-start; gap: 8px; font-size: 13.5px; color: var(--ink-soft); line-height: 1.4; }
        .footer-note { display: flex; align-items: center; gap: 12px; background: var(--primary-tint); border: none; font-size: 14px; }
        @media (max-width: 900px) { .rec-grid { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  )
}
