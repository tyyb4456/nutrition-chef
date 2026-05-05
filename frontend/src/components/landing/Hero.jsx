import { useEffect, useState } from 'react'
import { ArrowRight, Play, Zap, Target, Leaf } from 'lucide-react'
import Button from '../ui/Button'

const badges = [
  { icon: Zap, label: 'AI-Powered' },
  { icon: Target, label: 'Goal-Oriented' },
  { icon: Leaf, label: 'Personalized' },
]

const macros = [
  { label: 'Calories', val: '1,840', dot: 'bg-cyprus dark:bg-sand' },
  { label: 'Protein', val: '120g', dot: 'bg-cyprus/60 dark:bg-sand/60' },
  { label: 'Carbs', val: '210g', dot: 'bg-cyprus/40 dark:bg-sand/40' },
]

export default function Hero() {
  const [visible, setVisible] = useState(false)
  useEffect(() => { const t = setTimeout(() => setVisible(true), 80); return () => clearTimeout(t) }, [])

  return (
    <section className="hero-bg min-h-screen flex items-center pt-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* ── LEFT ── */}
          <div className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>

            {/* Badge strip */}
            <div className="flex flex-wrap gap-2 mb-7">
              {badges.map(({ icon: Icon, label }) => (
                <span key={label} className="inline-flex items-center gap-1.5 text-xs font-semibold border border-cyprus/20 dark:border-sand/20 bg-white/60 dark:bg-cyprus-light/60 text-cyprus dark:text-sand px-3 py-1.5 rounded-full backdrop-blur-sm">
                  <Icon size={12} strokeWidth={2.5} />
                  {label}
                </span>
              ))}
            </div>

            {/* Headline */}
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] text-cyprus dark:text-sand mb-6">
              Eat Smarter,
              <span className="block gradient-text">Feel Better</span>
              Every Day
            </h1>

            <p className="text-lg text-cyprus/60 dark:text-sand/60 leading-relaxed mb-9 max-w-lg">
              Your personal AI nutritionist that creates customized meal plans, tracks your goals, and adapts to your taste — so healthy eating finally feels effortless.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4">
              <Button href="#pricing" size="lg">
                Start Free Today
                <ArrowRight size={18} strokeWidth={2.5} />
              </Button>
              <Button href="#how-it-works" variant="outline" size="lg">
                <Play size={16} strokeWidth={2.5} className="fill-current" />
                See How It Works
              </Button>
            </div>
          </div>

          {/* ── RIGHT ── */}
          <div className={`relative flex justify-center transition-all duration-700 delay-200 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>

            {/* Blobs */}
            <div className="absolute -top-16 -right-16 w-80 h-80 rounded-full bg-cyprus/10 dark:bg-sand/10 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-cyprus/8 dark:bg-sand/8 blur-3xl pointer-events-none" />

            {/* Main image */}
            <div className="relative z-10 animate-float">
              <div className="w-72 h-72 sm:w-88 sm:h-88 lg:w-96 lg:h-96 rounded-3xl overflow-hidden shadow-2xl border-4 border-white dark:border-cyprus-light">
                <img
                  src="pexels-szymon-shields-1503561-33033817.jpg"
                  alt="Healthy meal bowl"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Floating — nutrition card */}
              <div className="absolute -left-30 sm:-left-25 top-10 bg-sand dark:bg-cyprus-light rounded-2xl shadow-xl p-4 border border-cyprus/10 dark:border-sand/10 w-44 backdrop-blur-sm">
                <div className="text-[10px] font-bold uppercase tracking-wider text-cyprus/50 dark:text-sand/50 mb-2.5">Today's Plan</div>
                <div className="space-y-2">
                  {macros.map((m) => (
                    <div key={m.label} className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full shrink-0 ${m.dot}`} />
                      <span className="text-xs text-cyprus/70 dark:text-sand/70">{m.label}</span>
                      <span className="text-xs font-bold text-cyprus dark:text-sand ml-auto">{m.val}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Floating — AI badge */}
              <div className="absolute -right-16 sm:-right-20 bottom-14 bg-sand dark:bg-cyprus-light rounded-2xl shadow-xl px-4 py-3 border border-cyprus/10 dark:border-sand/10 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyprus dark:bg-sand flex items-center justify-center shrink-0">
                  <Leaf size={18} className="text-sand dark:text-cyprus" />
                </div>
                <div>
                  <div className="text-xs font-bold text-cyprus dark:text-sand whitespace-nowrap">AI Suggestion</div>
                  <div className="text-xs text-cyprus/60 dark:text-sand/60 flex items-center gap-1">
                    Plan updated <span className="text-[10px]">✓</span>
                  </div>
                </div>
              </div>

              {/* Streak pill */}
              <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-cyprus dark:bg-sand text-sand dark:text-cyprus text-xs font-bold px-4 py-2 rounded-full shadow-lg flex items-center gap-1.5 whitespace-nowrap">
                <Zap size={12} className="fill-current" />
                14-day streak — keep going!
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Wave */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
        <svg viewBox="0 0 1440 72" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0 72L60 62C120 53 240 33 360 28C480 24 600 33 720 38C840 43 960 43 1080 38C1200 33 1320 24 1380 19L1440 14V72H0Z" className="fill-sand dark:fill-cyprus" />
        </svg>
      </div>
    </section>
  )
}