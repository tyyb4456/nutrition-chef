const meals = [
  {
    name: 'Avocado Power Bowl',
    category: 'Lunch',
    calories: 520,
    protein: 28,
    carbs: 48,
    fat: 22,
    time: '15 min',
    difficulty: 'Easy',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop',
    tags: ['Vegan', 'Gluten-Free'],
    color: 'bg-green-100 text-green-700',
  },
  {
    name: 'Grilled Salmon & Quinoa',
    category: 'Dinner',
    calories: 680,
    protein: 52,
    carbs: 42,
    fat: 24,
    time: '25 min',
    difficulty: 'Medium',
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop',
    tags: ['High Protein', 'Omega-3'],
    color: 'bg-blue-100 text-blue-700',
  },
  {
    name: 'Berry Protein Smoothie',
    category: 'Breakfast',
    calories: 380,
    protein: 35,
    carbs: 38,
    fat: 8,
    time: '5 min',
    difficulty: 'Easy',
    image: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400&h=300&fit=crop',
    tags: ['High Protein', 'Quick'],
    color: 'bg-purple-100 text-purple-700',
  },
  {
    name: 'Mediterranean Chickpea Salad',
    category: 'Lunch',
    calories: 440,
    protein: 18,
    carbs: 55,
    fat: 16,
    time: '10 min',
    difficulty: 'Easy',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=300&fit=crop',
    tags: ['Vegan', 'Fiber-Rich'],
    color: 'bg-amber-100 text-amber-700',
  },
  {
    name: 'Chicken & Sweet Potato',
    category: 'Dinner',
    calories: 590,
    protein: 48,
    carbs: 52,
    fat: 14,
    time: '35 min',
    difficulty: 'Medium',
    image: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=400&h=300&fit=crop',
    tags: ['High Protein', 'Low Fat'],
    color: 'bg-orange-100 text-orange-700',
  },
  {
    name: 'Overnight Chia Pudding',
    category: 'Breakfast',
    calories: 320,
    protein: 12,
    carbs: 40,
    fat: 14,
    time: '5 min',
    difficulty: 'Easy',
    image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&h=300&fit=crop',
    tags: ['Vegan', 'Meal Prep'],
    color: 'bg-rose-100 text-rose-700',
  },
]

const categoryColors = {
  Breakfast: 'bg-amber-100 text-amber-700',
  Lunch: 'bg-green-100 text-green-700',
  Dinner: 'bg-blue-100 text-blue-700',
}

export default function MealShowcase() {
  return (
    <section id="meals" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-green-600 bg-green-100 px-4 py-1.5 rounded-full mb-4">
            Sample Meals
          </span>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Delicious Meals,{' '}
            <span className="gradient-text">Perfectly Balanced</span>
          </h2>
          <p className="text-lg text-gray-500">
            Hundreds of chef-quality recipes optimized for your macros. Never boring, always nutritious.
          </p>
        </div>

        {/* Meal Cards Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {meals.map((meal) => (
            <div
              key={meal.name}
              className="card-lift group bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl cursor-default"
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={meal.image}
                  alt={meal.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/30 to-transparent" />
                <span className={`absolute top-3 left-3 text-xs font-bold px-2.5 py-1 rounded-full ${categoryColors[meal.category]}`}>
                  {meal.category}
                </span>
                <div className="absolute top-3 right-3 flex flex-col gap-1">
                  {meal.tags.map((tag) => (
                    <span key={tag} className="text-xs font-semibold bg-white/90 text-gray-700 px-2 py-0.5 rounded-full backdrop-blur-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-bold text-gray-900 text-base leading-tight flex-1 pr-2">{meal.name}</h3>
                  <div className="flex items-center gap-1 text-gray-400 text-xs whitespace-nowrap">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {meal.time}
                  </div>
                </div>

                {/* Macro pills */}
                <div className="flex gap-2 mb-4">
                  <div className="flex-1 bg-green-50 rounded-xl p-2 text-center">
                    <div className="text-sm font-bold text-green-700">{meal.calories}</div>
                    <div className="text-xs text-gray-500">kcal</div>
                  </div>
                  <div className="flex-1 bg-blue-50 rounded-xl p-2 text-center">
                    <div className="text-sm font-bold text-blue-700">{meal.protein}g</div>
                    <div className="text-xs text-gray-500">protein</div>
                  </div>
                  <div className="flex-1 bg-amber-50 rounded-xl p-2 text-center">
                    <div className="text-sm font-bold text-amber-700">{meal.carbs}g</div>
                    <div className="text-xs text-gray-500">carbs</div>
                  </div>
                  <div className="flex-1 bg-rose-50 rounded-xl p-2 text-center">
                    <div className="text-sm font-bold text-rose-700">{meal.fat}g</div>
                    <div className="text-xs text-gray-500">fat</div>
                  </div>
                </div>

                <button className="w-full text-center text-sm font-semibold text-green-600 hover:text-white bg-green-50 hover:bg-green-500 py-2.5 rounded-xl transition-all duration-300">
                  View Recipe →
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <a
            href="#pricing"
            className="inline-flex items-center gap-2 text-sm font-semibold text-green-600 hover:text-green-700 border-2 border-green-200 hover:border-green-400 px-6 py-3 rounded-full transition-all duration-200 hover:bg-green-50"
          >
            Explore 500+ Recipes
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
        </div>

      </div>
    </section>
  )
}
