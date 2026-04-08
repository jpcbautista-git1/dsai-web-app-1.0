import React, { useState, useEffect } from 'react'

export default function Topbar(){
  const ZOOM_KEY = 'SMART_UI_ZOOM'
  const [zoom, setZoom] = useState(() => {
    try { return parseFloat(localStorage.getItem(ZOOM_KEY)) || 1 }
    catch(e){ return 1 }
  })

  useEffect(() => {
    try{ document.documentElement.style.zoom = zoom }
    catch(e){}
    try{ localStorage.setItem(ZOOM_KEY, String(zoom)) }catch(e){}
  }, [zoom])

  const increase = () => setZoom(z => Math.min(1.6, Math.round((z + 0.1) * 100) / 100))
  const decrease = () => setZoom(z => Math.max(0.6, Math.round((z - 0.1) * 100) / 100))

  return (
    <header style={{height:64,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 16px',background:'#2f3136',color:'#fff'}}>
      <div style={{display:'flex',alignItems:'center',gap:10}}>
        <div style={{width:36,height:36,display:'grid',placeItems:'center',background:'#202226',borderRadius:8,color:'#ffd200',fontWeight:800}}>EY</div>
        <div style={{fontWeight:700}}>SMART</div>
      </div>

      <div style={{display:'flex',alignItems:'center',gap:12}}>
        <div style={{display:'inline-flex',alignItems:'center',gap:8}}>
          <button
            aria-label="Decrease zoom"
            title="Zoom out"
            onClick={decrease}
            style={{background:'#444852',color:'#fff',border:'none',padding:'6px 10px',borderRadius:8,cursor:'pointer',fontWeight:700}}
          >
            A-
          </button>

          <button
            aria-label="Increase zoom"
            title="Zoom in"
            onClick={increase}
            style={{background:'#444852',color:'#fff',border:'none',padding:'6px 10px',borderRadius:8,cursor:'pointer',fontWeight:700}}
          >
            A+
          </button>
        </div>

        <div style={{width:28,height:28,borderRadius:999,background:'#50535d'}} />
      </div>
    </header>
  )
}
