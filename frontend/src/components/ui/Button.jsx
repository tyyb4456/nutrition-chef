export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  href,
  className = '',
  ...props
}) {
  const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-full transition-all duration-300 cursor-pointer select-none'

  const variants = {
    primary:  'bg-cyprus text-sand hover:bg-cyprus-light shadow-md hover:shadow-lg hover:scale-[1.03] dark:bg-sand dark:text-cyprus dark:hover:bg-sand-dark',
    outline:  'border-2 border-cyprus text-cyprus hover:bg-cyprus hover:text-sand dark:border-sand dark:text-sand dark:hover:bg-sand dark:hover:text-cyprus',
    ghost:    'text-cyprus hover:bg-cyprus/10 dark:text-sand dark:hover:bg-sand/10',
    sand:     'bg-sand text-cyprus hover:bg-sand-dark shadow-sm dark:bg-cyprus-light dark:text-sand dark:hover:bg-cyprus-lighter',
  }

  const sizes = {
    sm: 'text-sm px-4 py-2',
    md: 'text-sm px-6 py-3',
    lg: 'text-base px-8 py-4',
  }

  const cls = `${base} ${variants[variant]} ${sizes[size]} ${className}`

  if (href) {
    return <a href={href} className={cls} {...props}>{children}</a>
  }

  return <button className={cls} {...props}>{children}</button>
}
