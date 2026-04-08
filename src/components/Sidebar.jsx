import React from 'react'
import homeIcon from '../assets/icons/home.png'
import rocketIcon from '../assets/icons/rocket.png'
import metricsIcon from '../assets/icons/metrics.png'
import auditIcon from '../assets/icons/audit.png'
import reputationIcon from '../assets/icons/reputation.png'
import reviewIcon from '../assets/icons/review.png'
import reportIcon from '../assets/icons/report.png'
import dsaiIcon from '../assets/icons/dsai_logo.png'

export default function Sidebar({onNavigate, active}){
  const items = [
    {key:'home',label:'Home', icon: homeIcon},
    {key:'projects',label:'Projects', icon: rocketIcon},
    {key:'metrics',label:'Metrics Dashboard', icon: metricsIcon},
    {key:'audit',label:'Process Audit', icon: auditIcon},
    {key:'voc',label:'VOC Dashboard', icon: reputationIcon},
    {key:'review',label:'Review Dashboard', icon: reviewIcon},
    {key:'reports',label:'Review Reports', icon: reportIcon},
    {key:'dsai',label:'DSAI', icon: dsaiIcon}
  ]

  return (
    <aside style={{width:72,background:'#3a3d46',padding:12,display:'flex',flexDirection:'column',gap:8,alignItems:'center'}}>
      {items.map(it=> (
        <a key={it.key} href="#" onClick={(e)=>{ e.preventDefault(); onNavigate(it.key); }} style={{textDecoration:'none',color:'#cfd2da',width:'100%'}}>
          <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:6,padding:10,borderRadius:12,background: active===it.key? '#2f323b' : 'transparent'}}>
            <div style={{width:24,height:24,display:'grid',placeItems:'center'}}>
              {it.icon ? (
                <img src={it.icon} alt={it.label} style={{width:20,height:20,objectFit:'contain'}} />
              ) : (
                <div style={{width:20,height:20,background:'#585c68',borderRadius:6}} />
              )}
            </div>
            <span style={{fontSize:11,color: active===it.key? '#ffd200' : '#b5bac7'}}>{it.label}</span>
          </div>
        </a>
      ))}
    </aside>
  )
}
