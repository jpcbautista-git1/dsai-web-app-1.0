import React, { useState } from 'react'

export default function ProjectSample(){
  const [activeTab, setActiveTab] = useState('basic')
  const [modalOpen, setModalOpen] = useState(false)

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
            <button id="tab-dsai" onClick={()=>setActiveTab('dsai')} aria-selected={activeTab==='dsai'} style={{padding:'8px 12px',borderRadius:8,border:'none',background: activeTab==='dsai' ? '#550a8a' : '#6a0dad',color:'#fff',cursor:'pointer'}}>Onboard to DSAI</button>

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
            <section id="panel-dsai" className="panel" role="tabpanel" aria-labelledby="tab-dsai" style={{padding:20}}>
              <div id="dsaiIntro" style={{display:'grid',gap:12}}>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                  <div>
                    <h3 style={{margin:0}}>DSAI Onboarding</h3>
                    <div style={{color:'#6b7280',fontSize:13}}>Run the DSAI onboarding to generate phases, resources and a project Gantt.</div>
                  </div>
                  <div>
                    <span id="dsaiStatus" className="status-toggle" style={{display:'none'}}><span className="dot" /> Onboarded</span>
                  </div>
                </div>

                <div style={{display:'flex',justifyContent:'flex-end'}}>
                  <button id="btnOnboard" onClick={()=>setModalOpen(true)} style={{padding:'10px 14px',borderRadius:8,background:'#6a0dad',border:'none',color:'#fff',fontWeight:700,cursor:'pointer'}}>Onboard to DSAI</button>
                </div>
              </div>

              <div id="dsaiSummary" style={{display:'none',marginTop:12}}>
                {/* summary content and gantt mount will be injected by legacy JS */}
                <div id="ganttMount" />
              </div>

              <div style={{display:'flex',justifyContent:'flex-end',gap:8,marginTop:12}}>
                <button id="btnClearDsai" style={{padding:'8px 12px',borderRadius:8,border:'1px solid #e7e9ee',background:'#fff',cursor:'pointer'}}>Clear DSAI</button>
                <button id="btnSaveDsai" style={{padding:'8px 12px',borderRadius:8,background:'#ffd200',border:'none',fontWeight:800,cursor:'pointer'}}>Save DSAI</button>
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
                <p style={{color:'#6b7280'}}>This modal mirrors the DSAI onboarding modal in the original HTML. Complex interactions (calendar, phases, persistence) are placeholders for a later React conversion.</p>

                {/* Phases section (matching ids expected by legacy JS) */}
                <section>
                  <h3>Phases</h3>
                  <div className="section-actions top"><button className="btn btn-primary" id="btnAddPhaseTop" style={{background:'#6a0dad', color:'white'}}>+ Add Phase</button></div>
                  <div id="phaseContainer"></div>
                  <div className="section-actions bottom" id="phaseBottomActions" style={{display:'none'}}><button className="btn btn-primary" id="btnAddPhaseBottom" style={{background:'#6a0dad', color:'white'}}>+ Add Phase</button></div>
                </section>

                <hr />

                {/* Resources section (matching ids expected by legacy JS) */}
                <section>
                  <h3>Resources</h3>
                  <div className="section-actions top"><button className="btn btn-primary" id="btnAddResourceTop" style={{background:'#6a0dad', color:'white'}}>+ Add Resource</button></div>
                  <div id="resourceContainer"></div>
                  <div className="section-actions bottom" id="resourceBottomActions" style={{display:'none'}}><button className="btn btn-primary" id="btnAddResourceBottom" style={{background:'#6a0dad', color:'white'}}>+ Add Resource</button></div>
                </section>

                <div style={{display:'flex',justifyContent:'flex-end',gap:8,marginTop:16}}>
                  <button onClick={()=>setModalOpen(false)} style={{padding:'8px 12px',borderRadius:8,border:'1px solid #e7e9ee',background:'#fff',cursor:'pointer'}}>Cancel</button>
                  <button onClick={()=>{ setModalOpen(false); }} id="submitDsai" style={{padding:'8px 12px',borderRadius:8,background:'#ffd200',border:'none',fontWeight:800,cursor:'pointer'}}>Save</button>
                </div>

              </div>
            </div>
          </div>
        )}

      </div>
    </main>
  )
}
