import { Routes, Route } from 'react-router'
import Layout from './components/Layout'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import Signals from './pages/Signals'
import Performance from './pages/Performance'
import Pricing from './pages/Pricing'
import Credits from './pages/Credits'
import Referrals from './pages/Referrals'
import Onboarding from './pages/Onboarding'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/signals" element={<Signals />} />
        <Route path="/performance" element={<Performance />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/credits" element={<Credits />} />
        <Route path="/referrals" element={<Referrals />} />
        <Route path="/start" element={<Onboarding />} />
      </Routes>
    </Layout>
  )
}
