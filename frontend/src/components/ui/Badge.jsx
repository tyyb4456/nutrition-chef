export default function Badge({ children, variant = 'default', className = '' }) {
  const variants = {
    default: 'bg-cyprus/10 text-cyprus dark:bg-sand/10 dark:text-sand',
    solid:   'bg-cyprus text-sand dark:bg-sand dark:text-cyprus',
    outline: 'border border-cyprus/30 text-cyprus dark:border-sand/30 dark:text-sand',
    muted:   'bg-sand-dark text-cyprus/70 dark:bg-cyprus-light dark:text-sand/70',
  }

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${variants[variant]} ${className}`}>
      {children}
    </span>
  )
}
