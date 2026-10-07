import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, ArrowRight, ArrowLeft } from 'lucide-react'
import client from '../api/client'

const STEPS = [
  {
    title: 'Phone Usage',
    questions: [
      {
        key: 'phone_hours',
        text: 'How many hours do you spend on your phone daily (on average)?',
        options: [
          ['lt2', 'Less than 2 hours'],
          ['2to4', '2 – 4 hours'],
          ['4to6', '4 – 6 hours'],
          ['gt6', 'More than 6 hours'],
        ],
      },
      {
        key: 'phone_checks',
        text: 'How many times a day do you check your phone?',
        options: [
          ['lt10', 'Less than 10 times'],
          ['10to30', '10 – 30 times'],
          ['30to60', '30 – 60 times'],
          ['gt60', 'More than 60 times'],
        ],
      },
      {
        key: 'social_hours',
        text: 'How many hours do you spend on social media daily?',
        options: [
          ['lt1', 'Less than 1 hour'],
          ['1to3', '1 – 3 hours'],
          ['3to5', '3 – 5 hours'],
          ['gt5', 'More than 5 hours'],
        ],
      },
    ],
  },
  {
    title: 'Sleep Patterns',
    questions: [
      {
        key: 'sleep_hours',
        text: 'How many hours do you sleep on average per night?',
        options: [
          ['lt5', 'Less than 5 hours'],
          ['5to6', '5 – 6 hours'],
          ['6to7', '6 – 7 hours'],
          ['7to8', '7 – 8 hours'],
          ['gt8', 'More than 8 hours'],
        ],
      },
      {
        key: 'night_wakes',
        text: 'How often do you wake up during the night?',
        options: [
          ['never', 'Never'],
          ['rarely', 'Rarely'],
          ['sometimes', 'Sometimes'],
          ['often', 'Often'],
        ],
      },
      {
        key: 'phone_before_bed',
        text: 'Do you use your phone right before going to sleep?',
        options: [
          ['no', 'No'],
          ['yes', 'Yes'],
        ],
      },
    ],
  },
  {
    title: 'Mental & Focus',
    questions: [
      {
        key: 'stress_level',
        text: 'How would you rate your stress level lately?',
        options: [['1', '1 - Very low'], ['2', '2 - Low'], ['3', '3 - Moderate'], ['4', '4 - High'], ['5', '5 - Very high']],
      },
      {
        key: 'focus_difficulty',
        text: 'How hard is it for you to focus on tasks?',
        options: [['1', '1 - Very easy'], ['2', '2 - Easy'], ['3', '3 - Moderate'], ['4', '4 - Hard'], ['5', '5 - Very hard']],
      },
      {
        key: 'exercise_freq',
        text: 'How often do you exercise per week?',
        options: [
          ['none', 'None'],
          ['1to2', '1 – 2 times'],
          ['3to4', '3 – 4 times'],
          ['5plus', '5+ times'],
        ],
      },
    ],
  },
]

export default function Assessment() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState({})
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const current = STEPS[step]
  const stepAnswered = current.questions.every((q) => answers[q.key] !== undefined)

  const select = (key, value) => setAnswers((a) => ({ ...a, [key]: value }))

  const next = async () => {
    if (!stepAnswered) return
    if (step < STEPS.length - 1) {
      setStep(step + 1)
      return
    }
    setSubmitting(true)
    setError('')
    try {
      await client.post('/assessment/submit', answers)
      navigate('/results')
    } catch (err) {
      setError(err.response?.data?.error || 'Could not submit assessment. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>Assessment</h1>
        <p>Answer a few questions about your daily habits.</p>
      </div>

      <div className="card assess-card">
        <div className="stepper">
          {STEPS.map((s, i) => (
            <div key={s.title} className="step-node">
              <div className={`step-circle${i === step ? ' active' : ''}${i < step ? ' done' : ''}`}>{i + 1}</div>
              {i < STEPS.length - 1 && <div className={`step-line${i < step ? ' done' : ''}`} />}
            </div>
          ))}
        </div>
        <div className="step-label">Step {step + 1} of {STEPS.length} · {current.title}</div>

        {error && <div className="error-text">{error}</div>}

        {current.questions.map((q, qi) => (
          <div key={q.key} className="question-block">
            <div className="q-text">{qi + 1}. {q.text}</div>
            <div className="options">
              {q.options.map(([val, label]) => (
                <label key={val} className={`option${answers[q.key] === val ? ' selected' : ''}`}>
                  <input
                    type="radio"
                    name={q.key}
                    checked={answers[q.key] === val}
                    onChange={() => select(q.key, val)}
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>
        ))}

        <div className="assess-actions">
          <button className="btn btn-outline" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
            <ArrowLeft size={15} /> Back
          </button>
          <button className="btn btn-primary" onClick={next} disabled={!stepAnswered || submitting}>
            {submitting ? <span className="spinner" /> : (step === STEPS.length - 1 ? 'Submit' : 'Next')}
            {!submitting && <ArrowRight size={15} />}
          </button>
        </div>
      </div>

      <div className="privacy-note"><Lock size={13} /> Your answers are safe and private.</div>

      <style>{`
        .assess-card { max-width: 640px; }
        .stepper { display: flex; align-items: center; margin-bottom: 6px; }
        .step-node { display: flex; align-items: center; }
        .step-circle {
          width: 28px; height: 28px; border-radius: 50%; background: var(--surface-tint);
          color: var(--ink-faint); display: flex; align-items: center; justify-content: center;
          font-size: 13px; font-weight: 700; border: 1.5px solid var(--border);
        }
        .step-circle.active { background: var(--primary); color: #fff; border-color: var(--primary); }
        .step-circle.done { background: var(--good); color: #fff; border-color: var(--good); }
        .step-line { width: 60px; height: 2px; background: var(--border); margin: 0 4px; }
        .step-line.done { background: var(--good); }
        .step-label { color: var(--ink-faint); font-size: 12.5px; margin-bottom: 20px; }
        .question-block { margin-bottom: 22px; }
        .q-text { font-weight: 700; font-size: 15px; margin-bottom: 12px; }
        .options { display: flex; flex-direction: column; gap: 9px; }
        .option {
          display: flex; align-items: center; gap: 10px;
          border: 1.5px solid var(--border); border-radius: var(--radius-sm);
          padding: 11px 14px; font-size: 14px; color: var(--ink-soft);
        }
        .option.selected { border-color: var(--primary); background: var(--primary-tint); color: var(--ink); font-weight: 600; }
        .assess-actions { display: flex; justify-content: space-between; margin-top: 8px; }
        .privacy-note { display: flex; align-items: center; gap: 6px; color: var(--ink-faint); font-size: 12.5px; margin-top: 14px; }
      `}</style>
    </div>
  )
}
