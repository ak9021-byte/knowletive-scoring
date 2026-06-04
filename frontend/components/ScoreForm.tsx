"use client"
import { useState, useEffect, useRef } from "react"

// ── Constants ──────────────────────────────────────────────
const METRICS = [
  { key: "attendance", label: "Attendance", max: 10,  icon: "🟢", color: "#10b981", bg: "#ecfdf5", border: "#6ee7b7", steps: [0,1,2,3,4,5,6,7,8,9,10] },
  { key: "speak_up",   label: "Speak Up",   max: 15,  icon: "🎤", color: "#8b5cf6", bg: "#f5f3ff", border: "#c4b5fd", steps: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15] },
  { key: "activity",   label: "Activity",   max: 20,  icon: "⚡", color: "#f59e0b", bg: "#fffbeb", border: "#fcd34d", steps: [0,2,4,6,8,10,12,14,16,18,20] },
  { key: "technical",  label: "Technical",  max: 30,  icon: "💻", color: "#3b82f6", bg: "#eff6ff", border: "#93c5fd", steps: [0,5,10,15,20,25,30] },
  { key: "behavior",   label: "Behavior",   max: 10,  icon: "🤝", color: "#ec4899", bg: "#fdf2f8", border: "#f9a8d4", steps: [0,1,2,3,4,5,6,7,8,9,10] },
  { key: "initiative", label: "Initiative", max: 15,  icon: "🚀", color: "#6366f1", bg: "#eef2ff", border: "#a5b4fc", steps: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15] },
]

const tierInfo = (t: number) =>
  t >= 90 ? { label: "Pro",      color: "#7c3aed", bg: "#f5f3ff", border: "#ddd6fe" }
  : t >= 75 ? { label: "Good",   color: "#2563eb", bg: "#eff6ff", border: "#bfdbfe" }
  : t >= 50 ? { label: "Average",color: "#d97706", bg: "#fffbeb", border: "#fde68a" }
  :           { label: "Beginner",color: "#dc2626", bg: "#fef2f2", border: "#fecaca" }

const avatarGrads = [
  ["#667eea","#764ba2"],["#f093fb","#f5576c"],["#4facfe","#00f2fe"],
  ["#43e97b","#38f9d7"],["#fa709a","#fee140"],["#30cfd0","#667eea"],
  ["#a18cd1","#fbc2eb"],["#fccb90","#d57eeb"],
]

const emptyScores = () => ({ attendance:0, speak_up:0, activity:0, technical:0, behavior:0, initiative:0 })

// ── Demo students (replace with real API data via props) ───
const DEMO_STUDENTS = [
  { id:1, name:"Khatal Srushti Santosh", email:"srushti@example.com", rollNo:"STU-001" },
  { id:2, name:"Aman Verma",            email:"aman@example.com",    rollNo:"STU-002" },
  { id:3, name:"Rahul Patil",           email:"rahul@example.com",   rollNo:"STU-003" },
  { id:4, name:"Priya Sharma",          email:"priya@example.com",   rollNo:"STU-004" },
  { id:5, name:"Neha Singh",            email:"neha@example.com",    rollNo:"STU-005" },
  { id:6, name:"Rohit Kumar",           email:"rohit@example.com",   rollNo:"STU-006" },
  { id:7, name:"Sagar Joshi",           email:"sagar@example.com",   rollNo:"STU-007" },
  { id:8, name:"Pooja Yadav",           email:"pooja@example.com",   rollNo:"STU-008" },
  { id:9, name:"Vishal Mehta",          email:"vishal@example.com",  rollNo:"STU-009" },
  { id:10,name:"Anjali Gupta",          email:"anjali@example.com",  rollNo:"STU-010" },
]

// ── Helpers ────────────────────────────────────────────────
const totalScore = (scores: Record<string, number>) => Object.values(scores).reduce((a,b) => a + b, 0)
const initials = (name: string) => name.split(" ").map((w: string) => w[0]).join("").slice(0,2).toUpperCase()
const DRAFT_KEY = (sid, date) => `score_draft_${sid}_${date}`

interface Student {
  id: number
  name: string
  email: string
  rollNo?: string
  photo?: string
}

interface Props {
  students?: Student[]
  onSaveAll?: (entries: any[]) => Promise<void>
  batchName?: string
}

export default function ScoreEntryFullRange({
  students: propStudents,
  onSaveAll,
  batchName = "BCA 1st Year - A",
}: Props) {
  
  const students = propStudents || DEMO_STUDENTS
  const today = new Date().toLocaleDateString("en-CA") // YYYY-MM-DD

  const [date, setDate] = useState(today)
  const [selectedIdx, setSelectedIdx] = useState(0)
  const [scores, setScores] = useState({}) // { [studentId]: { attendance, speak_up, ... } }
  const [saved,  setSaved]  = useState({}) // { [studentId]: true } = submitted
  const [filter, setFilter] = useState("all") // "all" | "scored" | "pending"
  const [search, setSearch] = useState("")
  const [showSummary, setShowSummary] = useState(false)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: string } | null>(null)

  const showToast = (msg, type = "success") => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  // Load drafts on mount / date change
  useEffect(() => {
    const loaded = {}
    students.forEach(s => {
      try {
        const d = localStorage.getItem(DRAFT_KEY(s.id, date))
        if (d) loaded[s.id] = JSON.parse(d)
      } catch {}
    })
    setScores(loaded)
    setSaved({})
  }, [date])

  const getScores = (sid) => scores[sid] || emptyScores()
  const setStudentScore = (sid, key, val) => {
    setScores(prev => {
      const next = { ...prev, [sid]: { ...getScores(sid), [key]: val } }
      try { localStorage.setItem(DRAFT_KEY(sid, date), JSON.stringify(next[sid])) } catch {}
      return next
    })
  }

  const filteredStudents = students.filter(s => {
    const q = search.toLowerCase()
    if (q && !s.name.toLowerCase().includes(q)) return false
    if (filter === "scored")  return !!saved[s.id]
    if (filter === "pending") return !saved[s.id]
    return true
  })

  const sel = filteredStudents[selectedIdx] || filteredStudents[0]
  const selRealIdx = sel ? students.findIndex(s => s.id === sel.id) : 0

  const handleSave = async (single = false) => {
    setSaving(true)
    const toSave = single
      ? [{ student: sel, sc: getScores(sel.id) }]
      : students.map(s => ({ student: s, sc: getScores(s.id) }))

    try {
      if (onSaveAll) {
        await onSaveAll(toSave.map(({ student, sc }) => ({
          student_id: student.id,
          date,
          ...sc,
          total: totalScore(sc),
          score_type: "daily",
        })))
      }
      const newSaved = { ...saved }
      toSave.forEach(({ student }) => {
        newSaved[student.id] = true
        try { localStorage.removeItem(DRAFT_KEY(student.id, date)) } catch {}
      })
      setSaved(newSaved)
      showToast(single ? `Score saved for ${sel.name}! 🚀` : "All scores saved! 🚀")
    } catch (e) {
      showToast(e?.response?.data?.detail || "Error saving scores", "error")
    }
    setSaving(false)
  }

  const goNext = () => {
    if (selectedIdx < filteredStudents.length - 1) setSelectedIdx(i => i + 1)
  }
  const goPrev = () => {
    if (selectedIdx > 0) setSelectedIdx(i => i - 1)
  }

  const scoredCount = students.filter(s => saved[s.id]).length

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin:0; padding:0; }
        .frs-root {
          font-family: 'Plus Jakarta Sans', sans-serif;
          background: #f8f9fe;
          min-height: 100vh;
          color: #0f172a;
        }
        .frs-topbar {
          background: #fff;
          border-bottom: 1px solid #e5e9f5;
          padding: 16px 32px;
          display: flex;
          align-items: center;
          gap: 20px;
          flex-wrap: wrap;
        }
        .frs-title { font-size: 22px; font-weight: 800; color: #0f172a; }
        .frs-sub   { font-size: 13px; color: #64748b; margin-top: 2px; }
        .frs-topbar-right { margin-left: auto; display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
        .frs-date-input {
          padding: 9px 14px; border-radius: 10px;
          border: 1.5px solid #e5e9f5; font-size: 13px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          color: #0f172a; outline: none; background: #fff;
          cursor: pointer;
        }
        .frs-date-input:focus { border-color: #5b5ef4; }
        .frs-btn-outline {
          padding: 9px 18px; border-radius: 10px;
          border: 1.5px solid #e5e9f5; background: #fff;
          font-size: 13px; font-weight: 700; cursor: pointer;
          font-family: 'Plus Jakarta Sans', sans-serif;
          color: #0f172a; display: flex; align-items: center; gap: 6px;
          transition: all 0.2s;
        }
        .frs-btn-outline:hover { background: #f8f9fe; border-color: #c7d2fe; }
        .frs-btn-primary {
          padding: 9px 20px; border-radius: 10px;
          border: none; background: linear-gradient(135deg,#5b5ef4,#818cf8);
          font-size: 13px; font-weight: 700; cursor: pointer;
          font-family: 'Plus Jakarta Sans', sans-serif;
          color: #fff; display: flex; align-items: center; gap: 6px;
          box-shadow: 0 4px 14px rgba(91,94,244,0.3);
          transition: all 0.2s;
        }
        .frs-btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(91,94,244,0.4); }
        .frs-btn-primary:disabled { opacity:0.6; cursor: not-allowed; transform: none; }

        .frs-body {
          display: grid;
          grid-template-columns: 300px 1fr;
          min-height: calc(100vh - 72px);
        }

        /* Left panel */
        .frs-left {
          background: #fff;
          border-right: 1px solid #e5e9f5;
          display: flex;
          flex-direction: column;
        }
        .frs-left-header { padding: 16px 20px 12px; border-bottom: 1px solid #e5e9f5; }
        .frs-batch-row { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
        .frs-batch-icon { width:36px; height:36px; border-radius:10px; background:#eef0ff; display:flex; align-items:center; justify-content:center; font-size:18px; flex-shrink:0; }
        .frs-batch-label { font-size:11px; color:#94a3b8; font-weight:600; text-transform:uppercase; letter-spacing:1px; }
        .frs-batch-name { font-size:14px; font-weight:700; color:#0f172a; }
        .frs-stats-row { display:flex; gap:8px; }
        .frs-stat-pill { flex:1; background:#f8f9fe; border:1px solid #e5e9f5; border-radius:8px; padding:8px 10px; text-align:center; }
        .frs-stat-pill-val { font-size:18px; font-weight:800; color:#5b5ef4; }
        .frs-stat-pill-lbl { font-size:10px; color:#94a3b8; font-weight:600; margin-top:1px; }

        .frs-filter-row { display:flex; gap:4px; padding:10px 20px 0; }
        .frs-filter-btn { flex:1; padding:7px 6px; border-radius:8px; border:1px solid #e5e9f5; background:transparent; font-size:11px; font-weight:700; cursor:pointer; font-family:'Plus Jakarta Sans',sans-serif; color:#94a3b8; transition:all 0.15s; }
        .frs-filter-btn.active { background:#eef0ff; color:#5b5ef4; border-color:#c7d2fe; }

        .frs-search-wrap { padding:10px 20px 0; position:relative; }
        .frs-search { width:100%; padding:9px 36px 9px 12px; border-radius:9px; border:1.5px solid #e5e9f5; font-size:13px; font-family:'Plus Jakarta Sans',sans-serif; outline:none; color:#0f172a; background:#f8f9fe; }
        .frs-search:focus { border-color:#5b5ef4; background:#fff; }
        .frs-search-icon { position:absolute; right:30px; top:50%; transform:translateY(-50%); font-size:14px; color:#94a3b8; pointer-events:none; margin-top:5px; }

        .frs-list { flex:1; overflow-y:auto; padding:10px 12px 20px; }
        .frs-student-row {
          display:flex; align-items:center; gap:10px;
          padding:10px 12px; border-radius:10px; cursor:pointer;
          transition:all 0.15s; margin-bottom:4px;
          border:1px solid transparent;
        }
        .frs-student-row:hover { background:#f8f9fe; }
        .frs-student-row.active { background:#eef0ff; border-color:#c7d2fe; }
        .frs-srow-num { font-size:12px; color:#94a3b8; font-weight:600; min-width:20px; text-align:center; }
        .frs-srow-avatar { width:36px; height:36px; border-radius:10px; flex-shrink:0; overflow:hidden; display:flex; align-items:center; justify-content:center; font-size:13px; font-weight:800; color:#fff; position:relative; }
        .frs-srow-info { flex:1; min-width:0; }
        .frs-srow-name { font-size:13px; font-weight:600; color:#0f172a; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .frs-srow-score { font-size:11px; color:#64748b; margin-top:1px; }
        .frs-srow-badge { width:20px; height:20px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:11px; flex-shrink:0; }

        .frs-load-more { width:100%; padding:9px; border-radius:9px; border:1.5px dashed #e5e9f5; background:transparent; font-size:12px; font-weight:600; color:#94a3b8; cursor:pointer; font-family:'Plus Jakarta Sans',sans-serif; transition:all 0.2s; margin-top:8px; }
        .frs-load-more:hover { border-color:#c7d2fe; color:#5b5ef4; }

        /* Right panel */
        .frs-right { display:flex; flex-direction:column; }
        .frs-right-header { padding:20px 32px 18px; background:#fff; border-bottom:1px solid #e5e9f5; display:flex; align-items:center; gap:16px; }
        .frs-student-avatar-lg { width:52px; height:52px; border-radius:14px; flex-shrink:0; overflow:hidden; display:flex; align-items:center; justify-content:center; font-size:20px; font-weight:800; color:#fff; position:relative; cursor:pointer; }
        .frs-avatar-edit-badge { position:absolute; bottom:-3px; right:-3px; width:18px; height:18px; border-radius:50%; background:#5b5ef4; border:2px solid #fff; display:flex; align-items:center; justify-content:center; font-size:9px; color:#fff; }
        .frs-student-name-lg { font-size:20px; font-weight:800; color:#0f172a; }
        .frs-student-roll { font-size:13px; color:#64748b; margin-top:2px; }
        .frs-total-wrap { margin-left:auto; text-align:right; }
        .frs-total-label { font-size:11px; color:#94a3b8; font-weight:600; text-transform:uppercase; letter-spacing:1px; }
        .frs-total-score { font-size:36px; font-weight:800; line-height:1; }
        .frs-total-out { font-size:16px; color:#94a3b8; font-weight:500; }
        .frs-tier-pill { display:inline-block; padding:4px 14px; border-radius:20px; font-size:12px; font-weight:700; margin-top:4px; }

        .frs-metrics-area { flex:1; padding:24px 32px; overflow-y:auto; }
        .frs-metric-row {
          display:flex; align-items:center; gap:16px;
          padding:18px 0; border-bottom:1px solid #f1f5f9;
        }
        .frs-metric-row:last-child { border-bottom:none; }
        .frs-metric-icon { font-size:24px; flex-shrink:0; }
        .frs-metric-label { font-size:15px; font-weight:700; color:#0f172a; min-width:110px; }
        .frs-metric-max { font-size:11px; color:#94a3b8; }
        .frs-btn-grid { display:flex; flex-wrap:wrap; gap:6px; flex:1; }
        .frs-score-btn {
          min-width:44px; height:38px; padding:0 8px;
          border-radius:9px; border:1.5px solid #e5e9f5;
          background:#fff; color:#64748b;
          font-size:13px; font-weight:700;
          cursor:pointer; font-family:'Plus Jakarta Sans',sans-serif;
          transition:all 0.15s;
          display:flex; align-items:center; justify-content:center;
        }
        .frs-score-btn:hover { border-color:#a5b4fc; color:#5b5ef4; }
        .frs-score-btn.selected {
          color:#fff; border-color:transparent;
          box-shadow:0 2px 8px rgba(0,0,0,0.15);
          transform:scale(1.08);
        }

        .frs-footer {
          background:#fff; border-top:1px solid #e5e9f5;
          padding:14px 32px; display:flex; align-items:center; justify-content:space-between; gap:12px;
        }
        .frs-autosave-note { font-size:12px; color:#64748b; display:flex; align-items:center; gap:6px; }
        .frs-footer-btns { display:flex; gap:10px; }
        .frs-btn-nav {
          padding:10px 20px; border-radius:10px;
          border:1.5px solid #e5e9f5; background:#fff;
          font-size:13px; font-weight:700; cursor:pointer;
          font-family:'Plus Jakarta Sans',sans-serif;
          color:#0f172a; display:flex; align-items:center; gap:6px;
          transition:all 0.2s;
        }
        .frs-btn-nav:hover:not(:disabled) { background:#f8f9fe; border-color:#c7d2fe; }
        .frs-btn-nav:disabled { opacity:0.4; cursor:not-allowed; }
        .frs-btn-save {
          padding:10px 24px; border-radius:10px;
          border:none; background:linear-gradient(135deg,#5b5ef4,#818cf8);
          font-size:13px; font-weight:700; cursor:pointer;
          font-family:'Plus Jakarta Sans',sans-serif;
          color:#fff; display:flex; align-items:center; gap:6px;
          box-shadow:0 4px 14px rgba(91,94,244,0.3);
          transition:all 0.2s;
        }
        .frs-btn-save:hover { transform:translateY(-1px); box-shadow:0 6px 20px rgba(91,94,244,0.4); }

        /* Toast */
        .frs-toast {
          position:fixed; bottom:28px; right:28px; z-index:9999;
          padding:12px 20px; border-radius:12px; font-size:13px; font-weight:700;
          box-shadow:0 8px 32px rgba(0,0,0,0.15); animation:slideUp 0.3s ease;
          font-family:'Plus Jakarta Sans',sans-serif;
        }
        @keyframes slideUp { from{transform:translateY(20px);opacity:0} to{transform:translateY(0);opacity:1} }

        /* Summary overlay */
        .frs-overlay { position:fixed; inset:0; z-index:200; background:rgba(0,0,0,0.4); display:flex; align-items:center; justify-content:center; }
        .frs-summary-card { background:#fff; border-radius:20px; padding:28px 32px; width:560px; max-height:80vh; overflow-y:auto; box-shadow:0 20px 60px rgba(0,0,0,0.2); }
        .frs-summary-title { font-size:18px; font-weight:800; color:#0f172a; margin-bottom:18px; }
        .frs-summary-row { display:flex; align-items:center; justify-content:space-between; padding:10px 0; border-bottom:1px solid #f1f5f9; }
        .frs-summary-row:last-child { border-bottom:none; }

        @media(max-width:768px){
          .frs-body { grid-template-columns:1fr; }
          .frs-left { max-height:300px; }
          .frs-topbar { padding:12px 16px; }
          .frs-right-header, .frs-metrics-area, .frs-footer { padding-left:16px; padding-right:16px; }
          .frs-btn-grid { gap:4px; }
          .frs-score-btn { min-width:36px; height:34px; font-size:12px; }
        }
      `}</style>

      <div className="frs-root">
        {/* Toast */}
        {toast && (
          <div className="frs-toast" style={{
            background: toast.type==="error"?"#fef2f2":toast.type==="warning"?"#fffbeb":"#f0fdf4",
            color: toast.type==="error"?"#dc2626":toast.type==="warning"?"#b45309":"#15803d",
            border: `1px solid ${toast.type==="error"?"#fecaca":toast.type==="warning"?"#fde68a":"#bbf7d0"}`,
          }}>
            {toast.msg}
          </div>
        )}

        {/* Summary overlay */}
        {showSummary && (
          <div className="frs-overlay" onClick={() => setShowSummary(false)}>
            <div className="frs-summary-card" onClick={e => e.stopPropagation()}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:18}}>
                <div className="frs-summary-title">📊 Score Summary — {date}</div>
                <button onClick={() => setShowSummary(false)} style={{background:"none",border:"none",cursor:"pointer",fontSize:20,color:"#94a3b8"}}>✕</button>
              </div>
              {students.map((s,i) => {
                const sc = getScores(s.id)
                const tot = totalScore(sc)
                const tier = tierInfo(tot)
                const [g1,g2] = avatarGrads[i % avatarGrads.length]
                return (
                  <div key={s.id} className="frs-summary-row">
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <div style={{width:32,height:32,borderRadius:8,background:`linear-gradient(135deg,${g1},${g2})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,color:"#fff",flexShrink:0,overflow:"hidden"}}>
                        {s.photo ? <img src={s.photo} style={{width:"100%",height:"100%",objectFit:"cover"}} alt="" /> : initials(s.name)}
                      </div>
                      <div>
                        <div style={{fontSize:13,fontWeight:700}}>{s.name}</div>
                        <div style={{fontSize:11,color:"#94a3b8"}}>{s.rollNo}</div>
                      </div>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <span style={{fontSize:20,fontWeight:800,color:tier.color}}>{tot}</span>
                      <span style={{fontSize:11,color:"#94a3b8"}}>/100</span>
                      <span className="frs-tier-pill" style={{background:tier.bg,color:tier.color,border:`1px solid ${tier.border}`,fontSize:11}}>{tier.label}</span>
                      {saved[s.id] && <span style={{fontSize:14}}>✅</span>}
                    </div>
                  </div>
                )
              })}
              <button className="frs-btn-primary" style={{width:"100%",marginTop:20,justifyContent:"center"}}
                onClick={() => { handleSave(false); setShowSummary(false) }} disabled={saving}>
                {saving ? "Saving…" : "💾 Save All Scores"}
              </button>
            </div>
          </div>
        )}

        {/* Top bar */}
        <div className="frs-topbar">
          <div>
            <div className="frs-title">📝 Score Entry <span style={{fontSize:15,fontWeight:600,color:"#8b5cf6"}}>(Full Range Mode)</span></div>
            <div className="frs-sub">Click on any score to select. Full range of marks are shown for easy selection.</div>
          </div>
          <div className="frs-topbar-right">
            <input type="date" className="frs-date-input" value={date} onChange={e => setDate(e.target.value)} />
            <button className="frs-btn-outline" onClick={() => setShowSummary(true)}>
              📊 View Summary
            </button>
            <button className="frs-btn-primary" onClick={() => handleSave(false)} disabled={saving}>
              💾 {saving ? "Saving…" : "Save All Scores"}
            </button>
          </div>
        </div>

        <div className="frs-body">
          {/* LEFT: student list */}
          <div className="frs-left">
            <div className="frs-left-header">
              <div className="frs-batch-row">
                <div className="frs-batch-icon">🎓</div>
                <div>
                  <div className="frs-batch-label">Class / Batch</div>
                  <div className="frs-batch-name">{batchName}</div>
                </div>
              </div>
              <div className="frs-stats-row">
                <div className="frs-stat-pill">
                  <div className="frs-stat-pill-val">{students.length}</div>
                  <div className="frs-stat-pill-lbl">Total Students</div>
                </div>
                <div className="frs-stat-pill">
                  <div className="frs-stat-pill-val" style={{color:"#10b981"}}>{scoredCount}</div>
                  <div className="frs-stat-pill-lbl">Scored</div>
                </div>
                <div className="frs-stat-pill">
                  <div className="frs-stat-pill-val" style={{color:"#f59e0b"}}>{students.length - scoredCount}</div>
                  <div className="frs-stat-pill-lbl">Pending</div>
                </div>
              </div>
            </div>

            <div className="frs-filter-row">
              {["all","scored","pending"].map(f => (
                <button key={f} className={`frs-filter-btn ${filter===f?"active":""}`}
                  onClick={() => { setFilter(f); setSelectedIdx(0) }}>
                  {f==="all"?"All":f==="scored"?"✅ Scored":"⏳ Pending"}
                </button>
              ))}
            </div>

            <div className="frs-search-wrap">
              <input className="frs-search" placeholder="Search student..." value={search} onChange={e => { setSearch(e.target.value); setSelectedIdx(0) }} />
              <span className="frs-search-icon">🔍</span>
            </div>

            <div className="frs-list">
              {filteredStudents.map((s, fi) => {
                const realIdx = students.findIndex(x => x.id === s.id)
                const [g1,g2] = avatarGrads[realIdx % avatarGrads.length]
                const sc = getScores(s.id)
                const tot = totalScore(sc)
                const hasAnyScore = tot > 0 || saved[s.id]
                const isActive = fi === selectedIdx
                return (
                  <div key={s.id} className={`frs-student-row ${isActive?"active":""}`} onClick={() => setSelectedIdx(fi)}>
                    <span className="frs-srow-num">{realIdx+1}</span>
                    <div className="frs-srow-avatar" style={{background:`linear-gradient(135deg,${g1},${g2})`}}>
                      {s.photo
                        ? <img src={s.photo} style={{width:"100%",height:"100%",objectFit:"cover"}} alt="" />
                        : initials(s.name)
                      }
                    </div>
                    <div className="frs-srow-info">
                      <div className="frs-srow-name">{s.name}</div>
                      <div className="frs-srow-score">
                        {saved[s.id] ? `${tot}/100` : hasAnyScore ? `${tot}/100 (draft)` : "–/100"}
                      </div>
                    </div>
                    <div className="frs-srow-badge" style={{
                      background: saved[s.id] ? "#ecfdf5" : hasAnyScore ? "#fffbeb" : "#f1f5f9",
                      color:      saved[s.id] ? "#10b981" : hasAnyScore ? "#f59e0b" : "#94a3b8",
                    }}>
                      {saved[s.id] ? "✓" : hasAnyScore ? "◑" : "○"}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* RIGHT: score entry */}
          {sel && (() => {
            const [g1,g2] = avatarGrads[selRealIdx % avatarGrads.length]
            const sc = getScores(sel.id)
            const tot = totalScore(sc)
            const tier = tierInfo(tot)
            return (
              <div className="frs-right">
                {/* Student header */}
                <div className="frs-right-header">
                  <div
                    className="frs-student-avatar-lg"
                    style={{background:`linear-gradient(135deg,${g1},${g2})`}}
                  >
                  </div>
                  <div>
                    <div className="frs-student-name-lg">{sel.name}</div>
                    <div className="frs-student-roll">Roll No: {sel.rollNo}</div>
                  </div>
                  <div className="frs-total-wrap">
                    <div className="frs-total-label">Total Score</div>
                    <div>
                      <span className="frs-total-score" style={{color:tier.color}}>{tot}</span>
                      <span className="frs-total-out">/100</span>
                    </div>
                    <div>
                      <span className="frs-tier-pill" style={{background:tier.bg,color:tier.color,border:`1px solid ${tier.border}`}}>
                        {tier.label}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Metrics */}
                <div className="frs-metrics-area">
                  {METRICS.map(m => {
                    const val = sc[m.key]
                    return (
                      <div key={m.key} className="frs-metric-row">
                        <span className="frs-metric-icon">{m.icon}</span>
                        <div style={{minWidth:110}}>
                          <div className="frs-metric-label">{m.label}</div>
                          <div className="frs-metric-max">/{m.max}</div>
                        </div>
                        <div className="frs-btn-grid">
                          {m.steps.map(s => {
                            const isSel = val === s
                            return (
                              <button
                                key={s}
                                className={`frs-score-btn ${isSel?"selected":""}`}
                                style={isSel ? {background:m.color,borderColor:m.color} : {}}
                                onClick={() => setStudentScore(sel.id, m.key, s)}
                              >
                                {s}
                                {isSel && <span style={{marginLeft:3,fontSize:10}}>✓</span>}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Footer */}
                <div className="frs-footer">
                  <div className="frs-autosave-note">
                    <span style={{fontSize:16}}>ℹ️</span>
                    Scores are saved automatically as you select.
                  </div>
                  <div className="frs-footer-btns">
                    <button className="frs-btn-nav" onClick={goPrev} disabled={selectedIdx === 0}>
                      ← Previous Student
                    </button>
                    <button
                      className="frs-btn-save"
                      onClick={() => handleSave(true)}
                      disabled={saving}
                    >
                      {saving ? "Saving…" : `Submit ${sel.name.split(" ")[0]}'s Score`}
                    </button>
                    <button className="frs-btn-nav" onClick={goNext} disabled={selectedIdx === filteredStudents.length - 1}>
                      Next Student →
                    </button>
                  </div>
                </div>
              </div>
            )
          })()}
        </div>
      </div>
    </>
  )
}