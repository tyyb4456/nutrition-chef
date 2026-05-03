import { User, Bot, ShoppingBag, BarChart2 } from 'lucide-react'
import SectionHeader from '../ui/SectionHeader'
import Badge from '../ui/Badge'

const steps = [
  {
    number: '01',
    Icon:   User,
    title:  'Tell Us About You',
    desc:   'Share your dietary preferences, allergies, health goals, and activity level in a quick 2-minute onboarding. The more you share, the smarter your plan.',
    image:  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=520&h=400&fit=crop',
    tag:    'Setup in 2 minutes',
  },
  {
    number: '02',
    Icon:   Bot,
    title:  'AI Crafts Your Plan',
    desc:   'Our AI analyzes your profile and generates a personalized 7-day meal plan complete with full recipes, macros, and prep tips — in seconds.',
    image:  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=520&h=400&fit=crop',
    tag:    'Instant generation',
  },
  {
    number: '03',
    Icon:   ShoppingBag,
    title:  'Shop With Ease',
    desc:   'Get a smart grocery list organized by category. Know exactly what to buy and how much — zero food waste, zero decision fatigue.',
    image:  'https://images.unsplash.com/photo-1542838132-92c53300491e?w=520&h=400&fit=crop',
    tag:    'Save time & money',
  },
  {
    number: '04',
    Icon:   BarChart2,
    title:  'Track & Improve',
    desc:   'Log meals with a photo, rate dishes you love (or don\'t), and watch the AI refine your plan week by week for even better results.',
    image:  'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=520&h=400&fit=crop',
    tag:    'Continuous improvement',
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-sand-dark dark:bg-cyprus-dark overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="How It Works"
          title="From Profile to Plate"
          highlight="in Minutes"
          description="Four simple steps to your healthiest, most delicious lifestyle yet."
        />

        <div className="space-y-20 lg:space-y-28">
          {steps.map(({ number, Icon, title, desc, image, tag }, idx) => {
            const isEven = idx % 2 === 0
            return (
              <div
                key={number}
                className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-10 lg:gap-20`}
              >
                {/* Text */}
                <div className="flex-1 max-w-lg">
                  <div className="flex items-end gap-3 mb-5">
                    <span className="font-display text-8xl font-black leading-none text-cyprus/8 dark:text-sand/8 select-none">
                      {number}
                    </span>
                    <div className="mb-2 w-12 h-12 rounded-xl bg-cyprus/10 dark:bg-sand/10 border border-cyprus/15 dark:border-sand/15 flex items-center justify-center">
                      <Icon size={20} className="text-cyprus dark:text-sand" strokeWidth={2} />
                    </div>
                  </div>
                  <div className="mb-3">
                    <Badge variant="outline">{tag}</Badge>
                  </div>
                  <h3 className="font-display text-2xl sm:text-3xl font-bold text-cyprus dark:text-sand mb-4">{title}</h3>
                  <p className="text-cyprus/60 dark:text-sand/60 leading-relaxed">{desc}</p>
                  <div className="mt-6 flex items-center gap-2 text-sm font-medium text-cyprus/50 dark:text-sand/50">
                    <span className="w-2 h-2 rounded-full bg-cyprus/40 dark:bg-sand/40 animate-pulse" />
                    Fully automated
                  </div>
                </div>

                {/* Image */}
                <div className="flex-1 w-full max-w-md">
                  <div className="relative">
                    <div className={`absolute inset-0 rounded-3xl bg-cyprus/15 dark:bg-sand/10 ${isEven ? 'translate-x-4 translate-y-4' : '-translate-x-4 translate-y-4'}`} />
                    <img
                      src={image}
                      alt={title}
                      className="relative rounded-3xl w-full h-64 sm:h-80 object-cover shadow-xl border-2 border-white/30 dark:border-cyprus-light/30"
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
