import { UserCircle, Bot, ShoppingCart, Target } from 'lucide-react'

const steps = [
  {
    number: '01',
    Icon: UserCircle,
    title: 'Tell Us About You',
    description: 'Share your dietary preferences, allergies, health goals, and activity level in a quick 2-minute onboarding.',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=400&fit=crop',
    tag: 'Setup in 2 minutes',
  },
  {
    number: '02',
    Icon: Bot,
    title: 'AI Crafts Your Plan',
    description: 'Our AI analyzes your profile and generates a personalized 7-day meal plan with full recipes and macros.',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500&h=400&fit=crop',
    tag: 'Instant generation',
  },
  {
    number: '03',
    Icon: ShoppingCart,
    title: 'Shop with Ease',
    description: 'Get a smart grocery list organized by category. Know exactly what to buy and how much — zero food waste.',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&h=400&fit=crop',
    tag: 'Save time & money',
  },
  {
    number: '04',
    Icon: Target,
    title: 'Track & Improve',
    description: 'Log meals with a photo, rate dishes, and watch the AI refine your plan week by week for even better results.',
    image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=500&h=400&fit=crop',
    tag: 'Continuous improvement',
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-gray-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-20">
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-green-600 bg-green-100 px-4 py-1.5 rounded-full mb-4">
            How It Works
          </span>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            From Profile to Plate{' '}
            <span className="gradient-text">in Minutes</span>
          </h2>
          <p className="text-lg text-gray-500">
            Four simple steps to your healthiest, most delicious lifestyle yet.
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-20">
          {steps.map((step, idx) => {
            const isEven = idx % 2 === 0
            const { Icon } = step
            return (
              <div
                key={step.number}
                className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-12 lg:gap-20`}
              >
                {/* Text Side */}
                <div className="flex-1 max-w-lg">
                  <div className="flex items-center gap-4 mb-5">
                    <span className="font-display text-7xl font-black text-green-100 leading-none select-none">
                      {step.number}
                    </span>
                    <div className="w-14 h-14 rounded-2xl bg-white shadow-md border border-green-100 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-green-500" strokeWidth={1.75} />
                    </div>
                  </div>
                  <span className="inline-block text-xs font-bold text-green-600 bg-green-100 px-3 py-1 rounded-full mb-3">
                    {step.tag}
                  </span>
                  <h3 className="font-display text-2xl sm:text-3xl font-bold text-gray-900 mb-4">{step.title}</h3>
                  <p className="text-base text-gray-500 leading-relaxed">{step.description}</p>

                  <div className="mt-6 flex items-center gap-2 text-sm font-medium text-green-600">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    Fully automated
                  </div>
                </div>

                {/* Image Side */}
                <div className="flex-1 w-full max-w-md">
                  <div className="relative">
                    <div className={`absolute inset-0 rounded-3xl bg-linear-to-br from-green-200 to-emerald-300 ${isEven ? 'translate-x-4 translate-y-4' : '-translate-x-4 translate-y-4'}`} />
                    <img
                      src={step.image}
                      alt={step.title}
                      className="relative rounded-3xl w-full h-64 sm:h-80 object-cover shadow-xl"
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

      </div>
    </section>
  )
}