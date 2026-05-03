import { Brain, UtensilsCrossed, Camera, BarChart2, ShoppingCart, RefreshCw } from 'lucide-react'

const features = [
  {
    Icon: Brain,
    title: 'AI-Powered Personalization',
    description: 'Our Gemini AI learns your food preferences, dietary restrictions, and health goals to craft a meal plan that\'s uniquely yours.',
    color: 'from-green-400 to-emerald-600',
    bg: 'bg-green-50',
    border: 'border-green-100',
    iconColor: 'text-white',
  },
  {
    Icon: UtensilsCrossed,
    title: 'Smart Meal Planning',
    description: 'Get a full 7-day meal plan with recipes, ingredient lists, and prep schedules — all optimized for your macros and calorie goals.',
    color: 'from-teal-400 to-cyan-600',
    bg: 'bg-teal-50',
    border: 'border-teal-100',
    iconColor: 'text-white',
  },
  {
    Icon: Camera,
    title: 'Food Image Analysis',
    description: 'Snap a photo of any meal and our AI instantly identifies ingredients, estimates calories, and logs it to your daily tracker.',
    color: 'from-amber-400 to-orange-500',
    bg: 'bg-amber-50',
    border: 'border-amber-100',
    iconColor: 'text-white',
  },
  {
    Icon: BarChart2,
    title: 'Progress Tracking',
    description: 'Visual dashboards show your weekly adherence, macro breakdowns, and trends — with actionable insights to keep you on track.',
    color: 'from-purple-400 to-violet-600',
    bg: 'bg-purple-50',
    border: 'border-purple-100',
    iconColor: 'text-white',
  },
  {
    Icon: ShoppingCart,
    title: 'Auto Grocery Lists',
    description: 'Automatically generate optimized shopping lists from your meal plan, sorted by store section to save you time and money.',
    color: 'from-lime-400 to-green-500',
    bg: 'bg-lime-50',
    border: 'border-lime-100',
    iconColor: 'text-white',
  },
  {
    Icon: RefreshCw,
    title: 'Adaptive Learning',
    description: 'Rate your meals and the AI continuously improves your plan — finding the perfect balance between nutrition and meals you love.',
    color: 'from-rose-400 to-pink-600',
    bg: 'bg-rose-50',
    border: 'border-rose-100',
    iconColor: 'text-white',
  },
]

export default function Features() {
  return (
    <section id="features" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-green-600 bg-green-100 px-4 py-1.5 rounded-full mb-4">
            Why Nutrition AI
          </span>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Everything You Need to{' '}
            <span className="gradient-text">Eat Well</span>
          </h2>
          <p className="text-lg text-gray-500 leading-relaxed">
            Stop guessing what to eat. Let AI handle the nutrition science while you enjoy delicious, healthy food every day.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(({ Icon, title, description, color, bg, border, iconColor }) => (
            <div
              key={title}
              className={`card-lift group relative p-7 rounded-2xl border ${border} ${bg} overflow-hidden cursor-default`}
            >
              {/* Decorative bg circle */}
              <div className={`absolute -top-8 -right-8 w-32 h-32 rounded-full bg-linear-to-br ${color} opacity-10 group-hover:opacity-20 transition-opacity duration-300`} />

              <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-linear-to-br ${color} shadow-md mb-5`}>
                <Icon className={`w-6 h-6 ${iconColor}`} strokeWidth={1.75} />
              </div>
              <h3 className="font-display text-lg font-bold text-gray-900 mb-3">{title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{description}</p>

              {/* Hover arrow */}
              <div className="mt-5 flex items-center gap-1 text-sm font-semibold text-green-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -translate-x-2 group-hover:translate-x-0">
                Learn more
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}