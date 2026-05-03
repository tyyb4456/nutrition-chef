import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Leaf, ArrowLeft, Eye, EyeOff, Loader } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import ThemeToggle from '../components/ui/ThemeToggle'

export default function AuthPage() {
  const [tab,      setTab]      = useState('login')
  const [name,     setName]     = useState('')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPw,   setShowPw]   = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  const { login, register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (tab === 'login') {
        await login(name, password)
      } else {
        await register(name, email, password)
      }
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-sand dark:bg-cyprus flex">

      {/* Left panel — branding */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] bg-cyprus dark:bg-cyprus-darker p-12">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-sand/10 flex items-center justify-center">
            <Leaf size={18} className="text-sand" strokeWidth={2.5} />
          </div>
          <span className="font-display font-bold text-xl text-sand tracking-tight">
            Nutrition<span className="opacity-50">AI</span>
          </span>
        </div>

        <div>
          <blockquote className="font-display text-4xl font-bold text-sand leading-snug mb-6">
            "Smart nutrition,<br />personalized for you."
          </blockquote>
          <p className="text-sand/60 leading-relaxed max-w-sm">
            Powered by Gemini AI — your meal plans adapt to your goals, tastes, and lifestyle every single week.
          </p>
          <div className="mt-10 flex flex-col gap-4">
            {[
              { stat: '50K+',  label: 'Active Users' },
              { stat: '2M+',   label: 'Meals Planned' },
              { stat: '98%',   label: 'Satisfaction Rate' },
            ].map(({ stat, label }) => (
              <div key={label} className="flex items-center gap-4">
                <span className="font-display text-2xl font-black text-sand">{stat}</span>
                <span className="text-sand/50 text-sm">{label}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-sand/30 text-xs">© 2025 Nutrition AI, Inc.</p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 relative">

        {/* Top bar */}
        <div className="absolute top-6 left-6 right-6 flex items-center justify-between">
          <a
            href="/"
            className="flex items-center gap-1.5 text-sm font-medium text-cyprus/60 dark:text-sand/60 hover:text-cyprus dark:hover:text-sand transition-colors"
          >
            <ArrowLeft size={16} /> Back to home
          </a>
          <ThemeToggle />
        </div>

        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-xl bg-cyprus dark:bg-sand/10 flex items-center justify-center">
              <Leaf size={16} className="text-sand dark:text-sand" strokeWidth={2.5} />
            </div>
            <span className="font-display font-bold text-lg text-cyprus dark:text-sand">
              Nutrition<span className="opacity-50">AI</span>
            </span>
          </div>

          {/* Tab toggle */}
          <div className="flex p-1 bg-sand-dark dark:bg-cyprus-light rounded-xl mb-8 border border-cyprus/8 dark:border-sand/8">
            {[['login', 'Sign In'], ['register', 'Get Started']].map(([t, label]) => (
              <button
                key={t}
                onClick={() => { setTab(t); setError('') }}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  tab === t
                    ? 'bg-white dark:bg-cyprus shadow text-cyprus dark:text-sand'
                    : 'text-cyprus/50 dark:text-sand/50 hover:text-cyprus dark:hover:text-sand'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <h1 className="font-display text-2xl font-bold text-cyprus dark:text-sand mb-1">
            {tab === 'login' ? 'Welcome back' : 'Create your account'}
          </h1>
          <p className="text-sm text-cyprus/50 dark:text-sand/50 mb-7">
            {tab === 'login'
              ? 'Sign in to your personalized nutrition dashboard'
              : 'Start your AI-powered nutrition journey today'}
          </p>

          {error && (
            <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-xs font-bold text-cyprus/60 dark:text-sand/60 uppercase tracking-wider mb-1.5">
                Username
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="your_username"
                required
                className="w-full bg-white dark:bg-cyprus-light border border-cyprus/15 dark:border-sand/15 text-cyprus dark:text-sand placeholder-cyprus/30 dark:placeholder-sand/30 px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyprus/30 dark:focus:ring-sand/30 transition-all"
              />
            </div>

            {/* Email (register only) */}
            {tab === 'register' && (
              <div>
                <label className="block text-xs font-bold text-cyprus/60 dark:text-sand/60 uppercase tracking-wider mb-1.5">
                  Email <span className="normal-case font-normal opacity-60">(optional)</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-white dark:bg-cyprus-light border border-cyprus/15 dark:border-sand/15 text-cyprus dark:text-sand placeholder-cyprus/30 dark:placeholder-sand/30 px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyprus/30 dark:focus:ring-sand/30 transition-all"
                />
              </div>
            )}

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-cyprus/60 dark:text-sand/60 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full bg-white dark:bg-cyprus-light border border-cyprus/15 dark:border-sand/15 text-cyprus dark:text-sand placeholder-cyprus/30 dark:placeholder-sand/30 px-4 py-3 pr-11 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyprus/30 dark:focus:ring-sand/30 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-cyprus/40 dark:text-sand/40 hover:text-cyprus dark:hover:text-sand transition-colors cursor-pointer"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-cyprus dark:bg-sand hover:bg-cyprus-light dark:hover:bg-sand-dark text-sand dark:text-cyprus font-bold text-sm py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <><Loader size={16} className="animate-spin" /> Processing...</>
              ) : tab === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-xs text-cyprus/40 dark:text-sand/40 mt-6">
            {tab === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => { setTab(tab === 'login' ? 'register' : 'login'); setError('') }}
              className="text-cyprus dark:text-sand font-semibold hover:underline cursor-pointer"
            >
              {tab === 'login' ? 'Get Started' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
