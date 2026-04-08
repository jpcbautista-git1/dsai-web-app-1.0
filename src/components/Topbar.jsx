import React from 'react'

export default function Topbar(){
  return (
    <header style={{height:64,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 16px',background:'#2f3136',color:'#fff'}}>
      <div style={{display:'flex',alignItems:'center',gap:10}}>
        <div style={{width:36,height:36,display:'grid',placeItems:'center',background:'#202226',borderRadius:8,color:'#ffd200',fontWeight:800}}>EY</div>
        <div style={{fontWeight:700}}>SMART</div>
      </div>
      <div style={{display:'flex',alignItems:'center',gap:14}}>
        <div style={{background:'#444852',padding:'6px 10px',borderRadius:8}}>Release</div>
        <div style={{width:28,height:28,borderRadius:999,background:'#50535d'}} />
      </div>
    </header>
  )
}
