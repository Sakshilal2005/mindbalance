import { Link } from 'react-router-dom'
import { Smartphone, Brain, Target, ArrowRight, Heart } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Home() {
  const { user } = useAuth()

  return (
    <div>
      <div className="hero card">
        <div className="hero-text">
          <h1>Take care of your mind and body, {user?.name?.split(' ')[0] || 'there'}.</h1>
          <p>Understand your phone usage, sleep patterns and get personalized, AI-powered recommendations to live a healthier life.</p>
          <Link to="/assessment" className="btn btn-primary">
            Start Assessment <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      <div className="feature-grid">
        <div className="card feature">
          <Smartphone size={20} color="var(--primary)" />
          <h3>Understand Your Habits</h3>
          <p>Track phone usage and sleep patterns</p>
        </div>
        <div className="card feature">
          <Brain size={20} color="var(--primary)" />
          <h3>AI-Powered Analysis</h3>
          <p>Claude analyzes your journal notes and habits</p>
        </div>
        <div className="card feature">
          <Target size={20} color="var(--primary)" />
          <h3>Improve Gradually</h3>
          <p>Get personalized tips and track your progress</p>
        </div>
      </div>

      <div className="card quote-card">
        <span>"Small changes today, better tomorrow."</span>
        <Heart size={18} color="var(--primary)" fill="var(--primary-tint)" />
      </div>

      <style>{`
        .hero { padding: 40px 34px; margin-bottom: 20px; }
        .hero-text h1 { font-family: var(--font-display); font-size: 30px; max-width: 560px; margin: 0 0 12px; line-height: 1.25; }
        .hero-text p { color: var(--ink-soft); max-width: 480px; margin: 0 0 20px; font-size: 15px; line-height: 1.55; }
        .feature-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 20px; }
        .feature h3 { font-size: 15px; margin: 12px 0 4px; }
        .feature p { font-size: 13px; color: var(--ink-soft); margin: 0; }
        .quote-card { display: flex; align-items: center; justify-content: space-between; font-style: italic; color: var(--ink-soft); }
        @media (max-width: 780px) { .feature-grid { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  )
}
