import { Route, Routes } from 'react-router-dom'
import { LiveScoreProvider } from './context/LiveScoreContext'
import MainLayout from './layouts/MainLayout'
import Home from './pages/Home'
import Competition from './pages/Competition'
import Map from './pages/Map'
import Login from './pages/Login'
import Committee from './pages/Committee'
import LuckyDraw from './pages/luckyDraw'
import Live from './pages/Live'
import Maintenance from './pages/Maintenance'
import MaintenanceUsers from './pages/MaintenanceUsers'
import MaintenanceParticipants from './pages/MaintenanceParticipants'
import MaintenanceTeams from './pages/MaintenanceTeams'
import MaintenanceTournaments from './pages/MaintenanceTournaments'
import MaintenanceGames from './pages/MaintenanceGames'
import MaintenanceLiveYoutube from './pages/MaintenanceLiveYoutube'
import MaintenanceLuckyDraw from './pages/MaintenanceLuckyDraw'
import QRCodeTester from './pages/QRCodeTester'
import RequireRole from './components/RequireRole'

function App() {
  return (
    <LiveScoreProvider>
      <Routes>
        <Route element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="competition" element={<Competition />} />
          <Route path="map" element={<Map />} />
          <Route path="committee" element={<Committee />} />
          <Route path="lucky-draw" element={<LuckyDraw />} />
          <Route path="live" element={<Live />} />
          <Route
            path="maintenance"
            element={
              <RequireRole allowedRoles={['Admin', 'Maintainer']}>
                <Maintenance />
              </RequireRole>
            }
          />
          <Route
            path="maintenance/users"
            element={
              <RequireRole allowedRoles={['Admin']}>
                <MaintenanceUsers />
              </RequireRole>
            }
          />
          <Route
            path="maintenance/participants"
            element={
              <RequireRole allowedRoles={['Admin', 'Maintainer']}>
                <MaintenanceParticipants />
              </RequireRole>
            }
          />
          <Route
            path="maintenance/teams"
            element={
              <RequireRole allowedRoles={['Admin', 'Maintainer']}>
                <MaintenanceTeams />
              </RequireRole>
            }
          />
          <Route
            path="maintenance/tournaments"
            element={
              <RequireRole allowedRoles={['Admin', 'Maintainer']}>
                <MaintenanceTournaments />
              </RequireRole>
            }
          />
          <Route
            path="maintenance/games"
            element={
              <RequireRole allowedRoles={['Admin', 'Maintainer']}>
                <MaintenanceGames />
              </RequireRole>
            }
          />
          <Route
            path="maintenance/live-youtube"
            element={
              <RequireRole allowedRoles={['Admin', 'Maintainer']}>
                <MaintenanceLiveYoutube />
              </RequireRole>
            }
          />
          <Route
            path="maintenance/lucky-draw"
            element={
              <RequireRole allowedRoles={['Admin', 'Maintainer']}>
                <MaintenanceLuckyDraw />
              </RequireRole>
            }
          />
        </Route>
        <Route path="/login" element={<Login />} />
        <Route
          path="qr-tester"
          element={
            <RequireRole allowedRoles={['Admin', 'Maintainer']}>
              <QRCodeTester />
            </RequireRole>
          }
        />
      </Routes>
    </LiveScoreProvider>
  )
}

export default App
