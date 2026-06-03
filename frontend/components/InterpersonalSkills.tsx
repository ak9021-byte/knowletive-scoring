"use client"
import { useState, useEffect } from "react"
import { getStudents } from "@/lib/api"

const SKILLS = [
  { key: "communication",    label: "Communication",    icon: "🗣️" },
  { key: "dressing",         label: "Dressing",         icon: "👔" },
  { key: "gestures",         label: "Gestures",         icon: "🤲" },
  { key: "time_management",  label: "Time Management",  icon: "⏰" },
  { key: "posture",          label: "Posture",          icon: "🧍" },
  { key: "teamwork",         label: "Team Work",        icon: "🤝" },
  { key: "confidence",       label: "Confidence",       icon: "💪" },
  { key: "leadership",       label: "Leadership",       icon: "👑" },
]

const MAX_MARK = 10
const TOTAL_WEEKS = 13
const SKILLS_KEY = "interpersonal_skills_v1"

const avatarColors = [
  ["#667eea","#764ba2"],["#f093fb","#f5576c"],["#4facfe","#00f2fe"],
  ["#43e97b","#38f9d7"],["#fa709a","#fee140"],["#30cfd0","#667eea"],
  ["#a18cd1","#fbc2eb"],["#5b5ef4","#818cf8"],
]

// { week: { studentName: { skillKey: mark } } }
type MarksMap = Record<string, Record<string, Record<string, number>>>

const getWeekNumber = () => {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 1)
  return Math.ceil(((now.getTime() - start.getTime()) / 86400000 + start.getDay() + 1) / 7)
}

const weekLabel = (w: string) => `Week ${w}`

const scoreColor = (pct: number) =>
  pct >= 80 ? "#059669" : pct >= 60 ? "#2563eb" : pct >= 40 ? "#d97706" : "#dc2626"

const scoreBg = (pct: number) =>
  pct >= 80 ? "#ecfdf5" : pct >= 60 ? "#eff6ff" : pct >= 40 ? "#fffbeb" : "#fef2f2"

export default function InterpersonalSkills() {
  const [students, setStudents] = useState<string[]>([])
  const [marks, setMarks] = useState<MarksMap>({})
  const [selectedWeek, setSelectedWeek] = useState(String(getWeekNumber()))
  const [selectedStudent, setSelectedStudent] = useState("")
  const [view, setView] = useState<"entry" | "history">("entry")
  const [loading, setLoading] = useState(true)
  const [historyStudent, setHistoryStudent] = useState("")

  useEffect(() => {
    getStudents()
      .then(res => {
        const names = res.data.map((s: any) => s.name)
        setStudents(names)
        if (names.length > 0) setSelectedStudent(names[0])
      })
      .catch(() => setStudents([]))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    try {
      const d = localStorage.getItem(SKILLS_KEY)
      if (d) setMarks(JSON.parse(d))
    } catch {}
  }, [])

  const persist = (m: MarksMap) => localStorage.setItem(SKILLS_KEY, JSON.stringify(m))

  const getMark = (week: string, student: string, skill: string) =>
    marks[week]?.[student]?.[skill] ?? 0

  const setMark = (week: string, student: string, skill: string, val: number) => {
    const v = Math.max(0, Math.min(MAX_MARK, val))
    const updated: MarksMap = {
      ...marks,
      [week]: {
        ...(marks[week] || {}),
        [student]: {
          ...(marks[week]?.[student] || {}),
          [skill]: v,
        },
      },
    }
    setMarks(updated)
    persist(updated)
  }

  const totalForStudent = (week: string, student: string) =>
    SKILLS.reduce((sum, s) => sum + getMark(week, student, s.key), 0)

  const allWeeks = Object.keys(marks).sort((a, b) => Number(b) - Number(a))
  const weeksTracked = allWeeks.length

  const avgForStudent = (student: string) => {
    const weeks = allWeeks.filter(w => marks[w]?.[student])
    if (weeks.length === 0) return 0
    const total = weeks.reduce((sum, w) => sum + totalForStudent(w, student), 0)
    return Math.round(total / weeks.length)
  }

  const inputStyle: React.CSSProperties = {
    width: 64, padding: "8px 6px", border: "1.5px solid #e5e9f5",
    borderRadius: 9, fontSize: 15, fontFamily: "inherit",
    textAlign: "center", outline: "none", color: "#0f172a", fontWeight: 700,
  }

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>

      {/* Toggle */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 6, background: "#f1f5f9", padding: 4, borderRadius: 12 }}>
          {([["entry","📝 Entry"],["history","📋 History"]] as const).map(([v,l]) => (
            <button key={v} onClick={() => setView(v)} style={{
              padding: "8px 16px", borderRadius: 9, border: "none", cursor: "pointer",
              fontWeight: 700, fontSize: 13, fontFamily: "inherit",
              background: view === v ? "#fff" : "transparent",
              color: view === v ? "#5b5ef4" : "#94a3b8",
              boxShadow: view === v ? "0 2px 8px rgba(0,0,0,0.1)" : "none",
              transition: "all 0.2s",
            }}>{l}</button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 20 }}>
        {[
          { label: "Total Students",  value: loading ? "..." : students.length, icon: "👥", color: "#6366f1", bg: "#eef0ff" },
          { label: "Weeks Tracked",   value: `${weeksTracked} / ${TOTAL_WEEKS}`, icon: "📅", color: "#059669", bg: "#ecfdf5" },
          { label: "Skills Tracked",  value: SKILLS.length,                      icon: "🎯", color: "#d97706", bg: "#fffbeb" },
        ].map(s => (
          <div key={s.label} style={{ background: "#fff", border: "1px solid #e5e9f5", borderRadius: 16, padding: "18px 20px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: s.color, borderRadius: "16px 16px 0 0" }} />
            <div style={{ width: 38, height: 38, borderRadius: 10, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, marginBottom: 10 }}>{s.icon}</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: 13, color: "#64748b", marginTop: 4, fontWeight: 500 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ══ ENTRY VIEW ══ */}
      {view === "entry" && (
        <>
          {/* Week + Student selector */}
          <div style={{ background: "#fff", border: "1px solid #e5e9f5", borderRadius: 14, padding: 18, marginBottom: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-end" }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", letterSpacing: "1px", textTransform: "uppercase" as const, display: "block", marginBottom: 7 }}>Week</label>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {Array.from({ length: TOTAL_WEEKS }, (_, i) => String(i + 1)).map(w => (
                    <button key={w} onClick={() => setSelectedWeek(w)} style={{
                      padding: "7px 14px", borderRadius: 9, border: `1.5px solid ${selectedWeek === w ? "#5b5ef4" : "#e5e9f5"}`,
                      background: selectedWeek === w ? "#eef0ff" : "#fff",
                      color: selectedWeek === w ? "#5b5ef4" : "#64748b",
                      fontWeight: 700, fontSize: 13, fontFamily: "inherit", cursor: "pointer",
                    }}>{w}</button>
                  ))}
                </div>
              </div>
            </div>

            {/* Student tabs */}
            {students.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", letterSpacing: "1px", textTransform: "uppercase" as const, display: "block", marginBottom: 8 }}>Student</label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {students.map((name, i) => {
                    const [g1,g2] = avatarColors[i % avatarColors.length]
                    return (
                      <button key={name} onClick={() => setSelectedStudent(name)} style={{
                        display: "flex", alignItems: "center", gap: 7,
                        padding: "6px 12px", borderRadius: 20, cursor: "pointer",
                        border: `1.5px solid ${selectedStudent === name ? "#5b5ef4" : "#e5e9f5"}`,
                        background: selectedStudent === name ? "#eef0ff" : "#fafbff",
                        color: selectedStudent === name ? "#5b5ef4" : "#0f172a",
                        fontWeight: 600, fontSize: 13, fontFamily: "inherit",
                      }}>
                        <div style={{ width: 22, height: 22, borderRadius: 6, background: `linear-gradient(135deg,${g1},${g2})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: "#fff" }}>
                          {name.charAt(0).toUpperCase()}
                        </div>
                        {name}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Skills entry table */}
          {loading ? (
            <div style={{ background: "#fff", border: "1px solid #e5e9f5", borderRadius: 16, padding: "48px 24px", textAlign: "center" }}>
              <p style={{ color: "#94a3b8" }}>Loading students...</p>
            </div>
          ) : !selectedStudent ? (
            <div style={{ background: "#fff", border: "1px solid #e5e9f5", borderRadius: 16, padding: "48px 24px", textAlign: "center" }}>
              <p style={{ color: "#94a3b8" }}>Select a student above</p>
            </div>
          ) : (
            <div style={{ background: "#fff", border: "1px solid #e5e9f5", borderRadius: 14, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
              {/* Card header */}
              <div style={{ padding: "14px 20px", background: "#f8f9fe", borderBottom: "1px solid #e5e9f5", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontWeight: 700, fontSize: 15, color: "#0f172a" }}>
                  🎯 {selectedStudent} — Week {selectedWeek}
                </span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#5b5ef4" }}>
                  Total: {totalForStudent(selectedWeek, selectedStudent)} / {SKILLS.length * MAX_MARK}
                </span>
              </div>

              <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
                {SKILLS.map(skill => {
                  const val = getMark(selectedWeek, selectedStudent, skill.key)
                  const pct = Math.round((val / MAX_MARK) * 100)
                  return (
                    <div key={skill.key} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 16px", borderRadius: 12, border: "1.5px solid #e5e9f5", background: val > 0 ? scoreBg(pct) : "#fff", transition: "all 0.2s" }}>
                      <span style={{ fontSize: 22, width: 32, textAlign: "center" }}>{skill.icon}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: "#0f172a" }}>{skill.label}</div>
                        <div style={{ height: 6, background: "#f1f5f9", borderRadius: 99, overflow: "hidden", marginTop: 6, width: "100%" }}>
                          <div style={{ height: "100%", width: `${pct}%`, background: scoreColor(pct), borderRadius: 99, transition: "width 0.3s" }} />
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <button onClick={() => setMark(selectedWeek, selectedStudent, skill.key, val - 1)}
                          style={{ width: 28, height: 28, borderRadius: 8, border: "1.5px solid #e5e9f5", background: "#f8f9fe", cursor: "pointer", fontSize: 16, fontWeight: 700, color: "#64748b", display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
                        <input
                          type="number" min={0} max={MAX_MARK} value={val}
                          onChange={e => setMark(selectedWeek, selectedStudent, skill.key, parseInt(e.target.value) || 0)}
                          style={{ ...inputStyle, borderColor: val > 0 ? scoreColor(pct) : "#e5e9f5", color: val > 0 ? scoreColor(pct) : "#94a3b8" }}
                        />
                        <button onClick={() => setMark(selectedWeek, selectedStudent, skill.key, val + 1)}
                          style={{ width: 28, height: 28, borderRadius: 8, border: "1.5px solid #e5e9f5", background: "#f8f9fe", cursor: "pointer", fontSize: 16, fontWeight: 700, color: "#64748b", display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
                        <span style={{ fontSize: 12, color: "#94a3b8", minWidth: 36 }}>/ {MAX_MARK}</span>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Total bar */}
              <div style={{ padding: "16px 20px", background: "#f8f9fe", borderTop: "2px solid #e5e9f5", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontWeight: 700, color: "#475569" }}>TOTAL SCORE</span>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 120, height: 8, background: "#e5e9f5", borderRadius: 99, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${Math.round((totalForStudent(selectedWeek, selectedStudent) / (SKILLS.length * MAX_MARK)) * 100)}%`, background: scoreColor(Math.round((totalForStudent(selectedWeek, selectedStudent) / (SKILLS.length * MAX_MARK)) * 100)), borderRadius: 99, transition: "width 0.3s" }} />
                  </div>
                  <span style={{ fontSize: 22, fontWeight: 800, color: scoreColor(Math.round((totalForStudent(selectedWeek, selectedStudent) / (SKILLS.length * MAX_MARK)) * 100)) }}>
                    {totalForStudent(selectedWeek, selectedStudent)}
                  </span>
                  <span style={{ fontSize: 13, color: "#94a3b8" }}>/ {SKILLS.length * MAX_MARK}</span>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* ══ HISTORY VIEW ══ */}
      {view === "history" && (
        <>
          {/* Filter by student */}
          <div style={{ background: "#fff", border: "1px solid #e5e9f5", borderRadius: 14, padding: 16, marginBottom: 16 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", letterSpacing: "1px", textTransform: "uppercase" as const, display: "block", marginBottom: 8 }}>Filter by Student</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button onClick={() => setHistoryStudent("")} style={{
                padding: "6px 14px", borderRadius: 20, border: `1.5px solid ${historyStudent === "" ? "#5b5ef4" : "#e5e9f5"}`,
                background: historyStudent === "" ? "#eef0ff" : "#fff",
                color: historyStudent === "" ? "#5b5ef4" : "#64748b",
                fontWeight: 700, fontSize: 13, fontFamily: "inherit", cursor: "pointer",
              }}>All Students</button>
              {students.map((name, i) => {
                const [g1,g2] = avatarColors[i % avatarColors.length]
                return (
                  <button key={name} onClick={() => setHistoryStudent(name)} style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "6px 12px", borderRadius: 20, cursor: "pointer",
                    border: `1.5px solid ${historyStudent === name ? "#5b5ef4" : "#e5e9f5"}`,
                    background: historyStudent === name ? "#eef0ff" : "#fafbff",
                    color: historyStudent === name ? "#5b5ef4" : "#0f172a",
                    fontWeight: 600, fontSize: 13, fontFamily: "inherit",
                  }}>
                    <div style={{ width: 20, height: 20, borderRadius: 5, background: `linear-gradient(135deg,${g1},${g2})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 800, color: "#fff" }}>
                      {name.charAt(0).toUpperCase()}
                    </div>
                    {name}
                  </button>
                )
              })}
            </div>
          </div>

          {allWeeks.length === 0 ? (
            <div style={{ background: "#fff", border: "1px solid #e5e9f5", borderRadius: 16, padding: "60px 24px", textAlign: "center" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
              <p style={{ color: "#64748b", fontSize: 15 }}>No records yet. Enter marks in the Entry tab.</p>
            </div>
          ) : historyStudent ? (
            /* Single student week-by-week */
            <div style={{ background: "#fff", border: "1px solid #e5e9f5", borderRadius: 14, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
              <div style={{ padding: "14px 20px", background: "#f8f9fe", borderBottom: "1px solid #e5e9f5", fontWeight: 700, fontSize: 15, color: "#0f172a" }}>
                📊 {historyStudent} — All Weeks
              </div>
              <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "#fafbff" }}>
                    <th style={{ padding: "10px 16px", textAlign: "left", fontWeight: 700, color: "#475569", fontSize: 12, borderBottom: "1px solid #f1f5f9" }}>WEEK</th>
                    {SKILLS.map(s => (
                      <th key={s.key} style={{ padding: "10px 10px", textAlign: "center", fontWeight: 700, color: "#475569", fontSize: 11, borderBottom: "1px solid #f1f5f9" }}>{s.icon}<br/>{s.label}</th>
                    ))}
                    <th style={{ padding: "10px 16px", textAlign: "center", fontWeight: 700, color: "#5b5ef4", fontSize: 12, borderBottom: "1px solid #f1f5f9" }}>TOTAL</th>
                  </tr>
                </thead>
                <tbody>
                  {allWeeks.map(w => {
                    const total = totalForStudent(w, historyStudent)
                    const pct = Math.round((total / (SKILLS.length * MAX_MARK)) * 100)
                    return (
                      <tr key={w} style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "10px 16px", fontWeight: 700, color: "#0f172a" }}>Week {w}</td>
                        {SKILLS.map(s => {
                          const v = getMark(w, historyStudent, s.key)
                          return (
                            <td key={s.key} style={{ padding: "10px", textAlign: "center" }}>
                              <span style={{ fontWeight: 700, color: v > 0 ? scoreColor(Math.round((v / MAX_MARK) * 100)) : "#cbd5e1" }}>{v}</span>
                            </td>
                          )
                        })}
                        <td style={{ padding: "10px 16px", textAlign: "center" }}>
                          <span style={{ fontWeight: 800, fontSize: 15, color: scoreColor(pct) }}>{total}</span>
                          <span style={{ fontSize: 11, color: "#94a3b8" }}>/{SKILLS.length * MAX_MARK}</span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            /* All students summary */
            <div style={{ background: "#fff", border: "1px solid #e5e9f5", borderRadius: 14, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
              <div style={{ padding: "14px 20px", background: "#f8f9fe", borderBottom: "1px solid #e5e9f5", fontWeight: 700, fontSize: 15, color: "#0f172a" }}>
                📊 All Students — Average Summary
              </div>
              <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "#fafbff" }}>
                    <th style={{ padding: "10px 20px", textAlign: "left", fontWeight: 700, color: "#475569", fontSize: 12, borderBottom: "1px solid #f1f5f9" }}>STUDENT</th>
                    {SKILLS.map(s => (
                      <th key={s.key} style={{ padding: "10px 10px", textAlign: "center", fontWeight: 700, color: "#475569", fontSize: 11, borderBottom: "1px solid #f1f5f9" }}>{s.icon}<br/>{s.label}</th>
                    ))}
                    <th style={{ padding: "10px 16px", textAlign: "center", fontWeight: 700, color: "#5b5ef4", fontSize: 12, borderBottom: "1px solid #f1f5f9" }}>AVG</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((name, i) => {
                    const [g1,g2] = avatarColors[i % avatarColors.length]
                    const avg = avgForStudent(name)
                    const pct = Math.round((avg / (SKILLS.length * MAX_MARK)) * 100)
                    return (
                      <tr key={name} style={{ borderBottom: "1px solid #f1f5f9" }}
                        onClick={() => setHistoryStudent(name)}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#fafbff"}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
                        style={{ borderBottom: "1px solid #f1f5f9", cursor: "pointer" }}>
                        <td style={{ padding: "10px 20px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ width: 28, height: 28, borderRadius: 7, background: `linear-gradient(135deg,${g1},${g2})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: "#fff" }}>{name.charAt(0).toUpperCase()}</div>
                            <span style={{ fontWeight: 600, color: "#0f172a" }}>{name}</span>
                          </div>
                        </td>
                        {SKILLS.map(s => {
                          const weekVals = allWeeks.filter(w => marks[w]?.[name]).map(w => getMark(w, name, s.key))
                          const avgSkill = weekVals.length > 0 ? Math.round(weekVals.reduce((a,b) => a+b, 0) / weekVals.length) : 0
                          return (
                            <td key={s.key} style={{ padding: "10px", textAlign: "center" }}>
                              <span style={{ fontWeight: 700, color: avgSkill > 0 ? scoreColor(Math.round((avgSkill / MAX_MARK) * 100)) : "#cbd5e1" }}>{avgSkill || "—"}</span>
                            </td>
                          )
                        })}
                        <td style={{ padding: "10px 16px", textAlign: "center" }}>
                          <span style={{ fontWeight: 800, fontSize: 15, color: avg > 0 ? scoreColor(pct) : "#cbd5e1" }}>{avg || "—"}</span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  )
}