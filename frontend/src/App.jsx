import { ThemeProvider } from './context/ThemeContext'
import Navbar       from './components/layout/Navbar'
import Footer       from './components/layout/Footer'
import LandingPage  from './pages/LandingPage'

export default function App() {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-sand dark:bg-cyprus transition-colors duration-300">
        <Navbar />
        <LandingPage />
        <Footer />
      </div>
    </ThemeProvider>
  )
}
