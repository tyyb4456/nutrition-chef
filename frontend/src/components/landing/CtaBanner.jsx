import { useState } from 'react'
import { ArrowRight, Zap, Shield, Leaf, Smartphone, CheckCircle } from 'lucide-react'

const trustItems = [
  { Icon: Zap,        label: 'Setup in 2 minutes' },
  { Icon: Shield,     label: 'Privacy first' },
  { Icon: Leaf,       label: 'No diet culture' },
  { Icon: Smartphone, label: 'Any device' },
]

export default function CtaBanner() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (email) setSubmitted(true)
  }

  return (
    <section className="py-24 overflow-hidden relative bg-cyprus dark:bg-cyprus-darker">

      {/* Decorative blobs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-sand/5 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-sand/5 blur-3xl pointer-events-none" />

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(#F0EDE5 1px, transparent 1px), linear-gradient(90deg, #F0EDE5 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">

        <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-sand/50 bg-sand/8 border border-sand/15 px-4 py-1.5 rounded-full mb-7">
          Start Today — It's Free
        </span>

        <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-sand leading-tight mb-5">
          Your Healthiest Life{' '}
          <br className="hidden sm:block" />
          <span className="text-sand/50">Starts Now</span>
        </h2>

        <p className="text-base sm:text-lg text-sand/60 mb-10 max-w-xl mx-auto leading-relaxed">
          Join 50,000+ people who transformed their nutrition with AI. No fad diets, no obsessive calorie counting — just smart, personalized eating that works.
        </p>

        {/* Email form */}
        {!submitted ? (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto mb-7">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="flex-1 bg-sand/8 border border-sand/20 text-sand placeholder-sand/30 px-5 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-sand/30 text-sm transition-all"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 bg-sand hover:bg-sand-dark text-cyprus font-bold text-sm px-7 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] whitespace-nowrap cursor-pointer"
            >
              Get Started Free
              <ArrowRight size={16} strokeWidth={2.5} />
            </button>
          </form>
        ) : (
          <div className="flex justify-center mb-7">
            <div className="inline-flex items-center gap-2.5 bg-sand/10 border border-sand/20 text-sand font-semibold px-6 py-4 rounded-2xl">
              <CheckCircle size={20} className="text-sand/70" />
              You're on the list! Check your inbox.
            </div>
          </div>
        )}

        <p className="text-xs text-sand/35 mb-10">
          No credit card required · Free forever plan available · Cancel anytime
        </p>

        {/* Trust signals */}
        <div className="flex flex-wrap items-center justify-center gap-5 sm:gap-8">
          {trustItems.map(({ Icon, label }) => (
            <div key={label} className="flex items-center gap-2 text-sand/50 text-sm">
              <Icon size={15} strokeWidth={2} />
              <span className="font-medium">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
