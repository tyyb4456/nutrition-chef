import { useEffect, useState } from 'react'
import { BarChart2, RefreshCw, Loader, TrendingUp } from 'lucide-react'
import { analyticsService } from '../../services/analyticsService'
import { mealLogService }   from '../../services/mealLogService'
import { useAuth }          from '../../context/AuthContext'
import EmptyState from '../../components/dashboard/EmptyState'

export default function AnalyticsPage() {
  const { user } = useAuth()
  const [adherence,   setAdherence]   = useState([])
  const [preferences, setPreferences] = useState(null)
  const [report,      setReport]      = useState(null)
  const [loading,     setLoading]     = useState(true)
  const [generating,  setGenerating]  = useState(false)
  const [error,       setError]       = useState('')

  const calTarget = user?.calorie_target ?? 2000

  useEffect(() => {
    Promise.allSettled([
      mealLogService.getAdherence(14),
      analyticsService.getPreferences(),
      analyticsService.getProgress(),
    ]).then(([adhR, prefR, repR]) => {
      if (adhR.status  === 'fulfilled') setAdherence(adhR.value ?? [])
      if (prefR.status === 'fulfilled') setPreferences(prefR.value)
      if (repR.status  === 'fulfilled') setReport(repR.value)
      setLoading(false)
    })
  }, [])

  const generateReport = async () => {
    setGenerating(true)
    setError('')
    try {
      const r = await analyticsService.generateProgress()
      setReport(r)
    } catch (e) {
      setError(e.message)
    } finally {
      setGenerating(false)
    }
  }

  const maxCal = Math.max(...adherence.map(a => a.actual_calories ?? 0), calTarget, 1)

  const avgCalories = adherence.length
    ? Math.round(adherence.reduce((s, a) => s + (a.actual_calories ?? 0), 0) / adherence.length)
    : 0

  const avgAdherence = adherence.length
    ? Math.round(adherence.reduce((s, a) => s + (a.adherence_pct ?? 0), 0) / adherence.length)
    : 0

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader size={24} className="animate-spin text-cyprus dark:text-sand" />
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-cyprus dark:text-sand">Analytics</h1>
          <p className="text-sm text-cyprus/50 dark:text-sand/50 mt-1">Your progress and insights</p>
        </div>
        <button
          onClick={generateReport}
          disabled={generating}
          className="inline-flex items-center gap-2 bg-cyprus dark:bg-sand text-sand dark:text-cyprus text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-cyprus-light dark:hover:bg-sand-dark shadow-sm transition-all disabled:opacity-60 cursor-pointer"
        >
          {generating ? <Loader size={16} className="animate-spin" /> : <RefreshCw size={16} />}
          {generating ? 'Generating…' : 'AI Progress Report'}
        </button>
      </div>

      {error && <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">{error}</div>}

      {/* Summary cards */}
      {adherence.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Days Tracked',   value: adherence.length },
            { label: 'Avg Calories',   value: `${avgCalories} kcal` },
            { label: 'Avg Adherence',  value: `${avgAdherence}%` },
            { label: 'Target',         value: `${calTarget} kcal` },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white dark:bg-cyprus-light border border-cyprus/8 dark:border-sand/8 rounded-2xl p-4 text-center">
              <div className="font-display text-xl font-bold text-cyprus dark:text-sand">{value}</div>
              <div className="text-xs text-cyprus/50 dark:text-sand/50 mt-1">{label}</div>
            </div>
          ))}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">

        {/* Adherence chart */}
        <div className="lg:col-span-2 bg-white dark:bg-cyprus-light border border-cyprus/8 dark:border-sand/8 rounded-2xl p-5">
          <h2 className="font-display font-bold text-base text-cyprus dark:text-sand mb-4">14-Day Calorie Adherence</h2>
          {adherence.length === 0 ? (
            <EmptyState icon={BarChart2} title="No data yet" desc="Start logging meals to see your adherence trend." />
          ) : (
            <>
              <div className="flex items-end gap-1.5 h-40 mb-2">
                {adherence.map((a, i) => {
                  const pct = Math.min((a.actual_calories / maxCal) * 100, 100)
                  const targetPct = (calTarget / maxCal) * 100
                  const onTarget = a.adherence_pct >= 85 && a.adherence_pct <= 115
                  return (
                    <div key={i} className="flex-1 relative flex items-end" style={{ height: '100%' }}>
                      <div
                        className={`w-full rounded-t-lg ${onTarget ? 'bg-cyprus dark:bg-sand' : 'bg-cyprus/35 dark:bg-sand/35'}`}
                        style={{ height: `${pct}%` }}
                        title={`${a.log_date}: ${a.actual_calories} kcal (${Math.round(a.adherence_pct)}%)`}
                      />
                      <div
                        className="absolute w-full border-t border-dashed border-cyprus/30 dark:border-sand/30"
                        style={{ bottom: `${targetPct}%` }}
                      />
                    </div>
                  )
                })}
              </div>
              <div className="flex justify-between text-[10px] text-cyprus/30 dark:text-sand/30">
                <span>{new Date(adherence[0]?.log_date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                <span className="flex items-center gap-1">
                  <span className="w-4 border-t border-dashed border-cyprus/40 dark:border-sand/40" /> = {calTarget} kcal target
                </span>
                <span>{new Date(adherence[adherence.length-1]?.log_date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
              </div>
            </>
          )}
        </div>

        {/* Learned Preferences */}
        <div className="bg-white dark:bg-cyprus-light border border-cyprus/8 dark:border-sand/8 rounded-2xl p-5">
          <h2 className="font-display font-bold text-base text-cyprus dark:text-sand mb-4">AI-Learned Preferences</h2>
          {!preferences || Object.keys(preferences?.preferences ?? {}).length === 0 ? (
            <EmptyState icon={TrendingUp} title="Learning in progress" desc="Rate more recipes so the AI can learn your tastes." />
          ) : (
            <div className="space-y-3">
              {Object.entries(preferences.preferences ?? {}).slice(0, 8).map(([key, val]) => (
                <div key={key} className="flex items-start justify-between gap-2">
                  <span className="text-xs font-semibold text-cyprus/60 dark:text-sand/60 capitalize">
                    {key.replace(/_/g, ' ')}
                  </span>
                  <span className="text-xs font-bold text-cyprus dark:text-sand text-right">{String(val)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* AI Progress Report */}
      {(report || generating) && (
        <div className="mt-6 bg-white dark:bg-cyprus-light border border-cyprus/8 dark:border-sand/8 rounded-2xl p-5">
          <h2 className="font-display font-bold text-base text-cyprus dark:text-sand mb-3">AI Progress Report</h2>
          {generating ? (
            <div className="flex items-center gap-3 py-4">
              <Loader size={20} className="animate-spin text-cyprus dark:text-sand" />
              <p className="text-sm text-cyprus/60 dark:text-sand/60">Generating your personalized report…</p>
            </div>
          ) : report?.report ? (
            <div className="prose prose-sm max-w-none">
              <p className="text-sm text-cyprus/80 dark:text-sand/80 leading-relaxed whitespace-pre-wrap">{report.report}</p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}
