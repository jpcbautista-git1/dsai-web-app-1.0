import React, { useRef, useState } from 'react'

export default function Dsai(){
  const uploadRef = useRef(null)
  const [parsedData, setParsedData] = useState(null)
  const [projectSummaries, setProjectSummaries] = React.useState([
    {
      project_id: 'Globe ITSM',
      project_name: 'Globe ITSM',
      people: [ { person: 'Mark' }, { person: 'Carlo' } ],
      total_hours: 24,
      last_tx: '2h ago',
      key_risks: [ 'Delayed staffing near phase start', 'Recent change variance detected' ]
    },
    {
      project_id: 'ServiceMgmt-01',
      project_name: 'Service Management',
      people: [ { person: 'Alex' } ],
      total_hours: 8,
      last_tx: '1d ago',
      key_risks: [ 'Scope creep', 'Late dependencies' ]
    }
  ])
  // loading modal state
  const [loading, setLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('')
  const [loadingProgress, setLoadingProgress] = useState(null) // 0-100 or null
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [lastUpload, setLastUpload] = useState(null)
  const [activeTab, setActiveTab] = useState('dsai')
  const onUploadClick = () => uploadRef.current?.click()

  // compute summaries from parsed rows
  const computeProjectSummaries = (rows = []) => {
    const projects = {}
    for (const r of rows) {
      const pid = (r.project_id || r.project_name || 'unknown').toString()
      const pname = r.project_name || pid
      const hours = Number(r.hours || r.time || 0) || 0
      const dateStr = r.date || r.transaction_date || r['Transaction Date'] || null
      const date = dateStr ? (isNaN(Date.parse(dateStr)) ? null : new Date(dateStr)) : null

      if (!projects[pid]) projects[pid] = { project_id: pid, project_name: pname, total_hours: 0, last_tx: null, people: {} }
      projects[pid].total_hours += hours
      if (date && (!projects[pid].last_tx || date > projects[pid].last_tx)) projects[pid].last_tx = date

      const person = r.person_name || r.Name || 'unknown'
      if (!projects[pid].people[person]) projects[pid].people[person] = { hours: 0 }
      projects[pid].people[person].hours += hours
    }

    return Object.values(projects).map(p => ({
      ...p,
      last_tx: p.last_tx ? p.last_tx.toISOString().slice(0,10) : null,
      people: Object.entries(p.people).map(([person, info]) => ({ person, ...info }))
    }))
  }

  // update summaries when parsedData changes
  React.useEffect(() => {
    // If no parsedData yet, preserve the existing projectSummaries (seed/sample data)
    if (parsedData == null) return

    // If parsedData exists but isn't an array, do not change summaries
    if (!Array.isArray(parsedData)) return

    setProjectSummaries(computeProjectSummaries(parsedData))
  }, [parsedData])

  const parseCSV = (txt) => {
    const lines = txt.split(/\r?\n/).filter(l => l.trim())
    if (!lines.length) return []
    const headers = lines.shift().split(',').map(h => h.trim())
    return lines.map(line => {
      // naive split - good enough for simple CSVs in this POC
      const parts = line.split(',')
      const obj = {}
      headers.forEach((h, i) => { obj[h] = (parts[i] || '').trim() })
      return obj
    })
  }

  // Normalize parsed rows to canonical fields used by the DSAI UI
  const normalizeParsedRows = (rows) => {
    if (!Array.isArray(rows)) return rows
    return rows.map(row => {
      // copy to avoid mutating original
      const r = Object.assign({}, row)

      // helper to read case-insensitive keys and variants
      const get = (...keys) => {
        for (const k of keys) {
          if (k in r && r[k] != null && String(r[k]).trim() !== '') return r[k]
          const lower = Object.keys(r).find(x => x.toLowerCase() === k.toLowerCase())
          if (lower && r[lower] != null && String(r[lower]).trim() !== '') return r[lower]
        }
        return undefined
      }

      // Map engagement -> project_name (per your request)
      const projectVal = get('project_name', 'project', 'engagement', 'engagement_name', 'engagements')
      if (projectVal && !r.project_name) r.project_name = projectVal

      // common normalizations
      const personVal = get('person_name', 'person', 'resource', 'owner')
      if (personVal && !r.person_name) r.person_name = personVal

      const dateVal = get('date', 'day')
      if (dateVal && !r.date) r.date = dateVal

      const hoursVal = get('hours', 'time')
      if (hoursVal && !r.hours) r.hours = hoursVal

      const costVal = get('cost', 'amount')
      if (costVal && !r.cost) r.cost = costVal

      return r
    })
  }

  // Poll the server for a processed NDJSON file produced from an .xlsb upload
  // onProgress(optional) will be called with (attemptIndex, attempts)
  const pollForProcessed = async (jobId, attempts = 15, delay = 2000, onProgress) => {
    const base = jobId.replace(/\.uploaded$/i, '')
    const candidates = [`${base}.ndjson`, `${jobId}.ndjson`, `${base}.json`, `${jobId}.json`]
    for (let i = 0; i < attempts; i++) {
      // report progress
      try { onProgress?.(i + 1, attempts) } catch (e) {}
      for (const name of candidates) {
        try {
          const resp = await fetch(`http://localhost:3001/data/${encodeURIComponent(name)}`)
          if (resp.ok) return await resp.text()
        } catch (e) {
          // ignore and try next
        }
      }
      await new Promise(r => setTimeout(r, delay))
    }
    throw new Error('processed file not available')
  }

  const handleFileUpload = async (e) => {
    const f = e.target.files?.[0]
    if (!f) return

    setLoading(true)
    setLoadingMessage('Uploading report...')
    setLoadingProgress(null)

    try {
      const fd = new FormData()
      fd.append('file', f)
      const uplResp = await fetch('http://localhost:3001/api/upload', { method: 'POST', body: fd })
      const respText = await uplResp.clone().text()
      let parsedResp = {}
      try { parsedResp = JSON.parse(respText) } catch (err) { parsedResp = { ok: uplResp.ok, raw: respText } }
      setLastUpload({ ok: parsedResp.ok, jobId: parsedResp.jobId || parsedResp.savedCopy || '', savedOriginal: parsedResp.savedOriginal, raw: respText })

      // show immediate upload success per requirement
      setLoadingMessage('Upload successful')
      setLoadingProgress(100)
      setUploadSuccess(true)

      // optimistic mapping: for XLSB, infer project from filename and show in dashboard immediately
      const ext = (f.name.split('.').pop() || '').toLowerCase()
      if (ext === 'xlsb') {
        try {
          const inferred = inferProjectFromFilename(parsedResp.savedOriginal || parsedResp.jobId || f.name)
          if (inferred) {
            const optimistic = [{ project_name: inferred }]
            setParsedData(optimistic)
            setProjectSummaries(computeProjectSummaries(optimistic))
          }
        } catch (e) { /* ignore optimistic failure */ }
      }

      // background processing: try immediate fetch of outputs, otherwise poll
      ;(async () => {
        try {
          let text = null
          const jobId = parsedResp.jobId || parsedResp.savedCopy || ''
          const base = (jobId || '').replace(/\.uploaded$/i, '')
          const candidates = [`${base}.ndjson`, `${jobId}.ndjson`, `${base}.json`, `${jobId}.json`]

          // immediate attempt
          for (const name of candidates) {
            try {
              const r = await fetch(`http://localhost:3001/data/${encodeURIComponent(name)}`)
              if (r.ok) { text = await r.text(); break }
            } catch (e) { /* ignore */ }
          }

          // if not found, poll
          if (!text && ext === 'xlsb') {
            try {
              // don't attempt polling if the server did not return a jobId
              if (jobId) {
                text = await pollForProcessed(jobId, 15, 2000, (attempt, attempts) => {
                  const pct = Math.round((attempt / attempts) * 100)
                  if (!uploadSuccess) {
                    setLoadingProgress(pct <= 80 ? pct : 80)
                    setLoadingMessage(`Processing report... (${attempt}/${attempts})`)
                  }
                })
              } else {
                console.warn('No jobId returned from upload; skipping poll')
              }
            } catch (err) {
              console.warn('Processed file not available yet', err)
            }
          }

          // for non-xlsb types, try to fetch the saved jobId directly
          if (!text && ext !== 'xlsb' && jobId) {
            try {
              const r = await fetch(`http://localhost:3001/data/${encodeURIComponent(jobId)}`)
              if (r.ok) text = await r.text()
            } catch (e) { /* ignore */ }
          }

          if (!text) {
            // nothing to parse yet
            if (!uploadSuccess) {
              setLoadingMessage('Processing done')
              setLoadingProgress(null)
              setTimeout(() => setLoading(false), 1200)
            }
            return
          }

          // parse based on extension of returned content or original file
          let data = null
          // if the returned text looks like NDJSON (lines of JSON), prefer that
          const lines = text.split(/\r?\n/).filter(Boolean)
          const isNdjson = lines.length > 0 && lines.every(l => {
            try { JSON.parse(l); return true } catch (e) { return false }
          })

          if (isNdjson) {
            data = lines.map(l => JSON.parse(l))
          } else {
            // attempt JSON parse, then CSV
            let maybeObj = null
            try {
              maybeObj = JSON.parse(text)
            } catch (e) {
              maybeObj = null
            }

            if (maybeObj) {
              // worker may emit a summary JSON like { projects: [...] }
              if (Array.isArray(maybeObj.projects)) {
                const mapped = (maybeObj.projects || []).map(p => ({
                  project_id: p.project_id || p.gpn || p.id || p.project_id || (p.project_name || p.project || p.name) || 'unknown',
                  project_name: p.project_name || p.project || p.gpn || p.name || p.projectName || 'unknown',
                  hours: p.total_hours || p.totalHours || p.hours || 0,
                  last_tx: p.last_tx || p.lastTx || p.lastTransaction || null,
                  people: Array.isArray(p.people) ? p.people.map(x => ({ person: x.person_name || x.person || x.name || '', hours: x.hours || x.h || 0 })) : []
                }))
                setProjectSummaries(mapped.map(p => ({ ...p, total_hours: p.hours || 0 })))
                setParsedData(mapped.map(p => ({ project_name: p.project_name, project_id: p.project_id })))
                console.log('Parsed summary JSON (background):', maybeObj.projects)
              } else if (Array.isArray(maybeObj)) {
                data = maybeObj
              } else if (Array.isArray(maybeObj.rows)) {
                data = maybeObj.rows
              } else if (Array.isArray(maybeObj.data)) {
                data = maybeObj.data
              } else {
                // fallback: treat the object as a single-row array
                data = [maybeObj]
              }
            } else {
              try { data = parseCSV(text) } catch (e2) { data = null }
            }
          }

          if (Array.isArray(data)) {
            const normalized = normalizeParsedRows(data)
            setParsedData(normalized)
            setProjectSummaries(computeProjectSummaries(normalized))
            console.log('Parsed data (background):', normalized)
          }

          if (!uploadSuccess) {
            setLoadingMessage('Done')
            setLoadingProgress(100)
          }
        } catch (err) {
          console.error('Background processing error', err)
          if (!uploadSuccess) {
            setLoadingMessage('Background processing failed')
            setLoadingProgress(null)
            setTimeout(() => setLoading(false), 1500)
          }
        }
      })()

    } catch (err) {
      console.error('Upload error', err)
      setParsedData(null)
      setLoadingMessage('Upload failed')
      setLoadingProgress(null)
      setTimeout(() => setLoading(false), 2500)
    }
  }

  const panel = {
    width: '100%',
    maxWidth: '100%',
    minHeight: 520,
    borderRadius: 16,
    overflow: 'hidden',
    background: 'linear-gradient(180deg,#f5f6fb 0%,#eef0f7 100%)',
    boxShadow: '0 28px 70px rgba(0,0,0,.55)',
    border: '1px solid rgba(255,255,255,.10)'
  }

  const pill = (text, bg='#fff', color='#111') => (
    <span style={{display:'inline-flex',alignItems:'center',gap:8,padding:'6px 10px',borderRadius:999,background:bg,color, fontWeight:700}}>{text}</span>
  )

  const inferProjectFromFilename = (name) => {
    if (!name) return ''
    // strip common extensions and suffixes
    const n = name.replace(/\.uploaded$/i, '').replace(/\.(xlsb|xlsx|csv|json|ndjson)$/i, '')
    // replace separators with spaces and trim
    return n.replace(/[_\-\.]+/g, ' ').trim()
  }

  return (
    <main style={{padding:24}}>
      {/* Loading modal overlay */}
      {loading && (
        <div style={{position:'fixed',inset:0,display:'grid',placeItems:'center',background:'rgba(0,0,0,0.35)',zIndex:9999}} role="status" aria-live="polite">
          <div style={{width:360,maxWidth:'90%',background:'#fff',padding:20,borderRadius:12,boxShadow:'0 8px 30px rgba(0,0,0,.25)',textAlign:'center'}}>
            <div style={{marginBottom:12,fontWeight:800}}>{loadingMessage}</div>
            <div style={{height:8,background:'#eef2ff',borderRadius:6,overflow:'hidden',margin:'8px 0 12px'}}>
              <div style={{width: (loadingProgress != null ? `${loadingProgress}%` : '20%'),height:'100%',background:'#6366f1',transition:'width .35s ease'}} />
            </div>
            {loadingProgress == null ? <div style={{fontSize:12,color:'#6b7280'}}>Please wait…</div> : <div style={{fontSize:12,color:'#6b7280'}}>{loadingProgress}%</div>}
            {/* Manual dismiss so the message is not auto-closed */}
            <div style={{marginTop:12}}>
              <button onClick={() => { setLoading(false); setUploadSuccess(false); setLoadingProgress(null) }} style={{padding:'8px 14px',borderRadius:8,background:'#6366f1',color:'#fff',border:0,cursor:'pointer',fontWeight:700}}>Close</button>
            </div>
          </div>
        </div>
      )}
      <div style={{display:'block',paddingTop:18,position:'relative'}}>
        <div style={{...panel,boxSizing:'border-box'}}>

          <div style={{padding:18,borderBottom:'1px solid #e3e6ef',display:'flex',alignItems:'flex-start',justifyContent:'space-between'}}>
            <div>
              <h1 style={{margin:0,fontSize:20,fontWeight:800,color:'#2a2f36'}}>Delivery Stability AI</h1>
              <div style={{marginTop:6,color:'#6a7280',fontSize:13}}>AI-powered project risk intelligence and delivery monitoring</div>
            </div>

            <div style={{display:'flex',gap:10,alignItems:'center'}}>
              {/* Upload controls moved to Upload tab (kept here only other action buttons) */}
              
               <button style={{display:'inline-flex',alignItems:'center',gap:8,padding:'7px 10px',fontSize:12,fontWeight:700,background:'#fff',borderRadius:10,border:'1px solid #e3e6ef',cursor:'pointer'}}> 
                 <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M12 4a8 8 0 0 0-7.75 6H2l3 3 3-3H6.32A6 6 0 1 1 12 18c-1.66 0-3.18-.67-4.27-1.76l-1.42 1.42A7.96 7.96 0 0 0 12 20a8 8 0 0 0 0-16zm1 4h-2v6l5 3 1-1.73-4-2.27V8z"/></svg>
                 Sync All
               </button>

               {/* Export button - blue */}
               <button onClick={() => console.log('Export clicked')} style={{display:'inline-flex',alignItems:'center',gap:8,padding:'7px 12px',fontSize:12,fontWeight:700,background:'#2563eb',color:'#fff',borderRadius:10,border:'1px solid #1e40af',cursor:'pointer'}} title="Export projects">
                 <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                   <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                   <path d="M7 10l5 5 5-5" />
                   <path d="M12 15V3" />
                 </svg>
                 Export
               </button>

               <button style={{width:34,height:34,display:'grid',placeItems:'center',background:'#fff',border:'1px solid #e3e6ef',borderRadius:10,cursor:'pointer'}} aria-label="Settings">
                <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false" fill="currentColor">
                  <path d="M19.14 12.94a7.07 7.07 0 000-1.88l2.03-1.58a.5.5 0 00.12-.64l-1.92-3.32a.5.5 0 00-.6-.22l-2.39.96a7.02 7.02 0 00-1.61-.93l-.36-2.54A.5.5 0 0013.7 2h-3.4a.5.5 0 00-.5.42l-.36 2.54a7.02 7.02 0 00-1.61.93l-2.39-.96a.5.5 0 00-.6.22L2.71 8.84a.5.5 0 00.12.64l2.03 1.58a7.07 7.07 0 000 1.88L2.83 14.5a.5.5 0 00-.12.64l1.92 3.32c.13.23.39.34.6.22l2.39-.96c.5.38 1.04.7 1.61.93l.36 2.54c.05.27.27.47.5.47h3.4c.27 0 .45-.2.5-.47l.36-2.54c.57-.23 1.11-.55 1.61-.93l2.39.96c.22.12.48.01.6-.22l1.92-3.32a.5.5 0 00-.12-.64l-2.03-1.56zM12 15.5A3.5 3.5 0 1115.5 12 3.5 3.5 0 0112 15.5z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div style={{display:'flex',alignItems:'center',margin:'8px 0',padding:4,background:'#f8fafc',borderRadius:12,border:'1px solid #e6eefb'}}>
            {/* first tab - rounded left */}
            <button
              onClick={() => setActiveTab('dsai')}
              aria-pressed={activeTab === 'dsai'}
              style={{
                padding:'10px 16px',
                // keep full border so the right edge remains visible when active
                borderRadius: '8px 6px 6px 8px',
                border: activeTab === 'dsai' ? '1px solid #2563eb' : '1px solid #e2e8f0',
                background: activeTab === 'dsai' ? '#ffffff' : '#f8fafc',
                color: activeTab === 'dsai' ? '#0f172a' : '#475569',
                fontWeight:800,
                cursor:'pointer',
                boxShadow: activeTab === 'dsai' ? '0 2px 6px rgba(37,99,235,0.06)' : 'none'
              }}
            >DSAI</button>

            {/* separator */}
            <div style={{width:1, height:22, background:'#e6eef6', margin:'0 6px'}} aria-hidden />

            {/* upload tab */}
            <button
              onClick={() => setActiveTab('upload')}
              aria-pressed={activeTab === 'upload'}
              style={{
                padding:'10px 16px',
                borderRadius:6,
                border: activeTab === 'upload' ? '1px solid #2563eb' : '1px solid #e2e8f0',
                background: activeTab === 'upload' ? '#ffffff' : '#f8fafc',
                color: activeTab === 'upload' ? '#0f172a' : '#475569',
                fontWeight:800,
                cursor:'pointer',
                boxShadow: activeTab === 'upload' ? '0 2px 6px rgba(37,99,235,0.06)' : 'none'
              }}
            >Upload</button>
          </div>
          
          {/* subtle divider to separate tabs from content (reduced) */}
          <div style={{height:6}} />

          {/* DSAI tab content (KPIs + table) */}
          {activeTab === 'dsai' && (
            <>
              {/* KPIs */}
              <div style={{padding:'12px 20px 10px'}}>
                <div style={{display:'grid',gridTemplateColumns:'repeat(5, minmax(0,1fr))',gap:10}}>
                  <div style={{background:'#fff',border:'1px solid #e6e9f2',borderRadius:12,padding:12,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                    <div style={{display:'flex',flexDirection:'column',gap:4}}>
                      <div style={{fontSize:10,color:'#6a7280',fontWeight:700}}>Total Projects</div>
                      <div style={{fontSize:18,fontWeight:900,color:'#2a2f36'}}>{projectSummaries.length}</div>
                    </div>
                    <div style={{width:40,height:40,display:'grid',placeItems:'center',borderRadius:10,background:'#eef4ff',border:'1px solid rgba(0,0,0,.06)'}}>
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="#2563eb"><path d="M4 4h7v7H4V4zm9 0h7v5h-7V4zM4 13h7v7H4v-7zm9 3h7v4h-7v-4z"/></svg>
                    </div>
                  </div>

                  <div style={{background:'#fff',border:'1px solid #e6e9f2',borderRadius:12,padding:12,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                    <div style={{display:'flex',flexDirection:'column',gap:4}}>
                      <div style={{fontSize:10,color:'#6a7280',fontWeight:700}}>AI Risks</div>
                      <div style={{fontSize:18,fontWeight:900,color:'#2a2f36'}}>9</div>
                    </div>
                    <div style={{width:40,height:40,display:'grid',placeItems:'center',borderRadius:10,background:'#fff1f1',border:'1px solid rgba(0,0,0,.06)'}}>
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="#dc2626"><path d="M12 2 1 21h22L12 2zm0 7h2v6h-2V9zm0 8h2v2h-2v-2z"/></svg>
                    </div>
                  </div>

                  <div style={{background:'#fff',border:'1px solid #e6e9f2',borderRadius:12,padding:12,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                    <div style={{display:'flex',flexDirection:'column',gap:4}}>
                      <div style={{fontSize:10,color:'#6a7280',fontWeight:700}}>Sync Issues</div>
                      <div style={{fontSize:18,fontWeight:900,color:'#2a2f36'}}>2</div>
                    </div>
                    <div style={{width:40,height:40,display:'grid',placeItems:'center',borderRadius:10,background:'#fff7ed',border:'1px solid rgba(0,0,0,.06)'}}>
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="#f97316"><path d="M12 6V3L8 7l4 4V8c2.76 0 5 2.24 5 5 0 .64-.12 1.26-.34 1.83l1.53 1.18A6.97 6.97 0 0 0 19 13c0-3.87-3.13-7-7-7zm-5.66.17L4.81 4.99A6.97 6.97 0 0 0 5 13c0 3.87 3.13 7 7 7v3l4-4-4-4v3c-2.76 0-5-2.24-5-5 0-.64.12-1.26.34-1.83z"/></svg>
                    </div>
                  </div>

                  <div style={{background:'#fff',border:'1px solid #e6e9f2',borderRadius:12,padding:12,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                    <div style={{display:'flex',flexDirection:'column',gap:4}}>
                      <div style={{fontSize:10,color:'#6a7280',fontWeight:700}}>Needs Review</div>
                      <div style={{fontSize:18,fontWeight:900,color:'#2a2f36'}}>6</div>
                    </div>
                    <div style={{width:40,height:40,display:'grid',placeItems:'center',borderRadius:10,background:'#fffbe6',border:'1px solid rgba(0,0,0,.06)'}}>
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="#ca8a04"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                    </div>
                  </div>

                  <div style={{background:'#fff',border:'1px solid #e6e9f2',borderRadius:12,padding:12,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                    <div style={{display:'flex',flexDirection:'column',gap:4}}>
                      <div style={{fontSize:10,color:'#6a7280',fontWeight:700}}>RAG Mismatch</div>
                      <div style={{fontSize:18,fontWeight:900,color:'#2a2f36'}}>5</div>
                    </div>
                    <div style={{width:40,height:40,display:'grid',placeItems:'center',borderRadius:10,background:'#ecfdf5',border:'1px solid rgba(0,0,0,.06)'}}>
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="#16a34a"><path d="M12 2 4 5v6c0 5 3.4 9.7 8 11 4.6-1.3 8-6 8-11V5l-8-3zm-1 14-4-4 1.4-1.4L11 13.2l5.6-5.6L18 9l-7 7z"/></svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* toolbar: tabs + search */}
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:12,padding:'8px 0 0'}}>
                <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                  <button style={{padding:'7px 10px',borderRadius:10,background:'#f5f6fb',border:'1px solid #e3e6ef',fontWeight:800}}>All Projects</button>
                  <button style={{padding:'7px 10px',borderRadius:10,background:'#fff',border:'1px solid #e6e6ef',fontWeight:800}}> <span style={{display:'inline-block',width:8,height:8,borderRadius:999,background:'#ef4444',marginRight:8}}></span>At Risk</button>
                  <button style={{padding:'7px 10px',borderRadius:10,background:'#fff',border:'1px solid #e6e6ef',fontWeight:800}}> <span style={{display:'inline-block',width:8,height:8,borderRadius:999,background:'#f97316',marginRight:8}}></span>Sync Issue</button>
                  <button style={{padding:'7px 10px',borderRadius:10,background:'#fff',border:'1px solid #e6e6ef',fontWeight:800}}> <span style={{display:'inline-block',width:8,height:8,borderRadius:999,background:'#eab308',marginRight:8}}></span>Needs Review</button>
                </div>

                <div style={{display:'flex',alignItems:'center',gap:12,flex:1,justifyContent:'flex-end'}}>
                  <div style={{display:'flex',alignItems:'center',gap:8,background:'#fff',border:'1px solid #e6e6ef',borderRadius:10,padding:'7px 10px',minWidth:260}}>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="#6a7280"><path d="M10 2a8 8 0 1 0 4.9 14.32l4.39 4.39 1.41-1.41-4.39-4.39A8 8 0 0 0 10 2zm0 2a6 6 0 1 1 0 12 6 6 0 0 1 0-12z"/></svg>
                    <input type="search" placeholder="Search projects..." style={{border:0,outline:0,background:'transparent',width:'100%'}}/>
                  </div>
                </div>
              </div>

              {/* subtools */}
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:12,padding:'12px 0',borderTop:'1px solid #eef1f7'}}>
                <div>
                  <button style={{display:'inline-flex',alignItems:'center',gap:8,padding:'7px 10px',borderRadius:10,background:'#fff',border:'1px solid #e3e6ef',fontWeight:800,cursor:'pointer'}}>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="#3b4251"><path d="M3 5h18v2H3V5zm4 6h10v2H7v-2zm3 6h4v2h-4v-2z"/></svg>
                    Filter
                  </button>
                </div>

                <div style={{display:'flex',alignItems:'center',gap:10}}>
                  <div style={{display:'inline-flex',alignItems:'center',gap:8,padding:'6px 10px',background:'#fff',border:'1px solid #e6e6ef',borderRadius:999}}>Last 30 Days</div>
                  <div style={{display:'inline-flex',alignItems:'center',gap:8,padding:'6px 10px',background:'#fff',border:'1px solid #e6e6ef',borderRadius:999}}> <span style={{width:8,height:8,borderRadius:999,background:'#22c55e'}}></span> Last Sync: Apr 7, 9:30 AM</div>
                </div>
              </div>

              {/* table */}
              <div style={{paddingTop:12}}>
                <div style={{overflowX:'auto'}}>
                  <table style={{width:'100%',borderCollapse:'separate',borderSpacing:0,fontSize:13}} aria-label="Projects">
                    <thead>
                      <tr style={{textAlign:'left',color:'#6a7280',fontWeight:900,fontSize:12,borderBottom:'1px solid #e6e9f2'}}>
                        <th style={{padding:'12px 10px'}}>Project</th>
                        <th style={{padding:'12px 10px'}}>PM / DM</th>
                        <th style={{padding:'12px 10px'}}>RAG Status</th>
                        <th style={{padding:'12px 10px'}}>AI Risk</th>
                        <th style={{padding:'12px 10px'}}>Sync</th>
                        <th style={{padding:'12px 10px',verticalAlign:'top'}} aria-label="DEX actions" />
                        <th style={{padding:'12px 10px',verticalAlign:'top',color:'#6a7280'}}>
                          Key Risks
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {projectSummaries.length === 0 && (
                        <tr><td colSpan={7} style={{padding:'24px 10px',color:'#6a7280'}}>No uploaded project data yet.</td></tr>
                      )}
                      {projectSummaries.map((p) => (
                        <tr key={p.project_id}>
                          <td style={{padding:'12px 10px'}}>
                            <div style={{display:'flex',alignItems:'center',gap:10}}>
                              <div style={{width:36,height:36,borderRadius:999,display:'grid',placeItems:'center',background:'linear-gradient(135deg,#c7d2fe,#93c5fd)',border:'1px solid rgba(0,0,0,.06)',color:'#1f2937',fontWeight:900}}>{(p.project_name||'').charAt(0).toUpperCase()}</div>
                              <div>
                                <div style={{fontWeight:900}}>{p.project_name}</div>
                                <div style={{fontSize:12,color:'#6a7280',marginTop:4}}>{p.project_id}</div>
                              </div>
                            </div>
                          </td>
                          <td style={{padding:'12px 10px',verticalAlign:'top'}}>{(p.people && p.people.map(x=>x.person).slice(0,2).join(' / ')) || ''}</td>
                          <td style={{padding:'12px 10px',verticalAlign:'top'}}><span style={{display:'inline-flex',alignItems:'center',padding:'6px 10px',borderRadius:999,background:'#fff7ed',color:'#c2410c',fontWeight:900}}>—</span></td>
                          <td style={{padding:'12px 10px',verticalAlign:'top'}}><span style={{display:'inline-flex',alignItems:'center',padding:'6px 10px',borderRadius:999,background:'#fff1f1',color:'#b91c1c',fontWeight:900}}>—</span></td>
                          <td style={{padding:'12px 10px',verticalAlign:'top'}}><span style={{display:'inline-flex',alignItems:'center',padding:'6px 10px',borderRadius:999,background:'#ecfdf5',color:'#15803d',fontWeight:900}}>Synced</span></td>
                          <td style={{padding:'12px 10px',verticalAlign:'top',color:'#6a7280'}}>{p.last_tx || ''}</td>
                          <td style={{padding:'12px 10px',verticalAlign:'top',color:'#2a2a2c'}}>
                            <ul style={{margin:0,paddingLeft:16}}>{/* placeholder risks */}
                              <li>{p.total_hours} hrs</li>
                            </ul>
                          </td>
                          <td style={{padding:'12px 10px',verticalAlign:'top'}}>
                            <button onClick={() => console.log('DEX', p.project_id)} style={{padding:'6px 8px',borderRadius:8,border:'1px solid #e6e6ef',background:'#fff',fontWeight:800,cursor:'pointer'}}>DEX</button>
                          </td>
                        </tr>
                      ))}
                     </tbody>
                   </table>
                 </div>
               </div>

              <div style={{height:220,marginTop:12,background:'linear-gradient(180deg, rgba(11,18,40,.06), rgba(11,18,40,.00))'}} aria-hidden="true" />
            </>
          )}

          {/* Upload tab content */}
          {activeTab === 'upload' && (
            <div style={{padding:12}}>
              <div style={{display:'flex',alignItems:'center',gap:12}}>
                <input id="reportUpload" type="file" accept=".csv,.json,.ndjson,.xlsb" ref={uploadRef} onChange={handleFileUpload} style={{display:'none'}} />
                <button id="btnUploadReport" onClick={onUploadClick} style={{padding:'8px 12px',borderRadius:8,background:'#fff',border:'1px solid #e6e6ef',cursor:'pointer',fontWeight:800}}>Upload report</button>
                <div style={{fontSize:12,color:'#6b7280'}}>Accepted: .csv .json .ndjson .xlsb</div>
              </div>

              {lastUpload && (
                <div style={{marginTop:12,padding:12,background:'#fff4',borderRadius:8,border:'1px dashed #e3e6ef'}}>
                  <div style={{fontSize:12,fontWeight:700}}>Last upload</div>
                  <div style={{fontSize:12,marginTop:6}}>jobId: {lastUpload.jobId || '(none)'}</div>
                  <div style={{fontSize:12}}>savedOriginal: {lastUpload.savedOriginal || '(unknown)'}</div>
                  <pre style={{whiteSpace:'pre-wrap',fontSize:11,marginTop:6}}>{lastUpload.raw}</pre>
                </div>
              )}

              {parsedData && (
                <div style={{marginTop:12,padding:12,background:'#fff',borderRadius:8,border:'1px solid #e6e6ef'}}>
                  <div style={{fontSize:12,fontWeight:700}}>Parsed data (preview)</div>
                  <pre style={{maxHeight:240,overflow:'auto',fontSize:12,whiteSpace:'pre-wrap',marginTop:8}}>{JSON.stringify(parsedData.slice(0,20), null, 2)}</pre>
                </div>
              )}
            </div>
          )}

          {/* Debug panel: show last upload and parsed data so we can debug missing rows */}
          {lastUpload && (
            <div style={{padding:12,background:'#fff4',marginTop:12,borderRadius:8,border:'1px dashed #e3e6ef'}}>
              <div style={{fontSize:12,color:'#374151',fontWeight:700}}>Last upload</div>
              <div style={{fontSize:12,color:'#6b7280',marginTop:6}}>jobId: {lastUpload.jobId || '(none)'}</div>
              <div style={{fontSize:12,color:'#6b7280'}}>savedOriginal: {lastUpload.savedOriginal || '(unknown)'}</div>
              <div style={{fontSize:12,color:'#6b7280',marginTop:6}}>raw response: <pre style={{whiteSpace:'pre-wrap',fontSize:11,color:'#374151'}}>{lastUpload.raw}</pre></div>
            </div>
          )}

          {parsedData && (
            <div style={{padding:12,background:'#fff',marginTop:12,borderRadius:8,border:'1px solid #e6e6ef'}}>
              <div style={{fontSize:12,fontWeight:700,color:'#374151'}}>Parsed data (preview)</div>
              <pre style={{maxHeight:240,overflow:'auto',fontSize:12,whiteSpace:'pre-wrap',marginTop:8}}>{JSON.stringify(parsedData.slice(0,20), null, 2)}</pre>
            </div>
          )}
        </div>
      </div>
    </main>
    )
  }
