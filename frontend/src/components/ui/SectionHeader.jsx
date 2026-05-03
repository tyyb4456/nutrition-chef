import Badge from './Badge'

export default function SectionHeader({ eyebrow, title, highlight, description, center = true }) {
  return (
    <div className={`max-w-2xl mb-14 ${center ? 'mx-auto text-center' : ''}`}>
      {eyebrow && (
        <div className="mb-4">
          <Badge variant="outline">{eyebrow}</Badge>
        </div>
      )}
      <h2 className="font-display text-4xl sm:text-5xl font-bold text-cyprus dark:text-sand leading-tight mb-4">
        {title}{' '}
        {highlight && <span className="gradient-text">{highlight}</span>}
      </h2>
      {description && (
        <p className="text-base sm:text-lg text-cyprus/60 dark:text-sand/60 leading-relaxed">
          {description}
        </p>
      )}
    </div>
  )
}
