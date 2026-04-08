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
            <div className="scene" style={{ width: '95%', maxWidth: 640, aspectRatio: '16/10', background: 'conic-gradient(from 210deg at 60% 54%, #e5e7eb, #f9fafb 60%)', border: '1px dashed #e8eaf0', borderRadius: 16, position: 'relative' }}>
              <div className="isometric" style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', width: '46%', height: '36%', background: 'linear-gradient(#6b7280,#4b5563)', borderRadius: 16, boxShadow: '0 20px 40px rgba(0,0,0,.12)' }} />
            </div>
          </div>

          <div className="corner-version" style={{ position: 'absolute', right: 12, bottom: 10, color: '#67717f', fontSize: 12 }}>Version 7.2.0</div>
        </section>
      </div>
    </main>
  )
}
