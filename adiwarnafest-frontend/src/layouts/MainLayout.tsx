import { Outlet } from 'react-router-dom'
import { useAuth } from '../store/auth'
import BottomNavbar from '../components/BottomNavbar'
import TopNavbar from '../components/TopNavbar'
import LoadingScreen from '../components/LoadingScreen'

function MainLayout() {
  const { isLoading } = useAuth()

  if (isLoading) {
    return <LoadingScreen />
  }

  return (
    <div className="app-shell">
      <TopNavbar />
      <main className="page" style={{ paddingBottom: 'calc(80px + env(safe-area-inset-bottom))' }}>
        <Outlet />
      </main>
      <BottomNavbar />
    </div>
  )
}

export default MainLayout
