import { useEffect, useState } from 'react'
import { ChefHat, Plus, X, Loader, Clock, Flame, Beef, Wheat, ChevronRight } from 'lucide-react'
import { recipeService } from '../../services/recipeService'
import { useAuth } from '../../context/AuthContext'
import EmptyState from '../../components/dashboard/EmptyState'

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack']
const CUISINES   = ['any', 'italian', 'mexican', 'asian', 'mediterranean', 'indian', 'american', 'pakistani']

function RecipeCard({ recipe, onClick }) {
  const n = recipe.nutrition ?? {}
  return (
    <button
      onClick={() => onClick(recipe)}
      className="group text-left bg-white dark:bg-cyprus-light border border-cyprus/8 dark:border-sand/8 rounded-2xl overflow-hidden hover:border-cyprus/25 dark:hover:border-sand/25 hover:shadow-md transition-all duration-200 cursor-pointer"
    >
      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-cyprus/40 dark:text-sand/40">
              {recipe.meal_type}
            </span>
            <h3 className="font-display font-bold text-sm text-cyprus dark:text-sand leading-tight mt-0.5">
              {recipe.name}
            </h3>
          </div>
          <ChevronRight size={16} className="text-cyprus/30 dark:text-sand/30 shrink-0 mt-1 group-hover:translate-x-0.5 transition-transform" />
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          {[
            { icon: Flame,  val: n.calories,   unit: 'kcal' },
            { icon: Beef,   val: n.protein_g ? `${Math.round(n.protein_g)}g` : '—', unit: 'pro' },
            { icon: Wheat,  val: n.carbs_g   ? `${Math.round(n.carbs_g)}g`   : '—', unit: 'carb' },
            { icon: Clock,  val: recipe.prep_time_minutes ? `${recipe.prep_time_minutes}m` : '—', unit: 'prep' },
          ].map(({ icon: Icon, val, unit }) => (
            <div key={unit} className="bg-sand dark:bg-cyprus rounded-lg p-1.5 text-center">
              <div className="text-[11px] font-bold text-cyprus dark:text-sand">{val ?? '—'}</div>
              <div className="text-[9px] text-cyprus/40 dark:text-sand/40">{unit}</div>
            </div>
          ))}
        </div>
        {recipe.cuisine && recipe.cuisine !== 'any' && (
          <span className="mt-3 inline-block text-[10px] font-semibold bg-cyprus/8 dark:bg-sand/8 text-cyprus/60 dark:text-sand/60 px-2 py-0.5 rounded-full capitalize">
            {recipe.cuisine}
          </span>
        )}
      </div>
    </button>
  )
}

function RecipeDetail({ recipe, onClose }) {
  const n = recipe.nutrition ?? {}
  const steps = Array.isArray(recipe.steps) ? recipe.steps : []
  const ingredients = recipe.ingredients ?? []

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative ml-auto w-full max-w-lg h-full bg-sand dark:bg-cyprus overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-sand dark:bg-cyprus border-b border-cyprus/10 dark:border-sand/10 px-5 py-4 flex items-center justify-between z-10">
          <h2 className="font-display font-bold text-cyprus dark:text-sand truncate pr-4">{recipe.name}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-cyprus/10 dark:hover:bg-sand/10 transition-colors cursor-pointer shrink-0">
            <X size={18} className="text-cyprus dark:text-sand" />
          </button>
        </div>
        <div className="p-5 space-y-5">
          {/* Nutrition */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: 'Calories', val: n.calories, unit: 'kcal' },
              { label: 'Protein',  val: n.protein_g  ? `${Math.round(n.protein_g)}g`  : '—', unit: '' },
              { label: 'Carbs',    val: n.carbs_g    ? `${Math.round(n.carbs_g)}g`    : '—', unit: '' },
              { label: 'Fat',      val: n.fat_g      ? `${Math.round(n.fat_g)}g`      : '—', unit: '' },
            ].map(({ label, val }) => (
              <div key={label} className="bg-white dark:bg-cyprus-light rounded-xl p-3 text-center border border-cyprus/8 dark:border-sand/8">
                <div className="font-bold text-sm text-cyprus dark:text-sand">{val ?? '—'}</div>
                <div className="text-[10px] text-cyprus/40 dark:text-sand/40">{label}</div>
              </div>
            ))}
          </div>

          {/* Explanation */}
          {recipe.explanation && (
            <div className="bg-cyprus/5 dark:bg-sand/5 rounded-xl p-4 border border-cyprus/10 dark:border-sand/10">
              <h3 className="text-xs font-bold uppercase tracking-wider text-cyprus/50 dark:text-sand/50 mb-1.5">AI Explanation</h3>
              <p className="text-sm text-cyprus/70 dark:text-sand/70 leading-relaxed">{recipe.explanation}</p>
            </div>
          )}

          {/* Ingredients */}
          {ingredients.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-cyprus/50 dark:text-sand/50 mb-3">Ingredients</h3>
              <ul className="space-y-2">
                {ingredients.map((ing, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-cyprus/80 dark:text-sand/80">
                    <span className="mt-2 w-1.5 h-1.5 rounded-full bg-cyprus/40 dark:bg-sand/40 shrink-0" />
                    <span><strong>{ing.quantity}</strong> {ing.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Steps */}
          {steps.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-cyprus/50 dark:text-sand/50 mb-3">Instructions</h3>
              <ol className="space-y-3">
                {steps.map((step, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="shrink-0 w-6 h-6 rounded-full bg-cyprus dark:bg-sand text-sand dark:text-cyprus text-xs font-bold flex items-center justify-center">
                      {i + 1}
                    </span>
                    <p className="text-sm text-cyprus/80 dark:text-sand/80 leading-relaxed pt-0.5">{step}</p>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function RecipesPage() {
  const { user } = useAuth()
  const [recipes,    setRecipes]    = useState([])
  const [loading,    setLoading]    = useState(true)
  const [selected,   setSelected]   = useState(null)
  const [showForm,   setShowForm]   = useState(false)
  const [generating, setGenerating] = useState(false)
  const [error,      setError]      = useState('')

  const [form, setForm] = useState({
    meal_type: 'lunch',
    cuisine: 'any',
    extra_instructions: '',
  })

  useEffect(() => {
    recipeService.getAll().then(r => {
      setRecipes(r?.recipes ?? [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const generate = async (e) => {
    e.preventDefault()
    setGenerating(true)
    setError('')
    try {
      const req = {
        meal_type: form.meal_type,
        ...(form.cuisine !== 'any' && { cuisine: form.cuisine }),
        ...(form.extra_instructions && { extra_instructions: form.extra_instructions }),
      }
      const recipe = await recipeService.generate(req)
      setRecipes(prev => [recipe, ...prev])
      setSelected(recipe)
      setShowForm(false)
    } catch (e) {
      setError(e.message)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-cyprus dark:text-sand">Recipes</h1>
          <p className="text-sm text-cyprus/50 dark:text-sand/50 mt-1">
            {recipes.length} recipe{recipes.length !== 1 ? 's' : ''} generated
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 bg-cyprus dark:bg-sand text-sand dark:text-cyprus text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-cyprus-light dark:hover:bg-sand-dark shadow-sm transition-all cursor-pointer"
        >
          <Plus size={16} /> Generate Recipe
        </button>
      </div>

      {/* Generate form */}
      {showForm && (
        <div className="mb-6 bg-white dark:bg-cyprus-light border border-cyprus/10 dark:border-sand/10 rounded-2xl p-5">
          <h2 className="font-display font-bold text-base text-cyprus dark:text-sand mb-4">Generate a New Recipe</h2>
          {error && <p className="text-sm text-red-500 mb-3">{error}</p>}
          <form onSubmit={generate} className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-cyprus/50 dark:text-sand/50 uppercase tracking-wider mb-1.5">Meal Type</label>
              <select
                value={form.meal_type}
                onChange={e => setForm(f => ({ ...f, meal_type: e.target.value }))}
                className="w-full bg-sand dark:bg-cyprus border border-cyprus/15 dark:border-sand/15 text-cyprus dark:text-sand rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyprus/30 dark:focus:ring-sand/30"
              >
                {MEAL_TYPES.map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-cyprus/50 dark:text-sand/50 uppercase tracking-wider mb-1.5">Cuisine</label>
              <select
                value={form.cuisine}
                onChange={e => setForm(f => ({ ...f, cuisine: e.target.value }))}
                className="w-full bg-sand dark:bg-cyprus border border-cyprus/15 dark:border-sand/15 text-cyprus dark:text-sand rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyprus/30 dark:focus:ring-sand/30"
              >
                {CUISINES.map(c => <option key={c} value={c} className="capitalize">{c === 'any' ? 'Any cuisine' : c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-cyprus/50 dark:text-sand/50 uppercase tracking-wider mb-1.5">Notes (optional)</label>
              <input
                type="text"
                value={form.extra_instructions}
                onChange={e => setForm(f => ({ ...f, extra_instructions: e.target.value }))}
                placeholder="e.g. high protein, quick prep"
                className="w-full bg-sand dark:bg-cyprus border border-cyprus/15 dark:border-sand/15 text-cyprus dark:text-sand placeholder-cyprus/30 dark:placeholder-sand/30 rounded-xl px-3 py-2.5 text-sm focus:outline-none"
              />
            </div>
            <div className="sm:col-span-3 flex gap-3 justify-end">
              <button type="button" onClick={() => setShowForm(false)} className="text-sm text-cyprus/50 dark:text-sand/50 px-4 py-2 rounded-xl hover:bg-sand-dark dark:hover:bg-cyprus/20 cursor-pointer">
                Cancel
              </button>
              <button
                type="submit"
                disabled={generating}
                className="inline-flex items-center gap-2 bg-cyprus dark:bg-sand text-sand dark:text-cyprus text-sm font-bold px-6 py-2.5 rounded-xl disabled:opacity-60 cursor-pointer"
              >
                {generating ? <><Loader size={15} className="animate-spin" /> Generating…</> : 'Generate'}
              </button>
            </div>
          </form>
          {generating && (
            <p className="text-xs text-cyprus/50 dark:text-sand/50 mt-3 text-center">
              AI is crafting your recipe… this takes 15–30 seconds.
            </p>
          )}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16"><Loader size={24} className="animate-spin text-cyprus dark:text-sand" /></div>
      ) : recipes.length === 0 ? (
        <EmptyState
          icon={ChefHat}
          title="No recipes yet"
          desc="Generate your first AI-powered recipe tailored to your nutrition goals."
          action={
            <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 bg-cyprus dark:bg-sand text-sand dark:text-cyprus text-sm font-bold px-5 py-3 rounded-xl cursor-pointer">
              <Plus size={15} /> Generate Recipe
            </button>
          }
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {recipes.map(r => (
            <RecipeCard key={r.recipe_id ?? r.id} recipe={r} onClick={setSelected} />
          ))}
        </div>
      )}

      {selected && <RecipeDetail recipe={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
