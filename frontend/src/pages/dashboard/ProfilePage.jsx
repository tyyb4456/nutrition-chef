import { useState } from 'react'
import { User, Save, Loader, Check } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { userService } from '../../services/userService'

const ACTIVITY_LEVELS = ['sedentary', 'light', 'moderate', 'active', 'very_active']
const GOAL_TYPES      = ['fat_loss', 'maintenance', 'muscle_gain']
const GENDERS         = ['male', 'female', 'other']

export default function ProfilePage() {
  const { user, refreshUser } = useAuth()
  const [saving,  setSaving]  = useState(false)
  const [success, setSuccess] = useState(false)
  const [error,   setError]   = useState('')

  const [form, setForm] = useState({
    name:            user?.name            ?? '',
    email:           user?.email           ?? '',
    age:             user?.age             ?? '',
    gender:          user?.gender          ?? 'male',
    weight_kg:       user?.weight_kg       ?? '',
    height_cm:       user?.height_cm       ?? '',
    activity_level:  user?.activity_level  ?? 'moderate',
    goal_type:       user?.goal_type       ?? 'maintenance',
    calorie_target:  user?.calorie_target  ?? '',
    allergies:       (user?.allergies      ?? []).join(', '),
    medical_conditions: (user?.medical_conditions ?? []).join(', '),
  })

  const setField = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess(false)
    try {
      const payload = {
        name:           form.name || undefined,
        email:          form.email || undefined,
        age:            form.age           ? Number(form.age)           : undefined,
        gender:         form.gender        || undefined,
        weight_kg:      form.weight_kg     ? Number(form.weight_kg)     : undefined,
        height_cm:      form.height_cm     ? Number(form.height_cm)     : undefined,
        activity_level: form.activity_level || undefined,
        goal_type:      form.goal_type     || undefined,
        calorie_target: form.calorie_target ? Number(form.calorie_target) : undefined,
        allergies:      form.allergies.split(',').map(s => s.trim()).filter(Boolean),
        medical_conditions: form.medical_conditions.split(',').map(s => s.trim()).filter(Boolean),
      }
      await userService.updateMe(payload)
      await refreshUser()
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  const inputCls = 'w-full bg-white dark:bg-cyprus border border-cyprus/15 dark:border-sand/15 text-cyprus dark:text-sand placeholder-cyprus/30 dark:placeholder-sand/30 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyprus/25 dark:focus:ring-sand/25 transition-all'
  const labelCls = 'block text-xs font-bold text-cyprus/50 dark:text-sand/50 uppercase tracking-wider mb-1.5'

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-14 h-14 rounded-2xl bg-cyprus dark:bg-sand flex items-center justify-center flex-shrink-0">
          <span className="font-display text-xl font-black text-sand dark:text-cyprus">
            {user?.name?.slice(0, 2).toUpperCase() ?? '?'}
          </span>
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-cyprus dark:text-sand">{user?.name}</h1>
          <p className="text-sm text-cyprus/50 dark:text-sand/50">{user?.email || 'No email set'}</p>
        </div>
      </div>

      {error   && <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">{error}</div>}
      {success && (
        <div className="mb-5 px-4 py-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 text-sm flex items-center gap-2">
          <Check size={15} /> Profile updated successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Basic */}
        <div className="bg-sand-dark dark:bg-cyprus-light rounded-2xl p-5 border border-cyprus/8 dark:border-sand/8">
          <h2 className="font-display font-bold text-sm uppercase tracking-wider text-cyprus/50 dark:text-sand/50 mb-4">Account</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Username</label>
              <input type="text" value={form.name} onChange={e => setField('name', e.target.value)} placeholder="username" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Email</label>
              <input type="email" value={form.email} onChange={e => setField('email', e.target.value)} placeholder="you@example.com" className={inputCls} />
            </div>
          </div>
        </div>

        {/* Physical Stats */}
        <div className="bg-sand-dark dark:bg-cyprus-light rounded-2xl p-5 border border-cyprus/8 dark:border-sand/8">
          <h2 className="font-display font-bold text-sm uppercase tracking-wider text-cyprus/50 dark:text-sand/50 mb-4">Physical Stats</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Age</label>
              <input type="number" min="10" max="120" value={form.age} onChange={e => setField('age', e.target.value)} placeholder="25" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Gender</label>
              <select value={form.gender} onChange={e => setField('gender', e.target.value)} className={inputCls}>
                {GENDERS.map(g => <option key={g} value={g} className="capitalize">{g}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Weight (kg)</label>
              <input type="number" min="20" max="500" step="0.1" value={form.weight_kg} onChange={e => setField('weight_kg', e.target.value)} placeholder="70" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Height (cm)</label>
              <input type="number" min="50" max="300" value={form.height_cm} onChange={e => setField('height_cm', e.target.value)} placeholder="175" className={inputCls} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Activity Level</label>
              <div className="flex flex-wrap gap-2">
                {ACTIVITY_LEVELS.map(level => (
                  <button
                    key={level} type="button"
                    onClick={() => setField('activity_level', level)}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all cursor-pointer capitalize ${
                      form.activity_level === level
                        ? 'bg-cyprus dark:bg-sand text-sand dark:text-cyprus border-transparent'
                        : 'border-cyprus/20 dark:border-sand/20 text-cyprus/60 dark:text-sand/60 hover:border-cyprus/40 dark:hover:border-sand/40'
                    }`}
                  >
                    {level.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Goals */}
        <div className="bg-sand-dark dark:bg-cyprus-light rounded-2xl p-5 border border-cyprus/8 dark:border-sand/8">
          <h2 className="font-display font-bold text-sm uppercase tracking-wider text-cyprus/50 dark:text-sand/50 mb-4">Nutrition Goals</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Goal Type</label>
              <div className="flex flex-wrap gap-2">
                {GOAL_TYPES.map(g => (
                  <button
                    key={g} type="button"
                    onClick={() => setField('goal_type', g)}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all cursor-pointer capitalize ${
                      form.goal_type === g
                        ? 'bg-cyprus dark:bg-sand text-sand dark:text-cyprus border-transparent'
                        : 'border-cyprus/20 dark:border-sand/20 text-cyprus/60 dark:text-sand/60 hover:border-cyprus/40 dark:hover:border-sand/40'
                    }`}
                  >
                    {g.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className={labelCls}>Daily Calorie Target</label>
              <input type="number" min="800" max="6000" value={form.calorie_target} onChange={e => setField('calorie_target', e.target.value)} placeholder="2000" className={inputCls} />
            </div>
          </div>
        </div>

        {/* Health */}
        <div className="bg-sand-dark dark:bg-cyprus-light rounded-2xl p-5 border border-cyprus/8 dark:border-sand/8">
          <h2 className="font-display font-bold text-sm uppercase tracking-wider text-cyprus/50 dark:text-sand/50 mb-4">Health Info</h2>
          <div className="space-y-4">
            <div>
              <label className={labelCls}>Allergies <span className="normal-case font-normal opacity-60">(comma separated)</span></label>
              <input type="text" value={form.allergies} onChange={e => setField('allergies', e.target.value)} placeholder="nuts, dairy, gluten" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Medical Conditions <span className="normal-case font-normal opacity-60">(comma separated)</span></label>
              <input type="text" value={form.medical_conditions} onChange={e => setField('medical_conditions', e.target.value)} placeholder="diabetes, hypertension" className={inputCls} />
            </div>
          </div>
        </div>

        <button
          type="submit" disabled={saving}
          className="w-full flex items-center justify-center gap-2 bg-cyprus dark:bg-sand text-sand dark:text-cyprus font-bold text-sm py-3.5 rounded-xl hover:bg-cyprus-light dark:hover:bg-sand-dark shadow-md transition-all disabled:opacity-60 cursor-pointer"
        >
          {saving ? <Loader size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? 'Saving…' : 'Save Profile'}
        </button>
      </form>
    </div>
  )
}
