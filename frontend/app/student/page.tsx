"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getMyScores, getLeaderboard, getStudentRewards } from "@/lib/api"

export default function StudentPage() {
  const router = useRouter()
  const [student, setStudent] = useState<any>(null)
  const [scores, setScores] = useState<any[]>([])
  const [leaderboard, setLeaderboard] = useState<any[]>([])
  const [rewards, setRewards] = useState<any[]>([])

  useEffect(() => {
    const s = localStorage.getItem("student")
    if (!s) { router.push("/login"); return }
    const parsed = JSON.parse(s)
    setStudent(parsed)
    fetchData(parsed.id)
  }, [])

  const fetchData = async (id: number) => {
    try {
      const [s, lb, r] = await Promise.all([
        getMyScores(id),
        getLeaderboard(),
        getStudentRewards(id)
      ])
      setScores(s.data)
      setLeaderboard(lb.data)
      setRewards(r.data)
    } catch {}
  }

  const latest = scores[0]
  const myRank = leaderboard.findIndex((l: any) => l.name === student?.name) + 1

  const levelColor = (t: number) => t >= 90 ? "#7c3aed" : t >= 75 ? "#2563eb" : t >= 50 ? "#d97706" : "#dc2626"
  const levelBg = (t: number) => t >= 90 ? "#f5f3ff" : t >= 75 ? "#eff6ff" : t >= 50 ? "#fffbeb" : "#fef2f2"
  const levelLabel = (t: number) => t >= 90 ? "🟣 Pro" : t >= 75 ? "🔵 Skilled" : t >= 50 ? "🟡 Learner" : "🔴 Beginner"

  const categories = [
    { key: "attendance", label: "Attendance", max: 10, icon: "🟢", color: "#059669", bg: "#ecfdf5", border: "#a7f3d0" },
    { key: "speak_up", label: "Speak Up", max: 15, icon: "🎤", color: "#2563eb", bg: "#eff6ff", border: "#bfdbfe" },
    { key: "activity", label: "Activity", max: 20, icon: "⚡", color: "#d97706", bg: "#fffbeb", border: "#fde68a" },
    { key: "technical", label: "Technical", max: 30, icon: "💻", color: "#7c3aed", bg: "#f5f3ff", border: "#ddd6fe" },
    { key: "behavior", label: "Behavior", max: 10, icon: "🤝", color: "#db2777", bg: "#fdf2f8", border: "#fbcfe8" },
    { key: "initiative", label: "Initiative", max: 15, icon: "🚀", color: "#ea580c", bg: "#fff7ed", border: "#fed7aa" },
  ]

  if (!student) return (
    <div style={{ minHeight: "100vh", background: "#f8f9fc", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "#94a3b8", fontSize: 15 }}>Loading...</div>
    </div>
  )

  return (
    <>
      <style>{`
        *{box-sizing:border-box;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes barFill{from{width:0%}to{width:var(--pct)}}
        .fade{animation:fadeUp 0.45s cubic-bezier(.16,1,.3,1) forwards;}
        .card{background:#fff;border-radius:16px;box-shadow:0 1px 4px rgba(0,0,0,0.06),0 4px 16px rgba(0,0,0,0.04);border:1px solid #f1f5f9;}
        .bar{height:8px;border-radius:99px;animation:barFill 1s cubic-bezier(.16,1,.3,1) forwards;}
        @media(max-width:640px){
          .hero-inner{flex-direction:column!important;gap:16px!important;}
          .badges{flex-wrap:wrap!important;}
          .cat-row{flex-direction:column!important;gap:6px!important;}
        }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#f8f9fc", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>

        {/* Header */}
        <div style={{ background: "#fff", borderBottom: "1px solid #f1f5f9", padding: "0 24px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
          <div style={{ maxWidth: 760, margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 0" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 36, height: 36, background: "linear-gradient(135deg,#6366f1,#4f46e5)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17 }}>🎯</div>
                <div>
                  <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: 15, color: "#0f172a" }}>Knowletive</div>
                  <div style={{ fontSize: 11, color: "#94a3b8" }}>Student Portal</div>
                </div>
              </div>
              <button onClick={() => { localStorage.removeItem("student"); router.push("/login") }}
                style={{ padding: "8px 16px", borderRadius: 10, border: "1.5px solid #e2e8f0", background: "#fff", color: "#475569", cursor: "pointer", fontWeight: 600, fontSize: 13, fontFamily: "'Plus Jakarta Sans',sans-serif", transition: "all 0.2s" }}>
                Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Hero */}
        <div style={{ background: "linear-gradient(135deg,#4f46e5,#7c3aed)", padding: "32px 24px" }}>
          <div style={{ maxWidth: 760, margin: "0 auto" }}>
            <div className="hero-inner" style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <div style={{ width: 72, height: 72, borderRadius: 20, background: "rgba(255,255,255,0.2)", border: "2px solid rgba(255,255,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, fontWeight: 800, color: "#fff", flexShrink: 0 }}>
                {student.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase" }}>Welcome back</div>
                <h1 style={{ fontFamily: "'Outfit',sans-serif", fontSize: 26, fontWeight: 800, color: "#fff", margin: "4px 0", letterSpacing: "-0.5px" }}>{student.name}</h1>
                <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, margin: 0 }}>{student.email}</p>
                <div className="badges" style={{ display: "flex", gap: 8, marginTop: 10 }}>
                  <span style={{ background: "rgba(255,255,255,0.2)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.25)", padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700, color: "#fff" }}>
                    🏆 {student.level}
                  </span>
                  {myRank > 0 && (
                    <span style={{ background: "rgba(255,255,255,0.2)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.25)", padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700, color: "#fff" }}>
                      📊 Rank #{myRank} Today
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{ maxWidth: 760, margin: "0 auto", padding: "24px" }}>

          {/* Today's Score */}
          {latest ? (
            <div className="card fade" style={{ padding: 24, marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 22 }}>
                <div>
                  <h2 style={{ fontFamily: "'Outfit',sans-serif", fontSize: 17, fontWeight: 700, color: "#0f172a", margin: "0 0 4px" }}>Today's Performance</h2>
                  <div style={{ fontSize: 13, color: "#94a3b8" }}>{latest.date}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 48, fontWeight: 800, fontFamily: "'Outfit',sans-serif", color: levelColor(latest.total), lineHeight: 1 }}>{latest.total}</div>
                  <div style={{ fontSize: 12, color: "#94a3b8" }}>out of 100</div>
                  <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700, background: levelBg(latest.total), color: levelColor(latest.total), display: "inline-block", marginTop: 4 }}>{levelLabel(latest.total)}</span>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {categories.map(cat => {
                  const val = latest[cat.key] || 0
                  const pct = Math.round((val / cat.max) * 100)
                  return (
                    <div key={cat.key}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ width: 30, height: 30, borderRadius: 8, background: cat.bg, border: `1px solid ${cat.border}`, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>{cat.icon}</span>
                          <span style={{ fontSize: 13, fontWeight: 600, color: "#334155" }}>{cat.label}</span>
                        </div>
                        <span style={{ fontSize: 14, fontWeight: 700, color: cat.color }}>{val}<span style={{ color: "#cbd5e1", fontWeight: 400 }}>/{cat.max}</span></span>
                      </div>
                      <div style={{ height: 8, background: "#f1f5f9", borderRadius: 99, overflow: "hidden" }}>
                        <div className="bar" style={{ background: `linear-gradient(90deg,${cat.color}88,${cat.color})`, "--pct": `${pct}%` } as any} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="card fade" style={{ padding: 48, textAlign: "center", marginBottom: 16 }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
              <p style={{ color: "#94a3b8", fontSize: 15, fontWeight: 500 }}>No scores recorded yet</p>
              <p style={{ color: "#cbd5e1", fontSize: 13, marginTop: 4 }}>Check back after your session</p>
            </div>
          )}

          {/* History */}
          {scores.length > 1 && (
            <div className="card fade" style={{ padding: 22, marginBottom: 16, animationDelay: "0.1s" }}>
              <h2 style={{ fontFamily: "'Outfit',sans-serif", fontSize: 16, fontWeight: 700, color: "#0f172a", margin: "0 0 16px" }}>📈 Score History</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {scores.slice(1).map((s: any, i: number) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderRadius: 12, background: "#f8fafc", border: "1px solid #f1f5f9" }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14, color: "#0f172a" }}>{s.date}</div>
                      <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>A:{s.attendance} · S:{s.speak_up} · Ac:{s.activity} · T:{s.technical} · B:{s.behavior} · I:{s.initiative}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span style={{ fontSize: 22, fontWeight: 800, fontFamily: "'Outfit',sans-serif", color: levelColor(s.total) }}>{s.total}</span>
                      <div style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, background: levelBg(s.total), color: levelColor(s.total), fontWeight: 700, marginTop: 2, display: "inline-block" }}>{levelLabel(s.total)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rewards */}
          {rewards.length > 0 && (
            <div className="card fade" style={{ padding: 22, marginBottom: 16, animationDelay: "0.15s" }}>
              <h2 style={{ fontFamily: "'Outfit',sans-serif", fontSize: 16, fontWeight: 700, color: "#0f172a", margin: "0 0 14px" }}>🏆 My Awards</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {rewards.map((r: any, i: number) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderRadius: 12,
                    background: r.type === "daily" ? "#fffbeb" : r.type === "weekly" ? "#eff6ff" : "#f5f3ff",
                    border: `1px solid ${r.type === "daily" ? "#fde68a" : r.type === "weekly" ? "#bfdbfe" : "#ddd6fe"}`
                  }}>
                    <span style={{ fontSize: 24 }}>{r.type === "daily" ? "⭐" : r.type === "weekly" ? "🏅" : "🏆"}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}>{r.title}</div>
                      <div style={{ fontSize: 12, color: "#64748b", marginTop: 1 }}>{r.date}</div>
                    </div>
                    <span style={{
                      fontSize: 11, padding: "3px 10px", borderRadius: 20, fontWeight: 700,
                      background: "rgba(255,255,255,0.7)",
                      color: r.type === "daily" ? "#d97706" : r.type === "weekly" ? "#2563eb" : "#7c3aed"
                    }}>{r.type}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Faculty Feedback */}
          {scores.filter((s: any) => s.suggestion).length > 0 && (
            <div className="card fade" style={{ padding: 22, marginBottom: 16, animationDelay: "0.2s" }}>
              <h2 style={{ fontFamily: "'Outfit',sans-serif", fontSize: 16, fontWeight: 700, color: "#0f172a", margin: "0 0 14px" }}>💬 Faculty Feedback</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {scores.filter((s: any) => s.suggestion).map((s: any, i: number) => (
                  <div key={i} style={{ padding: "16px", borderRadius: 12, background: "linear-gradient(135deg,#f0f4ff,#f8faff)", border: "1px solid #c7d7ff" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg,#1a3fa0,#1a2f6e)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>👨‍🏫</div>
                        <span style={{ fontSize: 13, fontWeight: 700, color: "#1a2f6e" }}>Faculty Feedback</span>
                      </div>
                      <span style={{ fontSize: 11, color: "#94a3b8" }}>{s.date}</span>
                    </div>
                    <p style={{ fontSize: 14, color: "#334155", lineHeight: 1.7, margin: 0, padding: "10px 12px", background: "#fff", borderRadius: 8, border: "1px solid #e8eeff" }}>
                      "{s.suggestion}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Level Guide */}
          <div className="card fade" style={{ padding: 22, animationDelay: "0.15s" }}>
            <h2 style={{ fontFamily: "'Outfit',sans-serif", fontSize: 16, fontWeight: 700, color: "#0f172a", margin: "0 0 14px" }}>🎯 Level System</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 10 }}>
              {[
                { level: "Beginner", range: "< 50 pts", score: 0 },
                { level: "Learner", range: "50–74 pts", score: 50 },
                { level: "Skilled", range: "75–89 pts", score: 75 },
                { level: "Pro", range: "90+ pts", score: 90 },
              ].map(l => (
                <div key={l.level} style={{ padding: "14px 16px", borderRadius: 12, background: student.level === l.level ? levelBg(l.score) : "#f8fafc", border: `1.5px solid ${student.level === l.level ? levelColor(l.score) + "33" : "#f1f5f9"}`, transition: "all 0.2s" }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: student.level === l.level ? levelColor(l.score) : "#334155" }}>{levelLabel(l.score).split(" ")[1] || levelLabel(l.score)}</div>
                  <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>{l.range}</div>
                  {student.level === l.level && <div style={{ fontSize: 10, color: levelColor(l.score), fontWeight: 700, marginTop: 6, letterSpacing: "0.5px" }}>● YOUR CURRENT LEVEL</div>}
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </>
  )
}