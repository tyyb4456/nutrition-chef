import { useEffect, useState } from 'react'
import { ClipboardList, Plus, X, Loader, Trash2, Clock } from 'lucide-react'
import { mealLogService } from '../../services/mealLogService'
import EmptyState from '../../components/dashboard/EmptyState'

const SLOTS = ['breakfast', 'lunch', 'dinner', 'snack']
const SLOT_EMOJI = { breakfast: '🌅', lunch: '☀️', dinner: '🌙', snack: '🍎' }

function todayKey() {
  return new Date().toLocaleDateString('en-CA')
}

function groupByDate(logs) {
  return logs.reduce((acc, log) => {
    const d = log.log_date
    if (!acc[d]) acc[d] = []
    acc[d].push(log)
    return acc
  }, {})
}

export default function MealLogsPage() {
  const [logs,    setLogs]    = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm,setShowForm]= useState(false)
  const [saving,  setSaving]  = useState(false)
  const [error,   setError]   = useState('')
  const [days,    setDays]    = useState(7)

  const [form, setForm] = useState({
    dish_name: '',
    meal_slot: 'lunch',
    log_date:  todayKey(),
    calories:  '',
    protein_g: '',
    carbs_g:   '',
    fat_g:     '',
    planned:   false,
    source:    'manual',
  })

  const fetchLogs = async (d = days) => {
    setLoading(true)
    try {
      const res = await mealLogService.getAll(d)
      setLogs(res?.logs ?? [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchLogs() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const payload = {
        ...form,
        calories:  form.calories  ? Number(form.calories)  : undefined,
        protein_g: form.protein_g ? Number(form.protein_g) : undefined,
        carbs_g:   form.carbs_g   ? Number(form.carbs_g)   : undefined,
        fat_g:     form.fat_g     ? Number(form.fat_g)     : undefined,
      }
      const newLog = await mealLogService.log(payload)
      setLogs(prev => [newLog, ...prev])
      setShowForm(false)
      setForm({ dish_name: '', meal_slot: 'lunch', log_date: todayKey(), calories: '', protein_g: '', carbs_g: '', fat_g: '', planned: false, source: 'manual' })
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await mealLogService.delete(id)
      setLogs(prev => prev.filter(l => l.log_id !== id))
    } catch {}
  }

  const grouped = groupByDate(logs)
  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a))

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto">

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-cyprus dark:text-sand">Meal Logs</h1>
          <p className="text-sm text-cyprus/50 dark:text-sand/50 mt-1">Track everything you eat</p>
        </div>
        <div className="flex gap-2">
          <select
            value={days}
            onChange={e => { setDays(Number(e.target.value)); fetchLogs(Number(e.target.value)) }}
            className="bg-white dark:bg-cyprus-light border border-cyprus/15 dark:border-sand/15 text-cyprus dark:text-sand text-sm rounded-xl px-3 py-2.5 focus:outline-none"
          >
            {[3, 7, 14, 30].map(d => <option key={d} value={d}>Last {d} days</option>)}
          </select>
          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center gap-2 bg-cyprus dark:bg-sand text-sand dark:text-cyprus text-sm font-bold px-4 py-2.5 rounded-xl hover:bg-cyprus-light dark:hover:bg-sand-dark shadow-sm transition-all cursor-pointer"
          >
            <Plus size={16} /> Log Meal
          </button>
        </div>
      </div>

      {/* Log form */}
      {showForm && (
        <div className="mb-6 bg-white dark:bg-cyprus-light border border-cyprus/10 dark:border-sand/10 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-base text-cyprus dark:text-sand">Log a Meal</h2>
            <button onClick={() => setShowForm(false)} className="p-1 rounded-lg hover:bg-sand-dark dark:hover:bg-cyprus/20 cursor-pointer">
              <X size={16} className="text-cyprus/50 dark:text-sand/50" />
            </button>
          </div>
          {error && <p className="text-sm text-red-500 mb-3">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-cyprus/50 dark:text-sand/50 uppercase tracking-wider mb-1.5">Dish Name *</label>
                <input
                  required value={form.dish_name}
                  onChange={e => setForm(f => ({ ...f, dish_name: e.target.value }))}
                  placeholder="e.g. Grilled Chicken Salad"
                  className="w-full bg-sand dark:bg-cyprus border border-cyprus/15 dark:border-sand/15 text-cyprus dark:text-sand placeholder-cyprus/30 dark:placeholder-sand/30 rounded-xl px-3 py-2.5 text-sm focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-cyprus/50 dark:text-sand/50 uppercase tracking-wider mb-1.5">Meal Slot</label>
                <select
                  value={form.meal_slot}
                  onChange={e => setForm(f => ({ ...f, meal_slot: e.target.value }))}
                  className="w-full bg-sand dark:bg-cyprus border border-cyprus/15 dark:border-sand/15 text-cyprus dark:text-sand rounded-xl px-3 py-2.5 text-sm focus:outline-none"
                >
                  {SLOTS.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-cyprus/50 dark:text-sand/50 uppercase tracking-wider mb-1.5">Date</label>
              <input
                type="date" value={form.log_date}
                onChange={e => setForm(f => ({ ...f, log_date: e.target.value }))}
                className="w-full bg-sand dark:bg-cyprus border border-cyprus/15 dark:border-sand/15 text-cyprus dark:text-sand rounded-xl px-3 py-2.5 text-sm focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[
                { key: 'calories',  label: 'Calories', placeholder: '500' },
                { key: 'protein_g', label: 'Protein g', placeholder: '30' },
                { key: 'carbs_g',   label: 'Carbs g',   placeholder: '50' },
                { key: 'fat_g',     label: 'Fat g',     placeholder: '15' },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="block text-[10px] font-bold text-cyprus/50 dark:text-sand/50 uppercase tracking-wider mb-1">{label}</label>
                  <input
                    type="number" min="0" value={form[key]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="w-full bg-sand dark:bg-cyprus border border-cyprus/15 dark:border-sand/15 text-cyprus dark:text-sand placeholder-cyprus/25 dark:placeholder-sand/25 rounded-xl px-2.5 py-2 text-sm focus:outline-none"
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-3 pt-1">
              <button type="button" onClick={() => setShowForm(false)} className="text-sm text-cyprus/50 dark:text-sand/50 px-4 py-2 rounded-xl hover:bg-sand-dark dark:hover:bg-cyprus/20 cursor-pointer">
                Cancel
              </button>
              <button
                type="submit" disabled={saving}
                className="inline-flex items-center gap-2 bg-cyprus dark:bg-sand text-sand dark:text-cyprus text-sm font-bold px-5 py-2 rounded-xl disabled:opacity-60 cursor-pointer"
              >
                {saving ? <Loader size={14} className="animate-spin" /> : null}
                {saving ? 'Saving…' : 'Log Meal'}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16"><Loader size={24} className="animate-spin text-cyprus dark:text-sand" /></div>
      ) : logs.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No meals logged"
          desc="Start tracking your meals to see your nutrition history and progress."
          action={
            <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 bg-cyprus dark:bg-sand text-sand dark:text-cyprus text-sm font-bold px-5 py-3 rounded-xl cursor-pointer">
              <Plus size={15} /> Log Your First Meal
            </button>
          }
        />
      ) : (
        <div className="space-y-6">
          {sortedDates.map(date => (
            <div key={date}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-cyprus/50 dark:text-sand/50">
                  {new Date(date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                </span>
                <div className="flex-1 h-px bg-cyprus/10 dark:bg-sand/10" />
                <span className="text-xs text-cyprus/40 dark:text-sand/40">
                  {grouped[date].reduce((s, l) => s + (l.calories ?? 0), 0)} kcal
                </span>
              </div>
              <div className="space-y-2">
                {grouped[date].sort((a, b) => SLOTS.indexOf(a.meal_slot) - SLOTS.indexOf(b.meal_slot)).map(log => (
                  <div key={log.log_id} className="group bg-white dark:bg-cyprus-light border border-cyprus/8 dark:border-sand/8 rounded-xl px-4 py-3 flex items-center gap-3">
                    <span className="text-lg w-8 text-center flex-shrink-0">{SLOT_EMOJI[log.meal_slot] ?? '🍽️'}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm text-cyprus dark:text-sand truncate">{log.dish_name}</div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-bold uppercase text-cyprus/40 dark:text-sand/40">{log.meal_slot}</span>
                        {log.calories && <span className="text-[10px] text-cyprus/40 dark:text-sand/40">· {log.calories} kcal</span>}
                        {log.protein_g && <span className="text-[10px] text-cyprus/40 dark:text-sand/40">· {Math.round(log.protein_g)}g protein</span>}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(log.log_id)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-cyprus/30 dark:text-sand/30 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all cursor-pointer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
