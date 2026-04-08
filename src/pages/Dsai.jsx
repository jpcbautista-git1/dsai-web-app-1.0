import React from 'react'

export default function Dsai(){
  return (
    <main style={{padding:24}}>
      <div style={{display:'flex',justifyContent:'center',paddingTop:18,position:'relative'}}>
        <div style={{width:'min(1040px,100%)',minHeight:520,borderRadius:16,overflow:'hidden',background:'linear-gradient(180deg,#f5f6fb 0%,#eef0f7 100%)',boxShadow:'0 28px 70px rgba(0,0,0,.55)',border:'1px solid rgba(255,255,255,.10)'}}>
          <div style={{padding:18,borderBottom:'1px solid #e3e6ef',display:'flex',alignItems:'flex-start',justifyContent:'space-between'}}>
            <div>
              <h3 style={{margin:0,fontSize:18,fontWeight:800,color:'#2a2f36'}}>DSAI Dashboard</h3>
              <div style={{marginTop:6,color:'#6a7280',fontSize:12}}>Overview & operational health</div>
            </div>
            <div style={{display:'flex',gap:10,alignItems:'center'}}>
              <button style={{padding:'7px 10px',fontSize:12,fontWeight:700,background:'#fff',borderRadius:10,border:'1px solid #e3e6ef'}}>Sync</button>
              <div style={{width:34,height:34,display:'grid',placeItems:'center',background:'#fff',border:'1px solid #e3e6ef',borderRadius:10}} />
            </div>
          </div>

          <div style={{padding:12}}>
            <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:10}}>
              {Array.from({length:5}).map((_,i)=> (
                <div key={i} style={{background:'#fff',border:'1px solid #e6e9f2',borderRadius:12,padding:10,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                  <div style={{display:'flex',flexDirection:'column',gap:4}}>
                    <div style={{fontSize:10,color:'#6a7280',fontWeight:700}}>KPI {i+1}</div>
                    <div style={{fontSize:18,fontWeight:900,color:'#2a2f36'}}>42</div>
                  </div>
                  <div style={{width:28,height:28,borderRadius:10,display:'grid',placeItems:'center',border:'1px solid rgba(0,0,0,.06)'}} />
                </div>
              ))}
            </div>

            <div style={{marginTop:12,padding:8,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div style={{display:'flex',gap:8}}>
                <div style={{padding:'7px 10px',borderRadius:10,background:'#fff',border:'1px solid #e3e6ef'}}>Overview</div>
                <div style={{padding:'7px 10px',borderRadius:10,background:'#fff',border:'1px solid #e3e6ef'}}>Models</div>
              </div>
              <div style={{display:'flex',gap:8}}>
                <div style={{background:'#fff',padding:'7px 8px',borderRadius:10,border:'1px solid #e3e6ef'}}>Filter</div>
                <div style={{padding:'7px 10px',borderRadius:10,background:'#fff',border:'1px solid #e3e6ef'}}>Export</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
