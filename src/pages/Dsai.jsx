import React, { useRef } from 'react'

export default function Dsai(){
  const uploadRef = useRef(null)
  const onUploadClick = () => uploadRef.current?.click()
  const handleFileUpload = (e) => {
    const f = e.target.files?.[0]
    if (!f) return
    const reader = new FileReader()
    reader.onload = () => {
      // For now just log the content; later parse and POST to backend or update UI state
      try { console.log('Uploaded report:', f.name); console.log(reader.result) } catch(e){}
    }
    reader.readAsText(f)
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

  return (
    <main style={{padding:24}}>
      <div style={{display:'block',paddingTop:18,position:'relative'}}>
        <div style={{...panel,boxSizing:'border-box'}}>

          <div style={{padding:18,borderBottom:'1px solid #e3e6ef',display:'flex',alignItems:'flex-start',justifyContent:'space-between'}}>
            <div>
              <h1 style={{margin:0,fontSize:20,fontWeight:800,color:'#2a2f36'}}>Delivery Stability AI</h1>
              <div style={{marginTop:6,color:'#6a7280',fontSize:13}}>AI-powered project risk intelligence and delivery monitoring</div>
            </div>

            <div style={{display:'flex',gap:10,alignItems:'center'}}>
              {/* hidden file input used by the Upload button */}
              <input id="reportUpload" type="file" accept=".csv,.json,.ndjson" ref={uploadRef} onChange={handleFileUpload} style={{display:'none'}} />

              {/* Upload report button (left of Sync All) - updated label and icon */}
              <button id="btnUploadReport" onClick={onUploadClick} style={{display:'inline-flex',alignItems:'center',gap:8,padding:'7px 10px',fontSize:12,fontWeight:700,background:'#fff',borderRadius:10,border:'1px solid #e3e6ef',cursor:'pointer'}}> 
                <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3v9" />
                  <path d="M8 7l4-4 4 4" />
                  <rect x="3" y="13" width="18" height="8" rx="2" />
                </svg>
                Upload report
              </button>

              <button style={{display:'inline-flex',alignItems:'center',gap:8,padding:'7px 10px',fontSize:12,fontWeight:700,background:'#fff',borderRadius:10,border:'1px solid #e3e6ef',cursor:'pointer'}}> 
                <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M12 4a8 8 0 0 0-7.75 6H2l3 3 3-3H6.32A6 6 0 1 1 12 18c-1.66 0-3.18-.67-4.27-1.76l-1.42 1.42A7.96 7.96 0 0 0 12 20a8 8 0 0 0 0-16zm1 4h-2v6l5 3 1-1.73-4-2.27V8z"/></svg>
                Sync All
              </button>

              <button style={{width:34,height:34,display:'grid',placeItems:'center',background:'#fff',border:'1px solid #e3e6ef',borderRadius:10,cursor:'pointer'}} aria-label="Settings">
                <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false" fill="currentColor">
                  <path d="M19.14 12.94a7.07 7.07 0 000-1.88l2.03-1.58a.5.5 0 00.12-.64l-1.92-3.32a.5.5 0 00-.6-.22l-2.39.96a7.02 7.02 0 00-1.61-.93l-.36-2.54A.5.5 0 0013.7 2h-3.4a.5.5 0 00-.5.42l-.36 2.54a7.02 7.02 0 00-1.61.93l-2.39-.96a.5.5 0 00-.6.22L2.71 8.84a.5.5 0 00.12.64l2.03 1.58a7.07 7.07 0 000 1.88L2.83 14.5a.5.5 0 00-.12.64l1.92 3.32c.13.23.39.34.6.22l2.39-.96c.5.38 1.04.7 1.61.93l.36 2.54c.05.27.27.47.5.47h3.4c.27 0 .45-.2.5-.47l.36-2.54c.57-.23 1.11-.55 1.61-.93l2.39.96c.22.12.48.01.6-.22l1.92-3.32a.5.5 0 00-.12-.64l-2.03-1.56zM12 15.5A3.5 3.5 0 1115.5 12 3.5 3.5 0 0112 15.5z" />
                </svg>
              </button>
            </div>
          </div>

          {/* KPIs */}
          <div style={{padding:'12px 20px 10px'}}>
            <div style={{display:'grid',gridTemplateColumns:'repeat(5, minmax(0,1fr))',gap:10}}>
              <div style={{background:'#fff',border:'1px solid #e6e9f2',borderRadius:12,padding:12,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                <div style={{display:'flex',flexDirection:'column',gap:4}}>
                  <div style={{fontSize:10,color:'#6a7280',fontWeight:700}}>Total Projects</div>
                  <div style={{fontSize:18,fontWeight:900,color:'#2a2f36'}}>42</div>
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

            {/* toolbar: tabs + search */}
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:12,padding:'8px 0 0'}}>
              <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                <button style={{padding:'7px 10px',borderRadius:10,background:'#f5f6fb',border:'1px solid #e3e6ef',fontWeight:800}}>All Projects</button>
                <button style={{padding:'7px 10px',borderRadius:10,background:'#fff',border:'1px solid #e3e6ef',fontWeight:800}}> <span style={{display:'inline-block',width:8,height:8,borderRadius:999,background:'#ef4444',marginRight:8}}></span>At Risk</button>
                <button style={{padding:'7px 10px',borderRadius:10,background:'#fff',border:'1px solid #e3e6ef',fontWeight:800}}> <span style={{display:'inline-block',width:8,height:8,borderRadius:999,background:'#f97316',marginRight:8}}></span>Sync Issue</button>
                <button style={{padding:'7px 10px',borderRadius:10,background:'#fff',border:'1px solid #e3e6ef',fontWeight:800}}> <span style={{display:'inline-block',width:8,height:8,borderRadius:999,background:'#eab308',marginRight:8}}></span>Needs Review</button>
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
                <div style={{display:'inline-flex',alignItems:'center',gap:8,padding:'6px 10px',background:'#fff',border:'1px solid #e3e6ef',borderRadius:999}}>Last 30 Days</div>
                <div style={{display:'inline-flex',alignItems:'center',gap:8,padding:'6px 10px',background:'#fff',border:'1px solid #e3e6ef',borderRadius:999}}> <span style={{width:8,height:8,borderRadius:999,background:'#22c55e'}}></span> Last Sync: Apr 7, 9:30 AM</div>
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
                      <th style={{padding:'12px 10px'}}>Sync</th>
                      <th style={{padding:'12px 10px'}}>Key Risks</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{padding:'12px 10px'}}>
                        <div style={{display:'flex',alignItems:'center',gap:10}}>
                          <div style={{width:36,height:36,borderRadius:999,display:'grid',placeItems:'center',background:'linear-gradient(135deg,#c7d2fe,#93c5fd)',border:'1px solid rgba(0,0,0,.06)',color:'#1f2937',fontWeight:900}}>G</div>
                          <div>
                            <div style={{fontWeight:900}}>Globe ITSM</div>
                            <div style={{fontSize:12,color:'#6a7280',marginTop:4}}>Service Management</div>
                          </div>
                        </div>
                      </td>
                      <td style={{padding:'12px 10px',verticalAlign:'top'}}>Mark / Carlo</td>
                      <td style={{padding:'12px 10px',verticalAlign:'top'}}><span style={{display:'inline-flex',alignItems:'center',padding:'6px 10px',borderRadius:999,background:'#fff7ed',color:'#c2410c',fontWeight:900}}>Amber</span></td>
                      <td style={{padding:'12px 10px',verticalAlign:'top'}}><span style={{display:'inline-flex',alignItems:'center',padding:'6px 10px',borderRadius:999,background:'#fff1f1',color:'#b91c1c',fontWeight:900}}>High</span></td>
                      <td style={{padding:'12px 10px',verticalAlign:'top'}}><span style={{display:'inline-flex',alignItems:'center',padding:'6px 10px',borderRadius:999,background:'#ecfdf5',color:'#15803d',fontWeight:900}}>Synced</span></td>
                      <td style={{padding:'12px 10px',verticalAlign:'top',color:'#6a7280'}}>2h ago</td>
                      <td style={{padding:'12px 10px',verticalAlign:'top',color:'#2a2f36'}}>
                        <ul style={{margin:0,paddingLeft:16}}>
                          <li>Delayed staffing near phase start</li>
                          <li>Recent change variance detected</li>
                        </ul>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div style={{height:220,marginTop:12,background:'linear-gradient(180deg, rgba(11,18,40,.06), rgba(11,18,40,.00))'}} aria-hidden="true" />

          </div>

        </div>
      </div>
    </main>
  )
}
