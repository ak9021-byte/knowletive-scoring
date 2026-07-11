"use client"
import { useEffect, useState } from "react"
import { getAllProjectUpdates, approveProjectUpdate } from "@/lib/api"

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

const avatarColors = [
  ["#667eea","#764ba2"],["#f093fb","#f5576c"],["#4facfe","#00f2fe"],
  ["#43e97b","#38f9d7"],["#fa709a","#fee140"],["#30cfd0","#667eea"],
]

export default function ProjectUpdates() {
  const [updates, setUpdates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState<number | null>(null)
  const [reviewText, setReviewText] = useState<Record<number, string>>({})

  useEffect(() => { fetchAll() }, [])

  const fetchAll = async () => {
    setLoading(true)
    try {
      const res = await getAllProjectUpdates()
      setUpdates(res.data)
      // seed review text boxes with any existing remarks
      const seed: Record<number, string> = {}
      res.data.forEach((u: any) => { seed[u.id] = u.faculty_remark || "" })
      setReviewText((prev) => ({ ...seed, ...prev }))
    } catch {
      setUpdates([])
    }
    setLoading(false)
  }

  const handleSubmitReview = async (id: number) => {
    setSubmitting(id)
    try {
      const text = (reviewText[id] || "").trim() || "Today's work done ✅"
      await approveProjectUpdate(id, text)
      await fetchAll()
    } catch {}
    setSubmitting(null)
  }

  const grouped: Record<string, any[]> = {}
  updates.forEach((u: any) => {
    if (!grouped[u.name]) grouped[u.name] = []
    grouped[u.name].push(u)
  })
  const studentNames = Object.keys(grouped).sort()

  return (
    <div style={{ maxWidth: 1000 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap" as const, gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", margin: 0 }}>📋 Project Updates</h1>
          <p style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>Daily project activity, grouped by student</p>
        </div>
        <a href={`${API}/project-updates/export`} style={{
          padding: "10px 20px", borderRadius: 10, background: "linear-gradient(135deg,#5b5ef4,#818cf8)",
          color: "#fff", fontWeight: 700, fontSize: 13, textDecoration: "none", boxShadow: "0 4px 14px rgba(91,94,244,0.3)",
        }}>
          📥 Download as Excel
        </a>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 48, color: "#94a3b8" }}>Loading...</div>
      ) : studentNames.length === 0 ? (
        <div style={{ background: "#fff", border: "1px solid #e5e9f5", borderRadius: 16, padding: "48px 24px", textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
          <p style={{ color: "#94a3b8" }}>No project updates submitted yet</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {studentNames.map((name, i) => {
            const studentUpdates = grouped[name].sort(
              (a, b) => new Date(b.date + " " + b.time).getTime() - new Date(a.date + " " + a.time).getTime()
            )
            const isOpen = expanded === name
            const [g1, g2] = avatarColors[i % avatarColors.length]
            const latest = studentUpdates[0]
            const projectNames = Array.from(new Set(studentUpdates.map((u: any) => u.project_name)))
            const pendingCount = studentUpdates.filter((u: any) => !u.approved).length

            return (
              <div key={name} style={{ background: "#fff", border: "1px solid #e5e9f5", borderRadius: 14, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                <div
                  onClick={() => setExpanded(isOpen ? null : name)}
                  style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 20px", cursor: "pointer", background: isOpen ? "#f8f9fe" : "#fff" }}
                >
                  <div style={{
                    width: 44, height: 44, borderRadius: 12, background: `linear-gradient(135deg,${g1},${g2})`,
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, fontWeight: 800, color: "#fff", flexShrink: 0,
                  }}>
                    {name.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, color: "#0f172a" }}>{name}</div>
                    <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>
                      {projectNames.join(", ")} · {studentUpdates.length} update{studentUpdates.length !== 1 ? "s" : ""}
                    </div>
                  </div>
                  {pendingCount > 0 && (
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#b45309", background: "#fffbeb", border: "1px solid #fde68a", padding: "3px 10px", borderRadius: 20, flexShrink: 0 }}>
                      {pendingCount} pending
                    </span>
                  )}
                  <div style={{ fontSize: 12, color: "#94a3b8", flexShrink: 0 }}>Last: {latest.date}</div>
                  <div style={{ fontSize: 18, color: "#94a3b8", transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>▾</div>
                </div>

                {isOpen && (
                  <div style={{ borderTop: "1px solid #e5e9f5", padding: "12px 20px 18px", display: "flex", flexDirection: "column", gap: 10 }}>
                    {studentUpdates.map((u: any) => (
                      <div key={u.id} style={{ padding: "14px", borderRadius: 10, background: "#f8fafc", border: "1px solid #f1f5f9" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                          {u.image ? (
                            <img src={u.image} style={{ width: 48, height: 48, borderRadius: 9, objectFit: "cover", flexShrink: 0 }} />
                          ) : (
                            <div style={{ width: 48, height: 48, borderRadius: 9, background: "#f1f5f9", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>📷</div>
                          )}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 700, fontSize: 13, color: "#0f172a" }}>{u.project_name}</div>
                            <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{u.date} at {u.time}{u.technology ? ` · ${u.technology}` : ""}</div>
                            <div style={{ display: "flex", gap: 10, marginTop: 4, flexWrap: "wrap" as const }}>
                              {u.github_link && <a href={u.github_link} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: "#4f46e5", fontWeight: 600 }}>🔗 GitHub</a>}
                              {u.deployment_link && <a href={u.deployment_link} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: "#059669", fontWeight: 600 }}>🌐 Live Demo</a>}
                            </div>
                          </div>
                          {u.approved && (
                            <span style={{ fontSize: 11, fontWeight: 700, color: "#059669", background: "#ecfdf5", border: "1px solid #a7f3d0", padding: "5px 12px", borderRadius: 20, whiteSpace: "nowrap" as const, flexShrink: 0 }}>
                              ✅ Reviewed
                            </span>
                          )}
                        </div>

                        {/* Faculty review input */}
                        <div style={{ marginTop: 10, display: "flex", gap: 8, alignItems: "flex-start" }}>
                          <textarea
                            value={reviewText[u.id] ?? ""}
                            onChange={(e) => setReviewText((prev) => ({ ...prev, [u.id]: e.target.value }))}
                            placeholder="Write a review for this update... (e.g. Today's work done ✅)"
                            rows={1}
                            style={{
                              flex: 1, padding: "8px 12px", borderRadius: 8, border: "1.5px solid #e2e8f0",
                              fontSize: 12, fontFamily: "'Plus Jakarta Sans',sans-serif", resize: "vertical" as const, outline: "none", color: "#0f172a",
                            }}
                          />
                          <button
                            onClick={() => handleSubmitReview(u.id)}
                            disabled={submitting === u.id}
                            style={{
                              padding: "8px 16px", borderRadius: 8, border: "none", cursor: submitting === u.id ? "not-allowed" : "pointer",
                              background: "linear-gradient(135deg,#4f46e5,#7c3aed)", color: "#fff", fontSize: 12, fontWeight: 700, whiteSpace: "nowrap" as const,
                              opacity: submitting === u.id ? 0.6 : 1,
                            }}
                          >
                            {submitting === u.id ? "..." : u.approved ? "Update Review" : "Submit Review"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}