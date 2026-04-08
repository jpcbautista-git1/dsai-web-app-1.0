import React from 'react'

export default function Home({ onNavigate }){
  return (
    <main className="content" style={{ padding: 24 }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <section
          className="hero"
          style={{
            marginTop: 18,
            position: 'relative',
            background: '#fff',
            borderRadius: 14,
            boxShadow: '0 6px 16px rgba(16,24,40,.08)',
            display: 'grid',
            gridTemplateColumns: '1.05fr 1fr',
            gap: 12,
            overflow: 'hidden',
            minHeight: 420
          }}
        >
          <div className="col-left" style={{ padding: '28px 34px' }}>
            <p className="kicker" style={{ color: '#4b5563', fontWeight: 800, letterSpacing: '.5px', margin: 0 }}>Welcome</p>
            <h1 className="title" style={{ fontSize: 28, margin: '8px 0 14px', fontWeight: 800 }}>#fromDATAtoINSIGHTS</h1>

            <p className="copy" style={{ color: '#525a68', maxWidth: '56ch', fontSize: 14, lineHeight: 1.6, marginTop: 0 }}>
              A powerful web-based collaborative tool to track and report your project's key delivery
              excellence parameters. Track your project's effort, schedule, quality, risks, issues,
              dependencies, and customer value using intuitive, easy-to-use modules.
            </p>

            <p className="copy" style={{ color: '#525a68', maxWidth: '56ch', fontSize: 14, lineHeight: 1.6 }}>
              Derive useful insights from data with the help of reports and dashboards.
            </p>

            <p className="note" style={{ color: '#d9534f', fontWeight: 700 }}>Note: Please ensure not to enter any personal or client sensitive data.</p>

            <div className="cta" style={{ marginTop: 12 }}>
              <button
                className="btn-primary"
                style={{ background: '#ffd200', color: '#2b2b2b', border: 'none', fontWeight: 800, padding: '12px 18px', borderRadius: 6, boxShadow: '0 6px 0 #c8aa00', cursor: 'pointer' }}
                onClick={(e) => {
                  e.preventDefault();
                  if (typeof onNavigate === 'function') return onNavigate('projects');
                  // fallback: update hash so users without client routing can still click
                  window.location.hash = '#projects';
                }}
              >
                Go to your Projects
              </button>
            </div>
          </div>

          <div className="col-right" style={{ position: 'relative', display: 'grid', placeItems: 'center', background: 'radial-gradient(1200px 480px at 70% 60%, #f7f8fb 0, #fff 60%)' }}>
            <div className="scene" style={{ width: '95%', maxWidth: 640, aspectRatio: '16/10', background: 'conic-gradient(from 210deg at 60% 54%, #e5e7eb, #f9fafb 60%)', borderRadius: 16, position: 'relative', overflow: 'hidden', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6)' }}>

              {/* faint dashed inner border */}
              <svg viewBox="0 0 100 62" preserveAspectRatio="none" style={{position:'absolute',inset:0, width:'100%',height:'100%',pointerEvents:'none'}}>
                <rect x="1" y="1" width="98" height="60" rx="4" ry="4" fill="none" stroke="#e8eaf0" strokeWidth="0.5" strokeDasharray="0.9 3" opacity="0.9" />
              </svg>

              {/* Top-left light card */}
              <div style={{ position: 'absolute', left: '6%', top: '10%', width: '34%', height: '22%', background: 'linear-gradient(180deg,#fbfcfe,#f3f5f7)', borderRadius: 12, boxShadow: '0 16px 32px rgba(16,24,40,0.06)', border: '1px solid rgba(16,24,40,0.02)', transform: 'translateZ(0)' }} />

              {/* Center colorful blurred card with inner shadow */}
              <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', width: '48%', height: '36%', borderRadius: 14, overflow: 'hidden', boxShadow: '0 22px 44px rgba(16,24,40,0.20)' }}>
                {/* muted darker yellow -> grey gradient for a more professional tone */}
                <div style={{position:'absolute',inset:0,background:'linear-gradient(120deg, #e0b800 0%, #d9dbe0 40%, #bfc4cb 100%)',filter:'blur(0.6px)',transform:'scale(1.01)'}} />
                {/* stronger vignette to darken edges */}
                <div style={{position:'absolute',inset:0,background:'radial-gradient(60% 60% at 35% 35%, rgba(0,0,0,0.18), rgba(0,0,0,0.06) 60%)',mixBlendMode:'multiply',opacity:0.98}} />
                {/* deeper inner shadow and subtle desaturated highlight */}
                <div style={{position:'absolute',inset:0,background:'radial-gradient(60% 60% at 35% 35%, rgba(0,0,0,0.18), rgba(0,0,0,0.06) 60%)',mixBlendMode:'multiply',opacity:0.98}} />
                <div style={{position:'absolute',left:6,top:6,right:6,bottom:6,borderRadius:12,background:'linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))',boxShadow:'inset 0 12px 30px rgba(0,0,0,0.34)'}} />
              </div>

              {/* Bottom-right light card */}
              <div style={{ position: 'absolute', right: '6%', bottom: '10%', width: '46%', height: '32%', background: 'linear-gradient(180deg,#fbfcfe,#f3f5f7)', borderRadius: 12, boxShadow: '0 16px 32px rgba(16,24,40,0.06)', border: '1px solid rgba(16,24,40,0.02)', transform: 'translateZ(0)' }} />

              {/* subtle diagonal translucent overlay to mimic the photo's fold */}
              <div style={{ position: 'absolute', left: '-10%', top: '48%', width: '140%', height: '34%', transform: 'rotate(-8deg)', background: 'linear-gradient(180deg, rgba(255,255,255,0.55), rgba(255,255,255,0.85))', opacity: 0.85 }} />

              {/* Yellow accent dot */}
              <div style={{ position: 'absolute', right: '20%', top: '10%', width: 12, height: 12, background: '#ffd200', borderRadius: 999, boxShadow: '0 6px 10px rgba(0,0,0,0.08)' }} />

            </div>
          </div>

          <div className="corner-version" style={{ position: 'absolute', right: 12, bottom: 10, color: '#67717f', fontSize: 12 }}>Version 7.2.0</div>
        </section>
      </div>
    </main>
  )
}
