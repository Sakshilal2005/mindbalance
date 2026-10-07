import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Moon } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { AuthStyles } from './Login'

export default function Signup() {
  const { register, loading } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await register(name, email, password)
      navigate('/assessment')
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
        <h1>Create your account</h1>
        <p>Start tracking your digital wellness today.</p>

        {error && <div className="error-text">{error}</div>}

        <label>Name</label>
        <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />

        <label>Email</label>
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />

        <label>Password</label>
        <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" />

        <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', marginTop: 8 }}>
          {loading ? <span className="spinner" /> : 'Sign up'}
        </button>

        <p className="switch-line">Already have an account? <Link to="/login">Log in</Link></p>
      </form>
      <AuthStyles />
    </div>
  )
}
