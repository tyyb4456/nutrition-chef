import { useState } from 'react'

const plans = [
  {
    name: 'Starter',
    price: { monthly: 0, annual: 0 },
    description: 'Perfect for exploring AI nutrition.',
    badge: null,
    highlight: false,
    cta: 'Get Started Free',
    features: [
      '7-day AI meal plan (1x/month)',
      'Basic nutrition tracking',
      'Access to 50 recipes',
      'Grocery list generation',
      'Email support',
    ],
    missing: [
      'Daily plan regeneration',
      'Food photo analysis',
      'Progress analytics',
    ],
  },
  {
    name: 'Pro',
    price: { monthly: 12, annual: 9 },
    description: 'The full AI nutrition experience.',
    badge: 'Most Popular',
    highlight: true,
    cta: 'Start 14-Day Free Trial',
    features: [
      'Unlimited AI meal plans',
      'Full nutrition & macro tracking',
      '500+ premium recipes',
      'Food photo analysis',
      'Weekly progress reports',
      'Smart grocery lists',
      'Priority support',
    ],
    missing: [],
  },
  {
    name: 'Premium',
    price: { monthly: 29, annual: 22 },
    description: 'For serious health transformation.',
    badge: 'Best Value',
    highlight: false,
    cta: 'Start 14-Day Free Trial',
    features: [
      'Everything in Pro',
      'AI personal nutrition coach',
      'Blood work & biomarker integration',
      'Custom recipe creation',
      'Family plans (up to 5 members)',
      'Advanced analytics & insights',
      '1-on-1 onboarding call',
      'Dedicated account manager',
    ],
    missing: [],
  },
]

export default function Pricing() {
  const [annual, setAnnual] = useState(true)

  return (
    <section id="pricing" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-green-600 bg-green-100 px-4 py-1.5 rounded-full mb-4">
            Pricing
          </span>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Simple, Transparent{' '}
            <span className="gradient-text">Pricing</span>
          </h2>
          <p className="text-lg text-gray-500 mb-8">
            Start free, upgrade anytime. No hidden fees, cancel anytime.
          </p>

          {/* Toggle */}
          <div className="inline-flex items-center gap-3 bg-gray-100 p-1 rounded-full">
            <button
              onClick={() => setAnnual(false)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                !annual ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                annual ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Annual
              <span className="text-xs font-bold bg-green-500 text-white px-2 py-0.5 rounded-full">Save 25%</span>
            </button>
          </div>
        </div>

        {/* Plan Cards */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 items-start">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-3xl overflow-hidden transition-all duration-300 ${
                plan.highlight
                  ? 'bg-linear-to-b from-green-500 to-emerald-700 text-white shadow-2xl shadow-green-200 scale-105 z-10'
                  : 'bg-white border border-gray-200 shadow-sm hover:shadow-lg'
              }`}
            >
              {plan.badge && (
                <div className={`absolute top-0 left-1/2 -translate-x-1/2 px-4 py-1 text-xs font-bold uppercase tracking-widest rounded-b-xl ${
                  plan.highlight ? 'bg-white/20 text-white' : 'bg-green-500 text-white'
                }`}>
                  {plan.badge}
                </div>
              )}

              <div className="p-7 pt-10">
                <h3 className={`font-display text-xl font-bold mb-1 ${plan.highlight ? 'text-white' : 'text-gray-900'}`}>
                  {plan.name}
                </h3>
                <p className={`text-sm mb-6 ${plan.highlight ? 'text-green-100' : 'text-gray-500'}`}>
                  {plan.description}
                </p>

                <div className="mb-6">
                  <div className="flex items-end gap-1">
                    <span className={`font-display text-5xl font-black ${plan.highlight ? 'text-white' : 'text-gray-900'}`}>
                      ${annual ? plan.price.annual : plan.price.monthly}
                    </span>
                    {(plan.price.monthly > 0) && (
                      <span className={`text-sm pb-2 ${plan.highlight ? 'text-green-100' : 'text-gray-500'}`}>
                        /mo
                      </span>
                    )}
                  </div>
                  {annual && plan.price.monthly > 0 && (
                    <p className={`text-xs ${plan.highlight ? 'text-green-100' : 'text-gray-400'}`}>
                      Billed annually · Save ${(plan.price.monthly - plan.price.annual) * 12}/yr
                    </p>
                  )}
                </div>

                <a
                  href="#"
                  className={`block text-center font-bold text-sm py-3.5 rounded-2xl transition-all duration-300 mb-7 ${
                    plan.highlight
                      ? 'bg-white text-green-700 hover:bg-green-50 shadow-md'
                      : 'bg-green-500 hover:bg-green-600 text-white shadow-md hover:shadow-green-200'
                  }`}
                >
                  {plan.cta}
                </a>

                <ul className="space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5">
                      <svg className={`w-5 h-5 shrink-0 mt-0.5 ${plan.highlight ? 'text-green-200' : 'text-green-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      <span className={`text-sm ${plan.highlight ? 'text-white' : 'text-gray-700'}`}>{f}</span>
                    </li>
                  ))}
                  {plan.missing.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 opacity-40">
                      <svg className="w-5 h-5 shrink-0 mt-0.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <span className="text-sm text-gray-500">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Trust line */}
        <div className="text-center mt-10 text-sm text-gray-400">
          🔒 Secure payment · No credit card required for free plan · Cancel anytime
        </div>

      </div>
    </section>
  )
}
