import { useState, useEffect } from 'react'
import { Menu, X, Leaf, ArrowRight } from 'lucide-react'
import ThemeToggle from '../ui/ThemeToggle'
import Button from '../ui/Button'

const navLinks = [
  { label: 'Features',     href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Meals',        href: '#meals' },
  { label: 'Pricing',      href: '#pricing' },
  { label: 'Testimonials', href: '#testimonials' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-sand/90 dark:bg-cyprus/90 backdrop-blur-md shadow-sm border-b border-cyprus/10 dark:border-sand/10'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">

          {/* Logo */}
          <a href="#" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-cyprus dark:bg-sand flex items-center justify-center shadow-md group-hover:shadow-cyprus/30 dark:group-hover:shadow-sand/20 transition-shadow duration-300">
              <Leaf size={18} className="text-sand dark:text-cyprus" strokeWidth={2.5} />
            </div>
            <span className="font-display font-bold text-xl text-cyprus dark:text-sand tracking-tight">
              Nutrition<span className="opacity-60">AI</span>
            </span>
          </a>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-7">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-cyprus/70 dark:text-sand/70 hover:text-cyprus dark:hover:text-sand transition-colors duration-200 relative after:absolute after:-bottom-0.5 after:left-0 after:w-0 after:h-0.5 after:bg-cyprus dark:after:bg-sand after:transition-all after:duration-300 hover:after:w-full"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Right actions */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            <a href="#" className="text-sm font-medium text-cyprus/70 dark:text-sand/70 hover:text-cyprus dark:hover:text-sand transition-colors px-2">
              Sign In
            </a>
            <Button href="#pricing" size="sm">
              Get Started
              <ArrowRight size={15} strokeWidth={2.5} />
            </Button>
          </div>

          {/* Mobile row */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setOpen(!open)}
              aria-label="Toggle menu"
              className="p-2 rounded-xl text-cyprus dark:text-sand hover:bg-cyprus/10 dark:hover:bg-sand/10 transition-colors"
            >
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        {open && (
          <div className="md:hidden bg-sand dark:bg-cyprus border-t border-cyprus/10 dark:border-sand/10 py-4 space-y-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="flex items-center px-4 py-3 text-sm font-medium text-cyprus/80 dark:text-sand/80 hover:text-cyprus dark:hover:text-sand hover:bg-cyprus/5 dark:hover:bg-sand/5 rounded-lg transition-colors"
              >
                {link.label}
              </a>
            ))}
            <div className="px-4 pt-3 border-t border-cyprus/10 dark:border-sand/10 mt-2 flex flex-col gap-2">
              <a href="#" className="text-center text-sm font-medium text-cyprus/70 dark:text-sand/70 py-2">
                Sign In
              </a>
              <Button href="#pricing" onClick={() => setOpen(false)} className="w-full justify-center">
                Get Started Free <ArrowRight size={15} />
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
