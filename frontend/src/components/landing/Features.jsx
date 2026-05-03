import { Brain, Utensils, Camera, TrendingUp, ShoppingCart, RefreshCw, ArrowRight } from 'lucide-react'
import SectionHeader from '../ui/SectionHeader'

const features = [
  {
    Icon:  Brain,
    title: 'AI-Powered Personalization',
    desc:  'Our AI learns your food preferences, dietary restrictions, and health goals to craft a meal plan that\'s uniquely yours — and keeps improving.',
    accent: 'bg-cyprus/8 dark:bg-sand/8 border-cyprus/12 dark:border-sand/12',
    iconBg: 'bg-cyprus dark:bg-sand',
    iconColor: 'text-sand dark:text-cyprus',
  },
  {
    Icon:  Utensils,
    title: 'Smart Meal Planning',
    desc:  'Get a full 7-day meal plan with recipes, ingredient lists, and prep schedules — all optimized for your macros and calorie goals.',
    accent: 'bg-cyprus/8 dark:bg-sand/8 border-cyprus/12 dark:border-sand/12',
    iconBg: 'bg-cyprus dark:bg-sand',
    iconColor: 'text-sand dark:text-cyprus',
  },
  {
    Icon:  Camera,
    title: 'Food Image Analysis',
    desc:  'Snap a photo of any meal and our AI instantly identifies ingredients, estimates calories, and logs it to your daily tracker.',
    accent: 'bg-cyprus/8 dark:bg-sand/8 border-cyprus/12 dark:border-sand/12',
    iconBg: 'bg-cyprus dark:bg-sand',
    iconColor: 'text-sand dark:text-cyprus',
  },
  {
    Icon:  TrendingUp,
    title: 'Progress Tracking',
    desc:  'Visual dashboards show your weekly adherence, macro breakdowns, and trends — with actionable insights to keep you on track.',
    accent: 'bg-cyprus/8 dark:bg-sand/8 border-cyprus/12 dark:border-sand/12',
    iconBg: 'bg-cyprus dark:bg-sand',
    iconColor: 'text-sand dark:text-cyprus',
  },
  {
    Icon:  ShoppingCart,
    title: 'Auto Grocery Lists',
    desc:  'Automatically generate optimized shopping lists from your meal plan, sorted by store section to save time and minimize waste.',
    accent: 'bg-cyprus/8 dark:bg-sand/8 border-cyprus/12 dark:border-sand/12',
    iconBg: 'bg-cyprus dark:bg-sand',
    iconColor: 'text-sand dark:text-cyprus',
  },
  {
    Icon:  RefreshCw,
    title: 'Adaptive Learning',
    desc:  'Rate your meals and the AI continuously improves your plan — finding the perfect balance between nutrition and food you actually love.',
    accent: 'bg-cyprus/8 dark:bg-sand/8 border-cyprus/12 dark:border-sand/12',
    iconBg: 'bg-cyprus dark:bg-sand',
    iconColor: 'text-sand dark:text-cyprus',
  },
]

export default function Features() {
  return (
    <section id="features" className="py-24 bg-sand dark:bg-cyprus">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Why Nutrition AI"
          title="Everything You Need to"
          highlight="Eat Well"
          description="Stop guessing what to eat. Let AI handle the nutrition science while you enjoy delicious, healthy food every single day."
        />

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map(({ Icon, title, desc, accent, iconBg, iconColor }) => (
            <div
              key={title}
              className={`card-lift group relative p-7 rounded-2xl border overflow-hidden cursor-default ${accent}`}
            >
              {/* Decorative corner */}
              <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-cyprus/5 dark:bg-sand/5 group-hover:bg-cyprus/10 dark:group-hover:bg-sand/10 transition-colors duration-300" />

              <div className={`relative inline-flex items-center justify-center w-12 h-12 rounded-xl ${iconBg} shadow-sm mb-5`}>
                <Icon size={20} className={iconColor} strokeWidth={2} />
              </div>

              <h3 className="font-display text-base font-bold text-cyprus dark:text-sand mb-2.5">{title}</h3>
              <p className="text-sm text-cyprus/60 dark:text-sand/60 leading-relaxed">{desc}</p>

              <div className="mt-5 flex items-center gap-1 text-xs font-bold text-cyprus/40 dark:text-sand/40 group-hover:text-cyprus dark:group-hover:text-sand transition-all duration-300 translate-x-0 group-hover:translate-x-1">
                Learn more <ArrowRight size={13} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
