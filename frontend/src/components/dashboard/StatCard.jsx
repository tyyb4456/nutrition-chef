export default function StatCard({ icon: Icon, label, value, sub, accent = false, loading = false }) {
  return (
    <div className={`rounded-2xl p-5 border ${
      accent
        ? 'bg-cyprus dark:bg-sand text-sand dark:text-cyprus border-cyprus dark:border-sand'
        : 'bg-white dark:bg-cyprus-light border-cyprus/8 dark:border-sand/8'
    }`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
          accent ? 'bg-sand/15 dark:bg-cyprus/15' : 'bg-sand-dark dark:bg-cyprus/30'
        }`}>
          {Icon && <Icon size={18} className={accent ? 'text-sand dark:text-cyprus' : 'text-cyprus dark:text-sand'} strokeWidth={2} />}
        </div>
      </div>
      {loading ? (
        <div className="space-y-2">
          <div className={`h-7 w-24 rounded-lg animate-pulse ${accent ? 'bg-sand/20' : 'bg-sand-dark dark:bg-cyprus/30'}`} />
          <div className={`h-4 w-16 rounded animate-pulse ${accent ? 'bg-sand/10' : 'bg-sand-dark dark:bg-cyprus/20'}`} />
        </div>
      ) : (
        <>
          <div className={`font-display text-2xl font-bold mb-0.5 ${accent ? 'text-sand dark:text-cyprus' : 'text-cyprus dark:text-sand'}`}>
            {value ?? '—'}
          </div>
          <div className={`text-xs font-medium ${accent ? 'text-sand/60 dark:text-cyprus/60' : 'text-cyprus/50 dark:text-sand/50'}`}>
            {label}
          </div>
          {sub && (
            <div className={`text-[11px] mt-1 ${accent ? 'text-sand/50 dark:text-cyprus/50' : 'text-cyprus/40 dark:text-sand/40'}`}>
              {sub}
            </div>
          )}
        </>
      )}
    </div>
  )
}
