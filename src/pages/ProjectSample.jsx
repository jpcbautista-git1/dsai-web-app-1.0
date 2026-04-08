import React, { useState } from 'react'

export default function ProjectSample(){
  const [activeTab, setActiveTab] = useState('basic')
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <main style={{padding:20}}>
      <div style={{maxWidth:1200,margin:'0 auto'}}>

        {/* Breadcrumbs / header */}
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:12,marginBottom:14}}>
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            <div style={{fontSize:14,fontWeight:800,color:'#374151'}}>Project Details</div>
            <div style={{display:'inline-flex',alignItems:'center',gap:8,padding:'6px 8px',borderRadius:999,background:'#f9fafb',border:'1px solid #e5e7eb',fontSize:12,color:'#111827'}}>Project Sample</div>
          </div>
          <div style={{display:'flex',gap:8,alignItems:'center'}}>
            <button style={{padding:'8px 12px',borderRadius:8,border:'1px solid #e5e7eb',background:'#fff',cursor:'pointer'}}>Edit</button>
            <button id="btnOnboard" onClick={()=>setModalOpen(true)} style={{padding:'8px 12px',borderRadius:8,background:'#ffd200',border:'none',fontWeight:800,cursor:'pointer'}}>Open DSAI</button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{background:'#fff',border:'1px solid #e7e9ee',borderRadius:10,boxShadow:'0 6px 16px rgba(16,24,40,.06)',overflow:'hidden'}}>
          <div style={{display:'flex',gap:8,padding:10,borderBottom:'1px solid #e7e9ee'}} role="tablist" aria-label="Project tabs">
            <button onClick={()=>setActiveTab('basic')} aria-selected={activeTab==='basic'} style={{padding:'8px 12px',borderRadius:8,border:'none',background: activeTab==='basic' ? '#eef2ff' : '#fafafa',color: activeTab==='basic' ? '#4338ca' : '#374151',cursor:'pointer'}}>Basic</button>
            <button id="tab-dsai" onClick={()=>setActiveTab('dsai')} aria-selected={activeTab==='dsai'} style={{padding:'8px 12px',borderRadius:8,border:'none',background: activeTab==='dsai' ? '#6a0dad' : '#fafafa',color: activeTab==='dsai' ? '#fff' : '#374151',cursor:'pointer'}}>DSAI</button>
            <button onClick={()=>setActiveTab('activity')} aria-selected={activeTab==='activity'} style={{padding:'8px 12px',borderRadius:8,border:'none',background: activeTab==='activity' ? '#eef2ff' : '#fafafa',color: activeTab==='activity' ? '#4338ca' : '#374151',cursor:'pointer'}}>Activity</button>
          </div>

          <div style={{padding:20}} className="panel">
            {activeTab==='basic' && (
              <div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(3,minmax(260px,1fr))',gap:12}} className="form-grid">
                  <div className="field">
                    <label style={{fontSize:12,fontWeight:600,color:'#374151'}}>Project Name</label>
                    <input type="text" defaultValue="Website Redesign" style={{padding:10,borderRadius:8,border:'1px solid #e7e9ee'}} />
                  </div>

                  <div className="field">
                    <label style={{fontSize:12,fontWeight:600,color:'#374151'}}>Project Manager</label>
                    <input type="text" defaultValue="Chou, Adrich" style={{padding:10,borderRadius:8,border:'1px solid #e7e9ee'}} />
                  </div>

                  <div className="field">
                    <label style={{fontSize:12,fontWeight:600,color:'#374151'}}>Competency</label>
                    <input type="text" defaultValue="Data Engineering" style={{padding:10,borderRadius:8,border:'1px solid #e7e9ee'}} />
                  </div>
                </div>

                <div style={{display:'grid',gridTemplateColumns:'1fr 320px',gap:12,marginTop:18}}>
                  <div>
                    <h4 style={{margin:'0 0 8px',fontSize:13,fontWeight:800}}>Overview</h4>
                    <p style={{color:'#6b7280',marginTop:0}}>This project tracks delivery excellence parameters and provides KPIs for stakeholders. The data below is static for the sample.</p>

                    <ul style={{listStyle:'none',padding:0,marginTop:12,borderTop:'1px dashed #e5e7eb',display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                      <li style={{fontSize:12,color:'#4b5563',display:'flex',justifyContent:'space-between'}}><span>Integrated Review Score</span><strong>--</strong></li>
                      <li style={{fontSize:12,color:'#4b5563',display:'flex',justifyContent:'space-between'}}><span>VOC</span><strong>NA</strong></li>
                      <li style={{fontSize:12,color:'#4b5563',display:'flex',justifyContent:'space-between'}}><span>Schedule Variance</span><strong>0</strong></li>
                    </ul>
                  </div>

                  <aside style={{background:'#fff',border:'1px solid #e7e9ee',borderRadius:10,padding:12,boxShadow:'0 6px 16px rgba(16,24,40,.06)'}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:8}}>
                      <div style={{fontSize:13,fontWeight:800}}>Summary</div>
                      <div style={{fontSize:12,color:'#6b7280'}}>Status: <strong style={{color:'#22c55e'}}>Active</strong></div>
                    </div>

                    <table style={{width:'100%',marginTop:10,borderCollapse:'collapse'}}>
                      <tbody>
                        <tr><td style={{padding:'6px 0',color:'#6b7280'}}>Start</td><td style={{padding:'6px 0',textAlign:'right'}}>2026-04-01</td></tr>
                        <tr><td style={{padding:'6px 0',color:'#6b7280'}}>Owner</td><td style={{padding:'6px 0',textAlign:'right'}}>Team 1</td></tr>
                        <tr><td style={{padding:'6px 0',color:'#6b7280'}}>Budget</td><td style={{padding:'6px 0',textAlign:'right'}}>$42k</td></tr>
                      </tbody>
                    </table>
                  </aside>
                </div>

              </div>
            )}

            {activeTab==='dsai' && (
              <div>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:12}}>
                  <div>
                    <h3 style={{margin:'0 0 6px',fontSize:16}}>DSAI</h3>
                    <div style={{color:'#6b7280',fontSize:13}}>Generate delivery insights, run assessments and onboard this project into DSAI.</div>
                  </div>
                  <div style={{display:'flex',gap:8}}>
                    <button onClick={()=>setModalOpen(true)} style={{padding:'8px 12px',borderRadius:8,background:'#6a0dad',color:'#fff',border:'none',cursor:'pointer'}}>Open DSAI Modal</button>
                  </div>
                </div>

                <div style={{marginTop:12,display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                  <div style={{background:'#fff',border:'1px solid #e7e9ee',borderRadius:10,padding:12}}>DSAI content placeholder.</div>
                  <div style={{background:'#fff',border:'1px solid #e7e9ee',borderRadius:10,padding:12}}>DSAI summary placeholder.</div>
                </div>
              </div>
            )}

            {activeTab==='activity' && (
              <div>
                <h3 style={{marginTop:0}}>Activity</h3>
                <p style={{color:'#6b7280'}}>Recent events and comments will appear here.</p>
              </div>
            )}

          </div>
        </div>

        {/* DSAI Modal */}
        {modalOpen && (
          <div role="dialog" aria-modal="true" aria-labelledby="dsaiTitle" style={{position:'fixed',inset:0,display:'flex',alignItems:'flex-start',justifyContent:'center',padding:40,background:'rgba(17,24,39,.55)',zIndex:9999}}>
            <div style={{width:'min(820px, calc(100vw - 32px))',maxHeight:'85vh',overflow:'auto',background:'#fff',borderRadius:12,boxShadow:'0 8px 20px rgba(0,0,0,.3)',padding:24}}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:12}}>
                <h2 id="dsaiTitle" style={{margin:0}}>DSAI — Onboard Project</h2>
                <button onClick={()=>setModalOpen(false)} style={{background:'none',border:'none',fontSize:20,cursor:'pointer'}}>✕</button>
              </div>

              <div style={{marginTop:12}}>
                <p style={{color:'#6b7280'}}>This modal mirrors the DSAI onboarding modal in the original HTML. Complex interactions (calendar, phases, persistence) are placeholders for a later conversion to React.</p>

                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginTop:12}}>
                  <div>
                    <label style={{fontSize:12,fontWeight:600,color:'#374151'}}>Project Name</label>
                    <input type="text" defaultValue="Website Redesign" style={{padding:10,borderRadius:8,border:'1px solid #e7e9ee',width:'100%'}} />
                  </div>
                  <div>
                    <label style={{fontSize:12,fontWeight:600,color:'#374151'}}>Start Date</label>
                    <input type="date" defaultValue="2026-04-01" style={{padding:10,borderRadius:8,border:'1px solid #e7e9ee',width:'100%'}} />
                  </div>
                </div>

                <div style={{display:'flex',justifyContent:'flex-end',gap:8,marginTop:16}}>
                  <button onClick={()=>setModalOpen(false)} style={{padding:'8px 12px',borderRadius:8,border:'1px solid #e7e9ee',background:'#fff',cursor:'pointer'}}>Cancel</button>
                  <button style={{padding:'8px 12px',borderRadius:8,background:'#ffd200',border:'none',fontWeight:800,cursor:'pointer'}}>Save</button>
                </div>

              </div>
            </div>
          </div>
        )}

      </div>
    </main>
  )
}
