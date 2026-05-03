import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, CalendarDays, ChefHat,
  ClipboardList, BarChart2, User, LogOut, Leaf,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import ThemeToggle from '../ui/ThemeToggle'

const navItems = [
  { to: '/dashboard',           icon: LayoutDashboard, label: 'Overview',  end: true },
  { to: '/dashboard/meal-plan', icon: CalendarDays,    label: 'Meal Plan' },
  { to: '/dashboard/recipes',   icon: ChefHat,         label: 'Recipes' },
  { to: '/dashboard/logs',      icon: ClipboardList,   label: 'Meal Logs' },
  { to: '/dashboard/analytics', icon: BarChart2,       label: 'Analytics' },
  { to: '/dashboard/profile',   icon: User,            label: 'Profile' },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/') }

  const initials = user?.name
    ? user.name.slice(0, 2).toUpperCase()
    : '?'

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-56 bg-cyprus dark:bg-cyprus-darker flex flex-col z-40 border-r border-sand/8">

      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 h-16 border-b border-sand/8 shrink-0">
        <div className="w-8 h-8 rounded-xl bg-sand/10 flex items-center justify-center">
          <Leaf size={16} className="text-sand" strokeWidth={2.5} />
        </div>
        <span className="font-display font-bold text-lg text-sand tracking-tight">
          Nutrition<span className="opacity-40">AI</span>
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-sand/15 text-sand'
                  : 'text-sand/50 hover:text-sand hover:bg-sand/8'
              }`
            }
          >
            <Icon size={18} strokeWidth={2} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-4 space-y-2 shrink-0 border-t border-sand/8 pt-3">
        <div className="flex items-center gap-2.5 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-sand/15 flex items-center justify-center shrink-0">
            <span className="text-sand text-xs font-bold">{initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sand text-sm font-semibold truncate">{user?.name}</div>
            <div className="text-sand/40 text-xs truncate">{user?.email || 'No email set'}</div>
          </div>
        </div>
        <div className="flex items-center gap-2 px-2">
          <ThemeToggle className="flex-1" />
          <button
            onClick={handleLogout}
            className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium text-sand/50 hover:text-sand hover:bg-sand/8 rounded-xl py-2.5 transition-all duration-200 cursor-pointer"
          >
            <LogOut size={15} /> Sign out
          </button>
        </div>
      </div>
    </aside>
  )
}
