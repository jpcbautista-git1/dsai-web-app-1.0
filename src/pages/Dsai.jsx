import React, { useRef, useState } from 'react'
import { useGemini } from '../gemini'

export default function Dsai(){
  const DEX_MODAL_SAVE_KEY = 'dsaiDexModalSavedAssignments'
  const DEX_VIEW_MODAL_SAVE_KEY = 'dsaiDexViewModalSavedAssignments'
  const uploadRef = useRef(null)
  const { complete: runGeminiAnalysis } = useGemini()
  const [parsedData, setParsedData] = useState(null)
  const [projectSummaries, setProjectSummaries] = React.useState([
    {
      project_id: 'website-redesign',
      project_name: 'Website Redesign',
      people: [ { person: 'Chou, Adrich' } ],
      total_hours: 0,
      last_tx: null,
      key_risks: ['Scope creep from stakeholder requests', 'Delayed design approval from marketing']
    },
    {
      project_id: 'sap-abap',
      project_name: 'SAP ABAP Implementation',
      people: [ { person: 'Santos, Aristotle' } ],
      total_hours: 0,
      last_tx: null,
      key_risks: ['Resource shortage on ABAP skills', 'Integration testing delays']
    },
    {
      project_id: 'changi-soar',
      project_name: 'Changi International Airport Group - SOAR',
      people: [ { person: 'Lorilla, Miguel' } ],
      total_hours: 0,
      last_tx: null,
      key_risks: ['External vendor dependency', 'High budget constraints']
    },
    {
      project_id: 'bdo-spm',
      project_name: 'BDO SPM Implementation',
      people: [],
      total_hours: 0,
      last_tx: null,
      key_risks: ['Complex data migration', 'Stakeholder alignment']
    },
    {
      project_id: 'japan-css',
      project_name: 'Japan CSS - Product Management Support.',
      people: [],
      total_hours: 0,
      last_tx: null,
      key_risks: ['Time zone coordination', 'Quality assurance gaps']
    },
    {
      project_id: 'nike-oracle',
      project_name: 'NIKE Oracle Support',
      people: [],
      total_hours: 0,
      last_tx: null,
      key_risks: ['System stability issues', 'Staffing turnover risk']
    },
    {
      project_id: 'legacy-closed',
      project_name: 'Legacy Project (Closed)',
      people: [],
      total_hours: 0,
      last_tx: null,
      key_risks: []
    },
  ])
  // loading modal state
  const [loading, setLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('')
  const [loadingProgress, setLoadingProgress] = useState(null) // 0-100 or null
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [lastUpload, setLastUpload] = useState(null)
  const defaultLastSync = 'Apr 7, 2026 9:30 AM'
  const [lastSync, setLastSync] = useState(defaultLastSync)
  const [activeTab, setActiveTab] = useState('dsai')
  const onUploadClick = () => uploadRef.current?.click()

  // Track which projects are onboarded to DSAI (reads from localStorage, kept in sync)
  const [dsaiOnboardedIds, setDsaiOnboardedIds] = React.useState(new Set())
  React.useEffect(() => {
    const load = () => {
      try {
        const raw = localStorage.getItem('dsaiOnboard')
        if (!raw) { setDsaiOnboardedIds(new Set()); return }
        const payload = JSON.parse(raw)
        const s = new Set()
        const add = (it) => {
          if (!it) return
          if (it.id) s.add(String(it.id))
          if (it.projectId) s.add(String(it.projectId))
          if (it.projectName) s.add(it.projectName)
          if (it.engagementName) s.add(it.engagementName)
          if (it.title) s.add(it.title)
        }
        if (Array.isArray(payload)) payload.forEach(add)
        else add(payload)
        setDsaiOnboardedIds(s)
      } catch (e) { /* ignore */ }
    }
    load()
    window.addEventListener('storage', load)
    return () => window.removeEventListener('storage', load)
  }, [])

  const normalizeDexViewPublishStatus = (value) => {
    if (value === 'Accepted') return 'Published'
    return value || ''
  }

  // format date/time for display (e.g. "Apr 9, 2026 9:30 AM")
  const formatDateTime = (d) => {
    if (!d) return ''
    const dt = (d instanceof Date) ? d : new Date(d)
    const month = dt.toLocaleString('en-US', { month: 'short' })
    const day = dt.getDate()
    const year = dt.getFullYear()
    let hours = dt.getHours()
    const minutes = String(dt.getMinutes()).padStart(2, '0')
    const ampm = hours >= 12 ? 'PM' : 'AM'
    hours = hours % 12 || 12
    return `${month} ${day}, ${year} ${hours}:${minutes} ${ampm}`
  }

  // Sync All action: update lastSync and show a brief loading message. In a real app this would call the backend.
  const handleSyncAll = async () => {
    try {
      setLoading(true)
      setLoadingMessage('Syncing all projects...')
      // simulate short network/sync operation
      await new Promise(r => setTimeout(r, 800))
      setLastSync(formatDateTime(new Date()))
      setLoadingMessage('All projects synced')
      setTimeout(() => setLoading(false), 700)
    } catch (err) {
      console.error('Sync failed', err)
      setLoadingMessage('Sync failed')
      setTimeout(() => setLoading(false), 800)
    }
  }
  
  // DEX modal state and helpers
  const [dexModalOpen, setDexModalOpen] = React.useState(false)
  const [dexModalProject, setDexModalProject] = React.useState(null)
  const [dexSaveMessage, setDexSaveMessage] = React.useState('')
  const [dexModalReadOnly, setDexModalReadOnly] = React.useState(false)
  const [dexValidationErrors, setDexValidationErrors] = React.useState({})
  const [dexGeneratingMitigations, setDexGeneratingMitigations] = React.useState(false)
  const [dexMitigationGenError, setDexMitigationGenError] = React.useState('')
  const openDexModal = (project) => { setDexModalProject(project); setDexModalReadOnly(false); setDexModalOpen(true) }
  const closeDexModal = () => {
    setDexModalOpen(false)
    setDexModalProject(null)
    setMitigationAssignments({})
    setAiMitigations({})
    setDexModalReadOnly(false)
    setDexValidationErrors({})
    setDexSaveMessage('')
  }

  const handleGenerateMitigationsWithGemini = async () => {
    if (!dexModalProject?.key_risks || dexModalProject.key_risks.length === 0) {
      setDexMitigationGenError('No risks to generate mitigations for.')
      setTimeout(() => setDexMitigationGenError(''), 3000)
      return
    }

    try {
      setDexGeneratingMitigations(true)
      setDexMitigationGenError('')

      const newAssignments = { ...mitigationAssignments }
      const newAiMitigations = { ...aiMitigations }
      let successCount = 0

      // Generate mitigation for each risk individually
      for (let idx = 0; idx < dexModalProject.key_risks.length; idx++) {
        const risk = dexModalProject.key_risks[idx]
        
        const prompt = [
          'You are a project delivery risk analyst reviewing project risks.',
          `Project: ${dexModalProject.project_name}`,
          `PM/DM: ${dexModalProject.people?.[0]?.person || 'Unknown'}`,
          `Hours: ${dexModalProject.total_hours || 0}h`,
          '',
          `Risk identified: ${risk}`,
          '',
          'Based on this risk, provide:',
          '1. Risk level assessment (High/Medium/Low)',
          '2. Smart and proactive mitigation strategy',
          '',
          'Format your response as:',
          'LEVEL: [High|Medium|Low]',
          'MITIGATION: [specific, actionable mitigation strategy]'
        ].join('\n')

        const response = await runGeminiAnalysis(prompt, {
          temperature: 0.3,
          maxOutputTokens: 500
        })

        const responseText = String(response || '').trim()
        if (responseText) {
          // Parse the response - capture everything after LEVEL: and MITIGATION:
          const levelMatch = responseText.match(/LEVEL:\s*(High|Medium|Low)/i)
          const mitigationMatch = responseText.match(/MITIGATION:\s*(.+)/is)
          
          const riskLevel = levelMatch ? levelMatch[1] : 'High'
          const mitigationText = mitigationMatch ? mitigationMatch[1].trim() : responseText

          // Store AI-generated mitigation and risk level
          newAiMitigations[idx] = {
            riskLevel,
            mitigation: mitigationText
          }
          successCount++
        }
      }

      if (successCount > 0) {
        setAiMitigations(newAiMitigations)
        setDexMitigationGenError(`✓ Generated ${successCount} mitigation(s). Review suggested mitigations and enter your actions below.`)
        setTimeout(() => setDexMitigationGenError(''), 5000)
      } else {
        setDexMitigationGenError('Could not parse Gemini response. Please try again.')
        setTimeout(() => setDexMitigationGenError(''), 3000)
      }
    } catch (error) {
      setDexMitigationGenError(error?.message || 'Mitigation generation failed. Try again.')
      setTimeout(() => setDexMitigationGenError(''), 5000)
    } finally {
      setDexGeneratingMitigations(false)
    }
  }

  // mitigation assignment state for modal (owner selection + accept flag)
  const [mitigationAssignments, setMitigationAssignments] = React.useState({})
  const [aiMitigations, setAiMitigations] = React.useState({}) // Store AI-generated mitigations and risk levels per risk
  const setMitigationOwner = (idx, owner) => setMitigationAssignments(prev => ({ ...prev, [idx]: { ...(prev[idx] || {}), owner } }))

  // Separate modal/state for DEX tab "View" action
  const [dexViewModalOpen, setDexViewModalOpen] = React.useState(false)
  const [dexViewModalProject, setDexViewModalProject] = React.useState(null)
  const [dexViewMitigationAssignments, setDexViewMitigationAssignments] = React.useState({})
  const [dexViewModalReadOnly, setDexViewModalReadOnly] = React.useState(false)
  const [dexViewSaveMessage, setDexViewSaveMessage] = React.useState('')
  const [publishTooltip, setPublishTooltip] = React.useState(null)
  const [rejectReasonEditor, setRejectReasonEditor] = React.useState(null)

  const openDexViewModal = (project) => {
    setDexViewModalProject(project)
    setDexViewModalReadOnly(true)
    setDexViewModalOpen(true)
  }

  const closeDexViewModal = () => {
    setDexViewModalOpen(false)
    setDexViewModalProject(null)
    setDexViewMitigationAssignments({})
    setDexViewModalReadOnly(false)
    setDexViewSaveMessage('')
    setPublishTooltip(null)
    setRejectReasonEditor(null)
  }

  // load previously saved DEX View assignments for selected project
  React.useEffect(() => {
    if (!dexViewModalOpen || !dexViewModalProject) return
    try {
      const raw = localStorage.getItem(DEX_VIEW_MODAL_SAVE_KEY)
      const savedByProject = raw ? JSON.parse(raw) : {}
      const projectKey = dexViewModalProject.project_id || dexViewModalProject.project_name || 'unknown'
      const savedAssignments = savedByProject?.[projectKey] || {}
      const normalizedSavedAssignments = Object.fromEntries(
        Object.entries(savedAssignments).map(([key, row]) => [
          key,
          {
            ...(row || {}),
            publish: normalizeDexViewPublishStatus(row?.publish)
          }
        ])
      )
      setDexViewMitigationAssignments(normalizedSavedAssignments)
      setDexViewModalReadOnly(true)
      setDexViewSaveMessage('')
    } catch (e) {
      setDexViewMitigationAssignments({})
      setDexViewModalReadOnly(true)
      setDexViewSaveMessage('')
    }
  }, [dexViewModalOpen, dexViewModalProject])

  const saveDexViewModalAssignments = () => {
    if (!dexViewModalProject) return
    try {
      const raw = localStorage.getItem(DEX_VIEW_MODAL_SAVE_KEY)
      const savedByProject = raw ? JSON.parse(raw) : {}
      const projectKey = dexViewModalProject.project_id || dexViewModalProject.project_name || 'unknown'

      const risks = dexViewModalProject?.key_risks || []
      const normalizedAssignments = { ...dexViewMitigationAssignments }
      risks.forEach((_, idx) => {
        const row = normalizedAssignments[idx] || {}
        const mappedPriority = row.riskPriority || (row.dexRisk === 'Red' ? 'High' : row.dexRisk === 'Green' ? 'Low' : 'Medium')
        const mappedPublish = normalizeDexViewPublishStatus(row.publish)
        normalizedAssignments[idx] = {
          ...row,
          riskPriority: mappedPriority,
          publish: mappedPublish
        }
      })

      savedByProject[projectKey] = normalizedAssignments
      localStorage.setItem(DEX_VIEW_MODAL_SAVE_KEY, JSON.stringify(savedByProject))
      setDexViewMitigationAssignments(normalizedAssignments)
      setDexViewModalReadOnly(true)
      setDexViewSaveMessage('Saved')
      setTimeout(() => setDexViewSaveMessage(''), 1400)
    } catch (e) {
      setDexViewSaveMessage('Save failed')
      setTimeout(() => setDexViewSaveMessage(''), 1800)
    }
  }

  const isDexViewRowLocked = (idx) => {
    const rowStatus = normalizeDexViewPublishStatus(dexViewMitigationAssignments[idx]?.publish)
    return rowStatus === 'Published' || rowStatus === 'Rejected'
  }

  // load previously saved assignments for the selected project when opening the modal
  React.useEffect(() => {
    if (!dexModalOpen || !dexModalProject) return
    try {
      const raw = localStorage.getItem(DEX_MODAL_SAVE_KEY)
      const savedByProject = raw ? JSON.parse(raw) : {}
      const projectKey = dexModalProject.project_id || dexModalProject.project_name || 'unknown'
      const savedAssignments = savedByProject?.[projectKey] || {}
      setMitigationAssignments(savedAssignments)
      setDexModalReadOnly(true)
      setDexValidationErrors({})
    } catch (e) {
      setMitigationAssignments({})
      setDexModalReadOnly(true)
      setDexValidationErrors({})
    }
  }, [dexModalOpen, dexModalProject])

  const validateDexModalAssignments = () => {
    const errors = {}
    const risks = dexModalProject?.key_risks || []

    risks.forEach((_, idx) => {
      const row = mitigationAssignments[idx] || {}
      const rowErrors = {}
      if (!String(row.actionsTaken || '').trim()) rowErrors.actionsTaken = 'Required'
      if (!String(row.dueDate || '').trim()) rowErrors.dueDate = 'Required'
      // Status dropdown defaults to Open in UI; treat it as selected even if user didn't change it.
      if (!String(row.workflowStatus || 'Open').trim()) rowErrors.workflowStatus = 'Required'
      if (Object.keys(rowErrors).length > 0) errors[idx] = rowErrors
    })

    setDexValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const saveDexModalAssignments = () => {
    if (!dexModalProject) return
    if (!validateDexModalAssignments()) {
      setDexSaveMessage('Please complete required fields')
      setTimeout(() => setDexSaveMessage(''), 1800)
      return
    }
    try {
      const raw = localStorage.getItem(DEX_MODAL_SAVE_KEY)
      const savedByProject = raw ? JSON.parse(raw) : {}
      const projectKey = dexModalProject.project_id || dexModalProject.project_name || 'unknown'
      // Persist explicit workflowStatus so reopened rows keep the chosen/default value.
      const risks = dexModalProject?.key_risks || []
      const normalizedAssignments = { ...mitigationAssignments }
      risks.forEach((_, idx) => {
        const row = normalizedAssignments[idx] || {}
        normalizedAssignments[idx] = { ...row, workflowStatus: row.workflowStatus || 'Open' }
      })
      savedByProject[projectKey] = normalizedAssignments
      localStorage.setItem(DEX_MODAL_SAVE_KEY, JSON.stringify(savedByProject))
      setMitigationAssignments(normalizedAssignments)
      setDexModalReadOnly(true)
      setDexValidationErrors({})
      setDexSaveMessage('Saved')
      setTimeout(() => setDexSaveMessage(''), 1400)
    } catch (e) {
      setDexSaveMessage('Save failed')
      setTimeout(() => setDexSaveMessage(''), 1800)
    }
  }
  
  // set a full status for a mitigation ('open'|'accepted'|'rejected'|'deferred')
  const setMitigationStatus = (idx, status, data) => setMitigationAssignments(prev => ({
    ...prev,
    [idx]: {
      ...(prev[idx] || {}),
      status,
      accepted: status === 'accepted',
      ...(data || {})
    }
  }))

  // toggle accept/unaccept while preserving other metadata
  const toggleAcceptMitigation = (idx) => setMitigationAssignments(prev => {
    const cur = prev[idx] || {}
    const newAccepted = !cur.accepted
    const newStatus = newAccepted ? 'accepted' : (cur.status === 'rejected' ? 'rejected' : 'open')
    return { ...prev, [idx]: { ...cur, accepted: newAccepted, status: newStatus, owner: cur.owner || 'PM' } }
  })

  // reject with optional reason (uses browser prompt for simplicity in this POC)
  const rejectMitigation = (idx) => {
    try {
      const ok = window.confirm('Reject this mitigation? This will mark it as Rejected.')
      if (!ok) return
      const reason = window.prompt('Optional reason for rejection (press Cancel to skip):', '')
      setMitigationStatus(idx, 'rejected', { rejectedReason: reason || '' })
    } catch (e) {
      // defensive: if window is not available, just set rejected
      setMitigationStatus(idx, 'rejected', { rejectedReason: '' })
    }
  }

  // defer with optional until date/string (uses prompt for POC)
  const deferMitigation = (idx) => {
    try {
      const until = window.prompt('Defer until (YYYY-MM-DD or a short description):', '')
      if (until == null) return // cancelled
      const untilVal = (String(until || '').trim()) || 'unspecified'
      setMitigationStatus(idx, 'deferred', { deferUntil: untilVal })
    } catch (e) {
      setMitigationStatus(idx, 'deferred', { deferUntil: 'unspecified' })
    }
  }

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

  const parseCSV = (txt = '') => {
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

    // Only accept .xlsb files for this upload feature
    const _ext = (f.name.split('.').pop() || '').toLowerCase()
    if (_ext !== 'xlsb') {
      // brief user-visible message and early return
      setLoading(true)
      setLoadingMessage('Only .xlsb files are accepted for upload')
      setTimeout(() => { setLoading(false); setLoadingMessage('') }, 1800)
      return
    }

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

  // sample suggested mitigations to display in the DEX modal
  const sampleMitigations = [
    'Increase staffing buffer and cross-train team members.',
    'Rebaseline schedule and remove non-critical scope.',
    'Engage stakeholders to unblock external dependencies.',
    'Run focused QA and code reviews on risky components.',
    'Allocate contingency budget and prioritize critical tasks.'
  ]

  // base font/style for modal to keep typography uniform and slightly smaller
  const modalBaseFont = { fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial", fontSize:13, color:'#334155' }

  // smarter mitigation generation: heuristics that inspect the risk text and produce proactive, prioritized suggestions
  const generateMitigationForRisk = (risk) => {
    if (!risk) return sampleMitigations[0]
    const text = String(risk).toLowerCase()
    const suggestions = []

    if (/(staff|resource|capacity|skill|onboard)/.test(text)) {
      suggestions.push('Increase staffing buffer: cross-train team members, onboard short-term contractors, and create a skills matrix to reassign tasks quickly.')
    }
    if (/(scope|creep|requirements|change)/.test(text)) {
      suggestions.push('Rebaseline schedule and apply strict change control: remove non-critical scope, run a rapid scope review with stakeholders, and freeze change for the next sprint.')
    }
    if (/(dependenc|external|vendor|blocked|third[- ]party)/.test(text)) {
      suggestions.push('Escalate to stakeholders and vendors: secure commitments with SLAs, unblock dependencies, and parallelize work where possible to reduce critical path risk.')
    }
    if (/(qa|test|bug|quality|regress|defect)/.test(text)) {
      suggestions.push('Run focused QA sprints and increase code-review coverage: add targeted automated tests, create a test-and-fix window, and pair-review risky modules.')
    }
    if (/(budget|cost|contingency|fund)/.test(text)) {
      suggestions.push('Allocate contingency budget and reprioritize features: protect critical deliverables and pause low-value work until stability returns.')
    }
    if (/(late|delay|schedule|timeline|slippage)/.test(text)) {
      suggestions.push('Fast-track the critical path: add resources to critical tasks, split work into parallel streams, and publish a clear recovery plan with owners and dates.')
    }
    if (/(security|vulnerab|auth|encrypt|compli|gdpr)/.test(text)) {
      suggestions.push('Run security scans and engage the security team immediately: apply patches, close vulnerabilities, and put compensating controls in place.')
    }
    if (/(integrat|data|api|migration|etl)/.test(text)) {
      suggestions.push('Improve integration stability: test end-to-end with representative data, add monitoring/alerts, and prepare rollback and mitigation scripts.')
    }

    if (suggestions.length === 0) {
      // generic, proactive approach when no keyword matches
      suggestions.push('Triage the issue, assign a clear owner, perform a quick root-cause analysis, and set short, measurable remediation checkpoints (1-week cadence).')
    }

    // return the top 1-2 suggestions concatenated for concise display
    return suggestions.slice(0, 2).join(' — ')
  }

  // DEX dashboard derived metrics (filtered to onboarded projects only)
  const dexOnboardedProjects = projectSummaries.filter(p => dsaiOnboardedIds.has(p.project_id) || dsaiOnboardedIds.has(p.project_name))
  const dexTotalProjects = dexOnboardedProjects.length
  const dexAtRisk = dexOnboardedProjects.filter(p => Array.isArray(p.key_risks) && p.key_risks.length > 0).length
  const dexSynced = dexOnboardedProjects.filter(p => p.last_tx).length
  const dexAvgHours = Math.round((dexOnboardedProjects.reduce((s,p) => s + (p.total_hours || 0), 0) / Math.max(1, dexTotalProjects)) * 100) / 100

  const dexTopProjects = dexOnboardedProjects.slice().sort((a,b) => (b.total_hours || 0) - (a.total_hours || 0)).slice(0,5)

  const dexRiskCategories = dexOnboardedProjects.reduce((acc, p) => {
    (p.key_risks || []).forEach(rk => {
      const t = String(rk || '').toLowerCase()
      let cat = 'Other'
      if (/(staff|resource|capacity|skill|onboard)/.test(t)) cat = 'Staffing'
      else if (/(scope|creep|requirements|change)/.test(t)) cat = 'Scope'
      else if (/(dependenc|external|vendor|blocked|third[- ]party)/.test(t)) cat = 'Dependencies'
      else if (/(qa|test|bug|quality|regress|defect)/.test(t)) cat = 'Quality'
      else if (/(budget|cost|contingency|fund)/.test(t)) cat = 'Budget'
      else if (/(late|delay|schedule|timeline|slippage)/.test(t)) cat = 'Schedule'
      acc[cat] = (acc[cat] || 0) + 1
    })
    return acc
  }, {})

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
              
               <button onClick={handleSyncAll} style={{display:'inline-flex',alignItems:'center',gap:8,padding:'7px 10px',fontSize:12,fontWeight:700,background:'#fff',borderRadius:10,border:'1px solid #e3e6ef',cursor:'pointer'}}> 
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

            {/* upload tab (moved before DEX) */}
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

            {/* separator */}
            <div style={{width:1, height:22, background:'#e6eef6', margin:'0 6px'}} aria-hidden />

            {/* DEX tab */}
            <button
              onClick={() => setActiveTab('dex')}
              aria-pressed={activeTab === 'dex'}
              style={{
                padding:'10px 16px',
                borderRadius:6,
                border: activeTab === 'dex' ? '1px solid #2563eb' : '1px solid #e2e8f0',
                background: activeTab === 'dex' ? '#ffffff' : '#f8fafc',
                color: activeTab === 'dex' ? '#0f172a' : '#475569',
                fontWeight:800,
                cursor:'pointer',
                boxShadow: activeTab === 'dex' ? '0 2px 6px rgba(37,99,235,0.06)' : 'none'
              }}
            >DEX</button>
          </div>
          
          {/* subtle divider to separate tabs from content (reduced) */}
          <div style={{height:6}} />

          {/* Full DEX dashboard content */}
          {activeTab === 'dex' && (
            <>
              <div style={{padding:'12px 20px 10px'}}>
                <div style={{display:'grid',gridTemplateColumns:'repeat(4, minmax(0,1fr))',gap:10}}>
                  <div style={{background:'#fff',border:'1px solid #e6e9f2',borderRadius:12,padding:12,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                    <div style={{display:'flex',flexDirection:'column',gap:4}}>
                      <div style={{fontSize:10,color:'#6a7280',fontWeight:700}}>Total Projects</div>
                      <div style={{fontSize:18,fontWeight:900,color:'#2a2f36'}}>{dexTotalProjects}</div>
                    </div>
                  </div>

                  <div style={{background:'#fff',border:'1px solid #e6e9f2',borderRadius:12,padding:12,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                    <div style={{display:'flex',flexDirection:'column',gap:4}}>
                      <div style={{fontSize:10,color:'#6a7280',fontWeight:700}}>Projects At Risk</div>
                      <div style={{fontSize:18,fontWeight:900,color:'#b91c1c'}}>{dexAtRisk}</div>
                    </div>
                  </div>

                  <div style={{background:'#fff',border:'1px solid #e6e9f2',borderRadius:12,padding:12,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                    <div style={{display:'flex',flexDirection:'column',gap:4}}>
                      <div style={{fontSize:10,color:'#6a7280',fontWeight:700}}>Synced</div>
                      <div style={{fontSize:18,fontWeight:900,color:'#15803d'}}>{dexSynced}</div>
                    </div>
                  </div>

                  <div style={{background:'#fff',border:'1px solid #e6e9f2',borderRadius:12,padding:12,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                    <div style={{display:'flex',flexDirection:'column',gap:4}}>
                      <div style={{fontSize:10,color:'#6a7280',fontWeight:700}}>Avg Hours</div>
                      <div style={{fontSize:18,fontWeight:900,color:'#f97316'}}>{dexAvgHours}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:12,padding:'8px 0 0'}}>
                <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                  <button style={{padding:'7px 10px',borderRadius:10,background:'#f5f6fb',border:'1px solid #e3e6ef',fontWeight:800}}>All Projects</button>
                  <button style={{padding:'7px 10px',borderRadius:10,background:'#fff',border:'1px solid #e6e6ef',fontWeight:800}}><span style={{display:'inline-block',width:8,height:8,borderRadius:999,background:'#ef4444',marginRight:8}}></span>At Risk</button>
                  <button style={{padding:'7px 10px',borderRadius:10,background:'#fff',border:'1px solid #e6e6ef',fontWeight:800}}><span style={{display:'inline-block',width:8,height:8,borderRadius:999,background:'#22c55e',marginRight:8}}></span>Synced</button>
                </div>

                <div style={{display:'flex',alignItems:'center',gap:12,flex:1,justifyContent:'flex-end'}}>
                  <div style={{display:'flex',alignItems:'center',gap:8,background:'#fff',border:'1px solid #e6e6ef',borderRadius:10,padding:'7px 10px',minWidth:260}}>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="#6a7280"><path d="M10 2a8 8 0 1 0 4.9 14.32l4.39 4.39 1.41-1.41-4.39-4.39A8 8 0 0 0 10 2zm0 2a6 6 0 1 1 0 12 6 6 0 0 1 0-12z"/></svg>
                    <input type="search" placeholder="Search projects..." style={{border:0,outline:0,background:'transparent',width:'100%'}}/>
                  </div>
                </div>
              </div>

              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:12,padding:'12px 0',borderTop:'1px solid #eef1f7'}}>
                <div>
                  <button style={{display:'inline-flex',alignItems:'center',gap:8,padding:'7px 10px',borderRadius:10,background:'#fff',border:'1px solid #e3e6ef',fontWeight:800,cursor:'pointer'}}>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="#3b4251"><path d="M3 5h18v2H3V5zm4 6h10v2H7v-2zm3 6h4v2h-4v-2z"/></svg>
                    Filter
                  </button>
                </div>

                <div style={{display:'flex',alignItems:'center',gap:10}}>
                  <div style={{display:'inline-flex',alignItems:'center',gap:8,padding:'6px 10px',background:'#fff',border:'1px solid #e6e6ef',borderRadius:999,fontSize:12}}>Last 30 Days</div>
                  <div style={{display:'inline-flex',alignItems:'center',gap:8,padding:'6px 10px',background:'#fff',border:'1px solid #e6e6ef',borderRadius:999,fontSize:12}}><span style={{width:8,height:8,borderRadius:999,background:'#22c55e'}}></span> Last Sync: {lastSync || 'n/a'}</div>
                </div>
              </div>

              <div style={{paddingTop:12}}>
                <div style={{overflowX:'auto'}}>
                  <table style={{width:'100%',borderCollapse:'separate',borderSpacing:0,fontSize:13}} aria-label="DEX Projects">
                    <thead>
                      <tr style={{textAlign:'left',color:'#6a7280',fontWeight:900,fontSize:12,borderBottom:'1px solid #e6e9f2'}}>
                        <th style={{padding:'12px 10px'}}>Project</th>
                        <th style={{padding:'12px 10px'}}>PM / DM</th>
                        <th style={{padding:'12px 10px'}}>Hours</th>
                        <th style={{padding:'12px 10px'}}>Last Sync</th>
                        <th style={{padding:'12px 10px'}}>Key Risks</th>
                        <th style={{padding:'12px 10px'}} aria-label="DEX action" />
                      </tr>
                    </thead>
                    <tbody>
                      {dexOnboardedProjects.length === 0 && (
                        <tr><td colSpan={6} style={{padding:'24px 10px',color:'#6a7280'}}>No projects onboarded to DSAI yet.</td></tr>
                      )}
                      {dexOnboardedProjects.map((p) => (
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
                          <td style={{padding:'12px 10px',verticalAlign:'top'}}>{p.total_hours || 0}h</td>
                          <td style={{padding:'12px 10px',verticalAlign:'top',color:'#6a7280'}}>{p.last_tx || 'n/a'}</td>
                          <td style={{padding:'12px 10px',verticalAlign:'top',color:'#2a2a2c'}}>{(p.key_risks || []).slice(0,2).join('; ') || 'None'}</td>
                          <td style={{padding:'12px 10px',verticalAlign:'top'}}>
                            <button onClick={() => openDexViewModal(p)} style={{padding:'6px 8px',borderRadius:8,border:'1px solid #e6e6ef',background:'#fff',fontWeight:800,cursor:'pointer'}}>View</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Separate DEX tab View modal */}
              {dexViewModalOpen && (
                <div style={{position:'fixed',inset:0,display:'grid',placeItems:'center',background:'rgba(2,6,23,0.55)',zIndex:10000,padding:20}} role="dialog" aria-modal="true">
                  <div style={{width:1300,maxWidth:'98vw',maxHeight:'92%',overflow:'hidden',background:'#fff',borderRadius:12,padding:0,boxShadow:'0 20px 60px rgba(2,6,23,0.35)',border:'1px solid rgba(15,23,42,0.06)',display:'flex',flexDirection:'column',...modalBaseFont}}>
                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'16px 20px',borderBottom:'1px solid #eef1f6'}}>
                      <div style={{display:'flex',alignItems:'center',gap:12}}>
                        <div style={{width:48,height:48,display:'grid',placeItems:'center',borderRadius:10,background:'linear-gradient(135deg,#e0e7ff,#c7d2fe)',color:'#0f172a',fontWeight:800,fontSize:14}}>{(dexViewModalProject?.project_name||'').charAt(0).toUpperCase()}</div>
                        <div>
                          <div style={{fontSize:15,fontWeight:800,color:'#0f172a'}}>{dexViewModalProject?.project_name || 'Project'}</div>
                          <div style={{fontSize:12,color:'#6b7280',marginTop:4}}>{dexViewModalProject?.people?.[0]?.person || 'Project Manager'}</div>
                        </div>
                      </div>

                      <div style={{display:'flex',alignItems:'center',gap:8}}>
                        <button onClick={() => { console.log('Export DEX View', dexViewModalProject?.project_id) }} aria-label="Export DEX view report" style={{display:'inline-flex',alignItems:'center',gap:8,padding:'6px 10px',height:34,lineHeight:1,fontSize:13,borderRadius:8,background:'#2563eb',border:'1px solid #1e40af',color:'#fff',fontWeight:700,cursor:'pointer'}}>
                          <svg viewBox="0 0 24 24" width="12" height="12" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{flex:'0 0 auto'}}>
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <path d="M7 10l5 5 5-5" />
                            <path d="M12 15V3" />
                          </svg>
                          <span style={{display:'inline-block',transform:'translateY(-1px)'}}>Export</span>
                        </button>
                        <button onClick={saveDexViewModalAssignments} aria-label="Save DEX view actions" style={{display:'inline-flex',alignItems:'center',padding:'6px 10px',height:34,lineHeight:1,fontSize:13,borderRadius:8,background:'#059669',border:'1px solid #047857',color:'#fff',fontWeight:700,cursor:'pointer'}}>
                          Save
                        </button>
                        <button onClick={() => { setDexViewModalReadOnly(false); setRejectReasonEditor(null) }} aria-label="Edit DEX view actions" style={{display:'inline-flex',alignItems:'center',padding:'6px 10px',height:34,lineHeight:1,fontSize:13,borderRadius:8,background:'#f59e0b',border:'1px solid #d97706',color:'#fff',fontWeight:700,cursor:'pointer'}}>
                          Edit
                        </button>
                        {dexViewSaveMessage && <div style={{fontSize:12,color:dexViewSaveMessage === 'Saved' ? '#065f46' : '#b91c1c',fontWeight:700}}>{dexViewSaveMessage}</div>}
                        <button onClick={closeDexViewModal} style={{padding:'6px 10px',height:34,lineHeight:1,fontSize:13,borderRadius:8,background:'#111827',border:0,color:'#fff',fontWeight:700,cursor:'pointer'}}>Close</button>
                      </div>
                    </div>

                    <div style={{padding:16,overflow:'auto'}}>
                      <div style={{marginBottom:12,display:'flex',alignItems:'center',justifyContent:'space-between',gap:12,padding:'10px 12px',borderRadius:10,border:'1px solid #dbeafe',background:'linear-gradient(135deg,#eff6ff,#f8fafc)'}}>
                        <div style={{display:'flex',alignItems:'center',gap:10}}>
                          <div style={{width:28,height:28,borderRadius:8,display:'grid',placeItems:'center',background:'#dbeafe',border:'1px solid #bfdbfe',color:'#1d4ed8'}}>
                            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                          </div>
                          <div>
                            <div style={{fontSize:12,fontWeight:800,color:'#1e3a8a',letterSpacing:0.2,textTransform:'uppercase'}}>AI Risk Detection</div>
                            <div style={{fontSize:13,color:'#334155'}}>These are AI identified risks for this project.</div>
                          </div>
                        </div>
                        <div style={{fontSize:12,fontWeight:800,color:'#0f172a',background:'#ffffff',border:'1px solid #cbd5e1',borderRadius:999,padding:'6px 10px'}}>
                          {(dexViewModalProject?.key_risks || []).length} risks
                        </div>
                      </div>
                      <div style={{border:'1px solid #e6e9f2',borderRadius:8,overflow:'visible',background:'#fff'}}>
                        <table style={{width:'100%',borderCollapse:'collapse',fontSize:13,tableLayout:'fixed'}}>
                          <colgroup>
                            <col style={{width:'20'}} />
                            <col style={{width:'14%'}} />
                            <col style={{width:'39%'}} />
                            <col style={{width:'18%'}} />
                            <col style={{width:'17%'}} />
                            <col style={{width:'12%'}} />
                          </colgroup>
                          <thead style={{background:'#f8fafc'}}>
                            <tr style={{textAlign:'left'}}>
                              <th style={{padding:12,borderBottom:'1px solid #eef1f6',fontWeight:700,color:'#374151',width:'30%'}}>Risk</th>
                              <th style={{padding:12,borderBottom:'1px solid #eef1f6',fontWeight:700,color:'#374151',width:'14%'}}>Risk level</th>
                              <th style={{padding:12,borderBottom:'1px solid #eef1f6',fontWeight:700,color:'#374151'}}>Suggested Mitigation</th>
                              <th style={{padding:12,borderBottom:'1px solid #eef1f6',fontWeight:700,color:'#374151',width:'18%'}}>Risk Priority</th>
                              <th style={{padding:12,borderBottom:'1px solid #eef1f6',fontWeight:700,color:'#374151',width:'17%'}}>Publish</th>
                              <th style={{padding:12,borderBottom:'1px solid #eef1f6',fontWeight:700,color:'#374151',width:'12%'}}>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {dexViewModalProject?.key_risks && dexViewModalProject.key_risks.length > 0 ? (
                              dexViewModalProject.key_risks.map((rk, idx) => (
                                <tr key={idx} style={{background: idx % 2 === 0 ? '#fff' : '#fbfdff'}}>
                                  {(() => {
                                    const rowStatus = dexViewMitigationAssignments[idx]?.publish || ''
                                    const rowLocked = isDexViewRowLocked(idx)
                                    return (
                                      <>
                                  <td style={{padding:12,borderBottom:'1px solid #f1f5f9',verticalAlign:'top',color:'#111827',wordBreak:'break-word'}}>{rk}</td>
                                  <td style={{padding:12,borderBottom:'1px solid #f1f5f9',verticalAlign:'top',width:'14%'}}><span style={{display:'inline-block',padding:'5px 6px',borderRadius:6,background:'#fff7ed',color:'#b91c1c',fontWeight:700,fontSize:12}}>High</span></td>
                                  <td style={{padding:12,borderBottom:'1px solid #f1f5f9',verticalAlign:'top',color:'#334155',wordBreak:'break-word'}}>
                                    <div>{generateMitigationForRisk(rk)}</div>
                                  </td>
                                  <td style={{padding:12,borderBottom:'1px solid #f1f5f9',verticalAlign:'top'}}>
                                    {(() => {
                                      const saved = dexViewMitigationAssignments[idx] || {}
                                      const riskPriority = saved.riskPriority || (saved.dexRisk === 'Red' ? 'High' : saved.dexRisk === 'Green' ? 'Low' : 'Medium')
                                      const riskTone = riskPriority === 'High'
                                        ? { bg: '#fef2f2', border: '#fecaca', text: '#b91c1c', dot: '#ef4444' }
                                        : riskPriority === 'Low'
                                          ? { bg: '#ecfdf5', border: '#bbf7d0', text: '#166534', dot: '#22c55e' }
                                          : { bg: '#fff7ed', border: '#fed7aa', text: '#b45309', dot: '#f59e0b' }

                                      return (
                                        <div style={{display:'grid',gap:8}}>
                                          <select
                                            value={riskPriority}
                                            disabled={dexViewModalReadOnly || rowLocked}
                                            onChange={(e) => {
                                              if (isDexViewRowLocked(idx)) return
                                              setDexViewMitigationAssignments(prev => ({ ...prev, [idx]: { ...(prev[idx] || {}), riskPriority: e.target.value } }))
                                            }}
                                            style={{width:'100%',padding:'6px 8px',borderRadius:8,border:'1px solid #dbe3ef',fontSize:12,fontWeight:700,background:(dexViewModalReadOnly || rowLocked) ? '#f8fafc' : '#fff',color:'#0f172a'}}
                                          >
                                            <option value="High">High</option>
                                            <option value="Medium">Medium</option>
                                            <option value="Low">Low</option>
                                          </select>
                                          <div style={{display:'inline-flex',alignItems:'center',gap:6,width:'fit-content',padding:'4px 8px',borderRadius:999,border:`1px solid ${riskTone.border}`,background:riskTone.bg,color:riskTone.text,fontWeight:800,fontSize:11}}>
                                            <span style={{width:8,height:8,borderRadius:999,background:riskTone.dot,boxShadow:'0 0 0 2px rgba(255,255,255,0.7)'}}></span>
                                            {riskPriority}
                                          </div>
                                        </div>
                                      )
                                    })()}
                                  </td>
                                  <td style={{padding:12,borderBottom:'1px solid #f1f5f9',verticalAlign:'top'}}>
                                    <div style={{display:'grid',gap:8}}>
                                      <div style={{display:'flex',gap:8,alignItems:'center'}}>
                                        <button
                                          onMouseEnter={(e) => {
                                            const r = e.currentTarget.getBoundingClientRect()
                                            const tooltipWidth = 300
                                            const left = Math.min(Math.max(12, r.left), window.innerWidth - tooltipWidth - 12)
                                            const top = r.top > 70 ? (r.top - 10) : (r.bottom + 10)
                                            const placement = r.top > 70 ? 'top' : 'bottom'
                                            setPublishTooltip({ row: idx, left, top, placement })
                                          }}
                                          onMouseLeave={() => setPublishTooltip(null)}
                                          disabled={dexViewModalReadOnly || rowLocked}
                                          onClick={() => {
                                            if (isDexViewRowLocked(idx)) return
                                            setDexViewMitigationAssignments(prev => ({ ...prev, [idx]: { ...(prev[idx] || {}), publish: 'Published' } }))
                                          }}
                                          style={{padding:'6px 10px',borderRadius:6,background:'#16a34a',color:'#fff',border:0,cursor:(dexViewModalReadOnly || rowLocked) ? 'not-allowed' : 'pointer',opacity:(dexViewModalReadOnly || rowLocked) ? 0.6 : 1,fontWeight:700}}
                                        >
                                          Publish
                                        </button>

                                        <button
                                          disabled={dexViewModalReadOnly || rowLocked}
                                          onClick={() => {
                                            if (isDexViewRowLocked(idx)) return
                                            setRejectReasonEditor({ row: idx, value: dexViewMitigationAssignments[idx]?.rejectReason || '', error: '' })
                                          }}
                                          style={{padding:'6px 10px',borderRadius:6,background:'#ef4444',color:'#fff',border:0,cursor:(dexViewModalReadOnly || rowLocked) ? 'not-allowed' : 'pointer',opacity:(dexViewModalReadOnly || rowLocked) ? 0.6 : 1,fontWeight:700}}
                                        >
                                          Reject
                                        </button>
                                      </div>
                                      {rejectReasonEditor?.row === idx && !rowLocked && (
                                        <div style={{width:'100%',padding:10,borderRadius:10,background:'#fff',border:'1px solid #fecaca',boxShadow:'0 10px 24px rgba(15,23,42,0.14)'}}>
                                          <div style={{fontSize:11,fontWeight:700,color:'#7f1d1d',marginBottom:6}}>Rejection reason</div>
                                          <textarea
                                            value={rejectReasonEditor.value}
                                            onChange={(e) => setRejectReasonEditor(prev => ({ ...(prev || {}), value: e.target.value, error: '' }))}
                                            placeholder="Enter reason"
                                            style={{width:'100%',minHeight:64,resize:'vertical',padding:'6px 8px',fontSize:12,borderRadius:8,border:'1px solid #e5e7eb',boxSizing:'border-box',fontFamily:'inherit'}}
                                          />
                                          {rejectReasonEditor?.error && (
                                            <div style={{marginTop:6,fontSize:11,color:'#b91c1c',fontWeight:700}}>{rejectReasonEditor.error}</div>
                                          )}
                                          <div style={{display:'flex',justifyContent:'flex-end',gap:6,marginTop:8}}>
                                            <button onClick={() => setRejectReasonEditor(null)} style={{padding:'5px 8px',borderRadius:6,border:'1px solid #d1d5db',background:'#fff',fontSize:11,fontWeight:700,cursor:'pointer'}}>Cancel</button>
                                            <button onClick={() => {
                                              if (!String(rejectReasonEditor?.value || '').trim()) {
                                                setRejectReasonEditor(prev => ({ ...(prev || {}), error: 'Reason is required' }))
                                                return
                                              }
                                              setDexViewMitigationAssignments(prev => ({
                                                ...prev,
                                                [idx]: { ...(prev[idx] || {}), publish: 'Rejected', rejectReason: String(rejectReasonEditor?.value || '').trim() }
                                              }))
                                              setRejectReasonEditor(null)
                                            }} style={{padding:'5px 8px',borderRadius:6,border:'1px solid #b91c1c',background:'#dc2626',color:'#fff',fontSize:11,fontWeight:700,cursor:'pointer'}}>Apply</button>
                                          </div>
                                        </div>
                                      )}
                                      {dexViewMitigationAssignments[idx]?.publish === 'Rejected' && String(dexViewMitigationAssignments[idx]?.rejectReason || '').trim() && (
                                        <div style={{padding:'6px 8px',borderRadius:8,background:'#fef2f2',border:'1px solid #fecaca',color:'#7f1d1d',fontSize:11,lineHeight:1.35}}>
                                          <span style={{fontWeight:800}}>Reason:</span> {dexViewMitigationAssignments[idx]?.rejectReason}
                                        </div>
                                      )}
                                    </div>
                                  </td>
                                  <td style={{padding:12,borderBottom:'1px solid #f1f5f9',verticalAlign:'top'}}>
                                    {(() => {
                                      const status = dexViewMitigationAssignments[idx]?.publish || ''
                                      if (!status) {
                                        return null
                                      }
                                      const tone = status === 'Published'
                                        ? { bg: '#ecfdf5', border: '#bbf7d0', text: '#166534', dot: '#22c55e' }
                                        : { bg: '#fef2f2', border: '#fecaca', text: '#b91c1c', dot: '#ef4444' }
                                      return (
                                        <span style={{display:'inline-flex',alignItems:'center',gap:6,padding:'4px 8px',borderRadius:999,border:`1px solid ${tone.border}`,background:tone.bg,color:tone.text,fontWeight:800,fontSize:11}}>
                                          <span style={{width:8,height:8,borderRadius:999,background:tone.dot}}></span>
                                          {status}
                                        </span>
                                      )
                                    })()}
                                  </td>
                                      </>
                                    )
                                  })()}
                                </tr>
                              ))
                            ) : (
                              <tr><td style={{padding:16}} colSpan={6}>No risks available.</td></tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                    {publishTooltip && (
                      <div
                        style={{
                          position:'fixed',
                          left: publishTooltip.left,
                          top: publishTooltip.top,
                          transform: publishTooltip.placement === 'top' ? 'translateY(-100%)' : 'none',
                          zIndex: 11000,
                          width: 300,
                          padding:'8px 10px',
                          borderRadius:8,
                          background:'#fffbeb',
                          border:'1px solid #fcd34d',
                          color:'#7c2d12',
                          fontSize:11,
                          lineHeight:1.35,
                          boxShadow:'0 10px 24px rgba(15,23,42,0.14)',
                          pointerEvents:'none'
                        }}
                      >
                        Publishing will make the AI-recommended risk mitigation available for this item.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {/* DSAI tab content (KPIs + table) */}
          {activeTab === 'dsai' && (
            <>
              {/* KPIs */}
              <div style={{padding:'12px 20px 10px'}}>
                <div style={{display:'grid',gridTemplateColumns:'repeat(5, minmax(0,1fr))',gap:10}}>
                  <div style={{background:'#fff',border:'1px solid #e6e9f2',borderRadius:12,padding:12,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                    <div style={{display:'flex',flexDirection:'column',gap:4}}>
                      <div style={{fontSize:10,color:'#6a7280',fontWeight:700}}>Total Projects</div>
                      <div style={{fontSize:18,fontWeight:900,color:'#2a2f36'}}>{projectSummaries.filter(p => dsaiOnboardedIds.has(p.project_id) || dsaiOnboardedIds.has(p.project_name)).length}</div>
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
                  <div style={{display:'inline-flex',alignItems:'center',gap:8,padding:'6px 10px',background:'#fff',border:'1px solid #e6e6ef',borderRadius:999,fontSize:12}}>Last 30 Days</div>
                  <div style={{display:'inline-flex',alignItems:'center',gap:8,padding:'6px 10px',background:'#fff',border:'1px solid #e6e6ef',borderRadius:999,fontSize:12}}> <span style={{width:8,height:8,borderRadius:999,background:'#22c55e'}}></span> Last Sync: {lastSync || 'n/a'}</div>
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
                      {projectSummaries.filter(p =>
                        dsaiOnboardedIds.has(p.project_id) || dsaiOnboardedIds.has(p.project_name)
                      ).length === 0 && (
                        <tr><td colSpan={7} style={{padding:'24px 10px',color:'#6a7280'}}>No projects onboarded to DSAI yet.</td></tr>
                      )}
                      {projectSummaries.filter(p =>
                        dsaiOnboardedIds.has(p.project_id) || dsaiOnboardedIds.has(p.project_name)
                      ).map((p) => (
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
                            <button onClick={() => openDexModal(p)} style={{padding:'6px 8px',borderRadius:8,border:'1px solid #e6e6ef',background:'#fff',fontWeight:800,cursor:'pointer'}}>DEX</button>
                          </td>
                        </tr>
                      ))}
                     </tbody>
                   </table>
                 </div>
               </div>

               {/* DEX modal */}
               {dexModalOpen && (
                 <div style={{position:'fixed',inset:0,display:'grid',placeItems:'center',background:'rgba(2,6,23,0.55)',zIndex:10000,padding:20}} role="dialog" aria-modal="true">
                  <div style={{width:1300,maxWidth:'98vw',maxHeight:'92%',overflow:'hidden',background:'#fff',borderRadius:12,padding:0,boxShadow:'0 20px 60px rgba(2,6,23,0.35)',border:'1px solid rgba(15,23,42,0.06)',display:'flex',flexDirection:'column',...modalBaseFont}}>

                    {/* modal header */}
                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'16px 20px',borderBottom:'1px solid #eef1f6'}}>
                      <div style={{display:'flex',alignItems:'center',gap:12}}>
                        <div style={{width:48,height:48,display:'grid',placeItems:'center',borderRadius:10,background:'linear-gradient(135deg,#e0e7ff,#c7d2fe)',color:'#0f172a',fontWeight:800,fontSize:14}}>{(dexModalProject?.project_name||'').charAt(0).toUpperCase()}</div>
                        <div>
                          <div style={{fontSize:15,fontWeight:800,color:'#0f172a'}}>{dexModalProject?.project_name || 'Project'}</div>
                          <div style={{fontSize:12,color:'#6b7280',marginTop:4}}>{dexModalProject?.people?.[0]?.person || 'Project Manager'}</div>
                        </div>
                      </div>

                      <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}}>
                        <button onClick={handleGenerateMitigationsWithGemini} disabled={dexGeneratingMitigations || dexModalReadOnly} aria-label="Generate mitigations with Gemini" style={{display:'inline-flex',alignItems:'center',gap:6,padding:'6px 10px',height:34,lineHeight:1,fontSize:13,borderRadius:8,background:dexGeneratingMitigations ? '#dbeafe' : '#10b981',border:dexGeneratingMitigations ? '1px solid #bfdbfe' : '1px solid #059669',color:'#fff',fontWeight:700,cursor:dexGeneratingMitigations ? 'wait' : 'pointer',opacity:dexModalReadOnly ? 0.6 : 1}}>
                          <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{flex:'0 0 auto'}}>
                            <path d="M12 2v6m0 0l-3-3m3 3l3-3M4 7v10m0 0v2c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-2m0 0V9c0-1.1-.9-2-2-2H6c-1.1 0-2 .9-2 2v8" />
                          </svg>
                          <span style={{display:'inline-block',transform:'translateY(-1px)'}}>{dexGeneratingMitigations ? 'Generating...' : 'Generate Mitigations'}</span>
                        </button>
                        <button onClick={() => { console.log('Export DEX', dexModalProject?.project_id); }} aria-label="Export DEX report" style={{display:'inline-flex',alignItems:'center',gap:8,padding:'6px 10px',height:34,lineHeight:1,fontSize:13,borderRadius:8,background:'#2563eb',border:'1px solid #1e40af',color:'#fff',fontWeight:700,cursor:'pointer'}}>
                          <svg viewBox="0 0 24 24" width="12" height="12" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{flex:'0 0 auto'}}>
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <path d="M7 10l5 5 5-5" />
                            <path d="M12 15V3" />
                          </svg>
                          <span style={{display:'inline-block',transform:'translateY(-1px)'}}>Export</span>
                        </button>
                        <button onClick={saveDexModalAssignments} aria-label="Save DEX actions" style={{display:'inline-flex',alignItems:'center',padding:'6px 10px',height:34,lineHeight:1,fontSize:13,borderRadius:8,background:'#059669',border:'1px solid #047857',color:'#fff',fontWeight:700,cursor:'pointer'}}>
                          Save
                        </button>
                        <button onClick={() => setDexModalReadOnly(false)} aria-label="Edit DEX actions" style={{display:'inline-flex',alignItems:'center',padding:'6px 10px',height:34,lineHeight:1,fontSize:13,borderRadius:8,background:'#f59e0b',border:'1px solid #d97706',color:'#fff',fontWeight:700,cursor:'pointer'}}>
                          Edit
                        </button>
                        {dexSaveMessage && <div style={{fontSize:12,color:dexSaveMessage === 'Saved' ? '#065f46' : '#b91c1c',fontWeight:700}}>{dexSaveMessage}</div>}
                        {dexMitigationGenError && <div style={{fontSize:12,color:dexMitigationGenError.includes('✓') ? '#059669' : '#b91c1c',fontWeight:700}}>{dexMitigationGenError}</div>}
                        <button onClick={closeDexModal} style={{padding:'6px 10px',height:34,lineHeight:1,fontSize:13,borderRadius:8,background:'#111827',border:0,color:'#fff',fontWeight:700,cursor:'pointer'}}>Close</button>
                       </div>
                    </div>

                    {/* modal body */}
                    <div style={{padding:16,overflow:'auto'}}>
                      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
                        <div style={{fontWeight:700,color:'#374151',fontSize:13}}>AI Risk Score: (AI) Red</div>
                        <div style={{fontSize:12,color:'#6b7280'}}>Last analyzed: {dexModalProject?.last_tx || 'n/a'}</div>
                      </div>

                      <div style={{marginBottom:12,color:'#475569',fontSize:13}}>
                        Explanation: (AI) Summary — the risks captured from the report are shown below. Use the actions to export or close.
                      </div>

                      <div style={{border:'1px solid #e6e9f2',borderRadius:8,overflow:'hidden',background:'#fff'}}>
                        <table style={{width:'100%',borderCollapse:'collapse',fontSize:13,tableLayout:'fixed'}}>
                          <colgroup>
                            <col style={{width:'20'}} />
                            <col style={{width:'15%'}} />
                            <col style={{width:'46%'}} />
                            <col style={{width:'25%'}} />
                            <col style={{width:'12%'}} />
                            <col style={{width:'10%'}} />
                          </colgroup>
                          <thead style={{background:'#f8fafc'}}>
                            <tr style={{textAlign:'left'}}>
                              <th style={{padding:12,borderBottom:'1px solid #eef1f6',fontWeight:700,color:'#374151',width:'30%'}}>Risk</th>
                              <th style={{padding:12,borderBottom:'1px solid #eef1f6',fontWeight:700,color:'#374151',width:'14%'}}>Risk level</th>
                              <th style={{padding:12,borderBottom:'1px solid #eef1f6',fontWeight:700,color:'#374151'}}>Suggested Mitigation</th>
                              <th style={{padding:12,borderBottom:'1px solid #eef1f6',fontWeight:700,color:'#374151',width:'12%'}}>Actions Taken <span style={{color:'#dc2626'}}>*</span></th>
                              <th style={{padding:12,borderBottom:'1px solid #eef1f6',fontWeight:700,color:'#374151',width:'10%'}}>Due Date <span style={{color:'#dc2626'}}>*</span></th>
                              <th style={{padding:12,borderBottom:'1px solid #eef1f6',fontWeight:700,color:'#374151',width:'18%'}}>Status <span style={{color:'#dc2626'}}>*</span></th>
                            </tr>
                          </thead>
                          <tbody>
                            {dexModalProject?.key_risks && dexModalProject.key_risks.length > 0 ? (
                              dexModalProject.key_risks.map((rk, idx) => (
                                <tr key={idx} style={{background: idx % 2 === 0 ? '#fff' : '#fbfdff'}}>
                                  <td style={{padding:12,borderBottom:'1px solid #f1f5f9',verticalAlign:'top',color:'#111827',wordBreak:'break-word'}}>{rk}</td>
                                  <td style={{padding:12,borderBottom:'1px solid #f1f5f9',verticalAlign:'top',width:'14%'}}>
                                    {(() => {
                                      const level = aiMitigations[idx]?.riskLevel || 'High'
                                      const bgColor = level === 'High' ? '#fff7ed' : level === 'Low' ? '#ecfdf5' : '#fef3c7'
                                      const textColor = level === 'High' ? '#b91c1c' : level === 'Low' ? '#166534' : '#b45309'
                                      return <span style={{display:'inline-block',padding:'5px 6px',borderRadius:6,background:bgColor,color:textColor,fontWeight:700,fontSize:12}}>{level}</span>
                                    })()}
                                  </td>

                                  {/* Suggested mitigation - AI generated */}
                                  <td style={{padding:12,borderBottom:'1px solid #f1f5f9',verticalAlign:'top',color:'#334155',wordBreak:'break-word'}}>
                                    <div style={{fontSize:13, lineHeight:1.4}}>
                                      {aiMitigations[idx]?.mitigation || generateMitigationForRisk(rk)}
                                    </div>
                                  </td>

                                  {/* Actions Taken */}
                                  <td style={{padding:12,borderBottom:'1px solid #f1f5f9',verticalAlign:'top'}}>
                                    <textarea placeholder="Enter action" readOnly={dexModalReadOnly} value={mitigationAssignments[idx]?.actionsTaken || ''} onChange={(e) => {
                                      const value = e.target.value
                                      setMitigationAssignments(prev => ({ ...prev, [idx]: { ...(prev[idx] || {}), actionsTaken: value } }))
                                      setDexValidationErrors(prev => ({ ...prev, [idx]: { ...(prev[idx] || {}), actionsTaken: '' } }))
                                    }} style={{width:'100%',minHeight:'80px',padding:'8px 10px',borderRadius:6,border:dexValidationErrors[idx]?.actionsTaken ? '1px solid #ef4444' : '1px solid #e6eef6',fontSize:12,boxSizing:'border-box',fontFamily:'inherit',resize:'vertical',background:dexModalReadOnly ? '#f8fafc' : '#fff'}} />
                                    {dexValidationErrors[idx]?.actionsTaken && <div style={{marginTop:6,color:'#dc2626',fontSize:11,fontWeight:700}}>{dexValidationErrors[idx]?.actionsTaken}</div>}
                                  </td>

                                  {/* Due Date */}
                                  <td style={{padding:12,borderBottom:'1px solid #f1f5f9',verticalAlign:'top'}}>
                                    <input
                                      type="date"
                                      value={mitigationAssignments[idx]?.dueDate || ''}
                                      disabled={dexModalReadOnly}
                                      onChange={(e) => {
                                        const value = e.target.value
                                        setMitigationAssignments(prev => ({
                                          ...prev,
                                          [idx]: {
                                            ...(prev[idx] || {}),
                                            dueDate: value
                                          }
                                        }))
                                        setDexValidationErrors(prev => ({ ...prev, [idx]: { ...(prev[idx] || {}), dueDate: '' } }))
                                      }}
                                      style={{
                                        width:'140px',
                                        maxWidth:'100%',
                                        padding:'4px 6px',
                                        borderRadius:6,
                                        border:dexValidationErrors[idx]?.dueDate ? '1px solid #ef4444' : '1px solid #e6eef6',
                                        fontSize:11,
                                        background:dexModalReadOnly ? '#f8fafc' : '#fff'
                                      }}
                                    />
                                    {dexValidationErrors[idx]?.dueDate && <div style={{marginTop:6,color:'#dc2626',fontSize:11,fontWeight:700}}>{dexValidationErrors[idx]?.dueDate}</div>}
                                  </td>

                                  <td style={{padding:12,borderBottom:'1px solid #f1f5f9',verticalAlign:'top',width:'18%'}}>
                                    <select
                                      value={mitigationAssignments[idx]?.workflowStatus || 'Open'}
                                      disabled={dexModalReadOnly}
                                      onChange={(e) => {
                                        const value = e.target.value
                                        setMitigationAssignments(prev => ({
                                          ...prev,
                                          [idx]: {
                                            ...(prev[idx] || {}),
                                            workflowStatus: value
                                          }
                                        }))
                                        setDexValidationErrors(prev => ({ ...prev, [idx]: { ...(prev[idx] || {}), workflowStatus: '' } }))
                                      }}
                                      style={{
                                        width:'100%',
                                        minWidth:130,
                                        padding:'6px 8px',
                                        borderRadius:6,
                                        border:dexValidationErrors[idx]?.workflowStatus ? '1px solid #ef4444' : '1px solid #e6eef6',
                                        fontSize:13,
                                        background:dexModalReadOnly ? '#f8fafc' : '#fff'
                                      }}
                                    >
                                      <option value="Open">Open</option>
                                      <option value="In Progress">In Progress</option>
                                      <option value="Closed">Closed</option>
                                    </select>
                                    {dexValidationErrors[idx]?.workflowStatus && <div style={{marginTop:6,color:'#dc2626',fontSize:11,fontWeight:700}}>{dexValidationErrors[idx]?.workflowStatus}</div>}
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr><td style={{padding:16}} colSpan={6}>No risks available.</td></tr>
                            )}
                          </tbody>
                        </table>
                      </div>

                    </div>

                  </div>
                </div>
              )}

              

            </>
          )}

          {/* Upload tab content */}
          {activeTab === 'upload' && (
            <div style={{padding:12}}>
              <div style={{display:'flex',alignItems:'center',gap:12}}>
                <input id="reportUpload" type="file" accept=".csv,.json,.ndjson,.xlsb" ref={uploadRef} onChange={handleFileUpload} style={{display:'none'}} />
                <button id="btnUploadReport" onClick={onUploadClick} style={{padding:'8px 12px',borderRadius:8,background:'#fff',border:'1px solid #e6e6ef',cursor:'pointer',fontWeight:800}}>Upload report</button>
                <div style={{fontSize:12,color:'#6b7280'}}>Accepted: .xlsb only</div>
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
            <div style={{padding:12,background:'#fff4',marginTop:12,borderRadius:8,border:'1px dashed #e6e6ef'}}>
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
