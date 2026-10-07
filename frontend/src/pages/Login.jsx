import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Moon } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login, loading } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await login(email, password)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.')
    }
  }

  return (
    <div className="auth-screen">
      <form className="auth-card card" onSubmit={submit}>
        <div className="auth-brand">
          <div className="brand-mark"><Moon size={18} /></div>
          <span>MindBalance</span>
        </div>
        <h1>Welcome back</h1>
        <p>Log in to continue your digital wellness journey.</p>

        {error && <div className="error-text">{error}</div>}

        <label>Email</label>
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />

        <label>Password</label>
        <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />

        <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', marginTop: 8 }}>
          {loading ? <span className="spinner" /> : 'Log in'}
        </button>

        <p className="switch-line">Don't have an account? <Link to="/signup">Sign up</Link></p>
      </form>
      <AuthStyles />
    </div>
  )
}

export function AuthStyles() {
  return (
    <style>{`
      .auth-screen {
        min-height: 100vh; display: flex; align-items: center; justify-content: center;
        background: linear-gradient(160deg, #F3F2FB 0%, #EAE7FA 100%);
        padding: 20px;
      }
      .auth-card { width: 100%; max-width: 380px; padding: 32px 28px; }
      .auth-brand { display: flex; align-items: center; gap: 9px; font-weight: 800; margin-bottom: 22px; }
      .auth-brand .brand-mark { width: 32px; height: 32px; border-radius: 9px; background: var(--primary); color: #fff; display: flex; align-items: center; justify-content: center; }
      .auth-card h1 { font-family: var(--font-display); font-size: 24px; margin: 0 0 4px; }
      .auth-card p { color: var(--ink-soft); font-size: 14px; margin: 0 0 20px; }
      .auth-card label { display: block; font-size: 13px; font-weight: 700; margin: 14px 0 6px; }
      .auth-card input {
        width: 100%; padding: 11px 13px; border-radius: 10px;
        border: 1.5px solid var(--border); font-size: 14.5px; outline: none;
      }
      .auth-card input:focus { border-color: var(--primary); }
      .switch-line { text-align: center; margin-top: 18px !important; font-size: 13.5px; }
      .switch-line a { color: var(--primary); font-weight: 700; }
    `}</style>
  )
}
