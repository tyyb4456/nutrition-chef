import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Flame, Beef, Wheat, Droplets, CalendarDays, ChefHat, Plus, ArrowRight } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { mealLogService } from '../../services/mealLogService'
import { mealPlanService } from '../../services/mealPlanService'
import StatCard from '../../components/dashboard/StatCard'
import MacroBar from '../../components/dashboard/MacroBar'
import EmptyState from '../../components/dashboard/EmptyState'

const SLOTS = ['breakfast', 'lunch', 'dinner', 'snack']
const SLOT_LABELS = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner', snack: 'Snack' }

function greeting(name) {
  const h = new Date().getHours()
  const part = h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening'
  return `Good ${part}, ${name?.split(' ')[0] ?? 'there'} 👋`
}

function todayKey() {
  return new Date().toLocaleDateString('en-CA')
}

function getDay() {
  return new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
}

export default function OverviewPage() {
  const { user } = useAuth()
  const [logs,      setLogs]      = useState([])
  const [plan,      setPlan]      = useState(null)
  const [adherence, setAdherence] = useState([])
  const [loading,   setLoading]   = useState(true)

  useEffect(() => {
    Promise.allSettled([
      mealLogService.getAll(1),
      mealPlanService.getActive(),
      mealLogService.getAdherence(7),
    ]).then(([logsR, planR, adhR]) => {
      if (logsR.status === 'fulfilled') setLogs(logsR.value?.logs ?? [])
      if (planR.status === 'fulfilled') setPlan(planR.value)
      if (adhR.status === 'fulfilled') setAdherence(adhR.value ?? [])
      setLoading(false)
    })
  }, [])

  const today = todayKey()
  const todayLogs = logs.filter(l => l.log_date === today)
  const totalCal  = todayLogs.reduce((s, l) => s + (l.calories ?? 0), 0)
  const totalPro  = Math.round(todayLogs.reduce((s, l) => s + (l.protein_g ?? 0), 0))
  const totalCarb = Math.round(todayLogs.reduce((s, l) => s + (l.carbs_g ?? 0), 0))
  const totalFat  = Math.round(todayLogs.reduce((s, l) => s + (l.fat_g ?? 0), 0))

  const calTarget = user?.calorie_target ?? 2000
  const proTarget = user?.macro_split
    ? Math.round((calTarget * (user.macro_split.protein / 100)) / 4)
    : 150
  const carbTarget = user?.macro_split
    ? Math.round((calTarget * (user.macro_split.carbs / 100)) / 4)
    : 250
  const fatTarget = user?.macro_split
    ? Math.round((calTarget * (user.macro_split.fat / 100)) / 9)
    : 65

  // Today's plan items
  const dayName = getDay()
  const todayPlanItems = plan?.days?.find(d => d.day?.toLowerCase() === dayName)?.meals ?? []

  // Adherence max for bar scaling
  const maxCal = Math.max(...adherence.map(a => a.actual_calories ?? 0), calTarget, 1)

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-cyprus dark:text-sand">
            {greeting(user?.name)}
          </h1>
          <p className="text-sm text-cyprus/50 dark:text-sand/50 mt-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/dashboard/logs"
            className="inline-flex items-center gap-1.5 text-sm font-semibold bg-white dark:bg-cyprus-light border border-cyprus/15 dark:border-sand/15 text-cyprus dark:text-sand px-4 py-2.5 rounded-xl hover:bg-sand-dark dark:hover:bg-cyprus-lighter transition-colors"
          >
            <Plus size={16} /> Log Meal
          </Link>
          <Link
            to="/dashboard/meal-plan"
            className="inline-flex items-center gap-1.5 text-sm font-semibold bg-cyprus dark:bg-sand text-sand dark:text-cyprus px-4 py-2.5 rounded-xl hover:bg-cyprus-light dark:hover:bg-sand-dark transition-colors"
          >
            <CalendarDays size={16} /> View Plan
          </Link>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Flame}   label="Calories today"  value={loading ? null : totalCal}  sub={`of ${calTarget} kcal`}   accent loading={loading} />
        <StatCard icon={Beef}    label="Protein"         value={loading ? null : `${totalPro}g`}  sub={`of ${proTarget}g`}  loading={loading} />
        <StatCard icon={Wheat}   label="Carbs"           value={loading ? null : `${totalCarb}g`} sub={`of ${carbTarget}g`} loading={loading} />
        <StatCard icon={Droplets}label="Fat"             value={loading ? null : `${totalFat}g`}  sub={`of ${fatTarget}g`}  loading={loading} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">

        {/* Today's Macros + Adherence */}
        <div className="lg:col-span-2 space-y-5">

          {/* Macro bars */}
          <div className="bg-white dark:bg-cyprus-light rounded-2xl p-5 border border-cyprus/8 dark:border-sand/8">
            <h2 className="font-display font-bold text-base text-cyprus dark:text-sand mb-4">Today's Macros</h2>
            <div className="space-y-4">
              <MacroBar label="Calories" current={totalCal}  target={calTarget} unit=" kcal" color="bg-cyprus dark:bg-sand" />
              <MacroBar label="Protein"  current={totalPro}  target={proTarget}  color="bg-cyprus/70 dark:bg-sand/70" />
              <MacroBar label="Carbs"    current={totalCarb} target={carbTarget} color="bg-cyprus/50 dark:bg-sand/50" />
              <MacroBar label="Fat"      current={totalFat}  target={fatTarget}  color="bg-cyprus/35 dark:bg-sand/35" />
            </div>
          </div>

          {/* Weekly adherence */}
          <div className="bg-white dark:bg-cyprus-light rounded-2xl p-5 border border-cyprus/8 dark:border-sand/8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-base text-cyprus dark:text-sand">7-Day Adherence</h2>
              <Link to="/dashboard/analytics" className="text-xs font-semibold text-cyprus/50 dark:text-sand/50 hover:text-cyprus dark:hover:text-sand flex items-center gap-1">
                Details <ArrowRight size={12} />
              </Link>
            </div>
            {adherence.length === 0 ? (
              <p className="text-sm text-cyprus/40 dark:text-sand/40 text-center py-6">
                Start logging meals to see your weekly adherence.
              </p>
            ) : (
              <div className="flex items-end gap-2 h-32">
                {adherence.slice(-7).map((a, i) => {
                  const pct = Math.min((a.actual_calories / maxCal) * 100, 100)
                  const targetPct = (calTarget / maxCal) * 100
                  const isToday = a.log_date === today
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full relative flex items-end" style={{ height: '96px' }}>
                        <div
                          className={`w-full rounded-t-lg transition-all duration-700 ${isToday ? 'bg-cyprus dark:bg-sand' : 'bg-cyprus/25 dark:bg-sand/25'}`}
                          style={{ height: `${pct}%` }}
                        />
                        <div
                          className="absolute w-full border-t-2 border-dashed border-cyprus/30 dark:border-sand/30"
                          style={{ bottom: `${targetPct}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-cyprus/40 dark:text-sand/40">
                        {new Date(a.log_date).toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 2)}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Today's meal plan */}
        <div className="bg-white dark:bg-cyprus-light rounded-2xl p-5 border border-cyprus/8 dark:border-sand/8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-base text-cyprus dark:text-sand">Today's Meals</h2>
            <Link to="/dashboard/meal-plan" className="text-xs font-semibold text-cyprus/50 dark:text-sand/50 hover:text-cyprus dark:hover:text-sand flex items-center gap-1">
              View Plan <ArrowRight size={12} />
            </Link>
          </div>

          {!plan ? (
            <EmptyState
              icon={CalendarDays}
              title="No active plan"
              desc="Generate a 7-day meal plan to see today's meals here."
              action={
                <Link to="/dashboard/meal-plan" className="inline-flex items-center gap-1.5 text-sm font-bold bg-cyprus dark:bg-sand text-sand dark:text-cyprus px-4 py-2.5 rounded-xl">
                  <Plus size={15} /> Generate Plan
                </Link>
              }
            />
          ) : (
            <div className="space-y-3">
              {SLOTS.map(slot => {
                const item = todayPlanItems.find(m => m.meal_slot === slot)
                const logged = todayLogs.find(l => l.meal_slot === slot)
                return (
                  <div key={slot} className={`p-3 rounded-xl border ${logged ? 'bg-cyprus/5 dark:bg-sand/5 border-cyprus/20 dark:border-sand/20' : 'border-cyprus/8 dark:border-sand/8'}`}>
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-cyprus/40 dark:text-sand/40">
                        {SLOT_LABELS[slot]}
                      </span>
                      {logged && (
                        <span className="text-[10px] font-bold text-cyprus dark:text-sand bg-cyprus/10 dark:bg-sand/10 px-2 py-0.5 rounded-full">
                          Logged ✓
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-cyprus dark:text-sand truncate">
                      {item?.recipe_name ?? logged?.dish_name ?? '—'}
                    </p>
                    {(item?.calories || logged?.calories) && (
                      <p className="text-[11px] text-cyprus/40 dark:text-sand/40 mt-0.5">
                        {item?.calories ?? logged?.calories} kcal
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Quick links */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {[
          { to: '/dashboard/recipes',   icon: ChefHat,       label: 'Generate Recipe',  desc: 'Create a new AI recipe' },
          { to: '/dashboard/logs',      icon: Plus,          label: 'Log a Meal',       desc: 'Track what you ate' },
          { to: '/dashboard/meal-plan', icon: CalendarDays,  label: 'Weekly Plan',      desc: 'View 7-day plan' },
          { to: '/dashboard/analytics', icon: ArrowRight,    label: 'View Progress',    desc: 'Weekly analytics report' },
        ].map(({ to, icon: Icon, label, desc }) => (
          <Link
            key={to}
            to={to}
            className="group flex items-center gap-3 bg-white dark:bg-cyprus-light border border-cyprus/8 dark:border-sand/8 rounded-2xl p-4 hover:border-cyprus/25 dark:hover:border-sand/25 hover:shadow-md transition-all duration-200"
          >
            <div className="w-9 h-9 rounded-xl bg-sand-dark dark:bg-cyprus/40 flex items-center justify-center flex-shrink-0 group-hover:bg-cyprus dark:group-hover:bg-sand transition-colors duration-200">
              <Icon size={17} className="text-cyprus dark:text-sand group-hover:text-sand dark:group-hover:text-cyprus transition-colors duration-200" strokeWidth={2} />
            </div>
            <div>
              <div className="text-sm font-bold text-cyprus dark:text-sand">{label}</div>
              <div className="text-xs text-cyprus/40 dark:text-sand/40">{desc}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
