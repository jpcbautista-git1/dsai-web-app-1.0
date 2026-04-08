import React, { useState } from 'react'
import Sidebar from './components/Sidebar'
import Topbar from './components/Topbar'
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

export default function App() {
  const [route, setRoute] = useState('home')

  function renderRoute() {
    if (route === 'home') return <Home />
    if (route === 'projects') return <Projects onOpen={(r) => setRoute(r === 'sample' ? 'project' : r)} />
    if (route === 'project') return <ProjectSample />
    if (route === 'dsai') return <Dsai />
    if (route === 'metrics') return <Metrics />
    if (route === 'process-audit') return <ProcessAudit />
    if (route === 'voc') return <Voc />
    if (route === 'review-dashboard') return <ReviewDashboard />
    if (route === 'review-reports') return <ReviewReports />
    return <Home />
  }

  return (
    <div style={{minHeight: '100vh', display: 'flex', flexDirection: 'column'}}>
      <Topbar />
      <div id="app-root" style={{ display: 'flex', flex: 1, minHeight: '0' }}>
        <Sidebar onNavigate={setRoute} active={route} />
        <div style={{ flex: 1, minWidth: 0 }}>
          {renderRoute()}
        </div>
      </div>
    </div>
  )
}
