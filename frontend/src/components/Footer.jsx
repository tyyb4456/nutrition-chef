const footerLinks = {
  Product: ['Features', 'Meal Plans', 'Recipe Library', 'Progress Tracking', 'Pricing'],
  Company: ['About Us', 'Blog', 'Careers', 'Press Kit', 'Contact'],
  Support: ['Help Center', 'Community', 'API Docs', 'Status', 'Cookie Settings'],
  Legal: ['Privacy Policy', 'Terms of Service', 'GDPR', 'Accessibility'],
}

const socials = [
  {
    name: 'Twitter',
    href: '#',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    name: 'Instagram',
    href: '#',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    ),
  },
  {
    name: 'YouTube',
    href: '#',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
  {
    name: 'TikTok',
    href: '#',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V9.59a8.16 8.16 0 004.77 1.52V7.66a4.85 4.85 0 01-1-.97z" />
      </svg>
    ),
  },
]

const awards = [
  { label: 'App Store Best', sub: 'Health & Fitness 2024' },
  { label: 'Product Hunt', sub: '#1 Product of the Day' },
  { label: 'SXSW Award', sub: 'Innovation in Health' },
]

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-400">

      {/* Awards strip */}
      <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-wrap items-center justify-center gap-6 sm:gap-12">
          {awards.map((a) => (
            <div key={a.label} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 text-sm">🏆</div>
              <div>
                <div className="text-sm font-bold text-white">{a.label}</div>
                <div className="text-xs text-gray-500">{a.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 lg:gap-12">

          {/* Brand */}
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-linear-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-md">
                <span className="text-white text-lg">🥗</span>
              </div>
              <span className="font-display font-bold text-xl text-white">
                Nutrition<span className="text-green-400">AI</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed mb-6 max-w-xs">
              The world's most personalized AI nutrition platform. Eat smarter, feel better, live longer.
            </p>
            <div className="flex gap-3">
              {socials.map((s) => (
                <a
                  key={s.name}
                  href={s.href}
                  aria-label={s.name}
                  className="w-9 h-9 rounded-xl bg-gray-800 hover:bg-green-600 text-gray-400 hover:text-white flex items-center justify-center transition-all duration-300"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([group, links]) => (
            <div key={group}>
              <h4 className="text-sm font-bold text-white mb-4">{group}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm hover:text-green-400 transition-colors duration-200">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* App store badges */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex flex-wrap gap-3">
              <a href="#" className="flex items-center gap-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white rounded-xl px-5 py-3 transition-colors duration-200">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98l-.09.06c-.22.16-2.18 1.27-2.16 3.8.03 3.02 2.65 4.03 2.68 4.04l-.07.24zM13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
                <div>
                  <div className="text-xs text-gray-400">Download on the</div>
                  <div className="text-sm font-bold">App Store</div>
                </div>
              </a>
              <a href="#" className="flex items-center gap-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white rounded-xl px-5 py-3 transition-colors duration-200">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3.18 23.76c.27.15.57.23.9.23.32 0 .64-.09.9-.26l11.24-6.49-2.5-2.51-10.54 9.03zM.29 1.08C.1 1.42 0 1.82 0 2.28v19.44c0 .46.1.86.29 1.2l.06.06 10.88-10.88v-.26L.35 1.02.29 1.08zm19.83 9.15l-2.55-1.47-2.85 2.85 2.85 2.85 2.56-1.48c.73-.42.73-1.32-.01-1.75zm-16.3 12.6L14.8 16 12.29 13.5 3.82 22z" />
                </svg>
                <div>
                  <div className="text-xs text-gray-400">Get it on</div>
                  <div className="text-sm font-bold">Google Play</div>
                </div>
              </a>
            </div>

            <p className="text-xs text-gray-600 text-center sm:text-right">
              © 2025 Nutrition AI, Inc. All rights reserved.<br />
              Made with 💚 for healthier humans everywhere.
            </p>
          </div>
        </div>
      </div>

    </footer>
  )
}
