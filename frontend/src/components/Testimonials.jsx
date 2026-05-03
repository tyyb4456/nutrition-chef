const testimonials = [
  {
    name: 'Sarah K.',
    role: 'Fitness Enthusiast',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face',
    stars: 5,
    text: 'I\'ve tried dozens of meal planning apps and nothing comes close to Nutrition AI. The personalization is insane — it actually accounts for my schedule and food aversions. Lost 12 lbs in 8 weeks!',
    badge: '12 lbs lost',
    badgeColor: 'bg-green-100 text-green-700',
  },
  {
    name: 'Marcus T.',
    role: 'Marathon Runner',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face',
    stars: 5,
    text: 'As an athlete, my nutrition needs are complex. Nutrition AI built a plan that perfectly aligned with my training schedule and carb-cycling protocol. My race performance improved significantly.',
    badge: 'PR broken',
    badgeColor: 'bg-blue-100 text-blue-700',
  },
  {
    name: 'Priya M.',
    role: 'Busy Mom of 3',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face',
    stars: 5,
    text: 'The grocery list feature alone is worth it. I used to spend 45 minutes planning meals — now I just approve the AI\'s plan in 30 seconds and head to the store with a perfect list. Game changer.',
    badge: 'Saves 5hrs/week',
    badgeColor: 'bg-amber-100 text-amber-700',
  },
  {
    name: 'James R.',
    role: 'Type 2 Diabetic',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face',
    stars: 5,
    text: 'Managing my blood sugar through diet felt overwhelming until Nutrition AI. It understood my restrictions perfectly and the variety of meals keeps me from getting bored. My A1C is the lowest it\'s been in years.',
    badge: 'A1C improved',
    badgeColor: 'bg-purple-100 text-purple-700',
  },
  {
    name: 'Elena V.',
    role: 'Vegan & Plant-Based',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=face',
    stars: 5,
    text: 'Finally a nutrition app that doesn\'t treat veganism as an afterthought. The plant-based recipes are incredible, and I\'m hitting my protein goals for the first time without constantly tracking manually.',
    badge: 'Hit protein goals',
    badgeColor: 'bg-teal-100 text-teal-700',
  },
  {
    name: 'David C.',
    role: 'Software Engineer',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face',
    stars: 5,
    text: 'I barely cook but the AI figured that out and gives me mostly 15-min meals with batch prep on Sundays. My eating is so much healthier and I\'m saving $300/month vs. food delivery.',
    badge: '$300/mo saved',
    badgeColor: 'bg-rose-100 text-rose-700',
  },
]

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-24 bg-gray-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-green-600 bg-green-100 px-4 py-1.5 rounded-full mb-4">
            Real Results
          </span>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Loved by Thousands of{' '}
            <span className="gradient-text">Happy Eaters</span>
          </h2>
          <p className="text-lg text-gray-500">
            From busy parents to elite athletes — Nutrition AI adapts to every lifestyle.
          </p>
        </div>

        {/* Overall rating */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex flex-wrap items-center gap-6 bg-white rounded-2xl shadow-sm border border-green-100 px-8 py-5">
            <div className="text-center">
              <div className="font-display text-4xl font-black text-gray-900">4.9</div>
              <div className="flex text-amber-400 justify-center text-lg">★★★★★</div>
              <div className="text-xs text-gray-500 mt-0.5">Average Rating</div>
            </div>
            <div className="w-px h-12 bg-gray-200 hidden sm:block" />
            <div className="text-center">
              <div className="font-display text-4xl font-black text-gray-900">50K+</div>
              <div className="text-xs text-gray-500 mt-1">Active Users</div>
            </div>
            <div className="w-px h-12 bg-gray-200 hidden sm:block" />
            <div className="text-center">
              <div className="font-display text-4xl font-black text-gray-900">98%</div>
              <div className="text-xs text-gray-500 mt-1">Recommend</div>
            </div>
          </div>
        </div>

        {/* Testimonial Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="card-lift bg-white rounded-2xl p-6 border border-gray-100 shadow-sm relative"
            >
              {/* Quote mark */}
              <div className="absolute top-5 right-6 text-5xl text-green-100 font-serif leading-none select-none">"</div>

              {/* Stars */}
              <div className="flex text-amber-400 text-sm mb-3">
                {'★'.repeat(t.stars)}
              </div>

              <p className="text-sm text-gray-600 leading-relaxed mb-5">"{t.text}"</p>

              <div className="flex items-center gap-3">
                <img src={t.avatar} alt={t.name} className="w-11 h-11 rounded-full object-cover border-2 border-green-100" />
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm text-gray-900">{t.name}</div>
                  <div className="text-xs text-gray-500">{t.role}</div>
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${t.badgeColor} whitespace-nowrap`}>
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
