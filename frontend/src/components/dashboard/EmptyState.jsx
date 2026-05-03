export default function EmptyState({ icon: Icon, title, desc, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {Icon && (
        <div className="w-16 h-16 rounded-2xl bg-sand-dark dark:bg-cyprus-light flex items-center justify-center mb-5 border border-cyprus/8 dark:border-sand/8">
          <Icon size={28} className="text-cyprus/30 dark:text-sand/30" strokeWidth={1.5} />
        </div>
      )}
      <h3 className="font-display text-lg font-bold text-cyprus dark:text-sand mb-2">{title}</h3>
      <p className="text-sm text-cyprus/50 dark:text-sand/50 max-w-xs mb-6">{desc}</p>
      {action}
    </div>
  )
}
