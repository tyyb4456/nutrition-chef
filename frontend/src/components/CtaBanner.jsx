import { useState } from 'react'
import { Apple, Carrot, Leaf, Cherry, Grape, Zap, Lock, Sprout, Smartphone, Sparkles } from "lucide-react"


export default function CtaBanner() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (email) {
      setSubmitted(true)
    }
  }

  return (
    <section className="py-24 overflow-hidden relative">
      {/* Background */}
      <div className="absolute inset-0 bg-linear-to-br from-green-600 via-emerald-600 to-teal-700" />
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-white blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-lime-300 blur-3xl" />
      </div>

      {/* Floating food icon decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
        {[
          { Icon: Leaf, top: '10%', left: '5%', size: 'w-10 h-10', delay: '0s' },
          { Icon: Apple, top: '20%', right: '8%', size: 'w-8 h-8', delay: '1s' },
          { Icon: Sprout, bottom: '15%', left: '10%', size: 'w-8 h-8', delay: '0.5s' },
          { Icon: Grape, bottom: '20%', right: '6%', size: 'w-10 h-10', delay: '1.5s' },
          { Icon: Cherry, top: '50%', left: '2%', size: 'w-6 h-6', delay: '0.8s' },
          { Icon: Carrot, top: '60%', right: '3%', size: 'w-6 h-6', delay: '1.2s' },
        ].map(({ Icon, size, delay, ...pos }, i) => (
          <Icon
            key={i}
            className={`absolute ${size} opacity-20 text-white`}
            style={{ ...pos, animation: `float 4s ease-in-out ${delay} infinite` }}
          />
        ))}
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <span className="inline-block text-xs font-bold uppercase tracking-widest text-green-200 bg-white/10 px-4 py-1.5 rounded-full mb-6">
          Start Today — It's Free
        </span>

        <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
          Your Healthiest Life{' '}
          <span className="text-lime-300">Starts Now</span>
        </h2>

        <p className="text-lg sm:text-xl text-green-100 mb-10 max-w-2xl mx-auto leading-relaxed">
          Join 50,000+ people who transformed their nutrition with AI. No fad diets, no calorie obsession — just smart, personalized eating that works.
        </p>

        {/* Email form */}
        {!submitted ? (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto mb-6">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
              className="flex-1 bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-green-200 px-5 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-transparent transition-all text-sm"
            />
            <button
              type="submit"
              className="bg-white hover:bg-green-50 text-green-700 font-bold text-sm px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 whitespace-nowrap"
            >
              Get Started Free →
            </button>
          </form>
        ) : (
          <div className="flex flex-col items-center gap-2 mb-6">
            <div className="inline-flex items-center gap-2 bg-white/20 text-white font-semibold px-6 py-4 rounded-2xl backdrop-blur-sm">
              <Sparkles className="w-5 h-5" />
              You're on the list! Check your inbox.
            </div>
          </div>
        )}

        <p className="text-xs text-green-200 mb-10">
          No credit card required · Free forever plan available · Cancel anytime
        </p>

        {/* Social proof row */}
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
          {[
            { Icon: Zap, label: 'Setup in 2 minutes' },
            { Icon: Lock, label: 'Privacy first' },
            { Icon: Sprout, label: 'No diet culture' },
            { Icon: Smartphone, label: 'Works on any device' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2 text-white/80 text-sm">
              <item.Icon className="w-4 h-4" />
              <span className="font-medium">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}