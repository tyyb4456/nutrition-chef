import { useState } from 'react'
import { Check, X } from 'lucide-react'
import SectionHeader from '../ui/SectionHeader'
import Button from '../ui/Button'
import Badge from '../ui/Badge'

const plans = [
  {
    name: 'Starter',
    price: { monthly: 0, annual: 0 },
    description: 'Perfect for exploring AI nutrition.',
    badge: null,
    highlight: false,
    cta: 'Get Started Free',
    features: [
      '7-day AI meal plan (1×/month)',
      'Basic nutrition tracking',
      'Access to 50 recipes',
      'Grocery list generation',
      'Email support',
    ],
    missing: ['Daily plan regeneration', 'Food photo analysis', 'Progress analytics'],
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
      'Biomarker integration',
      'Custom recipe creation',
      'Family plans (up to 5)',
      'Advanced analytics',
      '1-on-1 onboarding call',
      'Dedicated account manager',
    ],
    missing: [],
  },
]

export default function Pricing() {
  const [annual, setAnnual] = useState(true)

  return (
    <section id="pricing" className="py-24 bg-sand dark:bg-cyprus">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Pricing"
          title="Simple, Transparent"
          highlight="Pricing"
          description="Start free, upgrade anytime. No hidden fees, cancel anytime."
        />

        {/* Toggle */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex items-center p-1 rounded-full bg-sand-dark dark:bg-cyprus-light border border-cyprus/10 dark:border-sand/10">
            {[false, true].map((isAnnual) => (
              <button
                key={String(isAnnual)}
                onClick={() => setAnnual(isAnnual)}
                className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  annual === isAnnual
                    ? 'bg-cyprus dark:bg-sand text-sand dark:text-cyprus shadow'
                    : 'text-cyprus/60 dark:text-sand/60 hover:text-cyprus dark:hover:text-sand'
                }`}
              >
                {isAnnual ? 'Annual' : 'Monthly'}
                {isAnnual && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    annual ? 'bg-sand/20 text-sand dark:bg-cyprus/20 dark:text-cyprus' : 'bg-cyprus/10 text-cyprus dark:bg-sand/10 dark:text-sand'
                  }`}>
                    Save 25%
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-5 lg:gap-7 items-start">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-3xl overflow-hidden transition-all duration-300 ${
                plan.highlight
                  ? 'bg-cyprus dark:bg-sand shadow-2xl shadow-cyprus/20 dark:shadow-sand/10 md:scale-105 z-10'
                  : 'bg-white dark:bg-cyprus-light border border-cyprus/10 dark:border-sand/10 shadow-sm hover:shadow-md'
              }`}
            >
              {plan.badge && (
                <div className={`absolute top-0 left-1/2 -translate-x-1/2 px-4 py-1 text-[10px] font-bold uppercase tracking-widest rounded-b-xl ${
                  plan.highlight ? 'bg-sand/15 text-sand' : 'bg-cyprus text-sand'
                }`}>
                  {plan.badge}
                </div>
              )}

              <div className="p-7 pt-10">
                <h3 className={`font-display text-xl font-bold mb-1 ${plan.highlight ? 'text-sand' : 'text-cyprus dark:text-sand'}`}>
                  {plan.name}
                </h3>
                <p className={`text-sm mb-6 ${plan.highlight ? 'text-sand/60' : 'text-cyprus/50 dark:text-sand/50'}`}>
                  {plan.description}
                </p>

                <div className="mb-6">
                  <div className="flex items-end gap-1">
                    <span className={`font-display text-5xl font-black ${plan.highlight ? 'text-sand' : 'text-cyprus dark:text-sand'}`}>
                      ${annual ? plan.price.annual : plan.price.monthly}
                    </span>
                    {plan.price.monthly > 0 && (
                      <span className={`text-sm pb-2 ${plan.highlight ? 'text-sand/50' : 'text-cyprus/40 dark:text-sand/40'}`}>/mo</span>
                    )}
                  </div>
                  {annual && plan.price.monthly > 0 && (
                    <p className={`text-xs mt-0.5 ${plan.highlight ? 'text-sand/50' : 'text-cyprus/40 dark:text-sand/40'}`}>
                      Billed annually · Save ${(plan.price.monthly - plan.price.annual) * 12}/yr
                    </p>
                  )}
                </div>

                {plan.highlight ? (
                  <Button href="#" variant="sand" className="w-full justify-center mb-7">
                    {plan.cta}
                  </Button>
                ) : (
                  <Button href="#" variant="primary" className="w-full justify-center mb-7">
                    {plan.cta}
                  </Button>
                )}

                <ul className="space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5">
                      <Check size={16} strokeWidth={2.5} className={`shrink-0 mt-0.5 ${plan.highlight ? 'text-sand/70' : 'text-cyprus dark:text-sand'}`} />
                      <span className={`text-sm ${plan.highlight ? 'text-sand/80' : 'text-cyprus/80 dark:text-sand/80'}`}>{f}</span>
                    </li>
                  ))}
                  {plan.missing.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 opacity-35">
                      <X size={16} strokeWidth={2} className="shrink-0 mt-0.5 text-current" />
                      <span className="text-sm">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center mt-10 text-sm text-cyprus/40 dark:text-sand/40">
          🔒 &nbsp;Secure payment · No credit card required for free plan · Cancel anytime
        </p>
      </div>
    </section>
  )
}
