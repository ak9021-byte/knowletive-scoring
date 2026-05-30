"use client"
import Toast from "@/components/Toast"
import { useToast } from "@/lib/useToast"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getStudents, createStudent, deleteStudent, getLeaderboard, getStudentOfDay, submitScore, giveReward, getAllRewards, getWeeklyLeaderboard, getMonthlyLeaderboard } from "@/lib/api"

export default function FacultyPage() {
  const router = useRouter()
  const { toasts, showToast, removeToast } = useToast()
  const [tab, setTab] = useState("dashboard")
  const [students, setStudents] = useState<any[]>([])
  const [leaderboard, setLeaderboard] = useState<any[]>([])
  const [rewards, setRewards] = useState<any[]>([])
  const [studentOfDay, setStudentOfDay] = useState<any>(null)
  const [newName, setNewName] = useState("")
  const [newEmail, setNewEmail] = useState("")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [rewardForm, setRewardForm] = useState({ student_id:"", type:"daily", title:"" })
  const [suggestion, setSuggestion] = useState("")
  const [suggestionStudentId, setSuggestionStudentId] = useState("")
  const [dashPeriod, setDashPeriod] = useState<"daily"|"weekly"|"monthly">("daily")
  const [scorePeriod, setScorePeriod] = useState<"daily"|"weekly"|"monthly">("daily")
  const [periodLeaderboard, setPeriodLeaderboard] = useState<any[]>([])
  const [scoreForm, setScoreForm] = useState({
    student_id:"", date:new Date().toISOString().split("T")[0],
    attendance:0, speak_up:0, activity:0, technical:0, behavior:0, initiative:0
  })

  useEffect(() => {
    if (!localStorage.getItem("faculty_auth")) { router.push("/login"); return }
    fetchAll()
  }, [])

  const fetchAll = async () => {
    try {
      const [s,l,r] = await Promise.all([getStudents(), getLeaderboard(), getAllRewards()])
      setStudents(s.data); setLeaderboard(l.data); setPeriodLeaderboard(l.data); setRewards(r.data)
    } catch {}
    try { const sod = await getStudentOfDay(); setStudentOfDay(sod.data) } catch {}
  }

  const fetchLeaderboard = async (period: "daily"|"weekly"|"monthly") => {
    try {
      let res
      if (period === "daily") res = await getLeaderboard()
      else if (period === "weekly") res = await getWeeklyLeaderboard()
      else res = await getMonthlyLeaderboard()
      setPeriodLeaderboard(res.data)
    } catch { setPeriodLeaderboard([]) }
  }

  const handlePeriodChange = (period: "daily"|"weekly"|"monthly", isPeriod: "dash"|"score") => {
    if (isPeriod === "dash") {
      setDashPeriod(period)
      fetchLeaderboard(period)
    } else {
      setScorePeriod(period)
      fetchLeaderboard(period)
    }
  }

  const handleAddStudent = async () => {
    if (!newName || !newEmail) return showToast("Please fill in all fields!", "warning")
    try {
      await createStudent({ name:newName, email:newEmail })
      setNewName(""); setNewEmail("")
      fetchAll()
      showToast(`${newName} added successfully!`, "success")
    } catch { showToast("Error adding student. Email may already exist!", "error") }
  }

  const handleGiveReward = async () => {
    if (!rewardForm.student_id || !rewardForm.title) return showToast("Please fill in all fields!", "warning")
    try {
      await giveReward({ ...rewardForm, student_id:Number(rewardForm.student_id) })
      setRewardForm({ student_id:"", type:"daily", title:"" })
      fetchAll()
      showToast("Award given successfully! 🏅", "success")
    } catch { showToast("Error giving award!", "error") }
  }

  const handleSubmitSuggestion = async () => {
    if (!suggestionStudentId || !suggestion) return showToast("Please fill in all fields!", "warning")
    try {
      await submitScore({
        student_id:Number(suggestionStudentId),
        date:new Date().toISOString().split("T")[0],
        attendance:0, speak_up:0, activity:0,
        technical:0, behavior:0, initiative:0,
        total:0, suggestion
      })
      setSuggestion(""); setSuggestionStudentId("")
      showToast("Feedback sent successfully! 💬", "success")
    } catch { showToast("Error sending feedback!", "error") }
  }

  const scoreMax: any = {
    attendance:10, speak_up:15,
    activity:20, technical:30,
    behavior:10, initiative:15
  }

  const labels: any = {
    attendance:{ label:"Attendance", icon:"🟢", max:10, color:"#10b981", bg:"#ecfdf5", border:"#bbf7d0" },
    speak_up:{ label:"Speak Up", icon:"🎤", max:15, color:"#8b5cf6", bg:"#f5f3ff", border:"#ddd6fe" },
    activity:{ label:"Activity", icon:"⚡", max:20, color:"#f59e0b", bg:"#fffbeb", border:"#fde68a" },
    technical:{ label:"Technical", icon:"💻", max:30, color:"#3b82f6", bg:"#eff6ff", border:"#bfdbfe" },
    behavior:{ label:"Behavior", icon:"🤝", max:10, color:"#ec4899", bg:"#fdf2f8", border:"#fbcfe8" },
    initiative:{ label:"Initiative", icon:"🚀", max:15, color:"#6366f1", bg:"#eef2ff", border:"#c7d2fe" },
  }

  const total = Object.keys(scoreMax).reduce((sum,k) => sum+Number((scoreForm as any)[k]), 0)

  const handleSubmitScore = async () => {
    if (!scoreForm.student_id) return showToast("Please select a student!", "warning")
    try {
      await submitScore({ ...scoreForm, student_id:Number(scoreForm.student_id), total })
      fetchAll()
      showToast("Score submitted successfully! 🚀", "success")
      setScoreForm({
        student_id:"", date:new Date().toISOString().split("T")[0],
        attendance:0, speak_up:0, activity:0, technical:0, behavior:0, initiative:0
      })
    } catch (err:any) {
      const msg = err?.response?.data?.detail || "Error submitting score!"
      if (msg.includes("already submitted")) {
        showToast("⚠️ Score already submitted for this student today!", "error")
      } else {
        showToast(msg, "error")
      }
    }
  }

  const tabs = [
    { id:"dashboard", icon:"🏠", label:"Dashboard" },
    { id:"score", icon:"📝", label:"Score Entry" },
    { id:"students", icon:"👥", label:"Students" },
    { id:"leaderboard", icon:"🏆", label:"Leaderboard" },
    { id:"rewards", icon:"🎖️", label:"Rewards" },
  ]

  const avgScore = periodLeaderboard.length>0 ? Math.round(periodLeaderboard.reduce((a,b)=>a+b.total,0)/periodLeaderboard.length) : 0

  const tierInfo = (t:number) => t>=90
    ? { label:"🔮 Pro", color:"#7c3aed", bg:"#f5f3ff", border:"#ddd6fe" }
    : t>=75
    ? { label:"💎 Skilled", color:"#2563eb", bg:"#eff6ff", border:"#bfdbfe" }
    : t>=50
    ? { label:"🌟 Learner", color:"#d97706", bg:"#fffbeb", border:"#fde68a" }
    : { label:"🌱 Beginner", color:"#dc2626", bg:"#fef2f2", border:"#fecaca" }

  const avatarColors = [
    ["#667eea","#764ba2"],["#f093fb","#f5576c"],["#4facfe","#00f2fe"],
    ["#43e97b","#38f9d7"],["#fa709a","#fee140"],["#30cfd0","#667eea"],
    ["#a18cd1","#fbc2eb"],["#ffecd2","#fcb69f"],
  ]

  const rankEmoji = (i:number) => i===0?"🥇":i===1?"🥈":i===2?"🥉":`#${i+1}`

  const PeriodSelector = ({ active, onChange }: { active: string, onChange: (p: "daily"|"weekly"|"monthly") => void }) => (
    <div style={{ display:"flex", gap:6, background:"#f1f5f9", padding:4, borderRadius:12, width:"fit-content", marginBottom:24 }}>
      {([
        { key:"daily", label:"📅 Today" },
        { key:"weekly", label:"📆 This Week" },
        { key:"monthly", label:"🗓️ This Month" },
      ] as const).map(p => (
        <button key={p.key} onClick={() => onChange(p.key)}
          style={{
            padding:"8px 18px", borderRadius:9, border:"none", cursor:"pointer",
            fontWeight:700, fontSize:13, fontFamily:"'Plus Jakarta Sans',sans-serif",
            transition:"all 0.2s",
            background: active===p.key ? "#fff" : "transparent",
            color: active===p.key ? "#5b5ef4" : "#94a3b8",
            boxShadow: active===p.key ? "0 2px 8px rgba(0,0,0,0.1)" : "none"
          }}>
          {p.label}
        </button>
      ))}
    </div>
  )

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        :root {
          --font:'Plus Jakarta Sans',sans-serif;
          --bg:#f8f9fe; --white:#ffffff;
          --border:#e5e9f5; --border-dark:#d1d9ee;
          --text:#0f172a; --muted:#64748b; --faint:#94a3b8;
          --accent:#5b5ef4; --accent-light:#eef0ff;
          --radius:16px; --radius-sm:10px;
          --shadow:0 1px 3px rgba(0,0,0,0.06),0 4px 16px rgba(0,0,0,0.04);
          --shadow-md:0 4px 24px rgba(0,0,0,0.08),0 1px 4px rgba(0,0,0,0.04);
        }
        body { font-family:var(--font); background:var(--bg); color:var(--text); }
        .layout { display:flex; min-height:100vh; }
        .sidebar {
          width:256px; min-height:100vh; flex-shrink:0;
          background:var(--white); border-right:1px solid var(--border);
          display:flex; flex-direction:column; position:sticky; top:0; height:100vh;
          box-shadow:2px 0 12px rgba(91,94,244,0.04);
        }
        .brand-zone { padding:24px 20px 18px; border-bottom:1px solid var(--border); background:linear-gradient(135deg,#f8f7ff 0%,#ffffff 100%); }
        .brand-logo { height:42px; width:auto; object-fit:contain; }
        .brand-tag { font-size:10px; letter-spacing:2px; color:var(--faint); text-transform:uppercase; margin-top:6px; font-weight:600; }
        .nav-area { padding:16px 12px; flex:1; display:flex; flex-direction:column; gap:3px; }
        .nav-label { font-size:10px; letter-spacing:1.5px; text-transform:uppercase; color:var(--faint); font-weight:700; padding:0 10px; margin:8px 0 6px; }
        .nav-item { display:flex; align-items:center; gap:10px; padding:11px 14px; border-radius:var(--radius-sm); border:1px solid transparent; cursor:pointer; font-size:13.5px; font-weight:600; transition:all 0.18s; color:var(--muted); background:none; font-family:var(--font); text-align:left; width:100%; }
        .nav-item:hover { color:var(--text); background:#f8f9fe; border-color:var(--border); }
        .nav-item.active { color:var(--accent); background:var(--accent-light); border-color:rgba(91,94,244,0.18); }
        .nav-emoji { font-size:17px; }
        .nav-dot { margin-left:auto; width:6px; height:6px; border-radius:50%; background:var(--accent); }
        .sidebar-footer { padding:14px 12px; border-top:1px solid var(--border); }
        .faculty-badge { display:flex; align-items:center; gap:10px; padding:12px 14px; background:#f8f9fe; border-radius:var(--radius-sm); border:1px solid var(--border); margin-bottom:10px; }
        .faculty-avatar { width:36px; height:36px; border-radius:10px; background:linear-gradient(135deg,var(--accent),#818cf8); display:flex; align-items:center; justify-content:center; font-size:14px; font-weight:800; color:#fff; flex-shrink:0; }
        .faculty-name { font-size:13px; font-weight:700; color:var(--text); }
        .faculty-role { font-size:11px; color:var(--muted); margin-top:1px; }
        .logout-btn { width:100%; padding:10px; border-radius:var(--radius-sm); border:1px solid #fecaca; background:#fff5f5; color:#dc2626; cursor:pointer; font-size:13px; font-weight:600; font-family:var(--font); transition:all 0.2s; }
        .logout-btn:hover { background:#fee2e2; border-color:#fca5a5; }
        .main { flex:1; padding:36px 44px; overflow-y:auto; }
        .page-header { margin-bottom:28px; }
        .page-title { font-size:26px; font-weight:800; color:var(--text); }
        .page-sub { font-size:14px; color:var(--muted); margin-top:5px; }
        .card { background:var(--white); border:1px solid var(--border); border-radius:var(--radius); padding:24px; box-shadow:var(--shadow); }
        .stats-row { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; margin-bottom:24px; }
        .stat-card { background:var(--white); border:1px solid var(--border); border-radius:var(--radius); padding:22px 24px; box-shadow:var(--shadow); position:relative; overflow:hidden; transition:all 0.2s; }
        .stat-card:hover { box-shadow:var(--shadow-md); transform:translateY(-2px); }
        .stat-card-accent { position:absolute; top:0; left:0; right:0; height:3px; border-radius:var(--radius) var(--radius) 0 0; }
        .stat-icon { width:44px; height:44px; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:22px; margin-bottom:14px; }
        .stat-value { font-size:36px; font-weight:800; line-height:1; }
        .stat-label { font-size:13px; color:var(--muted); margin-top:5px; font-weight:500; }
        .sod-card { background:linear-gradient(135deg,#fffbeb,#fef9c3); border:1px solid #fde68a; border-radius:var(--radius); padding:22px 28px; margin-bottom:20px; display:flex; align-items:center; gap:20px; box-shadow:0 4px 20px rgba(245,158,11,0.12); }
        .sod-icon { font-size:44px; }
        .sod-tag { font-size:10px; letter-spacing:2px; text-transform:uppercase; color:#b45309; font-weight:700; }
        .sod-name { font-size:22px; font-weight:800; color:#92400e; margin-top:2px; }
        .sod-score { font-size:13px; color:#b45309; margin-top:3px; }
        .sec-label { font-size:11px; letter-spacing:1.5px; text-transform:uppercase; color:var(--faint); font-weight:700; margin-bottom:14px; padding-bottom:12px; border-bottom:1px solid var(--border); }
        .lb-row { display:flex; align-items:center; gap:14px; padding:15px 18px; border-radius:12px; border:1px solid var(--border); background:var(--white); margin-bottom:8px; transition:all 0.2s; box-shadow:var(--shadow); }
        .lb-row:hover { transform:translateX(3px); box-shadow:var(--shadow-md); }
        .lb-rank { font-size:22px; width:36px; text-align:center; }
        .lb-name { flex:1; font-size:15px; font-weight:600; }
        .lb-bar-wrap { flex:1; height:6px; background:#f1f5f9; border-radius:3px; overflow:hidden; max-width:100px; }
        .lb-bar { height:100%; border-radius:3px; transition:width 0.6s ease; }
        .lb-score { font-size:24px; font-weight:800; }
        .lb-denom { font-size:11px; color:var(--faint); }
        .tier-pill { padding:4px 12px; border-radius:20px; font-size:11px; font-weight:700; white-space:nowrap; }
        .field-label { font-size:11px; letter-spacing:1px; text-transform:uppercase; color:var(--muted); font-weight:700; margin-bottom:7px; display:block; }
        .f-input { width:100%; background:var(--white); border:1.5px solid var(--border); border-radius:var(--radius-sm); padding:12px 14px; color:var(--text); font-size:14px; outline:none; transition:all 0.2s; font-family:var(--font); }
        .f-input::placeholder { color:var(--faint); }
        .f-input:focus { border-color:var(--accent); box-shadow:0 0 0 3px rgba(91,94,244,0.1); }
        select.f-input option { background:#fff; color:var(--text); }
        .f-textarea { width:100%; background:var(--white); border:1.5px solid var(--border); border-radius:var(--radius-sm); padding:12px 14px; color:var(--text); font-size:14px; outline:none; transition:all 0.2s; font-family:var(--font); resize:vertical; line-height:1.65; }
        .f-textarea::placeholder { color:var(--faint); }
        .f-textarea:focus { border-color:var(--accent); box-shadow:0 0 0 3px rgba(91,94,244,0.1); }
        .score-metric { display:flex; align-items:center; gap:14px; padding:14px 18px; border-radius:12px; border:1.5px solid var(--border); background:var(--white); transition:all 0.2s; }
        .score-metric:hover { border-color:var(--border-dark); box-shadow:var(--shadow); }
        .metric-icon { font-size:24px; }
        .metric-name { font-size:14px; font-weight:600; color:var(--text); }
        .metric-max { font-size:11px; color:var(--faint); margin-top:1px; }
        .total-box { display:flex; align-items:center; justify-content:space-between; padding:20px 24px; border-radius:var(--radius-sm); border:1.5px solid var(--border); background:#fafbff; margin-bottom:18px; }
        .total-num { font-size:52px; font-weight:800; line-height:1; }
        .total-out { font-size:18px; color:var(--faint); font-weight:500; }
        .btn-primary { width:100%; padding:14px; border-radius:var(--radius-sm); border:none; cursor:pointer; font-weight:700; font-size:14px; background:linear-gradient(135deg,#5b5ef4,#818cf8); color:#fff; font-family:var(--font); transition:all 0.2s; box-shadow:0 4px 16px rgba(91,94,244,0.3); }
        .btn-primary:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(91,94,244,0.4); }
        .btn-gold { width:100%; padding:13px; border-radius:var(--radius-sm); border:none; cursor:pointer; font-weight:700; font-size:14px; background:linear-gradient(135deg,#f59e0b,#fbbf24); color:#78350f; font-family:var(--font); transition:all 0.2s; box-shadow:0 4px 16px rgba(245,158,11,0.25); }
        .btn-gold:hover { transform:translateY(-1px); box-shadow:0 8px 20px rgba(245,158,11,0.4); }
        .btn-add { padding:12px 20px; border-radius:var(--radius-sm); border:1.5px solid var(--accent); background:var(--accent-light); color:var(--accent); cursor:pointer; font-size:13px; font-weight:700; font-family:var(--font); white-space:nowrap; transition:all 0.2s; }
        .btn-add:hover { background:var(--accent); color:#fff; }
        .btn-del { background:#fff5f5; border:1px solid #fecaca; color:#dc2626; border-radius:8px; padding:8px 14px; cursor:pointer; font-size:13px; font-weight:600; font-family:var(--font); transition:all 0.2s; }
        .btn-del:hover { background:#fee2e2; }
        .student-card { background:var(--white); border:1px solid var(--border); border-radius:var(--radius); padding:18px 20px; display:flex; align-items:center; justify-content:space-between; box-shadow:var(--shadow); transition:all 0.2s; }
        .student-card:hover { box-shadow:var(--shadow-md); transform:translateY(-2px); }
        .s-avatar { width:46px; height:46px; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:18px; font-weight:800; color:#fff; flex-shrink:0; }
        .s-name { font-size:14px; font-weight:700; color:var(--text); }
        .s-email { font-size:12px; color:var(--muted); margin-top:2px; }
        .reward-row { display:flex; align-items:center; gap:14px; padding:13px 16px; border-radius:10px; background:var(--white); border:1px solid var(--border); margin-bottom:8px; transition:all 0.2s; }
        .reward-row:hover { border-color:var(--border-dark); box-shadow:var(--shadow); }
        .mobile-bar { display:none; }
        .sidebar-visible { display:flex; }
        @media(max-width:768px){
          .sidebar-visible { display:none; }
          .mobile-bar { display:flex; position:fixed; top:0; left:0; right:0; z-index:50; background:rgba(255,255,255,0.95); backdrop-filter:blur(16px); border-bottom:1px solid var(--border); padding:14px 20px; align-items:center; justify-content:space-between; }
          .main { padding:16px 20px; padding-top:72px; }
          .stats-row { grid-template-columns:1fr 1fr; }
          .two-col { grid-template-columns:1fr!important; }
          .score-metric { flex-wrap:wrap; }
        }
        @keyframes fadeUp { from { opacity:0; transform:translateY(14px) } to { opacity:1; transform:translateY(0) } }
        .fu { animation:fadeUp 0.4s ease forwards; }
        .fu1 { animation-delay:0.05s; opacity:0; }
        .fu2 { animation-delay:0.1s; opacity:0; }
        .fu3 { animation-delay:0.15s; opacity:0; }
      `}</style>

      <Toast toasts={toasts} removeToast={removeToast} />

      <div className="layout">

        {/* SIDEBAR */}
        <aside className="sidebar sidebar-visible">
          <div className="brand-zone">
            <img src="/logo.png" alt="Knowletive" className="brand-logo" />
            <div className="brand-tag">Faculty Portal</div>
          </div>
          <nav className="nav-area">
            <div className="nav-label">Navigation</div>
            {tabs.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} className={`nav-item ${tab===t.id?"active":""}`}>
                <span className="nav-emoji">{t.icon}</span>
                {t.label}
                {tab===t.id && <span className="nav-dot" />}
              </button>
            ))}
          </nav>
          <div className="sidebar-footer">
            <div className="faculty-badge">
              <div className="faculty-avatar">AF</div>
              <div>
                <div className="faculty-name">Admin Faculty</div>
                <div className="faculty-role">Instructor</div>
              </div>
            </div>
            <button className="logout-btn" onClick={() => { localStorage.removeItem("faculty_auth"); router.push("/login") }}>
              🚪 Sign out
            </button>
          </div>
        </aside>

        {/* MOBILE HEADER */}
        <div className="mobile-bar">
          <img src="/logo.png" alt="Knowletive" style={{ height:32, objectFit:"contain" }} />
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background:"#f1f5f9", border:"1px solid var(--border)", borderRadius:8, padding:"8px 12px", cursor:"pointer", fontSize:18 }}>☰</button>
        </div>

        {/* MOBILE DRAWER */}
        {sidebarOpen && (
          <div style={{ position:"fixed", inset:0, zIndex:100, background:"rgba(0,0,0,0.4)", display:"flex" }} onClick={() => setSidebarOpen(false)}>
            <div style={{ width:264, background:"#fff", height:"100%", padding:"80px 12px 24px", boxShadow:"4px 0 24px rgba(0,0,0,0.12)" }} onClick={e => e.stopPropagation()}>
              {tabs.map(t => (
                <button key={t.id} onClick={() => { setTab(t.id); setSidebarOpen(false) }} className={`nav-item ${tab===t.id?"active":""}`} style={{ marginBottom:3 }}>
                  <span className="nav-emoji">{t.icon}</span>{t.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <main className="main">

          {/* ── DASHBOARD ── */}
          {tab==="dashboard" && (
            <div style={{ maxWidth:880 }}>
              <div className="page-header fu">
                <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
                  <div>
                    <h1 className="page-title">Good day! 👋</h1>
                    <p className="page-sub">Here's your students' performance overview</p>
                  </div>
                  <div style={{ background:"#eef0ff", border:"1px solid #c7d2fe", borderRadius:10, padding:"8px 16px", fontSize:12, fontWeight:600, color:"#4338ca" }}>
                    📅 {new Date().toLocaleDateString("en-US",{ weekday:"short", month:"short", day:"numeric" })}
                  </div>
                </div>
              </div>

              {/* Period Selector */}
              <PeriodSelector active={dashPeriod} onChange={(p) => handlePeriodChange(p, "dash")} />

              {studentOfDay && dashPeriod === "daily" && (
                <div className="sod-card fu fu1">
                  <span className="sod-icon">⭐</span>
                  <div>
                    <div className="sod-tag">✨ Student of the Day</div>
                    <div className="sod-name">{studentOfDay.student_of_the_day}</div>
                    <div className="sod-score">🎯 Score: <strong>{studentOfDay.score}</strong> / 100</div>
                  </div>
                  <div style={{ marginLeft:"auto", textAlign:"right" }}>
                    <div style={{ fontSize:48, fontWeight:800, color:"#d97706", lineHeight:1 }}>{studentOfDay.score}</div>
                    <div style={{ fontSize:12, color:"#b45309", fontWeight:600 }}>out of 100</div>
                  </div>
                </div>
              )}

              <div className="stats-row fu fu2">
                {[
                  { label:"Total Students", value:students.length, icon:"👥", accent:"#6366f1", iconBg:"#eef0ff" },
                  { label: dashPeriod==="daily"?"Scored Today":dashPeriod==="weekly"?"Scored This Week":"Scored This Month", value:periodLeaderboard.length, icon:"✅", accent:"#10b981", iconBg:"#ecfdf5" },
                  { label:"Average Score", value:avgScore, icon:"📊", accent:"#f59e0b", iconBg:"#fffbeb" },
                ].map(s => (
                  <div key={s.label} className="stat-card">
                    <div className="stat-card-accent" style={{ background:s.accent }} />
                    <div className="stat-icon" style={{ background:s.iconBg }}>{s.icon}</div>
                    <div className="stat-value" style={{ color:s.accent }}>{s.value}</div>
                    <div className="stat-label">{s.label}</div>
                  </div>
                ))}
              </div>

              {periodLeaderboard.length > 0 && (
                <div className="card fu fu3">
                  <div className="sec-label">
                    🏆 {dashPeriod==="daily"?"Today's":"dashPeriod==="weekly"?"This Week's":"This Month's"} Top Performers
                  </div>
                  {periodLeaderboard.slice(0,5).map((e,i) => {
                    const t = tierInfo(e.total)
                    return (
                      <div key={i} className="lb-row" style={{ background:i===0?"linear-gradient(135deg,#fffbeb,#fef9c3)":"#fff", borderColor:i===0?"#fde68a":"var(--border)" }}>
                        <span className="lb-rank">{rankEmoji(i)}</span>
                        <span className="lb-name">{e.name}</span>
                        <div className="lb-bar-wrap">
                          <div className="lb-bar" style={{ width:`${Math.min(e.total, 100)}%`, background:t.color }} />
                        </div>
                        <div style={{ textAlign:"right" }}>
                          <span className="lb-score" style={{ color:t.color }}>{e.total}</span>
                          <span className="lb-denom">/100</span>
                        </div>
                        <span className="tier-pill" style={{ background:t.bg, color:t.color, border:`1px solid ${t.border}` }}>{t.label}</span>
                      </div>
                    )
                  })}
                </div>
              )}

              {periodLeaderboard.length === 0 && (
                <div className="card fu fu3" style={{ textAlign:"center", padding:"48px 24px" }}>
                  <div style={{ fontSize:48, marginBottom:12 }}>📭</div>
                  <p style={{ color:"var(--muted)", fontSize:15 }}>
                    No scores for {dashPeriod==="daily"?"today":dashPeriod==="weekly"?"this week":"this month"} yet
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ── SCORE ENTRY ── */}
          {tab==="score" && (
            <div style={{ maxWidth:680 }}>
              <div className="page-header fu">
                <h1 className="page-title">📝 Score Entry</h1>
                <p className="page-sub">Record daily student performance metrics</p>
              </div>

              {/* Period Selector */}
              <PeriodSelector active={scorePeriod} onChange={(p) => handlePeriodChange(p, "score")} />

              {/* Daily Score Entry Form */}
              {scorePeriod === "daily" && (
                <div className="card fu fu1">
                  <div className="sec-label">👤 Student & date</div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:28 }}>
                    <div>
                      <label className="field-label">Student</label>
                      <select className="f-input" value={scoreForm.student_id} onChange={e => setScoreForm({...scoreForm,student_id:e.target.value})}>
                        <option value="">— Select student —</option>
                        {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="field-label">Date</label>
                      <input className="f-input" type="date" value={scoreForm.date} onChange={e => setScoreForm({...scoreForm,date:e.target.value})} />
                    </div>
                  </div>

                  <div className="sec-label">⚡ Performance metrics</div>
                  <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:28 }}>
                    {Object.keys(scoreMax).map(key => {
                      const m = labels[key]
                      const val = (scoreForm as any)[key]
                      const pct = Math.round((val / scoreMax[key]) * 100)
                      return (
                        <div key={key} className="score-metric" style={{ borderColor:val>0?m.border:"var(--border)", background:val>0?m.bg:"#fff" }}>
                          <span className="metric-icon">{m.icon}</span>
                          <div style={{ minWidth:110 }}>
                            <div className="metric-name">{m.label}</div>
                            <div className="metric-max">max {m.max} pts</div>
                          </div>
                          <div style={{ display:"flex", alignItems:"center", gap:10, marginLeft:"auto" }}>
                            <div style={{ width:80, height:6, background:"#f1f5f9", borderRadius:99, overflow:"hidden" }}>
                              <div style={{ height:"100%", width:`${pct}%`, background:m.color, borderRadius:99, transition:"width 0.3s" }} />
                            </div>
                            <input
                              type="number" min={0} max={m.max} value={val}
                              onChange={e => {
                                let v = parseInt(e.target.value) || 0
                                if (v < 0) v = 0
                                if (v > m.max) v = m.max
                                setScoreForm({...scoreForm, [key]: v})
                              }}
                              style={{ width:64, padding:"8px 10px", borderRadius:8, border:`1.5px solid ${val>0?m.color:"var(--border)"}`, background:val>0?m.bg:"#fff", color:m.color, fontWeight:800, fontSize:16, textAlign:"center", outline:"none", fontFamily:"'Plus Jakarta Sans',sans-serif", transition:"all 0.2s" }}
                            />
                            <span style={{ fontSize:12, color:"var(--faint)", minWidth:40 }}>/ {m.max}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <div className="total-box">
                    <div>
                      <div style={{ fontSize:11, letterSpacing:"1px", textTransform:"uppercase", color:"var(--faint)", fontWeight:700, marginBottom:4 }}>Total Score</div>
                      <span className="total-num" style={{ color:tierInfo(total).color }}>{total}</span>
                      <span className="total-out">/100</span>
                    </div>
                    <span className="tier-pill" style={{ background:tierInfo(total).bg, color:tierInfo(total).color, border:`1px solid ${tierInfo(total).border}`, fontSize:14, padding:"6px 16px" }}>
                      {tierInfo(total).label}
                    </span>
                  </div>
                  <button className="btn-primary" onClick={handleSubmitScore}>Submit Score 🚀</button>
                </div>
              )}

              {/* Weekly / Monthly View */}
              {(scorePeriod === "weekly" || scorePeriod === "monthly") && (
                <div className="card fu fu1">
                  <div className="sec-label">
                    {scorePeriod==="weekly" ? "📆 This Week's Performance" : "🗓️ This Month's Performance"}
                  </div>
                  {periodLeaderboard.length === 0 ? (
                    <div style={{ textAlign:"center", padding:"48px 24px" }}>
                      <div style={{ fontSize:48, marginBottom:12 }}>📭</div>
                      <p style={{ color:"var(--muted)", fontSize:15 }}>
                        No scores for {scorePeriod==="weekly"?"this week":"this month"} yet
                      </p>
                    </div>
                  ) : (
                    periodLeaderboard.map((e:any, i:number) => {
                      const t = tierInfo(e.total)
                      return (
                        <div key={i} className="lb-row" style={{ background:i===0?"linear-gradient(135deg,#fffbeb,#fef9c3)":"#fff", borderColor:i===0?"#fde68a":"var(--border)" }}>
                          <span className="lb-rank">{rankEmoji(i)}</span>
                          <span className="lb-name">{e.name}</span>
                          <div className="lb-bar-wrap">
                            <div className="lb-bar" style={{ width:`${Math.min((e.total/700)*100, 100)}%`, background:t.color }} />
                          </div>
                          <div style={{ textAlign:"right" }}>
                            <span className="lb-score" style={{ color:t.color, fontSize:20 }}>{e.total}</span>
                            <div style={{ fontSize:11, color:"var(--faint)" }}>total pts</div>
                          </div>
                          <span className="tier-pill" style={{ background:t.bg, color:t.color, border:`1px solid ${t.border}` }}>{t.label}</span>
                        </div>
                      )
                    })
                  )}
                </div>
              )}
            </div>
          )}

          {/* STUDENTS */}
          {tab==="students" && (
            <div style={{ maxWidth:820 }}>
              <div className="page-header fu">
                <h1 className="page-title">👥 Students</h1>
                <p className="page-sub">Manage your student roster</p>
              </div>
              <div className="card fu fu1" style={{ marginBottom:24 }}>
                <div className="sec-label">➕ Add new student</div>
                <div style={{ display:"flex", gap:12, flexWrap:"wrap" as const }}>
                  <input className="f-input" placeholder="Full name" value={newName} onChange={e=>setNewName(e.target.value)} style={{ flex:1, minWidth:150 }} />
                  <input className="f-input" placeholder="Email address" value={newEmail} onChange={e=>setNewEmail(e.target.value)} style={{ flex:1, minWidth:150 }} />
                  <button className="btn-add" onClick={handleAddStudent}>+ Add Student</button>
                </div>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(340px,1fr))", gap:14 }}>
                {students.map((s,i) => {
                  const [g1,g2] = avatarColors[i % avatarColors.length]
                  const t = tierInfo(s.level==="Pro"?90:s.level==="Skilled"?75:s.level==="Learner"?50:0)
                  return (
                    <div key={s.id} className="student-card fu" style={{ animationDelay:`${i*0.04}s`, opacity:0 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:14 }}>
                        <div className="s-avatar" style={{ background:`linear-gradient(135deg,${g1},${g2})` }}>
                          {s.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="s-name">{s.name}</div>
                          <div className="s-email">{s.email}</div>
                          <span className="tier-pill" style={{ background:t.bg, color:t.color, border:`1px solid ${t.border}`, fontSize:11, marginTop:6, display:"inline-block" }}>
                            {t.label}
                          </span>
                        </div>
                      </div>
                      <button className="btn-del" onClick={() => deleteStudent(s.id).then(fetchAll)}>🗑 Remove</button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* LEADERBOARD */}
          {tab==="leaderboard" && (
            <div style={{ maxWidth:700 }}>
              <div className="page-header fu">
                <h1 className="page-title">🏆 Leaderboard</h1>
                <p className="page-sub">Student rankings by period</p>
              </div>

              <PeriodSelector active={dashPeriod} onChange={(p) => handlePeriodChange(p, "dash")} />

              {periodLeaderboard.length===0 ? (
                <div className="card fu fu1" style={{ textAlign:"center", padding:"60px 24px" }}>
                  <div style={{ fontSize:52, marginBottom:14 }}>📭</div>
                  <p style={{ color:"var(--muted)", fontSize:16 }}>No scores yet for this period</p>
                </div>
              ) : (
                <div className="fu fu1">
                  {periodLeaderboard.map((e,i) => {
                    const t = tierInfo(e.total)
                    return (
                      <div key={i} className="lb-row" style={{ padding:"18px 22px", borderRadius:"var(--radius)", marginBottom:12, background:i===0?"linear-gradient(135deg,#fffde7,#fffbeb)":"var(--white)", borderColor:i===0?"#fcd34d":i===1?"#e2e8f0":i===2?"#fed7aa":"var(--border)", borderWidth:i<3?"1.5px":"1px" }}>
                        <span style={{ fontSize:28, width:40, textAlign:"center" }}>{rankEmoji(i)}</span>
                        <div style={{ flex:1 }}>
                          <div style={{ fontSize:16, fontWeight:700 }}>{e.name}</div>
                          <div style={{ fontSize:12, color:"var(--muted)", marginTop:2 }}>Rank #{i+1}</div>
                        </div>
                        <div className="lb-bar-wrap" style={{ maxWidth:120 }}>
                          <div className="lb-bar" style={{ width:`${Math.min(e.total, 100)}%`, background:t.color }} />
                        </div>
                        <div style={{ textAlign:"right" }}>
                          <span className="lb-score" style={{ color:t.color }}>{e.total}</span>
                          <span className="lb-denom">/100</span>
                        </div>
                        <span className="tier-pill" style={{ background:t.bg, color:t.color, border:`1px solid ${t.border}` }}>{t.label}</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* REWARDS */}
          {tab==="rewards" && (
            <div style={{ maxWidth:880 }}>
              <div className="page-header fu">
                <h1 className="page-title">🎖️ Rewards & Feedback</h1>
                <p className="page-sub">Recognise achievements and guide student growth</p>
              </div>
              <div className="two-col fu fu1" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, marginBottom:24 }}>
                <div className="card">
                  <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
                    <div style={{ width:44, height:44, borderRadius:12, background:"#fffbeb", border:"1px solid #fde68a", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22 }}>🏅</div>
                    <div>
                      <div style={{ fontWeight:700, fontSize:16 }}>Give Award</div>
                      <div style={{ fontSize:12, color:"var(--muted)", marginTop:1 }}>Recognise student achievement</div>
                    </div>
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                    <div>
                      <label className="field-label">Student</label>
                      <select className="f-input" value={rewardForm.student_id} onChange={e => setRewardForm({...rewardForm,student_id:e.target.value})}>
                        <option value="">— Select student —</option>
                        {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="field-label">Award type</label>
                      <select className="f-input" value={rewardForm.type} onChange={e => setRewardForm({...rewardForm,type:e.target.value})}>
                        <option value="daily">🌟 Daily</option>
                        <option value="weekly">📅 Weekly</option>
                        <option value="monthly">🏆 Monthly</option>
                      </select>
                    </div>
                    <div>
                      <label className="field-label">Award title</label>
                      <select className="f-input" value={rewardForm.title} onChange={e => setRewardForm({...rewardForm,title:e.target.value})}>
                        <option value="">— Select award —</option>
                        <option value="Student of the Day">⭐ Student of the Day</option>
                        <option value="Top Performer">🥇 Top Performer</option>
                        <option value="Most Improved">📈 Most Improved</option>
                        <option value="Best Speaker">🎤 Best Speaker</option>
                        <option value="Internship Star">🌟 Internship Star</option>
                        <option value="Project Leader">👑 Project Leader</option>
                      </select>
                    </div>
                    <button className="btn-gold" onClick={handleGiveReward}>🏅 Give Award</button>
                  </div>
                </div>
                <div className="card">
                  <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
                    <div style={{ width:44, height:44, borderRadius:12, background:"#eef0ff", border:"1px solid #c7d2fe", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22 }}>💬</div>
                    <div>
                      <div style={{ fontWeight:700, fontSize:16 }}>Personal Feedback</div>
                      <div style={{ fontSize:12, color:"var(--muted)", marginTop:1 }}>Guide students on improvement</div>
                    </div>
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                    <div>
                      <label className="field-label">Student</label>
                      <select className="f-input" value={suggestionStudentId} onChange={e => setSuggestionStudentId(e.target.value)}>
                        <option value="">— Select student —</option>
                        {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="field-label">Feedback message</label>
                      <textarea className="f-textarea" rows={5}
                        placeholder="Mention strengths + areas to improve…"
                        value={suggestion} onChange={e => setSuggestion(e.target.value)} />
                      <div style={{ fontSize:11, color:"var(--faint)", marginTop:5 }}>💡 Be specific — mention what they did well and what to work on</div>
                    </div>
                    <button className="btn-primary" onClick={handleSubmitSuggestion}>💬 Send Feedback</button>
                  </div>
                </div>
              </div>
              {rewards.length>0 && (
                <div className="card fu fu2">
                  <div className="sec-label">🕒 Recent awards</div>
                  {rewards.slice(0,10).map((r:any,i:number) => (
                    <div key={i} className="reward-row">
                      <span style={{ fontSize:22 }}>{r.type==="daily"?"⭐":r.type==="weekly"?"🏅":"🏆"}</span>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:14, fontWeight:700 }}>{r.name}</div>
                        <div style={{ fontSize:12, color:"var(--muted)", marginTop:1 }}>{r.title}</div>
                      </div>
                      <div style={{ textAlign:"right" }}>
                        <span className="tier-pill" style={{ background:r.type==="daily"?"#fffbeb":r.type==="weekly"?"#eff6ff":"#f5f3ff", color:r.type==="daily"?"#d97706":r.type==="weekly"?"#2563eb":"#7c3aed", border:`1px solid ${r.type==="daily"?"#fde68a":r.type==="weekly"?"#bfdbfe":"#ddd6fe"}`, fontSize:11 }}>
                          {r.type==="daily"?"🌟 Daily":r.type==="weekly"?"📅 Weekly":"🏆 Monthly"}
                        </span>
                        <div style={{ fontSize:11, color:"var(--faint)", marginTop:4 }}>{r.date}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </main>
      </div>
    </>
  )
}