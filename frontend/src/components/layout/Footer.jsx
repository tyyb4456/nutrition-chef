import { Leaf, Globe, MessageCircle, Rss, Mail } from 'lucide-react'

const footerLinks = {
  Product:  ['Features', 'Meal Plans', 'Recipe Library', 'Progress Tracking', 'Pricing'],
  Company:  ['About Us', 'Blog', 'Careers', 'Press Kit', 'Contact'],
  Support:  ['Help Center', 'Community', 'API Docs', 'Status', 'Changelog'],
  Legal:    ['Privacy Policy', 'Terms of Service', 'GDPR', 'Accessibility'],
}

const socials = [
  { Icon: Globe,         label: 'Website' },
  { Icon: MessageCircle, label: 'Community' },
  { Icon: Rss,           label: 'Blog' },
  { Icon: Mail,          label: 'Newsletter' },
]

const awards = [
  { label: 'App Store Best',  sub: 'Health & Fitness 2024' },
  { label: 'Product Hunt #1', sub: 'Product of the Day' },
  { label: 'SXSW Award',      sub: 'Innovation in Health' },
]

export default function Footer() {
  return (
    <footer className="bg-cyprus dark:bg-cyprus-darker text-sand/70">

      {/* Awards strip */}
      <div className="border-b border-sand/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-wrap items-center justify-center gap-6 sm:gap-14">
          {awards.map((a) => (
            <div key={a.label} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-sand/10 flex items-center justify-center">
                <span className="text-sand text-sm">🏆</span>
              </div>
              <div>
                <div className="text-sm font-bold text-sand">{a.label}</div>
                <div className="text-xs text-sand/50">{a.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 lg:gap-12">

          {/* Brand */}
          <div className="col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-sand/10 flex items-center justify-center">
                <Leaf size={18} className="text-sand" strokeWidth={2.5} />
              </div>
              <span className="font-display font-bold text-xl text-sand tracking-tight">
                Nutrition<span className="opacity-50">AI</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed mb-6 max-w-xs">
              The world's most personalized AI nutrition platform. Eat smarter, feel better, live longer.
            </p>
            <div className="flex gap-2">
              {socials.map(({ Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="w-9 h-9 rounded-xl bg-sand/10 hover:bg-sand/20 text-sand/60 hover:text-sand flex items-center justify-center transition-all duration-200"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Link groups */}
          {Object.entries(footerLinks).map(([group, links]) => (
            <div key={group}>
              <h4 className="text-xs font-bold uppercase tracking-widest text-sand mb-4">{group}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm hover:text-sand transition-colors duration-200">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-sand/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {[['bg-sand/10 hover:bg-sand/20', 'App Store'], ['bg-sand/10 hover:bg-sand/20', 'Google Play']].map(([cls, store]) => (
              <a key={store} href="#" className={`text-xs font-semibold text-sand px-4 py-2 rounded-xl ${cls} transition-colors`}>
                {store}
              </a>
            ))}
          </div>
          <p className="text-xs text-sand/40 text-center">
            © 2025 Nutrition AI, Inc. · Made with care for healthier humans everywhere.
          </p>
        </div>
      </div>
    </footer>
  )
}
