import React from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Topbar from './components/Topbar'
import GeminiExample from './components/GeminiExample'
import Home from './pages/Home'
import Projects from './pages/Projects'
import ProjectSample from './pages/ProjectSample'
import Dsai from './pages/Dsai'
import Metrics from './pages/Metrics'
import ProcessAudit from './pages/ProcessAudit'
import Voc from './pages/Voc'
import ReviewDashboard from './pages/ReviewDashboard'
import ReviewReports from './pages/ReviewReports'
import './index.css'

function ScrollToTop() {
  const { pathname } = useLocation()
  React.useEffect(() => {
    const el = document.getElementById('app-content')
    if (el) el.scrollTop = 0
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'auto' })
  }, [pathname])
  return null
}

export default function App() {
  return (
    <Router>
      <div style={{minHeight: '100vh', display: 'flex', flexDirection: 'column'}}>
        <Topbar />
        <div id="app-root" style={{ display: 'flex', flex: 1, minHeight: '0' }}>
          <Sidebar />
          <div id="app-content" style={{ flex: 1, minWidth: 0 }}>
            <ScrollToTop />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/projects/:id" element={<ProjectSample />} />
              <Route path="/projects/:id/dsai-onboarding" element={<ProjectSample />} />
              <Route path="/dsai" element={<Dsai />} />
              <Route path="/gemini" element={<GeminiExample />} />
              <Route path="/metrics" element={<Metrics />} />
              <Route path="/process-audit" element={<ProcessAudit />} />
              <Route path="/voc" element={<Voc />} />
              <Route path="/review-dashboard" element={<ReviewDashboard />} />
              <Route path="/review-reports" element={<ReviewReports />} />
              <Route path="*" element={<Home />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  )
}
