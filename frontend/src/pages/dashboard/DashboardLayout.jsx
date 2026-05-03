import { useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Sidebar from '../../components/dashboard/Sidebar'
import { Loader } from 'lucide-react'

export default function DashboardLayout() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && !user) navigate('/auth')
  }, [user, loading, navigate])

  if (loading) {
    return (
      <div className="min-h-screen bg-sand dark:bg-cyprus flex items-center justify-center">
        <Loader size={28} className="animate-spin text-cyprus dark:text-sand" />
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-sand dark:bg-cyprus flex">
      <Sidebar />
      <main className="flex-1 ml-56 min-h-screen">
        <Outlet />
      </main>
    </div>
  )
}
