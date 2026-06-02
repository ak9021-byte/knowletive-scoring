"use client"
import { useState, useEffect } from "react"

type YesNo = "Yes" | "No" | ""

interface Note {
  id: string
  text: string
}

interface StudyEntry {
  id: string
  date: string
  topicName: string
  videoRecorded: YesNo
  videoAccess: YesNo
  programsGiven: number
  programsSubmitted: number
  notes: Note[]
}

const STUDY_KEY = "study_material_v1"
const today = () => new Date().toISOString().split("T")[0]
const fmtDate = (d: string) => new Date(d + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
const uid = () => Math.random().toString(36).slice(2, 9)

const emptyEntry = (): Omit<StudyEntry, "id"> => ({
  date: today(),
  topicName: "",
  videoRecorded: "",
  videoAccess: "",
  programsGiven: 0,
  programsSubmitted: 0,
  notes: [],
})

const YesNoToggle = ({ value, onChange }: { value: YesNo; onChange: (v: YesNo) => void }) => (
  <div style={{ display: "flex", gap: 8 }}>
    {(["Yes", "No"] as YesNo[]).map(opt => (
      <button key={opt} onClick={() => onChange(value === opt ? "" : opt)} style={{
        padding: "8px 20px", borderRadius: 9, border: `1.5px solid ${value === opt ? (opt === "Yes" ? "#a7f3d0" : "#fecaca") : "#e5e9f5"}`,
        background: value === opt ? (opt === "Yes" ? "#ecfdf5" : "#fef2f2") : "#fff",
        color: value === opt ? (opt === "Yes" ? "#059669" : "#dc2626") : "#94a3b8",
        fontWeight: 700, fontSize: 13, fontFamily: "inherit", cursor: "pointer", transition: "all 0.15s",
      }}>{opt === "Yes" ? "✅ Yes" : "❌ No"}</button>
    ))}
  </div>
)

export default function StudyMaterial() {
  const [entries, setEntries] = useState<StudyEntry[]>([])
  const [form, setForm] = useState(emptyEntry())
  const [newNote, setNewNote] = useState("")
  const [view, setView] = useState<"entry" | "history">("entry")
  const [editingEntry, setEditingEntry] = useState<StudyEntry | null>(null)
  const [editNote, setEditNote] = useState("")
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)

  useEffect(() => {
    try {
      const d = localStorage.getItem(STUDY_KEY)
      if (d) setEntries(JSON.parse(d))
    } catch {}
  }, [])

  const persist = (e: StudyEntry[]) => {
    localStorage.setItem(STUDY_KEY, JSON.stringify(e))
  }

  const addNote = () => {
    const text = newNote.trim()
    if (!text) return
    setForm(f => ({ ...f, notes: [...f.notes, { id: uid(), text }] }))
    setNewNote("")
  }

  const removeNote = (id: string) => {
    setForm(f => ({ ...f, notes: f.notes.filter(n => n.id !== id) }))
  }

  const saveEntry = () => {
    if (!form.topicName.trim()) return alert("Please enter a topic name!")
    const entry: StudyEntry = { ...form, id: uid() }
    const updated = [entry, ...entries]
    setEntries(updated)
    persist(updated)
    setForm(emptyEntry())
    setNewNote("")
    alert("✅ Study entry saved!")
  }

  const deleteEntry = (id: string) => {
    if (!confirm("Delete this study entry?")) return
    const updated = entries.filter(e => e.id !== id)
    setEntries(updated)
    persist(updated)
  }

  const startEdit = (entry: StudyEntry) => {
    setEditingEntry({ ...entry, notes: [...entry.notes] })
    setView("history")
  }

  const saveEdit = () => {
    if (!editingEntry) return
    if (!editingEntry.topicName.trim()) return alert("Please enter a topic name!")
    const updated = entries.map(e => e.id === editingEntry.id ? editingEntry : e)
    setEntries(updated)
    persist(updated)
    setEditingEntry(null)
  }

  const addNoteToEdit = () => {
    const text = editNote.trim()
    if (!text || !editingEntry) return
    setEditingEntry(e => e ? { ...e, notes: [...e.notes, { id: uid(), text }] } : e)
    setEditNote("")
  }

  const removeNoteFromEdit = (id: string) => {
    setEditingEntry(e => e ? { ...e, notes: e.notes.filter(n => n.id !== id) } : e)
  }

  const updateNoteInEdit = (id: string, text: string) => {
    setEditingEntry(e => e ? { ...e, notes: e.notes.map(n => n.id === id ? { ...n, text } : n) } : e)
  }

  const totalTopics = entries.length
  const totalVideos = entries.filter(e => e.videoRecorded === "Yes").length
  const totalPrograms = entries.reduce((s, e) => s + e.programsGiven, 0)
  const totalSubmitted = entries.reduce((s, e) => s + e.programsSubmitted, 0)

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 14px", border: "1.5px solid #e5e9f5",
    borderRadius: 10, fontSize: 14, fontFamily: "inherit", outline: "none", color: "#0f172a",
  }
  const labelStyle: React.CSSProperties = {
    fontSize: 11, fontWeight: 700, color: "#94a3b8", letterSpacing: "1px",
    textTransform: "uppercase", display: "block", marginBottom: 7,
  }

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>

      {/* Toggle */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 6, background: "#f1f5f9", padding: 4, borderRadius: 12 }}>
          {([["entry", "📝 Entry"], ["history", "📋 History"]] as const).map(([v, l]) => (
            <button key={v} onClick={() => { setView(v); setEditingEntry(null) }} style={{
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
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 20 }}>
        {[
          { label: "Topics Covered",    value: totalTopics,     icon: "📚", color: "#6366f1", bg: "#eef0ff" },
          { label: "Videos Recorded",   value: totalVideos,     icon: "🎥", color: "#059669", bg: "#ecfdf5" },
          { label: "Programs Given",    value: totalPrograms,   icon: "💻", color: "#d97706", bg: "#fffbeb" },
          { label: "Programs Submitted",value: totalSubmitted,  icon: "✅", color: "#db2777", bg: "#fdf2f8" },
        ].map(s => (
          <div key={s.label} style={{ background: "#fff", border: "1px solid #e5e9f5", borderRadius: 16, padding: "18px 20px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: s.color, borderRadius: "16px 16px 0 0" }} />
            <div style={{ width: 38, height: 38, borderRadius: 10, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, marginBottom: 10 }}>{s.icon}</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: 12, color: "#64748b", marginTop: 4, fontWeight: 500 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ══ ENTRY VIEW ══ */}
      {view === "entry" && (
        <div style={{ background: "#fff", border: "1px solid #e5e9f5", borderRadius: 16, padding: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", marginBottom: 20 }}>📚 Add Study Entry</div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 18 }}>
            <div>
              <label style={labelStyle}>Date</label>
              <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Topic Name</label>
              <input value={form.topicName} onChange={e => setForm(f => ({ ...f, topicName: e.target.value }))}
                placeholder="e.g. Arrays, SQL Joins, React Hooks..."
                style={inputStyle} />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 18 }}>
            <div>
              <label style={labelStyle}>Video Recorded?</label>
              <YesNoToggle value={form.videoRecorded} onChange={v => setForm(f => ({ ...f, videoRecorded: v }))} />
            </div>
            <div>
              <label style={labelStyle}>Video Access Provided?</label>
              <YesNoToggle value={form.videoAccess} onChange={v => setForm(f => ({ ...f, videoAccess: v }))} />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 18 }}>
            <div>
              <label style={labelStyle}>Programs Given for Practice</label>
              <input type="number" min={0} value={form.programsGiven}
                onChange={e => setForm(f => ({ ...f, programsGiven: parseInt(e.target.value) || 0 }))}
                style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Programs Submitted / Practiced</label>
              <input type="number" min={0} value={form.programsSubmitted}
                onChange={e => setForm(f => ({ ...f, programsSubmitted: parseInt(e.target.value) || 0 }))}
                style={inputStyle} />
            </div>
          </div>

          {/* Notes */}
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Notes (optional)</label>
            <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
              <input value={newNote} onChange={e => setNewNote(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addNote()}
                placeholder="Add a note and press Enter or click Add..."
                style={{ ...inputStyle, flex: 1 }} />
              <button onClick={addNote} style={{ padding: "10px 18px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#5b5ef4,#818cf8)", color: "#fff", fontWeight: 700, fontSize: 14, fontFamily: "inherit", cursor: "pointer", whiteSpace: "nowrap" }}>+ Add</button>
            </div>
            {form.notes.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {form.notes.map(n => (
                  <div key={n.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 10, background: "#f8f9fe", border: "1px solid #e5e9f5" }}>
                    <span style={{ fontSize: 14, flex: 1, color: "#334155" }}>📌 {n.text}</span>
                    <button onClick={() => removeNote(n.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#fca5a5", fontSize: 16, fontWeight: 700 }}>✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button onClick={saveEntry} style={{ width: "100%", padding: 14, borderRadius: 12, border: "none", background: "linear-gradient(135deg,#5b5ef4,#818cf8)", color: "#fff", fontWeight: 700, fontSize: 15, fontFamily: "inherit", cursor: "pointer", boxShadow: "0 4px 16px rgba(91,94,244,0.3)" }}>
            💾 Save Study Entry
          </button>
        </div>
      )}

      {/* ══ HISTORY VIEW ══ */}
      {view === "history" && (
        <>
          {/* Edit Modal */}
          {editingEntry && (
            <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
              onClick={() => setEditingEntry(null)}>
              <div style={{ background: "#fff", borderRadius: 20, padding: 28, width: "100%", maxWidth: 560, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 8px 40px rgba(0,0,0,0.16)" }}
                onClick={e => e.stopPropagation()}>
                <div style={{ fontSize: 17, fontWeight: 800, color: "#0f172a", marginBottom: 20 }}>✏️ Edit Study Entry</div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                  <div>
                    <label style={labelStyle}>Date</label>
                    <input type="date" value={editingEntry.date} onChange={e => setEditingEntry(x => x ? { ...x, date: e.target.value } : x)} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Topic Name</label>
                    <input value={editingEntry.topicName} onChange={e => setEditingEntry(x => x ? { ...x, topicName: e.target.value } : x)} style={inputStyle} />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                  <div>
                    <label style={labelStyle}>Video Recorded?</label>
                    <YesNoToggle value={editingEntry.videoRecorded} onChange={v => setEditingEntry(x => x ? { ...x, videoRecorded: v } : x)} />
                  </div>
                  <div>
                    <label style={labelStyle}>Video Access Provided?</label>
                    <YesNoToggle value={editingEntry.videoAccess} onChange={v => setEditingEntry(x => x ? { ...x, videoAccess: v } : x)} />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                  <div>
                    <label style={labelStyle}>Programs Given</label>
                    <input type="number" min={0} value={editingEntry.programsGiven} onChange={e => setEditingEntry(x => x ? { ...x, programsGiven: parseInt(e.target.value) || 0 } : x)} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Programs Submitted</label>
                    <input type="number" min={0} value={editingEntry.programsSubmitted} onChange={e => setEditingEntry(x => x ? { ...x, programsSubmitted: parseInt(e.target.value) || 0 } : x)} style={inputStyle} />
                  </div>
                </div>

                {/* Notes in edit */}
                <div style={{ marginBottom: 18 }}>
                  <label style={labelStyle}>Notes</label>
                  <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                    <input value={editNote} onChange={e => setEditNote(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && addNoteToEdit()}
                      placeholder="Add a note..."
                      style={{ ...inputStyle, flex: 1 }} />
                    <button onClick={addNoteToEdit} style={{ padding: "10px 14px", borderRadius: 10, border: "none", background: "#5b5ef4", color: "#fff", fontWeight: 700, fontFamily: "inherit", cursor: "pointer" }}>+ Add</button>
                  </div>
                  {editingEntry.notes.map(n => (
                    <div key={n.id} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      {editingNoteId === n.id ? (
                        <input value={n.text} onChange={e => updateNoteInEdit(n.id, e.target.value)}
                          onBlur={() => setEditingNoteId(null)}
                          autoFocus
                          style={{ ...inputStyle, flex: 1 }} />
                      ) : (
                        <div style={{ flex: 1, padding: "10px 14px", borderRadius: 10, background: "#f8f9fe", border: "1px solid #e5e9f5", fontSize: 14, color: "#334155" }}>📌 {n.text}</div>
                      )}
                      <button onClick={() => setEditingNoteId(n.id)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, color: "#94a3b8" }}>✏️</button>
                      <button onClick={() => removeNoteFromEdit(n.id)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 15, color: "#fca5a5", fontWeight: 700 }}>✕</button>
                    </div>
                  ))}
                </div>

                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={saveEdit} style={{ flex: 1, padding: 13, borderRadius: 10, border: "none", background: "linear-gradient(135deg,#5b5ef4,#818cf8)", color: "#fff", fontWeight: 700, fontSize: 14, fontFamily: "inherit", cursor: "pointer" }}>Save Changes ✅</button>
                  <button onClick={() => setEditingEntry(null)} style={{ flex: 1, padding: 13, borderRadius: 10, border: "1.5px solid #e5e9f5", background: "#f8f9fe", color: "#64748b", fontWeight: 700, fontSize: 14, fontFamily: "inherit", cursor: "pointer" }}>Cancel</button>
                </div>
              </div>
            </div>
          )}

          {entries.length === 0 ? (
            <div style={{ background: "#fff", border: "1px solid #e5e9f5", borderRadius: 16, padding: "60px 24px", textAlign: "center" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📚</div>
              <p style={{ color: "#64748b", fontSize: 15 }}>No study entries yet. Add one in Entry tab.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {entries.map(e => (
                <div key={e.id} style={{ background: "#fff", border: "1px solid #e5e9f5", borderRadius: 16, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                  {/* Header */}
                  <div style={{ padding: "14px 20px", background: "#f8f9fe", borderBottom: "1px solid #e5e9f5", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                      <span style={{ fontWeight: 800, fontSize: 15, color: "#0f172a" }}>📚 {e.topicName}</span>
                      <span style={{ fontSize: 12, color: "#94a3b8", marginLeft: 10 }}>📅 {fmtDate(e.date)}</span>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => startEdit(e)} style={{ padding: "6px 14px", borderRadius: 8, border: "1.5px solid #c7d2fe", background: "#eef0ff", color: "#5b5ef4", fontWeight: 700, fontSize: 12, fontFamily: "inherit", cursor: "pointer" }}>✏️ Edit</button>
                      <button onClick={() => deleteEntry(e.id)} style={{ padding: "6px 14px", borderRadius: 8, border: "1.5px solid #fecaca", background: "#fef2f2", color: "#dc2626", fontWeight: 700, fontSize: 12, fontFamily: "inherit", cursor: "pointer" }}>🗑 Delete</button>
                    </div>
                  </div>

                  {/* Body */}
                  <div style={{ padding: "16px 20px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: e.notes.length > 0 ? 14 : 0 }}>
                      {[
                        { label: "Video Recorded", value: e.videoRecorded || "—", color: e.videoRecorded === "Yes" ? "#059669" : e.videoRecorded === "No" ? "#dc2626" : "#94a3b8", bg: e.videoRecorded === "Yes" ? "#ecfdf5" : e.videoRecorded === "No" ? "#fef2f2" : "#f8f9fe" },
                        { label: "Video Access",   value: e.videoAccess || "—",   color: e.videoAccess === "Yes" ? "#059669" : e.videoAccess === "No" ? "#dc2626" : "#94a3b8",   bg: e.videoAccess === "Yes" ? "#ecfdf5" : e.videoAccess === "No" ? "#fef2f2" : "#f8f9fe" },
                        { label: "Programs Given",     value: e.programsGiven,     color: "#d97706", bg: "#fffbeb" },
                        { label: "Programs Submitted", value: e.programsSubmitted, color: "#6366f1", bg: "#eef0ff" },
                      ].map(item => (
                        <div key={item.label} style={{ background: item.bg, borderRadius: 12, padding: "12px 14px", textAlign: "center" }}>
                          <div style={{ fontSize: 20, fontWeight: 800, color: item.color }}>{item.value}</div>
                          <div style={{ fontSize: 11, color: "#64748b", marginTop: 4, fontWeight: 500 }}>{item.label}</div>
                        </div>
                      ))}
                    </div>

                    {/* Notes */}
                    {e.notes.length > 0 && (
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", letterSpacing: "1px", textTransform: "uppercase", marginBottom: 8 }}>Notes</div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                          {e.notes.map(n => (
                            <div key={n.id} style={{ padding: "10px 14px", borderRadius: 10, background: "#f8f9fe", border: "1px solid #e5e9f5", fontSize: 13, color: "#334155" }}>
                              📌 {n.text}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}