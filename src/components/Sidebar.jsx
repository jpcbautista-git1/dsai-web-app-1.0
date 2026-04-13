import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import homeIcon from '../assets/icons/home.png'
import dsaiIcon from '../assets/icons/dsai_logo.png'
import projectsIcon from '../assets/icons/rocket.png'
import metricsIcon from '../assets/icons/metrics.png'
import auditIcon from '../assets/icons/audit.png'
import reviewIcon from '../assets/icons/report.png'
import reputationIcon from '../assets/icons/reputation.png'

export default function Sidebar({onNavigate, active}){
  const location = useLocation()
  const current = location.pathname || '/'
  const items = [
    {key:'/',label:'Home', icon: homeIcon, to: '/'},
    {key:'/projects',label:'Projects', icon: projectsIcon, to: '/projects'},
    {key:'/metrics',label:'Metrics Dashboard', icon: metricsIcon, to: '/metrics'},
    {key:'/process-audit',label:'Process Audit', icon: auditIcon, to: '/process-audit'},
    {key:'/voc',label:'VOC Dashboard', icon: reputationIcon, to: '/voc'},
    {key:'/review-dashboard',label:'Review Dashboard', icon: reviewIcon, to: '/review-dashboard'},
    {key:'/review-reports',label:'Review Reports', icon: reviewIcon, to: '/review-reports'},
    {key:'/dsai',label:'DSAI', icon: dsaiIcon, to: '/dsai'}
  ]

  return (
    <aside style={{width:64,background:'#3a3d46',padding:12,display:'flex',flexDirection:'column',gap:12,alignItems:'center'}}>
      {items.map(it=> (
        <Link
          key={it.key}
          to={it.to}
          style={{textDecoration:'none',color:'#cfd2da',width:'100%',display:'flex',justifyContent:'center'}}
        >
          <div
            style={{
              display:'flex',
              flexDirection:'column',
              alignItems:'center',
              justifyContent:'center',
              gap:6,
              padding:'6px 4px 8px',
              borderRadius:10,
              background: current === it.to ? '#2f323b' : 'transparent',
              width: 68,
              margin: '0 auto',
              textAlign: 'center',
              boxSizing: 'border-box'
            }}
          >
            <div style={{width:36,height:36,display:'grid',placeItems:'center',borderRadius:8,background: current === it.to ? 'rgba(255,210,0,0.08)' : 'transparent'}}>
              {it.icon ? (
                <img
                  src={it.icon}
                  alt={it.label}
                  style={{
                    width:18,
                    height:18,
                    objectFit:'contain',
                    // keep other icons white, but show original color for DSAI
                    filter: it.key === '/dsai' ? 'none' : 'brightness(0) invert(1)'
                  }}
                />
              ) : (
                <div style={{width:18,height:18,background:'#585c68',borderRadius:4}} />
              )}
            </div>
            <span style={{display:'inline-block',maxWidth:68,textAlign:'center',fontSize:12,lineHeight:'16px',color: current === it.to ? '#ffffff' : 'rgba(255,255,255,0.9)', marginTop:4,whiteSpace:'normal',overflowWrap:'normal',wordBreak:'normal',paddingBottom:2}}>{it.label}</span>
          </div>
        </Link>
      ))}
    </aside>
  )
}
