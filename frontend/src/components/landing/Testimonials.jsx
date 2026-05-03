import { Star, Quote } from 'lucide-react'
import SectionHeader from '../ui/SectionHeader'

const testimonials = [
  {
    name: 'Sarah K.',   role: 'Fitness Enthusiast',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face',
    stars: 5,
    text: 'I\'ve tried dozens of meal planning apps and nothing comes close. The personalization is insane — it accounts for my schedule and food aversions. Lost 12 lbs in 8 weeks!',
    badge: '12 lbs lost',
  },
  {
    name: 'Marcus T.', role: 'Marathon Runner',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face',
    stars: 5,
    text: 'As an athlete, my nutrition needs are complex. Nutrition AI built a plan that perfectly aligned with my training schedule and carb-cycling protocol. My race times improved significantly.',
    badge: 'PR broken',
  },
  {
    name: 'Priya M.', role: 'Busy Mom of 3',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face',
    stars: 5,
    text: 'The grocery list feature alone is worth it. I used to spend 45 minutes planning meals — now I approve the AI\'s plan in 30 seconds and head to the store with a perfect list.',
    badge: 'Saves 5hrs/week',
  },
  {
    name: 'James R.', role: 'Type 2 Diabetic',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face',
    stars: 5,
    text: 'Managing my blood sugar through diet felt overwhelming until Nutrition AI. It understood my restrictions perfectly. My A1C is the lowest it\'s been in years.',
    badge: 'A1C improved',
  },
  {
    name: 'Elena V.', role: 'Plant-Based Athlete',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=face',
    stars: 5,
    text: 'Finally an app that doesn\'t treat veganism as an afterthought. The plant-based recipes are incredible, and I\'m hitting my protein goals for the first time without constant manual tracking.',
    badge: 'Hit protein goals',
  },
  {
    name: 'David C.', role: 'Software Engineer',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face',
    stars: 5,
    text: 'I barely cook but the AI figured that out and gives me mostly 15-min meals with batch prep on Sundays. My eating is so much healthier and I\'m saving $300/month vs. food delivery.',
    badge: '$300/mo saved',
  },
]

const overallStats = [
  { value: '4.9', sub: '/ 5.0', label: 'Average Rating' },
  { value: '50K+', sub: '', label: 'Active Users' },
  { value: '98%', sub: '', label: 'Recommend' },
]

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-24 bg-sand-dark dark:bg-cyprus-dark overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Real Results"
          title="Loved by Thousands of"
          highlight="Happy Eaters"
          description="From busy parents to elite athletes — Nutrition AI adapts to every lifestyle."
        />

        {/* Overall rating bar */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex flex-wrap items-center gap-8 sm:gap-12 bg-white dark:bg-cyprus-light rounded-2xl border border-cyprus/8 dark:border-sand/8 shadow-sm px-8 py-5">
            {overallStats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="font-display text-3xl font-bold text-cyprus dark:text-sand">
                  {s.value}<span className="text-lg text-cyprus/40 dark:text-sand/40">{s.sub}</span>
                </div>
                <div className="flex justify-center gap-0.5 my-1">
                  {[...Array(5)].map((_, i) => <Star key={i} size={12} className="text-amber-500 fill-amber-500" />)}
                </div>
                <div className="text-xs text-cyprus/50 dark:text-sand/50">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="card-lift bg-white dark:bg-cyprus-light rounded-2xl p-6 border border-cyprus/8 dark:border-sand/8 shadow-sm relative overflow-hidden"
            >
              {/* Quote icon */}
              <div className="absolute top-4 right-5 opacity-6">
                <Quote size={48} className="text-cyprus dark:text-sand" />
              </div>

              {/* Stars */}
              <div className="flex gap-0.5 mb-3">
                {[...Array(t.stars)].map((_, i) => (
                  <Star key={i} size={14} className="text-amber-500 fill-amber-500" />
                ))}
              </div>

              <p className="text-sm text-cyprus/70 dark:text-sand/70 leading-relaxed mb-5">"{t.text}"</p>

              <div className="flex items-center gap-3">
                <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover border-2 border-sand-dark dark:border-cyprus" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-cyprus dark:text-sand">{t.name}</div>
                  <div className="text-xs text-cyprus/50 dark:text-sand/50">{t.role}</div>
                </div>
                <span className="text-xs font-bold bg-cyprus/8 dark:bg-sand/8 text-cyprus dark:text-sand px-2.5 py-1 rounded-full whitespace-nowrap border border-cyprus/10 dark:border-sand/10">
                  {t.badge}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
