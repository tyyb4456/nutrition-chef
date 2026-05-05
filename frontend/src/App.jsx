import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext'

import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import LandingPage from './pages/LandingPage'
import AuthPage from './pages/AuthPage'
import DashboardLayout from './pages/dashboard/DashboardLayout'
import OverviewPage from './pages/dashboard/OverviewPage'
import MealPlanPage from './pages/dashboard/MealPlanPage'
import RecipesPage from './pages/dashboard/RecipesPage'
import MealLogsPage from './pages/dashboard/MealLogsPage'
import ImageAnalysisPage from './pages/dashboard/ImageAnalysisPage'
import AnalyticsPage from './pages/dashboard/AnalyticsPage'
import ProfilePage from './pages/dashboard/ProfilePage'

function LandingLayout() {
  return (
    <div className="min-h-screen bg-sand dark:bg-cyprus">
      <Navbar />
      <LandingPage />
      {/* <Footer /> */}
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/" element={<LandingLayout />} />
            <Route path="/auth" element={<AuthPage />} />

            {/* Protected — dashboard */}
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<OverviewPage />} />
              <Route path="meal-plan" element={<MealPlanPage />} />
              <Route path="recipes" element={<RecipesPage />} />
              <Route path="logs" element={<MealLogsPage />} />
              <Route path="scan" element={<ImageAnalysisPage />} />
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="profile" element={<ProfilePage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}
