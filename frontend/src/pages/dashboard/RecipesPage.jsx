import { useEffect, useState, useCallback } from 'react'
import { ChefHat, Plus, X, Loader, Clock, Flame, Beef, Wheat, ChevronRight, Star, Trash2, CheckCircle, Brain } from 'lucide-react'
import { recipeService } from '../../services/recipeService'
import { feedbackService } from '../../services/feedbackService'
import EmptyState from '../../components/dashboard/EmptyState'

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack']
const CUISINES = ['any', 'italian', 'mexican', 'asian', 'mediterranean', 'indian', 'american', 'pakistani']
const SPICE_LEVELS = ['mild', 'medium', 'hot']

function getCalories(r) { return r.calories ?? r.nutrition?.calories }
function getProtein(r) { return r.protein_g ?? r.nutrition?.protein_g }
function getCarbs(r) { return r.carbs_g ?? r.nutrition?.carbs_g }
function getFat(r) { return r.fat_g ?? r.nutrition?.fat_g }

/* ── Star picker ─────────────────────────────────────────────────────────── */
function StarPicker({ value, onChange, disabled }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          disabled={disabled}
          onClick={() => onChange(n)}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          className="cursor-pointer disabled:cursor-default transition-transform hover:scale-110"
        >
          <Star
            size={22}
            className={`transition-colors ${n <= (hover || value)
                ? 'fill-amber-400 text-amber-400'
                : 'text-cyprus/20 dark:text-sand/20'
              }`}
            strokeWidth={1.5}
          />
        </button>
      ))}
    </div>
  )
}

/* ── Markdown renderer ───────────────────────────────────────────────────── */
function MarkdownContent({ text }) {
  const renderInline = (str) => {
    // Bold: **text** or __text__
    const parts = str.split(/(\*\*[^*]+\*\*|__[^_]+__)/g)
    return parts.map((part, i) => {
      if (/^\*\*(.+)\*\*$/.test(part)) return <strong key={i} className="font-semibold text-cyprus dark:text-sand">{part.slice(2, -2)}</strong>
      if (/^__(.+)__$/.test(part)) return <strong key={i} className="font-semibold text-cyprus dark:text-sand">{part.slice(2, -2)}</strong>
      return part
    })
  }

  const lines = text.split('\n')
  const elements = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    // Skip separator lines like ---
    if (/^---+$/.test(line.trim())) { i++; continue }

    // H3: ###
    if (line.startsWith('### ')) {
      elements.push(
        <h3 key={i} className="text-sm font-bold text-cyprus dark:text-sand mt-3 mb-1">
          {renderInline(line.slice(4))}
        </h3>
      )
    }
    // H2: ##
    else if (line.startsWith('## ')) {
      elements.push(
        <h2 key={i} className="text-sm font-bold text-cyprus dark:text-sand mt-3 mb-1">
          {renderInline(line.slice(3))}
        </h2>
      )
    }
    // Bullet: * or -
    else if (/^[\*\-] /.test(line)) {
      elements.push(
        <div key={i} className="flex gap-2 text-sm text-cyprus/70 dark:text-sand/70 leading-relaxed">
          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-cyprus/40 dark:bg-sand/40 shrink-0" />
          <span>{renderInline(line.slice(2))}</span>
        </div>
      )
    }
    // Numbered list: 1. 2. etc
    else if (/^\d+\. /.test(line)) {
      const num = line.match(/^(\d+)\. /)[1]
      elements.push(
        <div key={i} className="flex gap-2.5 text-sm text-cyprus/70 dark:text-sand/70 leading-relaxed">
          <span className="shrink-0 w-5 h-5 rounded-full bg-cyprus/10 dark:bg-sand/10 text-cyprus dark:text-sand text-[10px] font-bold flex items-center justify-center mt-0.5">{num}</span>
          <span>{renderInline(line.replace(/^\d+\. /, ''))}</span>
        </div>
      )
    }
    // Empty line → spacing
    else if (line.trim() === '') {
      elements.push(<div key={i} className="h-1.5" />)
    }
    // Regular paragraph
    else {
      elements.push(
        <p key={i} className="text-sm text-cyprus/70 dark:text-sand/70 leading-relaxed">
          {renderInline(line)}
        </p>
      )
    }
    i++
  }

  return <div className="space-y-1">{elements}</div>
}

/* ── Feedback panel (inside detail drawer) ───────────────────────────────── */
function FeedbackPanel({ recipeId, threadId }) {
  const [existing, setExisting] = useState(null)   // already-submitted feedback
  const [loadingFb, setLoadingFb] = useState(true)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [loopRan, setLoopRan] = useState(false)
  const [error, setError] = useState('')
  const [deleting, setDeleting] = useState(false)

  // Load existing feedback for this recipe
  useEffect(() => {
    if (!recipeId) return
    setLoadingFb(true)
    feedbackService.listForRecipe(recipeId)
      .then(res => {
        const fb = res?.feedback?.[0] ?? null
        setExisting(fb)
        if (fb) { setRating(fb.rating); setComment(fb.comment ?? '') }
      })
      .catch(() => { })
      .finally(() => setLoadingFb(false))
  }, [recipeId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!rating) { setError('Please choose a star rating.'); return }
    setSubmitting(true)
    setError('')
    try {
      const res = await feedbackService.submit({
        recipe_id: recipeId,
        rating,
        comment: comment.trim() || undefined,
        thread_id: threadId ?? undefined,
      })
      setExisting(res)
      setSubmitted(true)
      setLoopRan(res.learning_loop_triggered)
    } catch (e) {
      setError(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!existing?.feedback_id) return
    setDeleting(true)
    try {
      await feedbackService.delete(existing.feedback_id)
      setExisting(null)
      setRating(0)
      setComment('')
      setSubmitted(false)
      setLoopRan(false)
    } catch (e) {
      setError(e.message)
    } finally {
      setDeleting(false)
    }
  }

  if (loadingFb) {
    return (
      <div className="flex justify-center py-4">
        <Loader size={16} className="animate-spin text-cyprus/30 dark:text-sand/30" />
      </div>
    )
  }

  // Success state
  if (submitted || existing) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map(n => (
              <Star
                key={n}
                size={18}
                className={n <= (existing?.rating ?? rating) ? 'fill-amber-400 text-amber-400' : 'text-cyprus/15 dark:text-sand/15'}
                strokeWidth={1.5}
              />
            ))}
          </div>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center gap-1 text-xs text-cyprus/40 dark:text-sand/40 hover:text-red-500 dark:hover:text-red-400 transition-colors cursor-pointer disabled:opacity-50"
          >
            {deleting ? <Loader size={12} className="animate-spin" /> : <Trash2 size={12} />}
            Remove
          </button>
        </div>
        {(existing?.comment || comment) && (
          <p className="text-sm text-cyprus/70 dark:text-sand/70 italic">
            "{existing?.comment ?? comment}"
          </p>
        )}
        <div className="flex items-center gap-2 text-xs">
          <CheckCircle size={13} className="text-green-500" />
          <span className="text-green-600 dark:text-green-400 font-medium">Feedback saved</span>
          {loopRan && (
            <>
              <span className="text-cyprus/30 dark:text-sand/30">·</span>
              <Brain size={13} className="text-cyan-500" />
              <span className="text-cyan-600 dark:text-cyan-400 font-medium">Learning loop ran</span>
            </>
          )}
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <StarPicker value={rating} onChange={setRating} disabled={submitting} />
      <textarea
        value={comment}
        onChange={e => setComment(e.target.value)}
        placeholder="Any thoughts? (optional)"
        rows={2}
        maxLength={1000}
        disabled={submitting}
        className="w-full bg-sand dark:bg-cyprus border border-cyprus/15 dark:border-sand/15 text-cyprus dark:text-sand rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-cyprus/20 dark:focus:ring-sand/20 placeholder:text-cyprus/30 dark:placeholder:text-sand/30 disabled:opacity-60"
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
      <button
        type="submit"
        disabled={submitting || !rating}
        className="inline-flex items-center gap-2 bg-cyprus dark:bg-sand text-sand dark:text-cyprus text-xs font-bold px-4 py-2 rounded-xl disabled:opacity-50 cursor-pointer hover:bg-cyprus-light dark:hover:bg-sand-dark transition-all"
      >
        {submitting
          ? <><Loader size={12} className="animate-spin" /> Submitting…</>
          : <><Star size={12} /> Submit Feedback</>
        }
      </button>
      {threadId && (
        <p className="text-[10px] text-cyprus/35 dark:text-sand/35">
          Your rating will help the AI learn your preferences for future recipes.
        </p>
      )}
    </form>
  )
}

/* ── Recipe card ─────────────────────────────────────────────────────────── */
function RecipeCard({ recipe, onClick }) {
  const cal = getCalories(recipe)
  const pro = getProtein(recipe)
  const carb = getCarbs(recipe)

  return (
    <button
      onClick={() => onClick(recipe)}
      className="group text-left bg-white dark:bg-cyprus-light border border-cyprus/8 dark:border-sand/8 rounded-2xl overflow-hidden hover:border-cyprus/25 dark:hover:border-sand/25 hover:shadow-md transition-all duration-200 cursor-pointer"
    >
      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-cyprus/40 dark:text-sand/40">
              {recipe.meal_type}
            </span>
            <h3 className="font-display font-bold text-sm text-cyprus dark:text-sand leading-tight mt-0.5 line-clamp-2">
              {recipe.dish_name}
            </h3>
          </div>
          <ChevronRight size={16} className="text-cyprus/30 dark:text-sand/30 shrink-0 mt-1 group-hover:translate-x-0.5 transition-transform" />
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          {[
            { icon: Flame, val: cal != null ? cal : '—', unit: 'kcal' },
            { icon: Beef, val: pro != null ? `${Math.round(pro)}g` : '—', unit: 'pro' },
            { icon: Wheat, val: carb != null ? `${Math.round(carb)}g` : '—', unit: 'carb' },
            { icon: Clock, val: recipe.prep_time_minutes ? `${recipe.prep_time_minutes}m` : '—', unit: 'prep' },
          ].map(({ icon: Icon, val, unit }) => (
            <div key={unit} className="bg-sand dark:bg-cyprus rounded-lg p-1.5 text-center">
              <div className="text-[11px] font-bold text-cyprus dark:text-sand">{val}</div>
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

/* ── Recipe detail drawer ────────────────────────────────────────────────── */
function RecipeDetail({ recipeId, initialRecipe, onClose }) {
  const [recipe, setRecipe] = useState(initialRecipe)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const id = recipeId ?? initialRecipe?.recipe_id
    if (!id) return
    const hasFullData = initialRecipe?.ingredients?.length > 0 || initialRecipe?.steps?.length > 0
    if (hasFullData) { setRecipe(initialRecipe); return }
    setLoading(true)
    recipeService.getById(id)
      .then(r => setRecipe(r))
      .catch(() => { })
      .finally(() => setLoading(false))
  }, [recipeId])

  const n = recipe?.nutrition ?? {}
  const steps = Array.isArray(recipe?.steps) ? recipe.steps : []
  const ingr = Array.isArray(recipe?.ingredients) ? recipe.ingredients : []
  const cal = getCalories(recipe)
  const pro = getProtein(recipe)
  const carb = getCarbs(recipe)
  const fat = getFat(recipe)

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative ml-auto w-full max-w-lg h-full bg-sand dark:bg-cyprus overflow-y-auto shadow-2xl">

        {/* Header */}
        <div className="sticky top-0 bg-sand dark:bg-cyprus border-b border-cyprus/10 dark:border-sand/10 px-5 py-4 flex items-center justify-between z-10">
          <h2 className="font-display font-bold text-cyprus dark:text-sand truncate pr-4">
            {recipe?.dish_name ?? '…'}
          </h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-cyprus/10 dark:hover:bg-sand/10 transition-colors cursor-pointer shrink-0">
            <X size={18} className="text-cyprus dark:text-sand" />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader size={24} className="animate-spin text-cyprus dark:text-sand" />
          </div>
        ) : (
          <div className="p-5 space-y-5">

            {/* Nutrition summary */}
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: 'Calories', val: cal != null ? String(cal) : '—' },
                { label: 'Protein', val: pro != null ? `${Math.round(pro)}g` : '—' },
                { label: 'Carbs', val: carb != null ? `${Math.round(carb)}g` : '—' },
                { label: 'Fat', val: fat != null ? `${Math.round(fat)}g` : '—' },
              ].map(({ label, val }) => (
                <div key={label} className="bg-white dark:bg-cyprus-light rounded-xl p-3 text-center border border-cyprus/8 dark:border-sand/8">
                  <div className="font-bold text-sm text-cyprus dark:text-sand">{val}</div>
                  <div className="text-[10px] text-cyprus/40 dark:text-sand/40">{label}</div>
                </div>
              ))}
            </div>

            {/* Extra nutrition */}
            {(n.fiber_g != null || n.sodium_mg != null) && (
              <div className="flex gap-2 flex-wrap">
                {n.fiber_g != null && <span className="text-xs bg-cyprus/8 dark:bg-sand/8 text-cyprus/70 dark:text-sand/70 px-2.5 py-1 rounded-full">Fiber: {Math.round(n.fiber_g)}g</span>}
                {n.sodium_mg != null && <span className="text-xs bg-cyprus/8 dark:bg-sand/8 text-cyprus/70 dark:text-sand/70 px-2.5 py-1 rounded-full">Sodium: {Math.round(n.sodium_mg)}mg</span>}
                {n.sugar_g != null && <span className="text-xs bg-cyprus/8 dark:bg-sand/8 text-cyprus/70 dark:text-sand/70 px-2.5 py-1 rounded-full">Sugar: {Math.round(n.sugar_g)}g</span>}
              </div>
            )}

            {/* AI explanation */}
            {recipe?.explanation && (
              <div className="bg-cyprus/5 dark:bg-sand/5 rounded-xl p-4 border border-cyprus/10 dark:border-sand/10">
                <h3 className="text-xs font-bold uppercase tracking-wider text-cyprus/50 dark:text-sand/50 mb-2">AI Explanation</h3>
                <MarkdownContent text={recipe.explanation} />
              </div>
            )}

            {/* Ingredients */}
            {ingr.length > 0 && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-cyprus/50 dark:text-sand/50 mb-3">Ingredients</h3>
                <ul className="space-y-2">
                  {ingr.map((ing, i) => (
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

            {/* Substitutions */}
            {recipe?.substitutions?.length > 0 && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-cyprus/50 dark:text-sand/50 mb-3">Substitutions</h3>
                <div className="space-y-2">
                  {recipe.substitutions.map((s, i) => (
                    <div key={i} className="bg-white dark:bg-cyprus-light rounded-xl p-3 border border-cyprus/8 dark:border-sand/8">
                      <p className="text-xs font-semibold text-cyprus dark:text-sand">
                        <span className="line-through opacity-50">{s.original}</span> → {s.substitute}
                      </p>
                      <p className="text-xs text-cyprus/50 dark:text-sand/50 mt-0.5">{s.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {steps.length === 0 && ingr.length === 0 && !loading && (
              <p className="text-sm text-cyprus/40 dark:text-sand/40 text-center py-4">
                Full recipe details could not be loaded.
              </p>
            )}

            {/* ── Feedback ──────────────────────────────────────────────── */}
            {recipe?.recipe_id && (
              <div className="border-t border-cyprus/10 dark:border-sand/10 pt-5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-cyprus/50 dark:text-sand/50 mb-3">
                  Rate this Recipe
                </h3>
                <FeedbackPanel
                  recipeId={recipe.recipe_id}
                  threadId={recipe.thread_id}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Stream step definitions (recipe pipeline) ───────────────────────────── */
const RECIPE_STEPS = [
  { key: 'health_goal', label: 'Calculating dietary requirements' },
  { key: 'recipe_generator', label: 'Crafting your personalized recipe' },
  { key: 'nutrition_validation', label: 'Validating nutritional balance' },
  { key: 'substitution', label: 'Checking allergen substitutions' },
  { key: 'explainability', label: 'Generating AI explanation' },
]

/* ── Main page ───────────────────────────────────────────────────────────── */
export default function RecipesPage() {
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [completedSteps, setCompletedSteps] = useState([])
  const [activeStep, setActiveStep] = useState(null)
  const [streamStatus, setStreamStatus] = useState('')
  const [streamTokens, setStreamTokens] = useState('')
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    meal_type: 'lunch',
    cuisine: 'any',
    spice_level: 'medium',
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
    setCompletedSteps([])
    setActiveStep(RECIPE_STEPS[0].key)
    setStreamStatus('')
    setStreamTokens('')

    const req = {
      meal_type: form.meal_type,
      ...(form.cuisine !== 'any' && { cuisine: form.cuisine }),
      ...(form.spice_level && { spice_level: form.spice_level }),
    }

    try {
      await recipeService.generateStream(req, (event) => {
        if (event.type === 'status') {
          setStreamStatus(event.message)
        } else if (event.type === 'token') {
          setStreamTokens(prev => prev + event.content)
        } else if (event.type === 'progress') {
          setStreamStatus('')
          setStreamTokens('')
          setCompletedSteps(prev => [...prev, event.step])
          const idx = RECIPE_STEPS.findIndex(s => s.key === event.step)
          const next = RECIPE_STEPS[idx + 1]
          setActiveStep(next?.key ?? null)
        } else if (event.type === 'result') {
          const recipe = event.data
          setRecipes(prev => [
            {
              recipe_id: recipe.recipe_id,
              dish_name: recipe.dish_name,
              cuisine: recipe.cuisine,
              meal_type: recipe.meal_type,
              calories: recipe.nutrition?.calories,
              protein_g: recipe.nutrition?.protein_g,
              carbs_g: recipe.nutrition?.carbs_g,
              fat_g: recipe.nutrition?.fat_g,
              prep_time_minutes: recipe.prep_time_minutes,
              _full: recipe,
            },
            ...prev,
          ])
          setSelected({ _full: recipe, recipe_id: recipe.recipe_id })
          setShowForm(false)
        } else if (event.type === 'error') {
          setError(event.message || 'Generation failed.')
        }
      })
    } catch (e) {
      setError(e.message)
    } finally {
      setGenerating(false)
      setActiveStep(null)
      setCompletedSteps([])
      setStreamStatus('')
      setStreamTokens('')
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
                className="w-full bg-sand dark:bg-cyprus border border-cyprus/15 dark:border-sand/15 text-cyprus dark:text-sand rounded-xl px-3 py-2.5 text-sm focus:outline-none"
              >
                {MEAL_TYPES.map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-cyprus/50 dark:text-sand/50 uppercase tracking-wider mb-1.5">Cuisine</label>
              <select
                value={form.cuisine}
                onChange={e => setForm(f => ({ ...f, cuisine: e.target.value }))}
                className="w-full bg-sand dark:bg-cyprus border border-cyprus/15 dark:border-sand/15 text-cyprus dark:text-sand rounded-xl px-3 py-2.5 text-sm focus:outline-none"
              >
                {CUISINES.map(c => <option key={c} value={c} className="capitalize">{c === 'any' ? 'Any cuisine' : c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-cyprus/50 dark:text-sand/50 uppercase tracking-wider mb-1.5">Spice Level</label>
              <select
                value={form.spice_level}
                onChange={e => setForm(f => ({ ...f, spice_level: e.target.value }))}
                className="w-full bg-sand dark:bg-cyprus border border-cyprus/15 dark:border-sand/15 text-cyprus dark:text-sand rounded-xl px-3 py-2.5 text-sm focus:outline-none"
              >
                {SPICE_LEVELS.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
              </select>
            </div>
            <div className="sm:col-span-3 flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="text-sm text-cyprus/50 dark:text-sand/50 px-4 py-2 rounded-xl hover:bg-sand-dark dark:hover:bg-cyprus/20 cursor-pointer"
              >
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
            <div className="mt-4 space-y-3">
              {/* Step tracker */}
              <div className="space-y-1.5">
                {RECIPE_STEPS.map(step => {
                  const done = completedSteps.includes(step.key)
                  const active = activeStep === step.key
                  return (
                    <div
                      key={step.key}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-all ${done
                          ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                          : active
                            ? 'bg-cyprus/8 dark:bg-sand/8 text-cyprus dark:text-sand font-semibold'
                            : 'text-cyprus/30 dark:text-sand/30'
                        }`}
                    >
                      {done ? (
                        <CheckCircle size={13} className="text-green-500 shrink-0" />
                      ) : active ? (
                        <Loader size={13} className="animate-spin shrink-0" />
                      ) : (
                        <span className="w-3.5 h-3.5 rounded-full border border-cyprus/20 dark:border-sand/20 shrink-0" />
                      )}
                      {step.label}
                    </div>
                  )
                })}
              </div>

              {/* Live status message from inside nodes */}
              {streamStatus && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-cyprus/5 dark:bg-sand/5 border border-cyprus/10 dark:border-sand/10">
                  <Loader size={11} className="animate-spin text-cyprus/40 dark:text-sand/40 shrink-0" />
                  <span className="text-[11px] text-cyprus/60 dark:text-sand/60 italic">{streamStatus}</span>
                </div>
              )}

              {/* Live token output — shown while the LLM is streaming */}
              {streamTokens && (
                <div className="px-3 py-2.5 rounded-xl bg-white dark:bg-cyprus-light border border-cyprus/10 dark:border-sand/10 max-h-32 overflow-y-auto">
                  <p className="text-[11px] text-cyprus/70 dark:text-sand/70 font-mono leading-relaxed whitespace-pre-wrap break-words">
                    {streamTokens}
                    <span className="inline-block w-1.5 h-3.5 bg-cyprus/40 dark:bg-sand/40 ml-0.5 animate-pulse align-middle" />
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader size={24} className="animate-spin text-cyprus dark:text-sand" />
        </div>
      ) : recipes.length === 0 ? (
        <EmptyState
          icon={ChefHat}
          title="No recipes yet"
          desc="Generate your first AI-powered recipe tailored to your nutrition goals."
          action={
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 bg-cyprus dark:bg-sand text-sand dark:text-cyprus text-sm font-bold px-5 py-3 rounded-xl cursor-pointer"
            >
              <Plus size={15} /> Generate Recipe
            </button>
          }
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {recipes.map(r => (
            <RecipeCard key={r.recipe_id} recipe={r} onClick={setSelected} />
          ))}
        </div>
      )}

      {selected && (
        <RecipeDetail
          recipeId={selected._full?.recipe_id ?? selected.recipe_id}
          initialRecipe={selected._full ?? selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  )
}