"use client"
import { useEffect, useState } from "react"
import { getAllProjectUpdates } from "@/lib/api"

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export default function ProjectUpdates() {
  const [updates, setUpdates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchAll() }, [])

  const fetchAll = async () => {
    setLoading(true)
    try {
      const res = await getAllProjectUpdates()
      setUpdates(res.data)
    } catch {
      setUpdates([])
    }
    setLoading(false)
  }

  return (
    <div style={{ maxWidth: 1000 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap" as const, gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", margin: 0 }}>📋 Project Updates</h1>
          <p style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>Daily project activity submitted by students</p>
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
      ) : updates.length === 0 ? (
        <div style={{ background: "#fff", border: "1px solid #e5e9f5", borderRadius: 16, padding: "48px 24px", textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
          <p style={{ color: "#94a3b8" }}>No project updates submitted yet</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {updates.map((u: any) => (
            <div key={u.id} style={{
              display: "flex", alignItems: "center", gap: 14, padding: "14px 18px", borderRadius: 12,
              background: "#fff", border: "1px solid #e5e9f5", boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            }}>
              {u.image ? (
                <img src={u.image} style={{ width: 52, height: 52, borderRadius: 10, objectFit: "cover", flexShrink: 0 }} />
              ) : (
                <div style={{ width: 52, height: 52, borderRadius: 10, background: "#f1f5f9", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>📷</div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" as const }}>
                  <span style={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}>{u.name}</span>
                  <span style={{ fontSize: 12, color: "#94a3b8" }}>· {u.project_name}</span>
                </div>
                <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 3 }}>{u.date} at {u.time}</div>
                <div style={{ display: "flex", gap: 10, marginTop: 6, flexWrap: "wrap" as const }}>
                  {u.github_link && <a href={u.github_link} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: "#4f46e5", fontWeight: 600 }}>🔗 GitHub</a>}
                  {u.deployment_link && <a href={u.deployment_link} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: "#059669", fontWeight: 600 }}>🌐 Live Demo</a>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}