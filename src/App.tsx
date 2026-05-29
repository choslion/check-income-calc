import { HashRouter, Routes, Route } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import HomePage from './pages/HomePage'
import ToolsPage from './pages/ToolsPage'
import BudgetPage from './pages/tools/BudgetPage'
import ResignationPage from './pages/tools/ResignationPage'
import ComingSoonPage from './pages/ComingSoonPage'

export default function App() {
  return (
    <HashRouter>
      <AppLayout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/tools" element={<ToolsPage />} />
          <Route path="/tools/budget" element={<BudgetPage />} />
          <Route path="/tools/resignation" element={<ResignationPage />} />
          <Route path="/tools/subscription" element={<ComingSoonPage toolId="subscription" />} />
          <Route path="/tools/savings-goal" element={<ComingSoonPage toolId="savings-goal" />} />
          <Route path="/tools/retirement" element={<ComingSoonPage toolId="retirement" />} />
          <Route path="/tools/date" element={<ComingSoonPage toolId="date" />} />
          <Route path="/tools/work-schedule" element={<ComingSoonPage toolId="work-schedule" />} />
        </Routes>
      </AppLayout>
    </HashRouter>
  )
}
