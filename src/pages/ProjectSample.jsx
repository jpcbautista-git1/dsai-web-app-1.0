import React, { useState, useEffect, useRef } from 'react'

export default function ProjectSample(){
  const [activeTab, setActiveTab] = useState('basic')
  const [modalOpen, setModalOpen] = useState(false)
  // DSAI onboard inline form state
  const [dsaiOnboardOpen, setDsaiOnboardOpen] = useState(false)
  const [dsaiData, setDsaiData] = useState({ projectName: 'Website Redesign', engagementName: '', engagementId: '', startDate: '', endDate: '' })
  const [dsaiInlineMessage, setDsaiInlineMessage] = useState('')
  const [dsaiOnboardSaved, setDsaiOnboardSaved] = useState(false)

  // Phases for modal
  const [phases, setPhases] = useState([])
  function addPhase(prefill = {}){
    const id = 'phase-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2,8)
    setPhases(s => ([...s, { id, name: prefill.name || '', desc: prefill.desc || '', start: prefill.start || '', end: prefill.end || '' }]))
  }
  function updatePhase(id, changes){
    setPhases(s => s.map(p => p.id === id ? { ...p, ...changes } : p))
  }
  function removePhase(id){
    setPhases(s => s.filter(p => p.id !== id))
  }

  // Resources for modal
  const [resources, setResources] = useState([])
  function addResource(prefill = {}, phaseId){
    const id = 'resource-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2,8)
    setResources(s => ([...s, { id, phaseId: prefill.phaseId || phaseId || '', name: prefill.name || '', level: prefill.level || 'Partner', location: prefill.location || 'Philippines', start: prefill.start || '', end: prefill.end || '' }]))
  }
  function updateResource(id, changes){
    setResources(s => s.map(r => r.id === id ? { ...r, ...changes } : r))
  }
  function removeResource(id){
    setResources(s => s.filter(r => r.id !== id))
  }

  // Validation state for modal
  const [phaseErrors, setPhaseErrors] = useState({})
  const [resourceErrors, setResourceErrors] = useState({})
  const [dsaiErrors, setDsaiErrors] = useState({})

  function validateModal(){
    const dErrors = {}
    const pErrors = {}
    const rErrors = {}
    let valid = true

    // validate DSAI header fields
    if(!dsaiData.projectName || !dsaiData.projectName.trim()){ dErrors.projectName = 'Required'; valid = false }
    if(!dsaiData.engagementName || !dsaiData.engagementName.trim()){ dErrors.engagementName = 'Required'; valid = false }
    // engagementId validation removed (no longer required)

    // validate phases
    phases.forEach(p => {
      const errs = {}
      if(!p.name || !p.name.trim()) { errs.name = 'Required'; valid = false }
      if(!p.start) { errs.start = 'Required'; valid = false }
      if(!p.end) { errs.end = 'Required'; valid = false }
      if(p.start && p.end && p.start > p.end) { errs.order = 'Start must be before End'; valid = false }
      if(Object.keys(errs).length) pErrors[p.id] = errs
    })

    // validate resources
    resources.forEach(r => {
      const errs = {}
      // resource name and gpn are no longer required
      // make Level required
      if(!r.level || !String(r.level).trim()) { errs.level = 'Required'; valid = false }
      if(!r.start) { errs.start = 'Required'; valid = false }
      if(!r.end) { errs.end = 'Required'; valid = false }
      if(r.start && r.end && r.start > r.end) { errs.order = 'Start must be before End'; valid = false }
      if(Object.keys(errs).length) rErrors[r.id] = errs
    })

    setDsaiErrors(dErrors)
    setPhaseErrors(pErrors)
    setResourceErrors(rErrors)
    return valid
  }

  function handleSaveDsai(){
    const ok = validateModal()
    if(ok){
      // persist dsai payload (dsaiData + phases + resources) to localStorage and mark as onboarded
      try{
        const payload = { ...dsaiData, phases, resources, onboarded: true, savedAt: new Date().toISOString() }
        localStorage.setItem('dsaiOnboard', JSON.stringify(payload))
      }catch(e){ console.error('Failed to persist DSAI onboard', e) }

      // update UI state to reflect saved/onboarded status
      setDsaiOnboardSaved(true)
      setModalOpen(false)
      setDsaiOnboardOpen(false)

      // ensure dsaiData / phases / resources in state reflect saved payload (they already do) but set dsaiData explicitly
      setDsaiData(s => ({ ...s, projectName: dsaiData.projectName || s.projectName, engagementName: dsaiData.engagementName || s.engagementName, engagementId: dsaiData.engagementId || s.engagementId, startDate: dsaiData.startDate || s.startDate, endDate: dsaiData.endDate || s.endDate }))

      // clear validation errors
      setDsaiErrors({})
      setPhaseErrors({})
      setResourceErrors({})

      console.log('DSAI saved', { dsaiData, phases, resources })
    } else {
      // focus first error
      const el = document.querySelector('.invalid') || document.querySelector('.remove-phase')
      if(el && el.scrollIntoView) el.scrollIntoView({behavior:'smooth',block:'center'})
    }
  }

  function handleInlineSaveDsai(){
    const errs = {}
    if(!dsaiData.projectName || !dsaiData.projectName.trim()){ errs.projectName = 'Required' }
    if(!dsaiData.engagementName || !dsaiData.engagementName.trim()){ errs.engagementName = 'Required' }
    // engagementId is no longer required for inline save
    setDsaiErrors(errs)
    if(Object.keys(errs).length){
      const el = document.querySelector('.invalid')
      if(el && el.scrollIntoView) el.scrollIntoView({behavior:'smooth',block:'center'})
      return
    }
    // persist to localStorage for now (prototype)
    try{ localStorage.setItem('dsaiOnboard', JSON.stringify(dsaiData)) }catch(e){ /* ignore */ }
    setDsaiOnboardSaved(true)
    setDsaiInlineMessage('Saved successfully')
    setTimeout(()=>setDsaiInlineMessage(''),3000)
    console.log('Inline DSAI saved', dsaiData)
  }

  // Clear inline DSAI form, phases and resources (used by the Clear button)
  function clearDsaiInline(){
    setDsaiData({ projectName: '', engagementName: '', engagementId: '', startDate: '', endDate: '' })
    setPhases([])
    setResources([])
    setDsaiOnboardSaved(false)
    setDsaiInlineMessage('Cleared')
    setTimeout(()=>setDsaiInlineMessage(''),2500)
    // also remove persisted prototype payload
    try{ localStorage.removeItem('dsaiOnboard') }catch(e){ /* ignore */ }
  }

  // Simple rate card and helpers for summary cost calculation (used by saved summary)
  const RATE_CARD = {
    'Partner': { 'Philippines': 180.00, 'India': 180.00 },
    'Executive Director': { 'Philippines': 152.00, 'India': 152.00 },
    'Associate Director': { 'Philippines': 97.00, 'India': 80.00 },
    'Senior Manager': { 'Philippines': 72.00, 'India': 58.00 },
    'Manager': { 'Philippines': 49.00, 'India': 40.25 },
    'Senior 3': { 'Philippines': 28.25, 'India': 24.25 },
    'Senior 1-2': { 'Philippines': 26.00, 'India': 21.75 },
    'Staff 2-3': { 'Philippines': 16.00, 'India': 13.00 },
    'Staff 1': { 'Philippines': 13.50, 'India': 10.00 },
    'Senior': { 'Philippines': 26.00, 'India': 21.75 },
    'Mid': { 'Philippines': 18.00, 'India': 15.00 },
    'Junior': { 'Philippines': 12.00, 'India': 10.00 }
  }
  const HOURS_PER_DAY = loc => (loc === 'India' ? 9 : (loc === 'Philippines' ? 8 : 8))
  const USD = n => (isNaN(n) ? '$0.00' : n.toLocaleString('en-US', { style: 'currency', currency: 'USD' }))
  const formatDate = (isoOrDdMmYy) => {
    if(!isoOrDdMmYy) return ''
    // if already dd/mm/yyyy
    if(/^[0-3]\d\/[0-1]\d\/[0-9]{4}$/.test(isoOrDdMmYy)) return isoOrDdMmYy
    // try YYYY-MM-DD
    const m = isoOrDdMmYy.match(/^([0-9]{4})-([0-9]{2})-([0-9]{2})/)
    if(m) return `${m[3]}/${m[2]}/${m[1]}`
    // fallback
    return isoOrDdMmYy
  }
  function businessDaysBetween(startIso, endIso){
    try{
      // normalize YYYY-MM-DD or DD/MM/YYYY
      const parse = s => {
        if(!s) return null
        if(/^[0-3]\d\/[0-1]\d\/[0-9]{4}$/.test(s)){
          const [d,m,y] = s.split('/')
          return new Date(`${y}-${m}-${d}`)
        }
        return new Date(s)
      }
      const a = parse(startIso)
      const b = parse(endIso)
      if(!a || !b || isNaN(a) || isNaN(b) || a > b) return 0
      let count = 0; const cur = new Date(a)
      while(cur <= b){ const day = cur.getDay(); if(day !== 0 && day !== 6) count++; cur.setDate(cur.getDate()+1) }
      return count
    }catch(e){ return 0 }
  }

  // Improved Gantt renderer with axis, responsive sizing and tooltip
  function Gantt({ phases, projectStart, projectEnd }){
    const containerRef = useRef(null)
    const [width, setWidth] = useState(900)
    const [hover, setHover] = useState(null)

    useEffect(()=>{
      const el = containerRef.current
      if(!el) return
      const obs = new ResizeObserver(()=>{
        setWidth(Math.max(400, el.clientWidth || 900))
      })
      obs.observe(el)
      setWidth(Math.max(400, el.clientWidth || 900))
      return ()=>obs.disconnect()
    }, [containerRef.current])

    const parseDateForGantt = s => {
      if(!s) return null
      if(/^[0-3]\d\/[0-1]\d\/[0-9]{4}$/.test(s)){ const [d,m,y]=s.split('/'); return new Date(`${y}-${m}-${d}`) }
      if(/^[0-9]{4}-[0-9]{2}-[0-9]{2}/.test(s)) return new Date(s)
      const d = new Date(s); return isNaN(d) ? null : d
    }
    const phaseStarts = phases.map(p=>parseDateForGantt(p.start)).filter(Boolean)
    const phaseEnds = phases.map(p=>parseDateForGantt(p.end)).filter(Boolean)
    const pStart = parseDateForGantt(projectStart) || (phaseStarts.length ? new Date(Math.min(...phaseStarts.map(d=>d.getTime()))) : null)
    const pEnd = parseDateForGantt(projectEnd) || (phaseEnds.length ? new Date(Math.max(...phaseEnds.map(d=>d.getTime()))) : null)
    if(!pStart || !pEnd || pStart > pEnd) return (<div style={{height:80,display:'flex',alignItems:'center',color:'#9ca3af'}}>Insufficient dates for Gantt.</div>)

    // timeline calculations
    const totalDays = Math.max(1, Math.ceil((pEnd - pStart)/(1000*60*60*24)) + 1)
    const leftPad = 60
    const rightPad = 20
    const innerWidth = Math.max(200, width - leftPad - rightPad)
    const dayWidth = innerWidth / totalDays
    const rowHeight = 32
    const height = 20 + phases.length * rowHeight + 40

    // nice tick interval (days)
    const approxTicks = Math.min(8, Math.max(2, Math.floor(innerWidth / 120)))
    const tickDays = Math.ceil(totalDays / approxTicks)

    const formatTick = d => `${('0'+d.getDate()).slice(-2)}/${('0'+(d.getMonth()+1)).slice(-2)}`

    return (
      <div ref={containerRef} style={{border:'1px solid #edf2ff',borderRadius:10,padding:12,background:'#fff'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
          <div style={{fontWeight:700,color:'#0f172a'}}>Timeline</div>
          <div style={{color:'#6b7280',fontSize:12}}>{formatDate(pStart.toISOString().slice(0,10))} — {formatDate(pEnd.toISOString().slice(0,10))}</div>
        </div>
        <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} preserveAspectRatio="xMinYMin meet">
          {/* axis ticks */}
          <g transform={`translate(${leftPad},20)`}>
            {[...Array(approxTicks+1).keys()].map(i => {
              const d = new Date(pStart.getTime() + Math.round(i * tickDays) * 24*60*60*1000)
              const x = Math.round(((d - pStart)/(1000*60*60*24)) * dayWidth)
              return (
                <g key={i}>
                  <line x1={x} x2={x} y1={0} y2={phases.length*rowHeight + 6} stroke="#eef2ff" />
                  <text x={x} y={phases.length*rowHeight + 20} fontSize={11} fill="#6b7280" textAnchor="middle">{formatTick(d)}</text>
                </g>
              )
            })}

            {/* phase bars */}
            {phases.map((p, idx) => {
              const ps = parseDateForGantt(p.start)
              const pe = parseDateForGantt(p.end)
              if(!ps || !pe) return null
              const startOffset = Math.max(0, Math.round((ps - pStart)/(1000*60*60*24)))
              const lenDays = Math.max(1, Math.round((pe - ps)/(1000*60*60*24)) + 1)
              const x = startOffset * dayWidth
              const w = Math.max(8, lenDays * dayWidth)
              const y = idx * rowHeight
              const color = ['#6a0dad','#4338ca','#0ea5a2','#f59e0b'][idx % 4]
              return (
                <g key={p.id || idx} onMouseEnter={()=>setHover({idx,x,y,w,p})} onMouseLeave={()=>setHover(null)}>
                  <rect x={x} y={y} rx={6} ry={6} width={w} height={18} fill={color} opacity={0.12} stroke={color} />
                  <rect x={x+2} y={y+2} rx={5} ry={5} width={Math.max(6,w-4)} height={14} fill={color} />
                  <text x={x+8} y={y+12} fontSize={12} fill="#ffffff" style={{pointerEvents:'none'}}>{p.name || 'Phase'}</text>
                </g>
              )
            })}

            {/* today line */}
            {(() => {
              const today = new Date(); if(today < pStart || today > pEnd) return null
              const off = Math.round((today - pStart)/(1000*60*60*24)) * dayWidth
              return <g><line x1={off} x2={off} y1={0} y2={phases.length*rowHeight} stroke="#ef4444" strokeWidth={2} strokeDasharray="4 3" /><text x={off+6} y={-4} fontSize={11} fill="#ef4444">Today</text></g>
            })()}

            {/* hover tooltip */}
            {hover && (
              <g>
                <rect x={hover.x + hover.w + 8} y={hover.y} rx={6} ry={6} width={220} height={64} fill="#0f172a" opacity={0.95} />
                <text x={hover.x + hover.w + 16} y={hover.y + 18} fontSize={12} fill="#fff">{hover.p.name}</text>
                <text x={hover.x + hover.w + 16} y={hover.y + 36} fontSize={11} fill="#d1d5db">{formatDate(hover.p.start)} → {formatDate(hover.p.end)}</text>
                <text x={hover.x + hover.w + 16} y={hover.y + 52} fontSize={11} fill="#d1d5db">{hover.p.desc || ''}</text>
              </g>
            )}

          </g>
        </svg>
      </div>
    )
  }

  // Load saved onboard payload (if any) so summary renders immediately after Save
  React.useEffect(()=>{
    try{
      const raw = localStorage.getItem('dsaiOnboard')
      if(raw){
        const payload = JSON.parse(raw)
        if(payload){
          setDsaiOnboardSaved(!!payload.onboarded || true)
          // keep existing dsaiData values unless payload supplies them
          setDsaiData(s => ({ ...s, projectName: payload.projectName || s.projectName || '', engagementName: payload.engagementName || s.engagementName || '', engagementId: payload.engagementId || s.engagementId || '', startDate: payload.startDate || payload.start || s.startDate || '', endDate: payload.endDate || payload.end || s.endDate || '' }))
          if(Array.isArray(payload.phases) && payload.phases.length) setPhases(payload.phases)
          if(Array.isArray(payload.resources) && payload.resources.length) setResources(payload.resources)
          setDsaiOnboardOpen(false)
        }
      }
    }catch(e){ /* ignore */ }
  }, [])

  // compute per-resource costs and estimated total for the summary view
  const resourceCosts = resources.map(r => {
    const start = r.start || r.startDate || ''
    const end = r.end || r.endDate || ''
    const days = businessDaysBetween(start, end) || 0
    const hours = days * HOURS_PER_DAY(r.location)
    const ratesForLevel = RATE_CARD[r.level] || {}
    const rate = (ratesForLevel[r.location] || Object.values(ratesForLevel)[0]) || 26
    const cost = (hours || 0) * (rate || 0)
    return { ...r, days, hours, rate, cost }
  })
  const estimatedCost = resourceCosts.reduce((s, r) => s + (r.cost || 0), 0)

  return (
    <main style={{padding:20, fontFamily:"'Plus Jakarta Sans', Inter, system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial", fontSize:14, color:'#374151'}}>
      <div style={{maxWidth:1200,margin:'0 auto'}}>

        {/* Breadcrumbs / header */}
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:12,marginBottom:14}}>
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            <div style={{fontSize:14,fontWeight:800,color:'#374151'}}>PROJECTS › <span style={{fontWeight:700}}>PIN Website</span></div>
          </div>

          <div style={{display:'flex',gap:8,alignItems:'center'}}>
            <div style={{display:'inline-flex',alignItems:'center',gap:8,padding:'6px 8px',borderRadius:999,background:'#fff',border:'1px solid #e7e9ee',fontSize:12,color:'#374151'}}>SSL - TC</div>
            <div style={{display:'inline-flex',alignItems:'center',gap:8,padding:'6px 8px',borderRadius:999,background:'#fff',border:'1px solid #e7e9ee',fontSize:12,color:'#374151'}}>SMART ID - 12308</div>
            <div style={{display:'inline-flex',alignItems:'center',gap:8,padding:'6px 8px',borderRadius:999,background:'#fff',border:'1px solid #e7e9ee',fontSize:12,color:'#374151'}}>Profinda ID - 2953691</div>
          </div>
        </div>

        {/* Tabs container */}
        <div style={{background:'#fff',border:'1px solid #e7e9ee',borderRadius:10,boxShadow:'0 6px 16px rgba(16,24,40,.06)',overflow:'hidden'}}>
          <div style={{display:'flex',flexWrap:'wrap',gap:8,padding:10,borderBottom:'1px solid #e7e9ee'}} role="tablist" aria-label="Project tabs">
            <button onClick={()=>setActiveTab('basic')} aria-selected={activeTab==='basic'} style={{padding:'8px 12px',borderRadius:8,border:'none',background: activeTab==='basic' ? '#eef2ff' : '#fafafa',color: activeTab==='basic' ? '#4338ca' : '#374151',cursor:'pointer'}}>Basic Details</button>
            <button onClick={()=>setActiveTab('additional')} aria-selected={activeTab==='additional'} style={{padding:'8px 12px',borderRadius:8,border:'none',background: activeTab==='additional' ? '#eef2ff' : '#fafafa',color: activeTab==='additional' ? '#4338ca' : '#374151',cursor:'pointer'}}>Additional Details</button>
            <button onClick={()=>setActiveTab('assets')} aria-selected={activeTab==='assets'} style={{padding:'8px 12px',borderRadius:8,border:'none',background: activeTab==='assets' ? '#eef2ff' : '#fafafa',color: activeTab==='assets' ? '#4338ca' : '#374151',cursor:'pointer'}}>Software & Hardware Assets</button>
            <button onClick={()=>setActiveTab('collab')} aria-selected={activeTab==='collab'} style={{padding:'8px 12px',borderRadius:8,border:'none',background: activeTab==='collab' ? '#eef2ff' : '#fafafa',color: activeTab==='collab' ? '#4338ca' : '#374151',cursor:'pointer'}}>Collaborating competencies</button>
            <button onClick={()=>setActiveTab('star')} aria-selected={activeTab==='star'} style={{padding:'8px 12px',borderRadius:8,border:'none',background: activeTab==='star' ? '#eef2ff' : '#fafafa',color: activeTab==='star' ? '#4338ca' : '#374151',cursor:'pointer'}}>Star Rating</button>
            <button onClick={()=>setActiveTab('charter')} aria-selected={activeTab==='charter'} style={{padding:'8px 12px',borderRadius:8,border:'none',background: activeTab==='charter' ? '#eef2ff' : '#fafafa',color: activeTab==='charter' ? '#4338ca' : '#374151',cursor:'pointer'}}>Project Charter</button>
            <button onClick={()=>setActiveTab('findings')} aria-selected={activeTab==='findings'} style={{padding:'8px 12px',borderRadius:8,border:'none',background: activeTab==='findings' ? '#eef2ff' : '#fafafa',color: activeTab==='findings' ? '#4338ca' : '#374151',cursor:'pointer'}}>Findings</button>
            <button onClick={()=>setActiveTab('tier')} aria-selected={activeTab==='tier'} style={{padding:'8px 12px',borderRadius:8,border:'none',background: activeTab==='tier' ? '#eef2ff' : '#fafafa',color: activeTab==='tier' ? '#4338ca' : '#374151',cursor:'pointer'}}>Tier Classification</button>

            {/* DSAI tab (matches original HTML id for scripts) */}
            <button id="tab-dsai" onClick={()=>{ setActiveTab('dsai'); setDsaiOnboardOpen(true); }} aria-selected={activeTab==='dsai'} style={{padding:'8px 12px',borderRadius:8,border:'none',background: activeTab==='dsai' ? '#550a8a' : '#6a0dad',color:'#fff',cursor:'pointer'}}>Onboard to DSAI</button>

            <div style={{flex:1}} />
            {/* removed header onboard button — Onboard button is placed inside the DSAI panel to preserve original DOM id (btnOnboard) */}

          </div>

          {/* Keep original form for all non-DSAI tabs */}
          {activeTab !== 'dsai' && (
            <form id="projectForm" style={{padding:20}} className="panel">
             {activeTab==='basic' && (
               <div>
                 {/* Unified 2-column grid (matches project_sample two-column layout) */}
                 <div style={{display:'grid',gridTemplateColumns:'repeat(2,minmax(320px,1fr))',gap:12}} className="form-grid">
                   <div style={{display:'flex',flexDirection:'column',gap:6}} className="field">
                     <label htmlFor="projectName" style={{fontSize:12,fontWeight:600,color:'#374151'}}>Project Name <span style={{color:'#ef4444'}}>*</span></label>
                     <input id="projectName" name="projectName" type="text" defaultValue="Website Redesign" style={{padding:12,borderRadius:12,border:'1px solid #e7e9ee',background:'#f3f4f6'}} />
                   </div>

                   <div style={{display:'flex',flexDirection:'column',gap:6}} className="field">
                     <label htmlFor="projectStart" style={{fontSize:12,fontWeight:600,color:'#374151'}}>Project Start Date <span style={{color:'#ef4444'}}>*</span></label>
                     <div style={{display:'flex',gap:8,alignItems:'center'}}>
                       <input id="projectStart" name="projectStart" type="text" defaultValue="01/04/2026" style={{padding:12,borderRadius:12,border:'1px solid #e7e9ee',flex:1,background:'#f3f4f6'}} />
                       <div style={{width:36,height:36,display:'grid',placeItems:'center',background:'#fff',borderRadius:8,border:'1px solid #e7e9ee'}}>📅</div>
                       <input id="projectStart_iso" type="hidden" defaultValue="2026-04-01" />
                     </div>
                   </div>

                   <div style={{display:'flex',flexDirection:'column',gap:6}} className="field">
                     <label htmlFor="projectEnd" style={{fontSize:12,fontWeight:600,color:'#374151'}}>Project End Date <span style={{color:'#ef4444'}}>*</span></label>
                     <div style={{display:'flex',gap:8,alignItems:'center'}}>
                       <input id="projectEnd" name="projectEnd" type="text" defaultValue="" placeholder="dd/mm/yyyy" style={{padding:12,borderRadius:12,border:'1px solid #e7e9ee',flex:1,background:'#f3f4f6'}} />
                       <div style={{width:36,height:36,display:'grid',placeItems:'center',background:'#fff',borderRadius:8,border:'1px solid #e7e9ee'}}>📅</div>
                       <input id="projectEnd_iso" type="hidden" defaultValue="" />
                     </div>
                   </div>

                   <div style={{display:'flex',flexDirection:'column',gap:6}} className="field">
                     <label htmlFor="deliveryOwner" style={{fontSize:12,fontWeight:600,color:'#374151'}}>Project delivery owned by</label>
                     <select id="deliveryOwner" name="deliveryOwner" defaultValue="Data Engineering" style={{padding:12,borderRadius:12,border:'1px solid #e7e9ee',background:'#f3f4f6'}}>
                       <option>Data Engineering</option>
                       <option>SAP</option>
                       <option>Cybersecurity</option>
                     </select>
                   </div>

                   <div style={{display:'flex',flexDirection:'column',gap:6}} className="field">
                     <label htmlFor="projectManager" style={{fontSize:12,fontWeight:600,color:'#374151'}}>Project Manager <span style={{color:'#ef4444'}}>*</span></label>
                     <select id="projectManager" name="projectManager" defaultValue="Thamarai Kannan Rajendran" style={{padding:12,borderRadius:12,border:'1px solid #e7e9ee',background:'#f3f4f6'}}>
                       <option>Thamarai Kannan Rajendran</option>
                       <option>Chou, Adrich</option>
                     </select>
                   </div>

                   <div style={{display:'flex',flexDirection:'column',gap:6}} className="field">
                     <label htmlFor="primaryLocation" style={{fontSize:12,fontWeight:600,color:'#374151'}}>Primary Location <span style={{color:'#ef4444'}}>*</span></label>
                     <select id="primaryLocation" name="primaryLocation" defaultValue="India-Bangalore" style={{padding:12,borderRadius:12,border:'1px solid #e7e9ee',background:'#f3f4f6'}}>
                       <option>India-Bangalore</option>
                       <option>Philippines-Manila</option>
                     </select>
                   </div>

                   <div style={{display:'flex',flexDirection:'column',gap:6}} className="field">
                     <label htmlFor="projectManagerDelegate" style={{fontSize:12,fontWeight:600,color:'#374151'}}>Project Manager Delegate</label>
                     <input id="projectManagerDelegate" name="projectManagerDelegate" type="text" defaultValue="Megha H Mathew" style={{padding:12,borderRadius:12,border:'1px solid #e7e9ee',background:'#f3f4f6'}} />
                   </div>

                   <div style={{display:'flex',flexDirection:'column',gap:6}} className="field">
                     <label htmlFor="competencyHead" style={{fontSize:12,fontWeight:600,color:'#374151'}}>Competency Head <span style={{color:'#ef4444'}}>*</span></label>
                     <input id="competencyHead" name="competencyHead" type="text" defaultValue="Dela Cruz, Juan" style={{padding:12,borderRadius:12,border:'1px solid #e7e9ee',background:'#f3f4f6'}} />
                   </div>

                   <div style={{display:'flex',flexDirection:'column',gap:6}} className="field">
                     <label htmlFor="deliveryManager" style={{fontSize:12,fontWeight:600,color:'#374151'}}>Delivery Manager <span style={{color:'#ef4444'}}>*</span></label>
                     <input id="deliveryManager" name="deliveryManager" type="text" defaultValue="Peter Parker" style={{padding:12,borderRadius:12,border:'1px solid #e7e9ee',background:'#f3f4f6'}} />
                   </div>

                   <div style={{display:'flex',flexDirection:'column',gap:6}} className="field">
                     <label htmlFor="subCompetency" style={{fontSize:12,fontWeight:600,color:'#374151'}}>Sub Competency</label>
                     <select id="subCompetency" name="subCompetency" defaultValue="--" style={{padding:12,borderRadius:12,border:'1px solid #e7e9ee',background:'#f3f4f6'}}>
                       <option>--</option>
                       <option>Analytics</option>
                     </select>
                   </div>

                   <div style={{display:'flex',flexDirection:'column',gap:6}} className="field">
                     <label htmlFor="area" style={{fontSize:12,fontWeight:600,color:'#374151'}}>Area <span style={{color:'#ef4444'}}>*</span></label>
                     <select id="area" name="area" defaultValue="APAC" style={{padding:12,borderRadius:12,border:'1px solid #e7e9ee',background:'#f3f4f6'}}>
                       <option>APAC</option>
                       <option>AMER</option>
                     </select>
                   </div>

                   <div style={{display:'flex',flexDirection:'column',gap:6}} className="field">
                     <label htmlFor="projectChargeCode" style={{fontSize:12,fontWeight:600,color:'#374151'}}>Project Charge Code <span style={{color:'#ef4444'}}>*</span></label>
                     <input id="projectChargeCode" name="projectChargeCode" type="text" defaultValue="69341378" style={{padding:12,borderRadius:12,border:'1px solid #e7e9ee',background:'#f3f4f6'}} />
                   </div>

                   <div style={{display:'flex',flexDirection:'column',gap:6}} className="field">
                     <label htmlFor="clientCountry" style={{fontSize:12,fontWeight:600,color:'#374151'}}>Client Country <span style={{color:'#ef4444'}}>*</span></label>
                     <select id="clientCountry" name="clientCountry" defaultValue="Australia" style={{padding:12,borderRadius:12,border:'1px solid #e7e9ee',background:'#f3f4f6'}}>
                       <option>Australia</option>
                       <option>India</option>
                     </select>
                   </div>

                   <div style={{display:'flex',flexDirection:'column',gap:6}} className="field">
                     <label htmlFor="methodology" style={{fontSize:12,fontWeight:600,color:'#374151'}}>Methodology Used</label>
                     <input id="methodology" name="methodology" type="text" defaultValue="Generic Agile Method" style={{padding:12,borderRadius:12,border:'1px solid #e7e9ee',background:'#f3f4f6'}} />
                   </div>

                   <div style={{display:'flex',flexDirection:'column',gap:6}} className="field">
                     <label htmlFor="secondaryLocation" style={{fontSize:12,fontWeight:600,color:'#374151'}}>Secondary Location</label>
                     <select id="secondaryLocation" name="secondaryLocation" defaultValue="India (IN)" style={{padding:12,borderRadius:12,border:'1px solid #e7e9ee',background:'#f3f4f6'}}>
                       <option>India (IN)</option>
                       <option>Philippines (PH)</option>
                     </select>
                   </div>

                   <div style={{display:'flex',flexDirection:'column',gap:6}} className="field">
                     <label htmlFor="accountName" style={{fontSize:12,fontWeight:600,color:'#374151'}}>Account Name</label>
                     <input id="accountName" name="accountName" type="text" defaultValue="CO*****ED" style={{padding:12,borderRadius:12,border:'1px solid #e7e9ee',background:'#f3f4f6'}} />
                   </div>

                   <div style={{display:'flex',flexDirection:'column',gap:6}} className="field">
                     <label htmlFor="lifeCycle" style={{fontSize:12,fontWeight:600,color:'#374151'}}>Life Cycle <span style={{color:'#ef4444'}}>*</span></label>
                     <select id="lifeCycle" name="lifeCycle" defaultValue="Limited Scope Projects" style={{padding:12,borderRadius:12,border:'1px solid #e7e9ee',background:'#f3f4f6'}}>
                       <option>Limited Scope Projects</option>
                       <option>Custom Implementation</option>
                     </select>
                   </div>

                   {/* Work description spans both columns */}
                   <div style={{gridColumn:'1 / -1',marginTop:12}}>
                     <label htmlFor="workDescription" style={{fontSize:12,fontWeight:600,color:'#374151'}}>Work Description</label>
                     <textarea id="workDescription" name="workDescription" placeholder="Add a short description of the project scope, deliverables, and constraints..." style={{width:'100%',padding:12,borderRadius:12,border:'1px solid #e7e9ee',minHeight:120,boxSizing:'border-box',background:'#f3f4f6'}} defaultValue={""} />
                   </div>

                 </div>
               </div>
             )}

             {activeTab!=='basic' && (
               <div>
                 <h3 style={{marginTop:0}}>{activeTab.replace(/^[a-z]/, c => c.toUpperCase())}</h3>
                 <p style={{color:'#6b7280'}}>This tab has been ported from project_sample.html. Placeholders for the remaining fields.</p>
               </div>
             )}

             {/* Sticky form actions */}
             <div style={{display:'flex',alignItems:'center',justifyContent:'flex-end',gap:10,borderTop:'1px solid #e7e9ee',padding:12,background:'#fff',position:'sticky',bottom:0}}>
               <button type="button" id="btnCancel" style={{border:'1px solid #e7e9ee',background:'#fff',padding:'10px 14px',borderRadius:8}}>Cancel</button>
               <button type="submit" style={{background:'#ffd200',border:'none',padding:'10px 14px',borderRadius:8,fontWeight:800}}>Update</button>
             </div>

            </form>
          )}

          {/* DSAI panel (matches original HTML structure and ids) */}
          {activeTab === 'dsai' && (
            <section id="panel-dsai" className="panel" role="tabpanel" aria-labelledby="tab-dsai" style={{padding:20, position: 'relative'}}>
              <div id="dsaiIntro" style={{display:'grid',gap:12}}>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                  <div>
                    <h3 style={{margin:0}}>DSAI Onboarding</h3>
                  </div>
                  <div>
                    <span id="dsaiStatus" className="status-toggle" style={{display:'none'}}><span className="dot" /> Onboarded</span>
                  </div>
                </div>

                {/* Onboard action moved to the top tab - button removed here */}

                {/* <div style={{display:'flex',justifyContent:'flex-end'}}>
                  <button id="btnOnboard" onClick={()=>{ setDsaiOnboardOpen(true); }} style={{padding:'10px 14px',borderRadius:8,background:'#6a0dad',border:'none',color:'#fff',fontWeight:700,cursor:'pointer'}}>Onboard to DSAI</button>
                </div> */}
              </div>

              {/* Inline DSAI onboard form - shown when user clicks Onboard to DSAI */}
              {dsaiOnboardOpen && (
                <div style={{marginTop:12,background:'#fff',border:'1px solid #e7e9ee',borderRadius:10,padding:18}}>
                  {/* Row 1: Project Name full width */}
                  <div style={{display:'grid',gridTemplateColumns:'1fr',gap:12}}>
                    <div>
                      <div style={{fontSize:13,fontWeight:700,color:'#374151',marginBottom:8}}>Project Name</div>
                      <input type="text" value={dsaiData.projectName} readOnly style={{width:'100%',padding:12,borderRadius:8,border:'1px solid #d1d5db',background:'#f3f4f6'}} />
                    </div>

                    {/* Row 2: Start and End side-by-side */}
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                      <div>
                        <div style={{fontSize:13,fontWeight:700,color:'#374151',marginBottom:8}}>Project Start Date</div>
                        <div style={{display:'flex',gap:8,alignItems:'center'}} onClick={()=>{ const el = document.getElementById('inlineStartDate'); if(el){ if(typeof el.showPicker === 'function'){ el.showPicker(); } else { el.focus(); } } }}>
                          <input id="inlineStartDate" type="date" value={dsaiData.startDate} onChange={(e)=>setDsaiData(s=>({...s,startDate:e.target.value}))} onClick={()=>{ const el = document.getElementById('inlineStartDate'); if(el){ if(typeof el.showPicker === 'function'){ el.showPicker(); } else { el.focus(); } } }} style={{flex:1,width:'100%',padding:12,borderRadius:8,border:'1px solid #d1d5db',background:'#fff'}} />
                        </div>
                      </div>

                      <div>
                        <div style={{fontSize:13,fontWeight:700,color:'#374151',marginBottom:8}}>Project End Date</div>
                        <div style={{display:'flex',gap:8,alignItems:'center'}} onClick={()=>{ const el = document.getElementById('inlineEndDate'); if(el){ if(typeof el.showPicker === 'function'){ el.showPicker(); } else { el.focus(); } } }}>
                          <input id="inlineEndDate" type="date" value={dsaiData.endDate} onChange={(e)=>setDsaiData(s=>({...s,endDate:e.target.value}))} onClick={()=>{ const el = document.getElementById('inlineEndDate'); if(el){ if(typeof el.showPicker === 'function'){ el.showPicker(); } else { el.focus(); } } }} style={{flex:1,width:'100%',padding:12,borderRadius:8,border:'1px solid #d1d5db',background:'#fff'}} />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:18}}>
                    <button onClick={()=>{ console.log('Open DSAI modal', dsaiData); setModalOpen(true); }} style={{padding:'10px 14px',background:'#6a0dad',border:'none',color:'#fff',borderRadius:8,fontWeight:800,cursor:'pointer'}}>On-Board</button>
                    <div style={{display:'flex',gap:10,alignItems:'center'}}>
                      <button onClick={()=>{ try{ localStorage.removeItem('dsaiOnboard'); setDsaiData({ projectName:'', engagementName:'', engagementId:'', startDate:'', endDate:'' }); setDsaiOnboardSaved(false); setDsaiErrors({}); setDsaiInlineMessage('Cleared') ; setTimeout(()=>setDsaiInlineMessage(''),2000) }catch(e){} }} style={{padding:'10px 14px',background:'#ef4444',border:'none',color:'#fff',borderRadius:8,fontWeight:700,cursor:'pointer'}}>Clear</button>
                      <button onClick={handleInlineSaveDsai} style={{padding:'10px 14px',background:'#ffd200',border:'none',color:'#111827',borderRadius:8,fontWeight:800,cursor:'pointer'}}>Save</button>
                      {dsaiInlineMessage && (
                        <div style={{marginLeft:12,background:'#ecfdf5',color:'#065f46',padding:'8px 12px',borderRadius:8,fontWeight:700}}>{dsaiInlineMessage}</div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div id="dsaiSummary" style={{display: dsaiOnboardOpen ? 'none' : 'block',marginTop:12}}>
                {/* Rendered summary: title, dates, phases box, resources table and estimated cost */}
                <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:12}}>
                  <div>
                    <h1 style={{margin:0,fontSize:32,fontWeight:800,color:'#0f172a'}}>{dsaiData.projectName || 'Untitled Project'}</h1>
                    <div style={{color:'#6b7280',marginTop:8,fontSize:14}}>Project Start Date: {formatDate(dsaiData.startDate)} • Project End Date: {formatDate(dsaiData.endDate)}</div>
                  </div>

                  {/* Estimated cost */}
                  <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:8}}>
                    <div style={{background:'#0f172a',color:'#fff',padding:'10px 16px',borderRadius:12,fontWeight:800,alignSelf:'flex-start'}}>{'Estimated Cost: ' + USD(estimatedCost)}</div>
                  </div>
                </div>

                <h3 style={{marginTop:24}}>Phases</h3>
                <div style={{background:'#f9fafb',border:'1px solid #e7e9ee',borderRadius:10,padding:18,minHeight:120}}>
                  {phases.length === 0 && (
                    <div style={{color:'#9ca3af'}}>No phases defined.</div>
                  )}

                  {phases.length > 0 && phases.map(p => (
                    <div key={p.id} style={{padding:'8px 0',borderBottom:'1px solid rgba(227,231,235,.6)'}}>
                      <div style={{fontWeight:700}}>{p.name || 'Phase'}</div>
                      <div style={{color:'#6b7280',marginTop:6}}>Start: {formatDate(p.start)} • End: {formatDate(p.end)}</div>
                      {p.desc && <div style={{marginTop:8,color:'#374151'}}>{p.desc}</div>}
                    </div>
                  ))}
                </div>

                {/* Gantt chart for phases */}
                <div style={{marginTop:24}}>
                  <Gantt phases={phases} projectStart={dsaiData.startDate} projectEnd={dsaiData.endDate} />
                </div>

                <h3 style={{marginTop:24}}>Resources</h3>
                <div style={{overflowX:'auto'}}>
                  <table style={{width:'100%',borderCollapse:'collapse',background:'#fff'}}>
                    <thead>
                      <tr style={{textAlign:'left',borderBottom:'2px solid #eef2f7'}}>
                        <th style={{padding:'12px 8px'}}>Resource Name</th>
                        <th style={{padding:'12px 8px'}}>Level</th>
                        <th style={{padding:'12px 8px'}}>Location</th>
                        <th style={{padding:'12px 8px'}}>Start Date</th>
                        <th style={{padding:'12px 8px'}}>End Date</th>
                        <th style={{padding:'12px 8px'}}>Cost Rate</th>
                        <th style={{padding:'12px 8px'}}>Cost</th>
                      </tr>
                    </thead>
                    <tbody>
                      {resourceCosts.map(r => (
                        <tr key={r.id} style={{borderBottom:'1px solid #f3f4f6'}}>
                          <td style={{padding:'12px 8px'}}>{r.name}</td>
                          <td style={{padding:'12px 8px'}}>{r.level}</td>
                          <td style={{padding:'12px 8px'}}>{r.location}</td>
                          <td style={{padding:'12px 8px'}}>{formatDate(r.start)}</td>
                          <td style={{padding:'12px 8px'}}>{formatDate(r.end)}</td>
                          <td style={{padding:'12px 8px'}}>{USD(r.rate)}</td>
                          <td style={{padding:'12px 8px'}}>{USD(r.cost)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* moved Clear button to bottom of the summary view */}
                {dsaiOnboardSaved && (
                  <div style={{display:'flex',justifyContent:'flex-end',marginTop:18}}>
                    <button onClick={clearDsaiInline} style={{background:'#ef4444',color:'#fff',border:'none',padding:'8px 12px',borderRadius:8,fontWeight:700,cursor:'pointer'}}>Clear</button>
                  </div>
                )}

                <style>{"#dsaiStatus{display:" + (dsaiOnboardSaved ? 'inline-flex' : 'none') + ";}"}</style>
              </div>

            </section>
          )}

        </div>

        {/* DSAI Modal (mirrors original HTML modal structure) */}
        {modalOpen && (
          <div role="dialog" aria-modal="true" aria-labelledby="dsaiTitle" style={{position:'fixed',inset:0,display:'flex',alignItems:'flex-start',justifyContent:'center',padding:40,background:'rgba(17,24,39,.55)',zIndex:9999}}>
            <div style={{width:'min(720px, calc(100vw - 32px))',maxHeight:'85vh',overflow:'auto',background:'#fff',borderRadius:12,boxShadow:'0 6px 16px rgba(16,24,40,.08)',padding:24}}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                <h2 id="dsaiTitle" style={{margin:0}}>DSAI Onboarding</h2>
                <button onClick={()=>setModalOpen(false)} style={{background:'none',border:'none',fontSize:20,cursor:'pointer'}}>✕</button>
              </div>

              <div style={{marginTop:12}}>
                {/* Modal header fields: Project + Engagement details (moved here, above Phases) */}
                <div style={{marginBottom:12,background:'#fff',border:'1px solid #f3f4f6',borderRadius:8,padding:12}}>
                  <div style={{display:'grid',gap:12}}>
                    <div>
                      <label htmlFor="modalProjectName" style={{fontSize:13,fontWeight:700,color:'#374151',marginBottom:6,display:'block'}}>Project Name <span style={{color:'#ef4444'}}>*</span></label>
                      <input id="modalProjectName" className={dsaiErrors.projectName ? 'invalid' : ''} type="text" value={dsaiData.projectName} onChange={(e)=>setDsaiData(s=>({...s,projectName:e.target.value}))} style={{width:'100%',padding:10,borderRadius:8,border: dsaiErrors.projectName ? '1px solid #ef4444' : '1px solid #e7e9ee',background:'#fff'}} />
                    </div>

                    {/* Stack Engagement Name and Engagement ID vertically instead of side-by-side */}
                    <div style={{display:'grid',gap:12}}>
                      <div>
                        <label htmlFor="modalEngagementName" style={{fontSize:13,fontWeight:700,color:'#374151',marginBottom:6,display:'block'}}>Engagement Name <span style={{color:'#ef4444'}}>*</span></label>
                        <input id="modalEngagementName" className={dsaiErrors.engagementName ? 'invalid' : ''} type="text" value={dsaiData.engagementName} onChange={(e)=>setDsaiData(s=>({...s,engagementName:e.target.value}))} style={{width:'100%',padding:10,borderRadius:8,border: dsaiErrors.engagementName ? '1px solid #ef4444' : '1px solid #e7e9ee',background:'#fff'}} />
                      </div>

                      <div>
                        <label htmlFor="modalEngagementId" style={{fontSize:13,fontWeight:700,color:'#374151',marginBottom:6,display:'block'}}>Engagement ID</label>
                        <input id="modalEngagementId" type="text" value={dsaiData.engagementId} onChange={(e)=>setDsaiData(s=>({...s,engagementId:e.target.value}))} style={{width:'100%',padding:10,borderRadius:8,border:'1px solid #e7e9ee',background:'#fff'}} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Phases section (matching ids expected by legacy JS) */}
                <section>
                  <h3>Phases</h3>

                  {/* Top add-phase button: only show when no phases exist (legacy id btnAddPhaseTop) */}
                  {phases.length === 0 && (
                    <div className="section-actions top" style={{marginBottom:8}}>
                      <button className="btn btn-primary" id="btnAddPhaseTop" onClick={()=>addPhase()} style={{background:'#6a0dad', color:'white', borderRadius:8, cursor:'pointer', padding:'8px 14px'}}>+ Add Phase</button>
                    </div>
                  )}

                  <div id="phaseContainer" style={{background:'#f3f4f6',padding:12,borderRadius:10}}>
                    {phases.map(p => (
                       <div key={p.id} className="phase-block" style={{background:'#f3f4f6', border:'1px solid #e7e9ee', padding:14, borderRadius:10, marginTop:12}}>
                         <div style={{display:'flex',flexDirection:'column',gap:8}}>
                           <label style={{fontWeight:700}}>Phase Name <span style={{color:'#ef4444'}}>*</span></label>
                           <input className={"phase-name " + (phaseErrors[p.id]?.name ? 'invalid' : '')} value={p.name} onChange={(e)=>updatePhase(p.id,{name:e.target.value})} style={{padding:10,borderRadius:8,border: phaseErrors[p.id]?.name ? '1px solid #ef4444' : '1px solid #e7e9ee',background:'#fff'}} />

                           <label style={{fontWeight:700}}>Short Description</label>
                           <textarea className="phase-desc" value={p.desc} onChange={(e)=>updatePhase(p.id,{desc:e.target.value})} style={{padding:10,borderRadius:8,border:'1px solid #e7e9ee',background:'#fff',minHeight:80}} />

                           <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                             <div>
                               <label style={{fontWeight:700}}>Start Date <span style={{color:'#ef4444'}}>*</span></label>
                               <input className={"phase-start " + (phaseErrors[p.id]?.start || phaseErrors[p.id]?.order ? 'invalid' : '')} type="date" value={p.start} onChange={(e)=>updatePhase(p.id,{start:e.target.value})} style={{width:'100%',padding:10,borderRadius:8,border: phaseErrors[p.id]?.start || phaseErrors[p.id]?.order ? '1px solid #ef4444' : '1px solid #e7e9ee',background:'#fff'}} />
                             </div>
                             <div>
                               <label style={{fontWeight:700}}>End Date <span style={{color:'#ef4444'}}>*</span></label>
                               <input className={"phase-end " + (phaseErrors[p.id]?.end || phaseErrors[p.id]?.order ? 'invalid' : '')} type="date" value={p.end} onChange={(e)=>updatePhase(p.id,{end:e.target.value})} style={{width:'100%',padding:10,borderRadius:8,border: phaseErrors[p.id]?.end || phaseErrors[p.id]?.order ? '1px solid #ef4444' : '1px solid #e7e9ee',background:'#fff'}} />
                             </div>
                           </div>

                           {/* Resources for this phase - embedded inside the phase block */}
                           <div style={{marginTop:12,background:'#fff',border:'1px solid #eef2ff',padding:12,borderRadius:8}}>
                             <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
                               <div style={{fontWeight:700}}>Resources for this phase</div>
                               <div>
                                 <button className="btn btn-secondary" onClick={()=>addResource({}, p.id)} style={{background:'#6a0dad',color:'#fff',padding:'6px 10px',borderRadius:8,border:'none',cursor:'pointer'}}>+ Add Resource</button>
                               </div>
                             </div>

                             <div>
                               {resources.filter(r=>r.phaseId === p.id).length === 0 && (
                                 <div style={{color:'#9ca3af'}}>No resources for this phase.</div>
                               )}

                               {resources.filter(r=>r.phaseId === p.id).map(r => (
                                 <div key={r.id} style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,alignItems:'start',marginBottom:12}}>
                                   <div>
                                     <label style={{fontWeight:700}}>Resource Name</label>
                                     <input className={"resource-name " + (resourceErrors[r.id]?.name ? 'invalid' : '')} value={r.name} onChange={(e)=>updateResource(r.id,{name:e.target.value})} style={{padding:8,borderRadius:8,border: resourceErrors[r.id]?.name ? '1px solid #ef4444' : '1px solid #e7e9ee',background:'#fff',width:'100%'}} />

                                     <label style={{fontWeight:700,marginTop:8}}>GPN</label>
                                     <input className={"resource-gpn " + (resourceErrors[r.id]?.gpn ? 'invalid' : '')} value={r.gpn || ''} onChange={(e)=>updateResource(r.id,{gpn:e.target.value})} style={{padding:8,borderRadius:8,border: resourceErrors[r.id]?.gpn ? '1px solid #ef4444' : '1px solid #e7e9ee',background:'#fff',width:'100%'}} />
                                   </div>
                                   <div>
                                     <label style={{fontWeight:700}}>Level <span style={{color:'#ef4444'}}>*</span></label>
                                     <select className={"resource-level " + (resourceErrors[r.id]?.level ? 'invalid' : '')} value={r.level} onChange={(e)=>updateResource(r.id,{level:e.target.value})} style={{padding:8,borderRadius:8,border: resourceErrors[r.id]?.level ? '1px solid #ef4444' : '1px solid #e7e9ee',background:'#fff',width:'100%'}}>
                                       <option>Partner</option>
                                       <option>Executive Director</option>
                                       <option>Associate Director</option>
                                       <option>Senior Manager</option>
                                       <option>Manager</option>
                                       <option>Senior 3</option>
                                       <option>Senior 1-2</option>
                                       <option>Staff 2-3</option>
                                       <option>Staff 1</option>
                                     </select>

                                     <label style={{fontWeight:700,marginTop:8}}>Location</label>
                                     <select className="resource-location" value={r.location} onChange={(e)=>updateResource(r.id,{location:e.target.value})} style={{padding:8,borderRadius:8,border:'1px solid #e7e9ee',background:'#fff',width:'100%'}}>
                                       <option>Philippines</option>
                                       <option>India</option>
                                       <option>Australia</option>
                                     </select>

                                     <div style={{display:'flex',gap:8,marginTop:8}}>
                                       <button className="remove-resource btn" onClick={()=>removeResource(r.id)} style={{background:'#fff',border:'1px solid #e9ecef',padding:'8px 12px',borderRadius:8, cursor:'pointer'}}>Remove</button>
                                     </div>
                                   </div>
                                 </div>
                               ))}
                             </div>
                           </div>

                           <div style={{marginTop:8}}>
                             <button className="remove-phase btn" onClick={()=>removePhase(p.id)} style={{background:'#fff',border:'1px solid #e7e9ee',padding:'8px 12px',borderRadius:8, cursor:'pointer'}}>Remove</button>
                           </div>
                         </div>
                       </div>
                    ))}

                  </div>
                  <div className="section-actions bottom" id="phaseBottomActions" style={{display: phases.length ? 'flex' : 'none', justifyContent: 'flex-end', paddingTop:12, paddingBottom:8}}>
                    <button className="btn btn-primary" id="btnAddPhaseBottom" style={{background:'#6a0dad', color:'white', borderRadius:8, cursor:'pointer', padding:'8px 14px'}} onClick={()=>addPhase()}>+ Add Phase</button>
                  </div>
                </section>

              </div>

              <div style={{display:'flex',justifyContent:'flex-end',gap:8,marginTop:16}}>
                <button onClick={()=>setModalOpen(false)} style={{padding:'8px 12px',borderRadius:8,border:'1px solid #e7e9ee',background:'#fff',cursor:'pointer'}}>Cancel</button>
                <button onClick={handleSaveDsai} id="submitDsai" style={{padding:'8px 12px',borderRadius:8,background:'#ffd200',border:'none',fontWeight:800,cursor:'pointer'}}>Save</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </main>
  )
}
