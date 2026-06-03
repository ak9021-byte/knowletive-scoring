"use client"
import { useState, useEffect, useCallback } from "react"

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

type Status = "present" | "absent" | "holiday" | ""

const TOTAL_DAYS = 90

const today = () => new Date().toISOString().split("T")[0]

const getPctColor = (pct: number) =>
  pct >= 90 ? "#059669" : pct >= 75 ? "#2563eb" : pct >= 50 ? "#d97706" : "#dc2626"

const statusStyle = (s: Status) => {
  if (s === "present") return { bg:"#ecfdf5", color:"#059669", border:"#a7f3d0", label:"P" }
  if (s === "absent")  return { bg:"#fef2f2", color:"#dc2626", border:"#fecaca", label:"A" }
  if (s === "holiday") return { bg:"#fffbeb", color:"#d97706", border:"#fde68a", label:"H" }
  return { bg:"#f8f9fe", color:"#94a3b8", border:"#e5e9f5", label:"—" }
}

const avatarColors = [
  ["#667eea","#764ba2"],["#f093fb","#f5576c"],["#4facfe","#00f2fe"],
  ["#43e97b","#38f9d7"],["#fa709a","#fee140"],["#30cfd0","#667eea"],
  ["#a18cd1","#fbc2eb"],["#ffecd2","#fcb69f"],
]

export default function AttendanceTracker() {
  const [students, setStudents] = useState<any[]>([])
  // { studentId: { "2026-05-01": "present" } }
  const [attendance, setAttendance] = useState<Record<number, Record<string, Status>>>({})
  const [selectedDate, setSelectedDate] = useState(today())
  const [view, setView] = useState<"mark" | "summary" | "detail">("mark")
  const [detailStudent, setDetailStudent] = useState<any>(null)
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<number | null>(null)
  const [saved, setSaved] = useState(false)
  const [allDates, setAllDates] = useState<string[]>([])

  // Fetch students from backend
  const fetchStudents = useCallback(async () => {
    try {
      const res = await fetch(`${API}/students/`)
      const data = await res.json()
      setStudents(data)
    } catch {}
  }, [])

  // Fetch all attendance records
  const fetchAttendance = useCallback(async () => {
    try {
      const res = await fetch(`${API}/attendance/`)
      const data: any[] = await res.json()
      const map: Record<number, Record<string, Status>> = {}
      const dates = new Set<string>()
      data.forEach(r => {
        if (!map[r.student_id]) map[r.student_id] = {}
        map[r.student_id][r.date] = r.status as Status
        dates.add(r.date)
      })
      setAttendance(map)
      setAllDates(Array.from(dates).sort())
    } catch {}
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchStudents()
    fetchAttendance()
  }, [fetchStudents, fetchAttendance])

  // Mark single student
  const markOne = async (studentId: number, status: Status) => {
    // Toggle off if same status clicked
    const current = attendance[studentId]?.[selectedDate] || ""
    const newStatus = current === status ? "" : status

    // Optimistic update
    setAttendance(prev => ({
      ...prev,
      [studentId]: { ...(prev[studentId] || {}), [selectedDate]: newStatus as Status },
    }))
    if (!allDates.includes(selectedDate)) {
      setAllDates(prev => [...prev, selectedDate].sort())
    }

    if (!newStatus) return // cleared — no API call needed for empty

    setSaving(studentId)
    try {
      await fetch(`${API}/attendance/mark`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ student_id: studentId, date: selectedDate, status: newStatus }),
      })
    } catch {}
    setSaving(null)
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  // Mark all students for selected date
  const markAll = async (status: Status) => {
    // Optimistic update
    const updated = { ...attendance }
    students.forEach(s => {
      if (!updated[s.id]) updated[s.id] = {}
      updated[s.id][selectedDate] = status
    })
    setAttendance(updated)
    if (!allDates.includes(selectedDate)) {
      setAllDates(prev => [...prev, selectedDate].sort())
    }

    // Bulk API call
    try {
      await fetch(`${API}/attendance/mark-bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: selectedDate,
          records: students.map(s => ({ student_id: s.id, date: selectedDate, status })),
        }),
      })
    } catch {}
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  // Stats per student
  const statsFor = (studentId: number) => {
    const rec = attendance[studentId] || {}
    const vals = Object.values(rec)
    const present = vals.filter(d => d === "present").length
    const absent  = vals.filter(d => d === "absent").length
    const holiday = vals.filter(d => d === "holiday").length
    const marked  = present + absent + holiday
    const pct = marked > 0 ? Math.round((present / marked) * 100) : 0
    return { present, absent, holiday, marked, pct }
  }

  const totalMarkedDays = allDates.length
  const avgPct = students.length > 0
    ? Math.round(students.reduce((sum, s) => sum + statsFor(s.id).pct, 0) / students.length)
    : 0

  const filtered = students.filter(s => s.name.toLowerCase().includes(search.toLowerCase()))
  const recent7 = allDates.slice(-7)

  if (loading) return (
    <div style={{ textAlign:"center", padding:"60px 24px", fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
      <div style={{ fontSize:36, marginBottom:12 }}>⏳</div>
      <p style={{ color:"#64748b", fontSize:15 }}>Loading attendance data...</p>
    </div>
  )

  return (
    <div style={{ fontFamily:"'Plus Jakarta Sans',sans-serif" }}>

      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12, marginBottom:24 }}>
        <p style={{ fontSize:13, color:"#64748b", marginTop:4 }}>90-day course · Data synced across all devices</p>
        <div style={{ display:"flex", gap:6, background:"#f1f5f9", padding:4, borderRadius:12 }}>
          {([["mark","📝 Mark"],["summary","📊 Summary"]] as const).map(([v,l]) => (
            <button key={v} onClick={() => { setView(v as any); setDetailStudent(null) }} style={{
              padding:"8px 16px", borderRadius:9, border:"none", cursor:"pointer",
              fontWeight:700, fontSize:13, fontFamily:"inherit",
              background: view === v ? "#fff" : "transparent",
              color: view === v ? "#5b5ef4" : "#94a3b8",
              boxShadow: view === v ? "0 2px 8px rgba(0,0,0,0.1)" : "none",
              transition:"all 0.2s",
            }}>{l}</button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14, marginBottom:20 }}>
        {[
          { label:"Total Students", value:students.length,                        icon:"👥", color:"#6366f1", bg:"#eef0ff" },
          { label:"Days Marked",    value:`${totalMarkedDays} / ${TOTAL_DAYS}`,   icon:"📅", color:"#059669", bg:"#ecfdf5" },
          { label:"Avg Attendance", value:`${avgPct}%`,                           icon:"📊", color:"#d97706", bg:"#fffbeb" },
        ].map(s => (
          <div key={s.label} style={{ background:"#fff", border:"1px solid #e5e9f5", borderRadius:16, padding:"20px 22px", boxShadow:"0 1px 3px rgba(0,0,0,0.06)", position:"relative", overflow:"hidden" }}>
            <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:s.color, borderRadius:"16px 16px 0 0" }} />
            <div style={{ width:40, height:40, borderRadius:10, background:s.bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, marginBottom:12 }}>{s.icon}</div>
            <div style={{ fontSize:30, fontWeight:800, color:s.color, lineHeight:1 }}>{s.value}</div>
            <div style={{ fontSize:13, color:"#64748b", marginTop:5, fontWeight:500 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ══ MARK VIEW ══ */}
      {view === "mark" && (
        <>
          {/* Date + bulk actions */}
          <div style={{ background:"#fff", border:"1px solid #e5e9f5", borderRadius:16, padding:20, marginBottom:16, boxShadow:"0 1px 3px rgba(0,0,0,0.06)" }}>
            <div style={{ display:"flex", alignItems:"center", flexWrap:"wrap", gap:12 }}>
              <div>
                <label style={{ fontSize:11, fontWeight:700, color:"#94a3b8", letterSpacing:"1px", textTransform:"uppercase" as const, display:"block", marginBottom:6 }}>Date</label>
                <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
                  style={{ padding:"10px 14px", border:"1.5px solid #e5e9f5", borderRadius:10, fontSize:14, fontFamily:"inherit", outline:"none", color:"#0f172a" }} />
              </div>
              {selectedDate !== today() && (
                <div style={{ padding:"8px 14px", background:"#fffbeb", border:"1px solid #fde68a", borderRadius:8, color:"#d97706", fontSize:13, fontWeight:600, alignSelf:"flex-end" }}>
                  ✏️ Editing: {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-IN", { weekday:"short", day:"numeric", month:"short" })}
                </div>
              )}
              <div style={{ flex:1 }} />
              <div>
                <label style={{ fontSize:11, fontWeight:700, color:"#94a3b8", letterSpacing:"1px", textTransform:"uppercase" as const, display:"block", marginBottom:6 }}>Mark All As</label>
                <div style={{ display:"flex", gap:8 }}>
                  {([["present","✅ All Present","#ecfdf5","#059669","#a7f3d0"],
                     ["absent", "❌ All Absent", "#fef2f2","#dc2626","#fecaca"],
                     ["holiday","🏖️ Holiday",    "#fffbeb","#d97706","#fde68a"]] as const).map(([s,l,bg,color,border]) => (
                    <button key={s} onClick={() => markAll(s as Status)} style={{
                      padding:"9px 16px", borderRadius:9, border:`1.5px solid ${border}`,
                      background:bg, color, fontWeight:700, fontSize:13,
                      fontFamily:"inherit", cursor:"pointer", whiteSpace:"nowrap" as const,
                    }}>{l}</button>
                  ))}
                </div>
              </div>
            </div>
            {saved && (
              <div style={{ marginTop:12, padding:"8px 14px", background:"#ecfdf5", border:"1px solid #a7f3d0", borderRadius:8, color:"#059669", fontSize:13, fontWeight:600 }}>
                ✅ Saved to server!
              </div>
            )}
          </div>

          {/* Search */}
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="🔍 Search student..."
            style={{ width:"100%", padding:"11px 16px", border:"1.5px solid #e5e9f5", borderRadius:10, fontSize:14, fontFamily:"inherit", outline:"none", color:"#0f172a", background:"#fff", marginBottom:12, boxSizing:"border-box" as any }} />

          {/* Student rows */}
          {students.length === 0 ? (
            <div style={{ background:"#fff", border:"1px solid #e5e9f5", borderRadius:16, padding:"60px 24px", textAlign:"center" }}>
              <div style={{ fontSize:48, marginBottom:12 }}>👥</div>
              <p style={{ color:"#64748b", fontSize:15 }}>No students found — add them in the Students section</p>
            </div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {filtered.map((student, i) => {
                const status = (attendance[student.id]?.[selectedDate] || "") as Status
                const st = statusStyle(status)
                const [g1, g2] = avatarColors[i % avatarColors.length]
                const stats = statsFor(student.id)
                const isSaving = saving === student.id
                return (
                  <div key={student.id} style={{
                    background: status ? st.bg + "55" : "#fff",
                    border:`1.5px solid ${status ? st.border : "#e5e9f5"}`,
                    borderRadius:14, padding:"14px 18px",
                    display:"flex", alignItems:"center", gap:14,
                    boxShadow:"0 1px 3px rgba(0,0,0,0.04)", transition:"all 0.2s",
                    opacity: isSaving ? 0.7 : 1,
                  }}>
                    <div style={{ width:42, height:42, borderRadius:11, background:`linear-gradient(135deg,${g1},${g2})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:15, fontWeight:800, color:"#fff", flexShrink:0 }}>
                      {student.name.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontWeight:700, fontSize:14, color:"#0f172a", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{student.name}</div>
                      <div style={{ fontSize:12, color:"#64748b", marginTop:2 }}>Present: {stats.present} · Absent: {stats.absent} · Holiday: {stats.holiday}</div>
                    </div>
                    <div style={{ display:"flex", gap:6, flexShrink:0 }}>
                      {([["present","P","#ecfdf5","#059669","#a7f3d0"],
                         ["absent", "A","#fef2f2","#dc2626","#fecaca"],
                         ["holiday","H","#fffbeb","#d97706","#fde68a"]] as const).map(([s,l,bg,color,border]) => (
                        <button key={s} onClick={() => markOne(student.id, s as Status)} disabled={isSaving} style={{
                          width:36, height:36, borderRadius:9,
                          border:`2px solid ${status === s ? color : border}`,
                          background: status === s ? color : bg,
                          color: status === s ? "#fff" : color,
                          fontWeight:800, fontSize:13, cursor:"pointer",
                          fontFamily:"inherit", transition:"all 0.15s",
                          boxShadow: status === s ? `0 2px 8px ${color}55` : "none",
                        }}>{l}</button>
                      ))}
                    </div>
                    <div style={{ textAlign:"right", minWidth:52, flexShrink:0 }}>
                      <div style={{ fontSize:20, fontWeight:800, color:getPctColor(stats.pct), lineHeight:1 }}>{stats.pct}%</div>
                      <div style={{ fontSize:10, color:"#94a3b8", marginTop:2 }}>{stats.marked} days</div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}

      {/* ══ SUMMARY VIEW ══ */}
      {view === "summary" && !detailStudent && (
        <>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="🔍 Search student..."
            style={{ width:"100%", padding:"11px 16px", border:"1.5px solid #e5e9f5", borderRadius:10, fontSize:14, fontFamily:"inherit", outline:"none", color:"#0f172a", background:"#fff", marginBottom:14, boxSizing:"border-box" as any }} />
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {filtered
              .map(s => ({ ...s, ...statsFor(s.id) }))
              .sort((a,b) => b.pct - a.pct)
              .map((s, i) => {
                const [g1,g2] = avatarColors[i % avatarColors.length]
                return (
                  <div key={s.id} onClick={() => setDetailStudent(s)}
                    style={{ background:"#fff", border:"1px solid #e5e9f5", borderRadius:14, padding:"16px 20px", display:"flex", alignItems:"center", gap:14, cursor:"pointer", boxShadow:"0 1px 3px rgba(0,0,0,0.04)", transition:"all 0.2s" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow="0 4px 16px rgba(0,0,0,0.08)"; (e.currentTarget as HTMLElement).style.transform="translateX(3px)" }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow="0 1px 3px rgba(0,0,0,0.04)"; (e.currentTarget as HTMLElement).style.transform="none" }}
                  >
                    <div style={{ width:42, height:42, borderRadius:11, background:`linear-gradient(135deg,${g1},${g2})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:15, fontWeight:800, color:"#fff", flexShrink:0 }}>
                      {s.name.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:700, fontSize:14, color:"#0f172a" }}>{s.name}</div>
                      <div style={{ fontSize:12, color:"#64748b", marginTop:2 }}>Present: {s.present} · Absent: {s.absent} · Holiday: {s.holiday}</div>
                      <div style={{ height:5, background:"#f1f5f9", borderRadius:99, overflow:"hidden", marginTop:7, maxWidth:200 }}>
                        <div style={{ height:"100%", width:`${s.pct}%`, background:getPctColor(s.pct), borderRadius:99, transition:"width 0.6s" }} />
                      </div>
                    </div>
                    <div style={{ display:"flex", gap:4 }}>
                      {recent7.map(d => {
                        const st = statusStyle((attendance[s.id]?.[d] || "") as Status)
                        return (
                          <div key={d} title={d} style={{ width:26, height:26, borderRadius:6, background:st.bg, border:`1px solid ${st.border}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:700, color:st.color }}>
                            {st.label}
                          </div>
                        )
                      })}
                    </div>
                    <div style={{ textAlign:"right", minWidth:60 }}>
                      <div style={{ fontSize:24, fontWeight:800, color:getPctColor(s.pct), lineHeight:1 }}>{s.pct}%</div>
                      <div style={{ fontSize:11, color:"#94a3b8", marginTop:2 }}>attendance</div>
                    </div>
                    <div style={{ fontSize:18, color:"#94a3b8" }}>›</div>
                  </div>
                )
              })}
          </div>
        </>
      )}

      {/* ══ DETAIL VIEW ══ */}
      {view === "summary" && detailStudent && (() => {
        const stats = statsFor(detailStudent.id)
        const rec = attendance[detailStudent.id] || {}
        return (
          <div>
            <button onClick={() => setDetailStudent(null)}
              style={{ display:"flex", alignItems:"center", gap:8, padding:"9px 16px", borderRadius:10, border:"1.5px solid #e5e9f5", background:"#fff", cursor:"pointer", fontWeight:600, fontSize:13, fontFamily:"inherit", color:"#475569", marginBottom:16 }}>
              ← Back to Summary
            </button>
            <div style={{ background:"#fff", border:"1px solid #e5e9f5", borderRadius:16, padding:24, boxShadow:"0 1px 3px rgba(0,0,0,0.06)" }}>
              <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:24, paddingBottom:20, borderBottom:"1px solid #f1f5f9" }}>
                <div style={{ width:56, height:56, borderRadius:14, background:"linear-gradient(135deg,#5b5ef4,#818cf8)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, fontWeight:800, color:"#fff" }}>
                  {detailStudent.name.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:800, fontSize:20, color:"#0f172a" }}>{detailStudent.name}</div>
                  <div style={{ fontSize:13, color:"#64748b", marginTop:3 }}>
                    Present {stats.present} · Absent {stats.absent} · Holiday {stats.holiday} · {stats.marked} days marked
                  </div>
                </div>
                <div style={{ textAlign:"center", padding:"14px 24px", borderRadius:14, background:getPctColor(stats.pct)+"18", border:`1.5px solid ${getPctColor(stats.pct)}44` }}>
                  <div style={{ fontSize:36, fontWeight:800, color:getPctColor(stats.pct), lineHeight:1 }}>{stats.pct}%</div>
                  <div style={{ fontSize:12, color:"#64748b", marginTop:4 }}>Attendance</div>
                </div>
              </div>

              <div style={{ marginBottom:24 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                  <span style={{ fontSize:13, fontWeight:600, color:"#475569" }}>Course Progress ({stats.marked}/{TOTAL_DAYS} days)</span>
                  <span style={{ fontSize:13, fontWeight:700, color:getPctColor(stats.pct) }}>{stats.pct}%</span>
                </div>
                <div style={{ height:10, background:"#f1f5f9", borderRadius:99, overflow:"hidden" }}>
                  <div style={{ height:"100%", width:`${stats.pct}%`, background:`linear-gradient(90deg,${getPctColor(stats.pct)}99,${getPctColor(stats.pct)})`, borderRadius:99, transition:"width 0.8s" }} />
                </div>
              </div>

              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:12, marginBottom:24 }}>
                {[
                  { label:"Present",  value:stats.present,              color:"#059669", bg:"#ecfdf5" },
                  { label:"Absent",   value:stats.absent,               color:"#dc2626", bg:"#fef2f2" },
                  { label:"Holiday",  value:stats.holiday,              color:"#d97706", bg:"#fffbeb" },
                  { label:"Unmarked", value:TOTAL_DAYS - stats.marked,  color:"#94a3b8", bg:"#f8f9fe" },
                ].map(s => (
                  <div key={s.label} style={{ background:s.bg, borderRadius:12, padding:"14px 16px", textAlign:"center" }}>
                    <div style={{ fontSize:28, fontWeight:800, color:s.color }}>{s.value}</div>
                    <div style={{ fontSize:12, color:"#64748b", marginTop:4, fontWeight:500 }}>{s.label}</div>
                  </div>
                ))}
              </div>

              <div style={{ fontSize:11, fontWeight:700, color:"#94a3b8", letterSpacing:"1px", textTransform:"uppercase" as const, marginBottom:14 }}>
                Day-wise Record ({allDates.length} days marked)
              </div>
              {allDates.length === 0 ? (
                <p style={{ color:"#94a3b8", fontSize:14 }}>No attendance marked yet.</p>
              ) : (
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(80px,1fr))", gap:8 }}>
                  {allDates.map(d => {
                    const st = statusStyle((rec[d] || "") as Status)
                    const dateLabel = new Date(d + "T00:00:00").toLocaleDateString("en-IN",{ day:"numeric", month:"short" })
                    return (
                      <div key={d} style={{ background:st.bg, border:`1.5px solid ${st.border}`, borderRadius:10, padding:"10px 8px", textAlign:"center" }}>
                        <div style={{ fontSize:11, color:"#64748b", fontWeight:600, marginBottom:4 }}>{dateLabel}</div>
                        <div style={{ fontSize:16, fontWeight:800, color:st.color }}>{st.label}</div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )
      })()}
    </div>
  )
}