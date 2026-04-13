import React, { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const SAMPLE_PROJECTS = [
	{
		id: 'website-redesign',
		title: 'Website Redesign',
		status: 'active',
		meta: [
			['SSL', 'TC'],
			['Competency', 'Data Engineering'],
			['Project Manager', 'Chou, Adrich'],
			['Life Cycle', 'Custom Implementation'],
		],
		kpis: [
			['Integrated Review Score', '—'],
			['Productivity', '—'],
			['VOC', 'NA'],
			['Effort Variance', '—'],
			['Schedule Variance', '0'],
		],
		chip: 'Data Engineering',
	},
	{
		id: 'sap-abap',
		title: 'SAP ABAP Implementation',
		status: 'active',
		meta: [
			['SSL', 'TC'],
			['Competency', 'SAP'],
			['Project Manager', 'Santos, Aristotle'],
			['Life Cycle', 'Limited Scope Project'],
		],
		kpis: [['Integrated Review Score', '17.92'], ['Productivity', '—']],
		chip: 'SAP',
	},
	{
		id: 'changi-soar',
		title: 'Changi International Airport Group - SOAR',
		status: 'active',
		meta: [
			['SSL', 'TC'],
			['Competency', 'Life Cycle'],
			['Project Manager', 'Lorilla, Miguel'],
			['Competency', 'Cybersecurity'],
		],
		kpis: [
			['Integrated Review Score', '100'],
			['Productivity', '—'],
			['VOC', '—'],
			['Effort Variance', '9.09'],
			['Schedule Variance', '0'],
		],
		chip: 'Cybersecurity',
	},
	{
		id: 'bdo-spm',
		title: 'BDO SPM Implementation',
		status: 'active',
		meta: [],
		kpis: [],
		chip: 'ServiceNow',
	},
	{
		id: 'japan-css',
		title: 'Japan CSS - Product Management Support.',
		status: 'awaiting',
		meta: [],
		kpis: [],
		chip: 'CSS',
	},
	{
		id: 'nike-oracle',
		title: 'NIKE Oracle Support',
		status: 'draft',
		meta: [],
		kpis: [],
		chip: 'Oracle',
	},
	{
		id: 'legacy-closed',
		title: 'Legacy Project (Closed)',
		status: 'closed',
		meta: [],
		kpis: [],
		chip: '',
	},
]

export default function Projects({ onOpen }) {
	const [filter, setFilter] = useState('all')
    const navigate = useNavigate()

	const counts = useMemo(() => {
		const counts = {
			all: SAMPLE_PROJECTS.length,
			active: 0,
			draft: 0,
			closed: 0,
			awaiting: 0,
		}
		SAMPLE_PROJECTS.forEach((p) => {
			if (counts[p.status] !== undefined) counts[p.status]++
		})
		return counts
	}, [])

	const visible = useMemo(() => {
		if (filter === 'all') return SAMPLE_PROJECTS
		return SAMPLE_PROJECTS.filter((p) => p.status === filter)
	}, [filter])

	// onboarded set loaded from localStorage (saved by the DSAI onboard modal)
	const [onboarded, setOnboarded] = useState(new Set())
	useEffect(() => {
		try {
			const raw = localStorage.getItem('dsaiOnboard')
			if (!raw) return
			const payload = JSON.parse(raw)
			const s = new Set()
			if (Array.isArray(payload)) {
				payload.forEach((it) => {
					if (!it) return
					if (it.projectName) s.add(it.projectName)
					if (it.engagementName) s.add(it.engagementName)
					if (it.engagementId) s.add(String(it.engagementId))
					if (it.projectId) s.add(String(it.projectId))
					if (it.title) s.add(it.title)
					if (it.id) s.add(String(it.id))
				})
			} else if (payload && typeof payload === 'object') {
				if (payload.projectName) s.add(payload.projectName)
				if (payload.engagementName) s.add(payload.engagementName)
				if (payload.engagementId) s.add(String(payload.engagementId))
				if (payload.projectId) s.add(String(payload.projectId))
				if (payload.title) s.add(payload.title)
				if (payload.id) s.add(String(payload.id))
			}
			setOnboarded(s)
		} catch (e) {
			// ignore parse errors
		}
	}, [])

	const pillStyle = (key) => ({
		display: 'inline-flex',
		alignItems: 'center',
		gap: 8,
		padding: '8px 10px',
		borderRadius: 999,
		background: filter === key ? '#f9fafb' : '#fff',
		border: '1px solid #e5e7eb',
		fontSize: 12,
		cursor: 'pointer',
		boxShadow:
			'0 6px 16px rgba(16,24,40,.08), 0 2px 6px rgba(16,24,40,.06)',
	})

	return (
		<main style={{ padding: 20 }}>
			<div style={{ maxWidth: 1400, margin: '0 auto' }}>
				<div
					style={{
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'space-between',
						gap: 12,
						marginBottom: 14,
					}}
				>
					<div
						style={{
							fontSize: 14,
							fontWeight: 800,
							color: '#374151',
						}}
					>
						PROJECTS
					</div>
					<div
						style={{
							display: 'flex',
							gap: 8,
							alignItems: 'center',
						}}
						role="tablist"
						aria-label="Project status filters"
					>
						<button
							onClick={() => setFilter('all')}
							className={filter === 'all' ? 'is-on' : ''}
							style={pillStyle('all')}
						>
							All
							<span
								className="count"
								style={{
									marginLeft: 6,
									background: '#6b7280',
									color: '#fff',
									padding: '0 6px',
									borderRadius: 999,
									fontWeight: 800,
								}}
							>
								{counts.all}
							</span>
						</button>
						<button
							onClick={() => setFilter('active')}
							style={pillStyle('active')}
							data-filter="active"
						>
							Active Projects
							<span
								className="count"
								style={{
									marginLeft: 6,
									background: '#22c55e',
									color: '#fff',
									padding: '0 6px',
									borderRadius: 999,
									fontWeight: 800,
								}}
							>
								{counts.active}
							</span>
						</button>
						<button
							onClick={() => setFilter('draft')}
							style={pillStyle('draft')}
							data-filter="draft"
						>
							Draft Projects
							<span
								className="count"
								style={{
									marginLeft: 6,
									background: '#3b82f6',
									color: '#fff',
									padding: '0 6px',
									borderRadius: 999,
									fontWeight: 800,
								}}
							>
								{counts.draft}
							</span>
						</button>
						<button
							onClick={() => setFilter('closed')}
							style={pillStyle('closed')}
							data-filter="closed"
						>
							Closed Projects
							<span
								className="count"
								style={{
									marginLeft: 6,
									background: '#ef4444',
									color: '#fff',
									padding: '0 6px',
									borderRadius: 999,
									fontWeight: 800,
								}}
							>
								{counts.closed}
							</span>
						</button>
						<button
							onClick={() => setFilter('awaiting')}
							style={pillStyle('awaiting')}
							data-filter="awaiting"
						>
							Awaiting Closure
							<span
								className="count"
								style={{
									marginLeft: 6,
									background: '#f59e0b',
									color: '#fff',
									padding: '0 6px',
									borderRadius: 999,
									fontWeight: 800,
								}}
							>
								{counts.awaiting}
							</span>
						</button>
					</div>
				</div>

				<section
					className="grid"
					id="projectGrid"
					style={{
						display: 'grid',
						gridTemplateColumns: 'repeat(3,minmax(320px,1fr))',
						gap: 18,
					}}
				>
					{visible.map((p) => (
						<a
							key={p.id}
							className={`tile status-${p.status}`}
							data-status={p.status}
							href="#"
							onClick={(e) => {
								e.preventDefault()
								// persist selected project for ProjectSample/details page to read
								try { localStorage.setItem('dsaiSelectedProject', JSON.stringify(p)) } catch (err) {}
								// navigate SPA to project details route
								navigate(`/projects/${p.id}`)
							}}
							style={{
								textDecoration: 'none',
								color: 'inherit',
								background: '#fff',
								border: '1px solid #e5e7eb',
								borderRadius: 12,
								padding: 16,
								boxShadow: '0 6px 16px rgba(16,24,40,.08)',
								boxSizing: 'border-box',
								minWidth: 0,
								display: 'flex',
								flexDirection: 'column',
								overflow: 'hidden',
							}}
						>
							<div
								className="status-bar"
								style={{
									height: 4,
									width: '100%',
									borderRadius: '10px 10px 0 0',
									background:
										p.status === 'active'
											? '#22c55e'
											: p.status === 'draft'
											? '#3b82f6'
											: p.status === 'closed'
											? '#ef4444'
											: '#f59e0b',
								}}
								aria-hidden="true"
							/>
							<h3
								style={{
									fontSize: 16,
									lineHeight: 1.25,
									margin: '4px 0 10px',
									fontWeight: 800,
									color: '#111827',
									overflowWrap: 'break-word',
									wordBreak: 'break-word',
									Hyphens: 'auto',
								}}
								title={p.title}
							>
								{p.title}
								{(onboarded.has(p.id) || onboarded.has(p.title)) && (
									<span style={{display:'inline-flex',alignItems:'center',gap:8,padding:'2px 8px',background:'#f3e8ff',color:'#6d28d9',borderRadius:999,fontSize:11,fontWeight:700,marginLeft:8}}>
										On-boarded to DSAI
									</span>
								)}
							</h3>

							<div
								className="meta"
								style={{
									display: 'grid',
									gridTemplateColumns: 'repeat(4,1fr)',
									gap: '6px 12px',
									minWidth: 0,
								}}
							>
								{p.meta && p.meta.length > 0 ? (
									p.meta.map((m, idx) => (
										<div
											className="item"
											key={idx}
											style={{
												fontSize: 11,
												color: '#4b5563',
												display: 'flex',
												flexDirection: 'column',
												gap: 6,
												minWidth: 0,
											}}
										>
											<span
												className="label"
												style={{
													color: '#6b7280',
													fontSize: 11,
												}}
											>
												{m[0]}
											</span>
											<span style={{minWidth: 0, color: '#374151'}}>{m[1]}</span>
										</div>
									))
								) : (
									<div
										style={{
											color: '#9ca3af',
											fontSize: 12,
										}}
									>
										No meta
									</div>
								)}
							</div>

							<ul
								className="kpis"
								style={{
									marginTop: 8,
									paddingTop: 8,
									listStyle: 'none',
									borderTop: '1px dashed #e5e7eb',
									display: 'grid',
									gridTemplateColumns: '1fr 1fr',
									gap: 6,
									margin: 0,
									minWidth: 0,
								}}
							>
								{p.kpis && p.kpis.length > 0 ? (
									p.kpis.map((k, idx) => (
										<li
											key={idx}
											style={{
												fontSize: 11,
												color: '#4b5563',
												display: 'flex',
												justifyContent: 'space-between',
												wordBreak: 'break-word',
												minWidth: 0,
											}}
										>
											<span style={{minWidth:0, flex:'1 1 0', overflowWrap:'anywhere'}}>{k[0]}</span>
											<strong style={{ color: '#111827', marginLeft: 8, flex:'0 0 auto' }}>{k[1]}</strong>
										</li>
									))
								) : (
									<li style={{ fontSize: 11, color: '#4b5563' }}>No KPIs</li>
								)}
							</ul>

							<div
								className="footer"
								style={{
									marginTop: 8,
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'space-between',
									gap: 8,
									paddingTop: 8,
								}}
							>
								<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
									<span
										className="chip-mini"
										style={{
											fontSize: 10,
											padding: '4px 8px',
											borderRadius: 999,
											border: '1px solid #e5e7eb',
											background: '#f9fafb',
											color: '#111827',
										}}
									>
										{p.chip}
									</span>
								</div>
								{/* Only show Open plan for projects onboarded to DSAI */}
								{(onboarded.has(p.id) || onboarded.has(p.title)) ? (
									<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
										<button
											onClick={(e) => {
												e.preventDefault()
												// persist selected project for ProjectSample/details page to read
												try { localStorage.setItem('dsaiSelectedProject', JSON.stringify(p)) } catch (err) {}
												// SPA navigate to project details
												navigate(`/projects/${p.id}`)
											}}
											style={{
												background: '#6d28d9',
												color: '#fff',
												padding: '6px 12px',
												borderRadius: 8,
												border: 'none',
												fontSize: 13,
												fontWeight: 700,
												cursor: 'pointer',
											}}
										>
											Open plan
										</button>
										<span className="goto" style={{ fontSize: 11, color: '#2563eb' }}>
										 Open ›
										</span>
									</div>
								) : (
									<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
										{/* placeholder when not onboarded: show nothing or a disabled indicator */}
										<span style={{ fontSize: 12, color: '#9ca3af' }}>Not onboarded</span>
									</div>
								)}
							</div>
						</a>
					))}
				</section>
			</div>
		</main>
	)
}
