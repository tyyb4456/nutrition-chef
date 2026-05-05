import { useEffect, useState } from 'react'
import { CalendarDays, RefreshCw, Loader, ChevronDown, ChevronUp, ShoppingCart, CheckCircle } from 'lucide-react'
import { mealPlanService } from '../../services/mealPlanService'
import EmptyState from '../../components/dashboard/EmptyState'

const SLOTS = ['breakfast', 'lunch', 'dinner', 'snack']
const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
const DAY_SHORT = { monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed', thursday: 'Thu', friday: 'Fri', saturday: 'Sat', sunday: 'Sun' }

const PLAN_STEPS = [
  { key: 'health_goal', label: 'Calculating your dietary requirements' },
  { key: 'weekly_plan', label: 'Generating 7-day meal plan (28 meals)' },
  { key: 'grocery', label: 'Building your grocery list' },
  { key: 'meal_prep', label: 'Creating batch-cooking schedule' },
]

function todayDay() {
  return new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
}

export default function MealPlanPage() {
  const [plan, setPlan] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [completedSteps, setCompletedSteps] = useState([])
  const [activeStep, setActiveStep] = useState(null)
  const [error, setError] = useState('')
  const [showGrocery, setShowGrocery] = useState(false)

  const fetchActive = async () => {
    try {
      const p = await mealPlanService.getActive()
      setPlan(p)
    } catch {
      setPlan(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchActive() }, [])

  const generate = async () => {
    setGenerating(true)
    setError('')
    setCompletedSteps([])
    setActiveStep(PLAN_STEPS[0].key)

    try {
      await mealPlanService.generateStream({}, (event) => {
        if (event.type === 'progress') {
          setCompletedSteps(prev => [...prev, event.step])
          const idx = PLAN_STEPS.findIndex(s => s.key === event.step)
          const next = PLAN_STEPS[idx + 1]
          setActiveStep(next?.key ?? null)
        } else if (event.type === 'result') {
          setPlan(event.data)
        } else if (event.type === 'error') {
          setError(event.message || 'Meal plan generation failed.')
        }
      })
    } catch (e) {
      setError(e.message)
    } finally {
      setGenerating(false)
      setActiveStep(null)
      setCompletedSteps([])
    }
  }

  const dayMeals = (dayName) => {
    const day = plan?.days?.find(d => d.day?.toLowerCase() === dayName)
    return day?.meals ?? []
  }

  const mealForSlot = (dayName, slot) => {
    return dayMeals(dayName).find(m => m.meal_slot === slot)
  }

  const today = todayDay()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader size={24} className="animate-spin text-cyprus dark:text-sand" />
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-cyprus dark:text-sand">Meal Plan</h1>
          <p className="text-sm text-cyprus/50 dark:text-sand/50 mt-1">
            {plan ? `Week of ${new Date(plan.week_start).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}` : 'No active plan'}
          </p>
        </div>
        <button
          onClick={generate}
          disabled={generating}
          className="inline-flex items-center gap-2 bg-cyprus dark:bg-sand text-sand dark:text-cyprus text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-cyprus-light dark:hover:bg-sand-dark shadow-sm transition-all disabled:opacity-60 cursor-pointer"
        >
          {generating ? <Loader size={16} className="animate-spin" /> : <RefreshCw size={16} />}
          {generating ? 'Generating…' : plan ? 'Regenerate Plan' : 'Generate Plan'}
        </button>
      </div>

      {error && (
        <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {generating && (
        <div className="mb-6 bg-white dark:bg-cyprus-light border border-cyprus/10 dark:border-sand/10 rounded-2xl p-5">
          <p className="font-semibold text-cyprus dark:text-sand mb-4">Crafting your personalized 7-day plan…</p>
          <div className="space-y-1.5">
            {PLAN_STEPS.map(step => {
              const done = completedSteps.includes(step.key)
              const active = activeStep === step.key
              return (
                <div
                  key={step.key}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all ${done
                      ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                      : active
                        ? 'bg-cyprus/8 dark:bg-sand/8 text-cyprus dark:text-sand font-semibold'
                        : 'text-cyprus/30 dark:text-sand/30'
                    }`}
                >
                  {done ? (
                    <CheckCircle size={15} className="text-green-500 shrink-0" />
                  ) : active ? (
                    <Loader size={15} className="animate-spin shrink-0" />
                  ) : (
                    <span className="w-4 h-4 rounded-full border border-cyprus/20 dark:border-sand/20 shrink-0" />
                  )}
                  {step.label}
                  {step.key === 'weekly_plan' && active && (
                    <span className="ml-auto text-xs text-cyprus/40 dark:text-sand/40 font-normal">~2 min</span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {!plan && !generating ? (
        <EmptyState
          icon={CalendarDays}
          title="No active meal plan"
          desc="Generate your personalized AI-powered 7-day meal plan to get started."
          action={
            <button
              onClick={generate}
              className="inline-flex items-center gap-2 bg-cyprus dark:bg-sand text-sand dark:text-cyprus text-sm font-bold px-6 py-3 rounded-xl"
            >
              <CalendarDays size={16} /> Generate My Plan
            </button>
          }
        />
      ) : plan ? (
        <>
          {/* Weekly grid */}
          <div className="overflow-x-auto">
            <div className="min-w-[700px]">

              {/* Day headers */}
              <div className="grid grid-cols-8 gap-2 mb-3">
                <div className="text-xs font-bold text-cyprus/40 dark:text-sand/40 uppercase tracking-wider py-2" />
                {DAYS.map(d => (
                  <div key={d} className={`text-center py-2 rounded-xl text-xs font-bold uppercase tracking-wider ${d === today
                      ? 'bg-cyprus dark:bg-sand text-sand dark:text-cyprus'
                      : 'text-cyprus/50 dark:text-sand/50'
                    }`}>
                    {DAY_SHORT[d]}
                  </div>
                ))}
              </div>

              {/* Meal rows */}
              {SLOTS.map(slot => (
                <div key={slot} className="grid grid-cols-8 gap-2 mb-2">
                  <div className="flex items-center">
                    <span className="text-xs font-bold text-cyprus/40 dark:text-sand/40 uppercase tracking-wider capitalize">
                      {slot}
                    </span>
                  </div>
                  {DAYS.map(d => {
                    const meal = mealForSlot(d, slot)
                    const isToday = d === today
                    return (
                      <div key={d} className={`rounded-xl p-2.5 border min-h-[72px] ${isToday
                          ? 'bg-cyprus/5 dark:bg-sand/5 border-cyprus/25 dark:border-sand/25'
                          : 'bg-white dark:bg-cyprus-light border-cyprus/8 dark:border-sand/8'
                        }`}>
                        {meal ? (
                          <>
                            <p className="text-[11px] font-semibold text-cyprus dark:text-sand leading-tight line-clamp-2">
                              {meal.recipe_name}
                            </p>
                            {meal.calories && (
                              <p className="text-[10px] text-cyprus/40 dark:text-sand/40 mt-1">
                                {meal.calories} kcal
                              </p>
                            )}
                          </>
                        ) : (
                          <div className="h-full flex items-center justify-center">
                            <span className="text-[10px] text-cyprus/20 dark:text-sand/20">—</span>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Grocery list toggle */}
          {plan.grocery_list && (
            <div className="mt-8 bg-white dark:bg-cyprus-light rounded-2xl border border-cyprus/8 dark:border-sand/8 overflow-hidden">
              <button
                onClick={() => setShowGrocery(!showGrocery)}
                className="w-full flex items-center justify-between p-5 cursor-pointer hover:bg-sand-dark/50 dark:hover:bg-cyprus/20 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <ShoppingCart size={18} className="text-cyprus dark:text-sand" />
                  <span className="font-display font-bold text-cyprus dark:text-sand">Grocery List</span>
                </div>
                {showGrocery ? <ChevronUp size={18} className="text-cyprus/50 dark:text-sand/50" /> : <ChevronDown size={18} className="text-cyprus/50 dark:text-sand/50" />}
              </button>
              {showGrocery && (
                <div className="px-5 pb-5 border-t border-cyprus/8 dark:border-sand/8 pt-4">
                  {typeof plan.grocery_list === 'string' ? (
                    <p className="text-sm text-cyprus/70 dark:text-sand/70 whitespace-pre-wrap">{plan.grocery_list}</p>
                  ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {Object.entries(plan.grocery_list).map(([cat, items]) => (
                        <div key={cat}>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-cyprus/50 dark:text-sand/50 mb-2">{cat}</h4>
                          <ul className="space-y-1">
                            {(Array.isArray(items) ? items : [items]).map((item, i) => (
                              <li key={i} className="text-sm text-cyprus/80 dark:text-sand/80 flex items-start gap-1.5">
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-cyprus/30 dark:bg-sand/30 flex-shrink-0" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </>
      ) : null}
    </div>
  )
}
