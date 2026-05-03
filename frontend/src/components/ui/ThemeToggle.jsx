import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

export default function ThemeToggle({ className = '' }) {
  const { isDark, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`relative w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-300 cursor-pointer
        bg-sand-dark border-cyprus/20 text-cyprus hover:bg-sand-darker
        dark:bg-cyprus-light dark:border-sand/20 dark:text-sand dark:hover:bg-cyprus-lighter
        ${className}`}
    >
      <span className={`absolute transition-all duration-300 ${isDark ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-90'}`}>
        <Moon size={18} strokeWidth={2} />
      </span>
      <span className={`absolute transition-all duration-300 ${isDark ? 'opacity-0 rotate-90' : 'opacity-100 rotate-0'}`}>
        <Sun size={18} strokeWidth={2} />
      </span>
    </button>
  )
}
