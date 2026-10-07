import { useEffect, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import client from '../api/client'

const dayLabel = (iso) => new Date(iso + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short' })

export default function Progress() {
  const [weekly, setWeekly] = useState(null)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ date: new Date().toISOString().slice(0, 10), screen_time_hours: '', sleep_hours: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = () => {
    client.get('/progress/weekly').then((res) => setWeekly(res.data)).finally(() => setLoading(false))
  }

  useEffect(load, [])

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      await client.post('/progress/log', {
        date: form.date,
        screen_time_hours: parseFloat(form.screen_time_hours),
        sleep_hours: parseFloat(form.sleep_hours),
      })
      setForm({ ...form, screen_time_hours: '', sleep_hours: '' })
      load()
    } catch (err) {
      setError(err.response?.data?.error || 'Could not save entry.')
    } finally {
      setSaving(false)
    }
  }

  const entries = (weekly?.entries || []).map((e) => ({ ...e, day: dayLabel(e.date) }))

  return (
    <div>
      <div className="page-header">
        <h1>Your Progress</h1>
        <p>Track your improvement over time.</p>
      </div>

      <form className="card log-form" onSubmit={submit}>
        <h3>Log today's numbers</h3>
        {error && <div className="error-text">{error}</div>}
        <div className="log-inputs">
          <div>
            <label>Date</label>
            <input type="date" value={form.date} max={new Date().toISOString().slice(0, 10)} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
          </div>
          <div>
            <label>Screen time (hrs)</label>
            <input type="number" step="0.1" min="0" max="24" placeholder="e.g. 4.5" value={form.screen_time_hours} onChange={(e) => setForm({ ...form, screen_time_hours: e.target.value })} required />
          </div>
          <div>
            <label>Sleep (hrs)</label>
            <input type="number" step="0.1" min="0" max="24" placeholder="e.g. 6.5" value={form.sleep_hours} onChange={(e) => setForm({ ...form, sleep_hours: e.target.value })} required />
          </div>
          <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? <span className="spinner" /> : 'Save'}</button>
        </div>
      </form>

      {!loading && entries.length === 0 && (
        <p style={{ color: 'var(--ink-soft)' }}>No entries yet this week, log your first day above to see your chart.</p>
      )}

      {entries.length > 0 && (
        <>
          <div className="card chart-card">
            <div className="chart-head">
              <h3>Average Screen Time (hrs/day)</h3>
              {weekly.screen_time_change_pct != null && (
                <span className={`pill ${weekly.screen_time_change_pct <= 0 ? 'pill-good' : 'pill-high'}`}>
                  {weekly.screen_time_change_pct <= 0 ? '↓' : '↑'} {Math.abs(weekly.screen_time_change_pct)}% vs first day
                </span>
              )}
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={entries}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="day" stroke="var(--ink-faint)" fontSize={12} />
                <YAxis stroke="var(--ink-faint)" fontSize={12} />
                <Tooltip />
                <Line type="monotone" dataKey="screen_time_hours" stroke="var(--primary)" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="card chart-card">
            <div className="chart-head">
              <h3>Average Sleep Duration (hrs/night)</h3>
              {weekly.sleep_change_pct != null && (
                <span className={`pill ${weekly.sleep_change_pct >= 0 ? 'pill-good' : 'pill-high'}`}>
                  {weekly.sleep_change_pct >= 0 ? '↑' : '↓'} {Math.abs(weekly.sleep_change_pct)}% vs first day
                </span>
              )}
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={entries}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="day" stroke="var(--ink-faint)" fontSize={12} />
                <YAxis stroke="var(--ink-faint)" fontSize={12} />
                <Tooltip />
                <Line type="monotone" dataKey="sleep_hours" stroke="var(--good)" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      <style>{`
        .log-form { margin-bottom: 18px; }
        .log-form h3 { margin: 0 0 14px; font-size: 15px; }
        .log-inputs { display: flex; gap: 12px; align-items: flex-end; flex-wrap: wrap; }
        .log-inputs > div { display: flex; flex-direction: column; gap: 6px; }
        .log-inputs label { font-size: 12.5px; font-weight: 700; color: var(--ink-soft); }
        .log-inputs input { padding: 9px 11px; border-radius: 9px; border: 1.5px solid var(--border); font-size: 14px; width: 130px; }
        .chart-card { margin-bottom: 16px; }
        .chart-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
        .chart-head h3 { margin: 0; font-size: 15px; }
      `}</style>
    </div>
  )
}
