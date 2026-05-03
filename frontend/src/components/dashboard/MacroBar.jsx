export default function MacroBar({ label, current, target, color = 'bg-cyprus dark:bg-sand', unit = 'g' }) {
  const pct = target > 0 ? Math.min((current / target) * 100, 100) : 0
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5 text-xs">
        <span className="font-semibold text-cyprus dark:text-sand">{label}</span>
        <span className="text-cyprus/50 dark:text-sand/50">
          <span className="font-bold text-cyprus dark:text-sand">{current ?? 0}</span>
          {unit} / {target ?? 0}{unit}
        </span>
      </div>
      <div className="h-2 bg-sand-dark dark:bg-cyprus-dark rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
