import { useState, useEffect } from 'react'
import { Leaf, Zap, Target, Salad, Drumstick, Grape, Wheat, ArrowRight, Play, Sparkles } from 'lucide-react'

const stats = [
  { value: '50K+', label: 'Active Users' },
  { value: '2M+', label: 'Meals Planned' },
  { value: '4.9★', label: 'App Rating' },
]

const badges = [
  { Icon: Leaf, label: 'Personalized Plans' },
  { Icon: Zap, label: 'AI-Powered' },
  { Icon: Target, label: 'Goal-Oriented' },
]

const mealTags = [
  { Icon: Salad, label: 'Salads', bg: 'bg-green-100', text: 'text-green-700' },
  { Icon: Drumstick, label: 'Protein', bg: 'bg-amber-100', text: 'text-amber-700' },
  { Icon: Grape, label: 'Smoothies', bg: 'bg-purple-100', text: 'text-purple-700' },
  { Icon: Wheat, label: 'Whole Grains', bg: 'bg-yellow-100', text: 'text-yellow-700' },
]

export default function Hero() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100)
    return () => clearTimeout(t)
  }, [])

  return (
    <section className="hero-gradient min-h-screen flex items-center pt-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* LEFT COLUMN */}
          <div
            className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          >
            {/* Badge row */}
            <div className="flex flex-wrap gap-2 mb-6">
              {badges.map((b) => (
                <span key={b.label} className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white border border-green-200 text-green-700 px-3 py-1.5 rounded-full shadow-sm">
                  <b.Icon className="w-3.5 h-3.5" />
                  {b.label}
                </span>
              ))}
            </div>

            {/* Headline */}
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight text-gray-900 mb-6">
              Eat Smarter,{' '}
              <span className="gradient-text block">Feel Better</span>
              Every Day
            </h1>

            <p className="text-lg sm:text-xl text-gray-500 leading-relaxed mb-8 max-w-lg">
              Your personal AI nutritionist that creates customized meal plans, tracks your goals, and adapts to your taste — so healthy eating finally feels effortless.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 mb-10">
              <a
                href="#pricing"
                className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold text-base px-8 py-4 rounded-full shadow-lg hover:shadow-green-300/50 transition-all duration-300 hover:scale-105"
              >
                Start Free Today
                <ArrowRight className="w-5 h-5" />
              </a>
              <a
                href="#how-it-works"
                className="inline-flex items-center gap-2 bg-white border-2 border-green-200 hover:border-green-400 text-gray-700 font-semibold text-base px-8 py-4 rounded-full shadow-sm hover:shadow-md transition-all duration-300"
              >
                <Play className="w-5 h-5 text-green-500 fill-current" />
                See How It Works
              </a>
            </div>

            {/* Social Proof */}
            <div className="flex items-center gap-4 mb-10">
              <div className="flex -space-x-2">
                {['https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&h=40&fit=crop&crop=face',
                  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face',
                  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face',
                  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
                ].map((src, i) => (
                  <img key={i} src={src} alt="" className="w-9 h-9 rounded-full border-2 border-white object-cover shadow-sm" />
                ))}
              </div>
              <div>
                <div className="flex text-amber-400 text-sm">★★★★★</div>
                <p className="text-sm text-gray-500">Loved by <span className="font-semibold text-gray-700">50,000+</span> health-focused people</p>
              </div>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-6">
              {stats.map((s) => (
                <div key={s.label} className="text-center">
                  <div className="font-display text-2xl font-bold text-green-600">{s.value}</div>
                  <div className="text-xs text-gray-500 font-medium">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT COLUMN — visual */}
          <div
            className={`relative flex justify-center transition-all duration-700 delay-200 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          >
            {/* Decorative blobs */}
            <div className="absolute -top-12 -right-12 w-72 h-72 bg-green-200 rounded-full opacity-30 blur-3xl" />
            <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-lime-200 rounded-full opacity-30 blur-3xl" />

            {/* Main food image */}
            <div className="relative z-10 animate-float">
              <div className="w-80 h-80 sm:w-96 sm:h-96 rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
                <img
                  src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&h=600&fit=crop"
                  alt="Healthy meal bowl"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Floating card — Nutrition info */}
              <div className="absolute -left-10 sm:-left-16 top-8 bg-white rounded-2xl shadow-xl p-4 border border-green-100 w-40">
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Today's Plan</div>
                <div className="space-y-1.5">
                  {[
                    { label: 'Calories', val: '1,840', color: 'bg-green-400' },
                    { label: 'Protein', val: '120g', color: 'bg-blue-400' },
                    { label: 'Carbs', val: '210g', color: 'bg-amber-400' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${item.color}`} />
                      <span className="text-xs text-gray-600">{item.label}</span>
                      <span className="text-xs font-bold text-gray-900 ml-auto">{item.val}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Floating card — AI badge */}
              <div className="absolute -right-6 sm:-right-12 bottom-12 bg-white rounded-2xl shadow-xl px-4 py-3 border border-green-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-linear-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white shadow">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-900">AI Suggestion</div>
                  <div className="text-xs text-green-600 font-medium">Plan updated ✓</div>
                </div>
              </div>

              {/* Meal type tags */}
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                {mealTags.map((tag) => (
                  <div key={tag.label} className={`${tag.bg} ${tag.text} rounded-full px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5 shadow-sm whitespace-nowrap`}>
                    <tag.Icon className="w-3.5 h-3.5" />
                    {tag.label}
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Wave bottom */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 80L60 69.3C120 59 240 37 360 32C480 27 600 37 720 42.7C840 48 960 48 1080 42.7C1200 37 1320 27 1380 21.3L1440 16V80H0Z" fill="white" />
        </svg>
      </div>
    </section>
  )
}