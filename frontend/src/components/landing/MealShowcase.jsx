import { Clock, ChefHat, ArrowRight } from 'lucide-react'
import SectionHeader from '../ui/SectionHeader'
import Button from '../ui/Button'

const meals = [
  {
    name: 'Avocado Power Bowl',
    category: 'Lunch',
    calories: 520, protein: 28, carbs: 48, fat: 22,
    time: '15 min', difficulty: 'Easy',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=280&fit=crop',
    tags: ['Vegan', 'Gluten-Free'],
  },
  {
    name: 'Grilled Salmon & Quinoa',
    category: 'Dinner',
    calories: 680, protein: 52, carbs: 42, fat: 24,
    time: '25 min', difficulty: 'Medium',
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=280&fit=crop',
    tags: ['High Protein', 'Omega-3'],
  },
  {
    name: 'Berry Protein Smoothie',
    category: 'Breakfast',
    calories: 380, protein: 35, carbs: 38, fat: 8,
    time: '5 min', difficulty: 'Easy',
    image: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400&h=280&fit=crop',
    tags: ['High Protein', 'Quick'],
  },
  {
    name: 'Mediterranean Chickpea',
    category: 'Lunch',
    calories: 440, protein: 18, carbs: 55, fat: 16,
    time: '10 min', difficulty: 'Easy',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=280&fit=crop',
    tags: ['Vegan', 'Fiber-Rich'],
  },
  {
    name: 'Chicken & Sweet Potato',
    category: 'Dinner',
    calories: 590, protein: 48, carbs: 52, fat: 14,
    time: '35 min', difficulty: 'Medium',
    image: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=400&h=280&fit=crop',
    tags: ['High Protein', 'Low Fat'],
  },
  {
    name: 'Overnight Chia Pudding',
    category: 'Breakfast',
    calories: 320, protein: 12, carbs: 40, fat: 14,
    time: '5 min', difficulty: 'Easy',
    image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&h=280&fit=crop',
    tags: ['Vegan', 'Meal Prep'],
  },
]

const categoryStyle = {
  Breakfast: 'bg-cyprus/10 text-cyprus dark:bg-sand/10 dark:text-sand',
  Lunch:     'bg-cyprus/15 text-cyprus dark:bg-sand/15 dark:text-sand',
  Dinner:    'bg-cyprus/20 text-cyprus dark:bg-sand/20 dark:text-sand',
}

const macroItems = [
  { key: 'calories', label: 'kcal', suffix: '' },
  { key: 'protein',  label: 'protein', suffix: 'g' },
  { key: 'carbs',    label: 'carbs',   suffix: 'g' },
  { key: 'fat',      label: 'fat',     suffix: 'g' },
]

export default function MealShowcase() {
  return (
    <section id="meals" className="py-24 bg-sand dark:bg-cyprus">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Sample Meals"
          title="Delicious Meals,"
          highlight="Perfectly Balanced"
          description="Hundreds of chef-quality recipes optimized for your macros. Never boring, always nutritious."
        />

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {meals.map((meal) => (
            <div
              key={meal.name}
              className="card-lift group bg-white dark:bg-cyprus-light border border-cyprus/8 dark:border-sand/8 rounded-2xl overflow-hidden shadow-sm"
            >
              {/* Image */}
              <div className="relative h-44 overflow-hidden">
                <img
                  src={meal.image}
                  alt={meal.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/25 to-transparent" />
                <span className={`absolute top-3 left-3 text-[11px] font-bold px-2.5 py-1 rounded-full ${categoryStyle[meal.category]}`}>
                  {meal.category}
                </span>
                <div className="absolute top-3 right-3 flex flex-col items-end gap-1">
                  {meal.tags.map((tag) => (
                    <span key={tag} className="text-[10px] font-semibold bg-white/85 dark:bg-cyprus/85 text-cyprus dark:text-sand px-2 py-0.5 rounded-full backdrop-blur-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Body */}
              <div className="p-5">
                <div className="flex items-start justify-between mb-3.5">
                  <h3 className="font-display font-bold text-cyprus dark:text-sand text-sm leading-tight flex-1 pr-2">{meal.name}</h3>
                  <div className="flex items-center gap-1 text-cyprus/40 dark:text-sand/40 text-xs whitespace-nowrap">
                    <Clock size={12} strokeWidth={2} />
                    {meal.time}
                  </div>
                </div>

                {/* Macros */}
                <div className="grid grid-cols-4 gap-1.5 mb-4">
                  {macroItems.map(({ key, label, suffix }) => (
                    <div key={key} className="bg-sand dark:bg-cyprus rounded-xl p-2 text-center">
                      <div className="text-xs font-bold text-cyprus dark:text-sand">{meal[key]}{suffix}</div>
                      <div className="text-[10px] text-cyprus/50 dark:text-sand/50">{label}</div>
                    </div>
                  ))}
                </div>

                <button className="w-full flex items-center justify-center gap-1.5 text-xs font-bold text-cyprus dark:text-sand bg-sand dark:bg-cyprus hover:bg-cyprus hover:text-sand dark:hover:bg-sand dark:hover:text-cyprus py-2.5 rounded-xl transition-all duration-300">
                  <ChefHat size={13} strokeWidth={2} />
                  View Recipe
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Button href="#pricing" variant="outline">
            Explore 500+ Recipes
            <ArrowRight size={16} />
          </Button>
        </div>
      </div>
    </section>
  )
}
