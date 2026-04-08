import React from 'react'

export default function Projects({onOpen}){
  return (
    <main style={{padding:20}}>
      <div style={{maxWidth:1200,margin:'0 auto'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:12,marginBottom:14}}>
          <div style={{fontSize:14,fontWeight:800,color:'#374151'}}>PROJECTS</div>
          <div style={{display:'flex',gap:8,alignItems:'center'}} role="tablist" aria-label="Project status filters">
            <button className="pill" data-filter="active" style={{display:'inline-flex',alignItems:'center',gap:8,padding:'8px 10px',borderRadius:999,background:'#fff',border:'1px solid #e5e7eb',fontSize:12}}>Active <span className="count" style={{marginLeft:6,background:'#22c55e',color:'#fff',padding:'0 6px',borderRadius:999,fontWeight:800}}>3</span></button>
            <button className="pill" data-filter="draft" style={{display:'inline-flex',alignItems:'center',gap:8,padding:'8px 10px',borderRadius:999,background:'#fff',border:'1px solid #e5e7eb',fontSize:12}}>Draft</button>
          </div>
        </div>

        <section className="grid" style={{display:'grid',gridTemplateColumns:'repeat(4,minmax(240px,1fr))',gap:14}} id="projectGrid">
          {[1,2,3,4,5,6].map(i=> (
            <a key={i} className={`tile status-active`} data-status="active" href="#" onClick={(e)=>{e.preventDefault(); onOpen('sample')}} style={{display:'block',textDecoration:'none',color:'inherit',background:'#fff',border:'1px solid #e5e7eb',borderRadius:10,padding:12}}>
              <div className="status-bar" style={{height:4,width:'100%',borderRadius:'10px 10px 0 0',background:'#22c55e'}} />
              <h3 style={{fontSize:14,lineHeight:1.3,margin:'6px 0 4px',fontWeight:800,color:'#111827'}}>Project {i}</h3>
              <div className="meta" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'6px 10px'}}>
                <div className="item"><span className="label" style={{color:'#6b7280',minWidth:84}}>Owner</span><span>Team {i}</span></div>
                <div className="item"><span className="label" style={{color:'#6b7280',minWidth:84}}>Start</span><span>2026-04-01</span></div>
              </div>
              <ul className="kpis" style={{marginTop:8,paddingTop:8,listStyle:'none',borderTop:'1px dashed #e5e7eb',display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,margin:0}}>
                <li style={{fontSize:11,color:'#4b5563',display:'flex',justifyContent:'space-between'}}><span>Budget</span><strong>$42k</strong></li>
                <li style={{fontSize:11,color:'#4b5563',display:'flex',justifyContent:'space-between'}}><span>Health</span><strong>OK</strong></li>
              </ul>
            </a>
          ))}
        </section>
      </div>
    </main>
  )
}
