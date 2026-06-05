import { HashRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import HomePage from './pages/HomePage'
import ToolsPage from './pages/ToolsPage'
import BudgetPage from './pages/tools/BudgetPage'
import ResignationPage from './pages/tools/ResignationPage'
import WasteSortingPage from './pages/tools/WasteSortingPage'
import RoomSimulatorPage from './pages/tools/RoomSimulatorPage'
import SubscriptionPage from './pages/tools/SubscriptionPage'
import ComingSoonPage from './pages/ComingSoonPage'

function AnimatedRoutes() {
  const { pathname } = useLocation()
  return (
    <div key={pathname} className="page-enter">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/tools" element={<ToolsPage />} />
        <Route path="/tools/budget" element={<BudgetPage />} />
        <Route path="/tools/resignation" element={<ResignationPage />} />
        <Route path="/tools/waste-sorting" element={<WasteSortingPage />} />
        <Route path="/tools/room-simulator" element={<RoomSimulatorPage />} />
        <Route path="/tools/subscription" element={<SubscriptionPage />} />
        <Route path="/tools/savings-goal" element={<ComingSoonPage toolId="savings-goal" />} />
        <Route path="/tools/retirement" element={<ComingSoonPage toolId="retirement" />} />
        <Route path="/tools/date" element={<ComingSoonPage toolId="date" />} />
        <Route path="/tools/work-schedule" element={<ComingSoonPage toolId="work-schedule" />} />
      </Routes>
    </div>
  )
}

export default function App() {
  return (
    <HashRouter>
      <AppLayout>
        <AnimatedRoutes />
      </AppLayout>
    </HashRouter>
  )
}
