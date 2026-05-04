import { useState, useRef } from 'react'
import { Camera, Upload, X, Loader, Check, Plus, AlertCircle } from 'lucide-react'
import { imageService } from '../../services/imageService'

const SLOTS = ['breakfast', 'lunch', 'dinner', 'snack']
const CONFIDENCE_COLOR = {
  high:   'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20',
  medium: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20',
  low:    'text-red-600  dark:text-red-400  bg-red-50  dark:bg-red-900/20',
}

function todayKey() {
  return new Date().toLocaleDateString('en-CA')
}

export default function ImageAnalysisPage() {
  const fileRef = useRef(null)

  const [preview,   setPreview]   = useState(null)
  const [file,      setFile]      = useState(null)
  const [result,    setResult]    = useState(null)
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState('')
  const [logged,    setLogged]    = useState(false)

  const [mealSlot,  setMealSlot]  = useState('lunch')
  const [logDate,   setLogDate]   = useState(todayKey())
  const [autoLog,   setAutoLog]   = useState(false)

  const handleFile = (f) => {
    if (!f) return
    setFile(f)
    setResult(null)
    setError('')
    setLogged(false)
    const reader = new FileReader()
    reader.onload = e => setPreview(e.target.result)
    reader.readAsDataURL(f)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const f = e.dataTransfer.files?.[0]
    if (f) handleFile(f)
  }

  const analyse = async () => {
    if (!file) return
    setLoading(true)
    setError('')
    setResult(null)
    setLogged(false)
    try {
      const res = await imageService.upload(file, {
        auto_log:  autoLog,
        meal_slot: mealSlot,
        log_date:  logDate,
      })
      setResult(res)
      if (res.logged) setLogged(true)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const logManually = async () => {
    if (!result) return
    setLoading(true)
    setError('')
    try {
      const res = await imageService.upload(file, {
        auto_log:  true,
        meal_slot: mealSlot,
        log_date:  logDate,
      })
      if (res.logged) setLogged(true)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setPreview(null)
    setFile(null)
    setResult(null)
    setError('')
    setLogged(false)
  }

  const n = result?.estimated_nutrition ?? {}

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">

      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-cyprus dark:text-sand">Scan Food</h1>
        <p className="text-sm text-cyprus/50 dark:text-sand/50 mt-1">
          Upload a photo of your meal — Gemini AI will identify it and estimate the nutrition
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">

        {/* Upload panel */}
        <div className="space-y-4">
          {/* Drop zone */}
          {!preview ? (
            <div
              onDrop={handleDrop}
              onDragOver={e => e.preventDefault()}
              onClick={() => fileRef.current?.click()}
              className="group border-2 border-dashed border-cyprus/20 dark:border-sand/20 rounded-2xl p-10 flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-cyprus/50 dark:hover:border-sand/50 hover:bg-cyprus/3 dark:hover:bg-sand/3 transition-all duration-200 min-h-55"
            >
              <div className="w-16 h-16 rounded-2xl bg-sand-dark dark:bg-cyprus-light flex items-center justify-center group-hover:bg-cyprus/10 dark:group-hover:bg-sand/10 transition-colors">
                <Camera size={28} className="text-cyprus/40 dark:text-sand/40" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-cyprus dark:text-sand text-sm">Drop a food photo here</p>
                <p className="text-xs text-cyprus/40 dark:text-sand/40 mt-1">or click to browse · JPEG, PNG, WEBP · max 10 MB</p>
              </div>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-cyprus dark:bg-sand text-sand dark:text-cyprus px-4 py-2 rounded-full">
                <Upload size={13} /> Choose File
              </span>
            </div>
          ) : (
            <div className="relative rounded-2xl overflow-hidden border border-cyprus/10 dark:border-sand/10">
              <img src={preview} alt="Preview" className="w-full object-cover max-h-72" />
              <button
                onClick={reset}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>
          )}

          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={e => handleFile(e.target.files?.[0])}
          />

          {/* Options */}
          <div className="bg-white dark:bg-cyprus-light border border-cyprus/8 dark:border-sand/8 rounded-2xl p-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyprus/50 dark:text-sand/50">Log Options</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-cyprus/60 dark:text-sand/60 mb-1">Meal Slot</label>
                <select
                  value={mealSlot}
                  onChange={e => setMealSlot(e.target.value)}
                  className="w-full bg-sand dark:bg-cyprus border border-cyprus/15 dark:border-sand/15 text-cyprus dark:text-sand rounded-xl px-3 py-2 text-sm focus:outline-none"
                >
                  {SLOTS.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-cyprus/60 dark:text-sand/60 mb-1">Date</label>
                <input
                  type="date"
                  value={logDate}
                  onChange={e => setLogDate(e.target.value)}
                  className="w-full bg-sand dark:bg-cyprus border border-cyprus/15 dark:border-sand/15 text-cyprus dark:text-sand rounded-xl px-3 py-2 text-sm focus:outline-none"
                />
              </div>
            </div>
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={autoLog}
                onChange={e => setAutoLog(e.target.checked)}
                className="w-4 h-4 rounded accent-cyprus dark:accent-sand"
              />
              <span className="text-sm text-cyprus/70 dark:text-sand/70">Auto-log to meal history after analysis</span>
            </label>
          </div>

          {error && (
            <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          <button
            onClick={analyse}
            disabled={!file || loading}
            className="w-full flex items-center justify-center gap-2 bg-cyprus dark:bg-sand text-sand dark:text-cyprus font-bold text-sm py-3.5 rounded-xl hover:bg-cyprus-light dark:hover:bg-sand-dark shadow-md transition-all disabled:opacity-50 cursor-pointer"
          >
            {loading
              ? <><Loader size={16} className="animate-spin" /> Analysing with Gemini…</>
              : <><Camera size={16} /> Analyse Food</>
            }
          </button>

          {loading && (
            <p className="text-center text-xs text-cyprus/40 dark:text-sand/40">
              Gemini Vision is identifying your meal — typically 3–8 seconds
            </p>
          )}
        </div>

        {/* Results panel */}
        <div>
          {!result && !loading && (
            <div className="h-full min-h-75 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-cyprus/10 dark:border-sand/10 p-8 text-center">
              <Camera size={36} className="text-cyprus/20 dark:text-sand/20 mb-3" />
              <p className="text-sm font-medium text-cyprus/40 dark:text-sand/40">
                Upload a photo and click Analyse to see results
              </p>
            </div>
          )}

          {result && (
            <div className="space-y-4">
              {/* Overall confidence + summary */}
              <div className="bg-white dark:bg-cyprus-light border border-cyprus/8 dark:border-sand/8 rounded-2xl p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h2 className="font-display font-bold text-sm text-cyprus dark:text-sand">
                    {result.dish_summary}
                  </h2>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full shrink-0 ${CONFIDENCE_COLOR[result.confidence_overall] ?? ''}`}>
                    {result.confidence_overall} confidence
                  </span>
                </div>
                {result.meal_type_guess && (
                  <span className="text-[10px] font-semibold text-cyprus/40 dark:text-sand/40 capitalize">
                    Detected as: {result.meal_type_guess}
                  </span>
                )}
              </div>

              {/* Nutrition estimate */}
              <div className="bg-white dark:bg-cyprus-light border border-cyprus/8 dark:border-sand/8 rounded-2xl p-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-cyprus/50 dark:text-sand/50 mb-3">Estimated Nutrition</h3>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Calories',  val: n.calories,              unit: 'kcal' },
                    { label: 'Protein',   val: n.protein_g != null ? Math.round(n.protein_g) : null, unit: 'g' },
                    { label: 'Carbs',     val: n.carbs_g   != null ? Math.round(n.carbs_g)   : null, unit: 'g' },
                    { label: 'Fat',       val: n.fat_g     != null ? Math.round(n.fat_g)     : null, unit: 'g' },
                    { label: 'Fiber',     val: n.fiber_g   != null ? Math.round(n.fiber_g)   : null, unit: 'g' },
                    { label: 'Sodium',    val: n.sodium_mg != null ? Math.round(n.sodium_mg) : null, unit: 'mg' },
                  ].filter(x => x.val != null).map(({ label, val, unit }) => (
                    <div key={label} className="bg-sand dark:bg-cyprus rounded-xl p-3 flex items-center justify-between">
                      <span className="text-xs text-cyprus/60 dark:text-sand/60">{label}</span>
                      <span className="text-sm font-bold text-cyprus dark:text-sand">{val} <span className="text-[10px] font-normal opacity-60">{unit}</span></span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Identified items */}
              {result.identified_items?.length > 0 && (
                <div className="bg-white dark:bg-cyprus-light border border-cyprus/8 dark:border-sand/8 rounded-2xl p-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-cyprus/50 dark:text-sand/50 mb-3">Identified Items</h3>
                  <div className="space-y-2">
                    {result.identified_items.map((item, i) => (
                      <div key={i} className="flex items-center justify-between gap-2">
                        <div>
                          <span className="text-sm font-semibold text-cyprus dark:text-sand">{item.name}</span>
                          <span className="text-xs text-cyprus/40 dark:text-sand/40 ml-2">{item.estimated_amount}</span>
                        </div>
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${CONFIDENCE_COLOR[item.confidence] ?? ''}`}>
                          {item.confidence}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {result.analysis_notes && (
                <div className="bg-cyprus/5 dark:bg-sand/5 border border-cyprus/10 dark:border-sand/10 rounded-xl p-3">
                  <p className="text-xs text-cyprus/60 dark:text-sand/60 leading-relaxed">{result.analysis_notes}</p>
                </div>
              )}

              {/* Log action */}
              {logged ? (
                <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-xl px-4 py-3 text-green-700 dark:text-green-400 text-sm font-semibold">
                  <Check size={16} /> Logged to your meal history!
                </div>
              ) : (
                <button
                  onClick={logManually}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-white dark:bg-cyprus-light border border-cyprus/20 dark:border-sand/20 text-cyprus dark:text-sand font-bold text-sm py-3 rounded-xl hover:bg-sand-dark dark:hover:bg-cyprus/30 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Plus size={15} /> Log This Meal
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
