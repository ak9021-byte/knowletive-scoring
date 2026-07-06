"use client"
import { useEffect, useState } from "react"
import { createProjectUpdate, getMyProjectUpdates } from "@/lib/api"

const nowDate = () => new Date().toISOString().split("T")[0]
const nowTime = () => {
  const d = new Date()
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
}

export default function ProjectUpdateForm() {
  const [student, setStudent]   = useState<any>(null)
  const [updates, setUpdates]   = useState<any[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast]       = useState<{ msg: string; type: string } | null>(null)

  const emptyForm = () => ({
    name: "",
    project_name: "",
    date: nowDate(),
    time: nowTime(),
    image: "",
    github_link: "",
    deployment_link: "",
  })
  const [form, setForm] = useState(emptyForm())

  const showToast = (msg: string, type = "success") => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    const s = localStorage.getItem("student")
    if (!s) return
    const parsed = JSON.parse(s)
    setStudent(parsed)
    setForm((f) => ({ ...f, name: parsed.name }))
    fetchUpdates(parsed.id)
  }, [])

  const fetchUpdates = async (id: number) => {
    try {
      const res = await getMyProjectUpdates(id)
      setUpdates(res.data)
    } catch {
      setUpdates([])
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2000000) { showToast("Image must be under 2MB", "warning"); return }
    const reader = new FileReader()
    reader.onload = (ev) => setForm((f) => ({ ...f, image: ev.target?.result as string }))
    reader.readAsDataURL(file)
  }

  const handleSubmit = async () => {
    if (!student) return
    if (!form.project_name || !form.name) return showToast("Please fill in name and project name!", "warning")
    setSubmitting(true)
    try {
      await createProjectUpdate({ ...form, student_id: student.id })
      showToast("Update submitted! 🚀")
      setForm({ ...emptyForm(), name: student.name })
      fetchUpdates(student.id)
    } catch {
      showToast("Error submitting update", "error")
    }
    setSubmitting(false)
  }

  if (!student) return null

  return (
    <div className="card fade" style={{ padding: 22, marginBottom: 16, animationDelay: "0.03s" }}>
      <style>{`
        .pu-input { width:100%; padding:10px 12px; border-radius:9px; border:1.5px solid #e2e8f0; font-size:13px; font-family:'Plus Jakarta Sans',sans-serif; outline:none; color:#0f172a; }
        .pu-input:focus { border-color:#4f46e5; }
        .pu-label { font-size:11px; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:0.5px; display:block; margin-bottom:6px; }
      `}</style>
      <h2 style={{ fontFamily: "'Outfit',sans-serif", fontSize: 16, fontWeight: 700, color: "#0f172a", margin: "0 0 16px" }}>
        📋 Daily Project Update
      </h2>

      {toast && (
        <div style={{
          padding: "8px 14px", borderRadius: 9, marginBottom: 14, fontSize: 12, fontWeight: 700,
          background: toast.type === "error" ? "#fef2f2" : toast.type === "warning" ? "#fffbeb" : "#f0fdf4",
          color: toast.type === "error" ? "#dc2626" : toast.type === "warning" ? "#b45309" : "#15803d",
        }}>{toast.msg}</div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
        <div>
          <label className="pu-label">Name</label>
          <input className="pu-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
        </div>
        <div>
          <label className="pu-label">Project Name</label>
          <input className="pu-input" placeholder="e.g. Knowletive Scoring App" value={form.project_name}
            onChange={e => setForm({ ...form, project_name: e.target.value })} />
        </div>
        <div>
          <label className="pu-label">Date</label>
          <input className="pu-input" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
        </div>
        <div>
          <label className="pu-label">Time</label>
          <input className="pu-input" type="time" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} />
        </div>
        <div>
          <label className="pu-label">GitHub Link</label>
          <input className="pu-input" placeholder="https://github.com/..." value={form.github_link}
            onChange={e => setForm({ ...form, github_link: e.target.value })} />
        </div>
        <div>
          <label className="pu-label">Deployment Link</label>
          <input className="pu-input" placeholder="https://myapp.vercel.app" value={form.deployment_link}
            onChange={e => setForm({ ...form, deployment_link: e.target.value })} />
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <label className="pu-label">Image of Today's Work</label>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <label style={{
            padding: "9px 16px", borderRadius: 9, border: "1.5px dashed #c7d2fe", background: "#eef2ff",
            color: "#4f46e5", fontSize: 12, fontWeight: 700, cursor: "pointer",
          }}>
            📷 Choose Image
            <input type="file" accept="image/*" style={{ display: "none" }} onChange={handleImageChange} />
          </label>
          {form.image && (
            <img src={form.image} alt="preview" style={{ width: 48, height: 48, borderRadius: 8, objectFit: "cover", border: "1px solid #e2e8f0" }} />
          )}
        </div>
      </div>

      <button onClick={handleSubmit} disabled={submitting} style={{
        width: "100%", padding: 12, borderRadius: 10, border: "none", cursor: submitting ? "not-allowed" : "pointer",
        fontWeight: 700, fontSize: 14, background: "linear-gradient(135deg,#4f46e5,#7c3aed)", color: "#fff",
        opacity: submitting ? 0.7 : 1,
      }}>
        {submitting ? "Submitting..." : "Submit Update 🚀"}
      </button>

      {updates.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 10 }}>
            Your Recent Updates
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {updates.slice(0, 5).map((u: any) => (
              <div key={u.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderRadius: 10, background: "#f8fafc", border: "1px solid #f1f5f9" }}>
                {u.image && <img src={u.image} style={{ width: 36, height: 36, borderRadius: 8, objectFit: "cover" }} />}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{u.project_name}</div>
                  <div style={{ fontSize: 11, color: "#94a3b8" }}>{u.date} · {u.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}