"use client"
import { useState } from "react"
import { fetchAttendanceFromSheet } from "@/lib/api"

export default function AttendanceTracker() {
  const [sheetUrl, setSheetUrl] = useState("https://docs.google.com/spreadsheets/d/1BV-Dgl6CwPlv1KrQux9mNoGCA6qouBH9/edit?usp=sharing&ouid=107551391375033821000&rtpof=true&sd=true")
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [selectedStudent, setSelectedStudent] = useState<any>(null)
  const [search, setSearch] = useState("")

  const extractSheetId = (url: string) => {
    const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)
    return match ? match[1] : null
  }

  const handleSync = async () => {
    setError(""); setLoading(true); setData(null)
    const sheetId = extractSheetId(sheetUrl)
    if (!sheetId) { setError("Invalid Google Sheet URL"); setLoading(false); return }
    try {
      const result = await fetchAttendanceFromSheet(sheetId)
      setData(result)
    } catch {
      setError("Could not fetch sheet. Make sure it is public.")
    }
    setLoading(false)
  }

  const filtered = data?.students?.filter((s: any) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  ) || []

  const getStatusColor = (val: string) => {
    const v = val?.toLowerCase()
    if (v === "p" || v === "present" || v === "1") return { bg:"#ecfdf5", color:"#059669", border:"#a7f3d0", label:"P" }
    if (v === "a" || v === "absent" || v === "0") return { bg:"#fef2f2", color:"#dc2626", border:"#fecaca", label:"A" }
    return { bg:"#f8f9fe", color:"#94a3b8", border:"#e5e9f5", label:"—" }
  }

  const getPctColor = (pct: number) =>
    pct >= 90 ? "#059669" : pct >= 75 ? "#2563eb" : pct >= 50 ? "#d97706" : "#dc2626"

  return (
    <div>
      {/* Sync Card */}
      <div style={{ background:"#fff", border:"1px solid #e5e9f5", borderRadius:16, padding:24, marginBottom:20, boxShadow:"0 1px 3px rgba(0,0,0,0.06)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:16 }}>
          <div style={{ width:44, height:44, borderRadius:12, background:"#ecfdf5", border:"1px solid #a7f3d0", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22 }}>📊</div>
          <div>
            <div style={{ fontWeight:700, fontSize:16, color:"#0f172a" }}>Google Sheet Sync</div>
            <div style={{ fontSize:12, color:"#64748b", marginTop:1 }}>Paste your HR's Google Sheet link to load attendance</div>
          </div>
        </div>
        <div style={{ display:"flex", gap:10 }}>
          <input
            value={sheetUrl}
            onChange={e => setSheetUrl(e.target.value)}
            placeholder="Paste Google Sheet URL here..."
            style={{ flex:1, padding:"11px 14px", border:"1.5px solid #e5e9f5", borderRadius:10, fontSize:14, fontFamily:"'Plus Jakarta Sans',sans-serif", outline:"none", color:"#0f172a" }}
            onFocus={e => e.target.style.borderColor="#5b5ef4"}
            onBlur={e => e.target.style.borderColor="#e5e9f5"}
          />
          <button onClick={handleSync} disabled={loading}
            style={{ padding:"11px 24px", borderRadius:10, border:"none", cursor:"pointer", fontWeight:700, fontSize:14, fontFamily:"'Plus Jakarta Sans',sans-serif", background:"linear-gradient(135deg,#5b5ef4,#818cf8)", color:"#fff", boxShadow:"0 4px 16px rgba(91,94,244,0.3)", transition:"all 0.2s", whiteSpace:"nowrap" }}>
            {loading ? "⏳ Loading..." : "🔄 Sync Now"}
          </button>
        </div>
        {error && (
          <div style={{ marginTop:12, padding:"10px 14px", background:"#fef2f2", border:"1px solid #fecaca", borderRadius:10, color:"#dc2626", fontSize:13, fontWeight:500 }}>
            ⚠️ {error}
          </div>
        )}
      </div>

      {/* Summary Stats */}
      {data && (
        <>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14, marginBottom:20 }}>
            {[
              { label:"Total Students", value:data.students.length, icon:"👥", color:"#6366f1", bg:"#eef0ff" },
              { label:"Tracking Days", value:data.headers.length, icon:"📅", color:"#059669", bg:"#ecfdf5" },
              { label:"Avg Attendance", value:`${Math.round(data.students.reduce((s:number,st:any)=>s+st.percentage,0)/data.students.length)}%`, icon:"📊", color:"#d97706", bg:"#fffbeb" },
            ].map(s => (
              <div key={s.label} style={{ background:"#fff", border:"1px solid #e5e9f5", borderRadius:16, padding:"20px 22px", boxShadow:"0 1px 3px rgba(0,0,0,0.06)", position:"relative", overflow:"hidden" }}>
                <div style={{ width:40, height:40, borderRadius:10, background:s.bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, marginBottom:12 }}>{s.icon}</div>
                <div style={{ fontSize:32, fontWeight:800, color:s.color, lineHeight:1 }}>{s.value}</div>
                <div style={{ fontSize:13, color:"#64748b", marginTop:5, fontWeight:500 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Search */}
          <div style={{ marginBottom:16 }}>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="🔍 Search student name..."
              style={{ width:"100%", padding:"11px 16px", border:"1.5px solid #e5e9f5", borderRadius:10, fontSize:14, fontFamily:"'Plus Jakarta Sans',sans-serif", outline:"none", color:"#0f172a", background:"#fff", boxSizing:"border-box" as any }}
              onFocus={e => e.target.style.borderColor="#5b5ef4"}
              onBlur={e => e.target.style.borderColor="#e5e9f5"}
            />
          </div>

          {/* Student List */}
          {!selectedStudent ? (
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {filtered.map((s: any, i: number) => (
                <div key={i} onClick={() => setSelectedStudent(s)}
                  style={{ background:"#fff", border:"1px solid #e5e9f5", borderRadius:14, padding:"16px 20px", display:"flex", alignItems:"center", gap:16, cursor:"pointer", transition:"all 0.2s", boxShadow:"0 1px 3px rgba(0,0,0,0.04)" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow="0 4px 16px rgba(0,0,0,0.08)"; (e.currentTarget as HTMLDivElement).style.transform="translateX(3px)" }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow="0 1px 3px rgba(0,0,0,0.04)"; (e.currentTarget as HTMLDivElement).style.transform="translateX(0)" }}
                >
                  {/* Avatar */}
                  <div style={{ width:44, height:44, borderRadius:12, background:`linear-gradient(135deg,#667eea,#764ba2)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, fontWeight:800, color:"#fff", flexShrink:0 }}>
                    {s.name.charAt(0)}
                  </div>

                  {/* Name */}
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:700, fontSize:14, color:"#0f172a" }}>{s.name}</div>
                    <div style={{ fontSize:12, color:"#64748b", marginTop:2 }}>
                      Present: {s.presentDays} / {s.totalDays} days
                    </div>
                  </div>

                  {/* Recent days */}
                  <div style={{ display:"flex", gap:4 }}>
                    {data.headers.slice(-7).map((day: string) => {
                      const st = getStatusColor(s.attendance[day])
                      return (
                        <div key={day} title={`${day}: ${s.attendance[day] || "—"}`}
                          style={{ width:28, height:28, borderRadius:6, background:st.bg, border:`1px solid ${st.border}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:700, color:st.color }}>
                          {st.label}
                        </div>
                      )
                    })}
                  </div>

                  {/* Percentage */}
                  <div style={{ textAlign:"right", minWidth:70 }}>
                    <div style={{ fontSize:24, fontWeight:800, color:getPctColor(s.percentage), lineHeight:1 }}>{s.percentage}%</div>
                    <div style={{ fontSize:11, color:"#94a3b8", marginTop:2 }}>attendance</div>
                  </div>

                  <div style={{ fontSize:18, color:"#94a3b8" }}>›</div>
                </div>
              ))}
            </div>
          ) : (
            /* Student Detail View */
            <div>
              <button onClick={() => setSelectedStudent(null)}
                style={{ display:"flex", alignItems:"center", gap:8, padding:"9px 16px", borderRadius:10, border:"1.5px solid #e5e9f5", background:"#fff", cursor:"pointer", fontWeight:600, fontSize:13, fontFamily:"'Plus Jakarta Sans',sans-serif", color:"#475569", marginBottom:16, transition:"all 0.2s" }}>
                ← Back to All Students
              </button>

              <div style={{ background:"#fff", border:"1px solid #e5e9f5", borderRadius:16, padding:24, boxShadow:"0 1px 3px rgba(0,0,0,0.06)" }}>
                {/* Student header */}
                <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:24, paddingBottom:20, borderBottom:"1px solid #f1f5f9" }}>
                  <div style={{ width:56, height:56, borderRadius:14, background:"linear-gradient(135deg,#5b5ef4,#818cf8)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, fontWeight:800, color:"#fff" }}>
                    {selectedStudent.name.charAt(0)}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:800, fontSize:20, color:"#0f172a" }}>{selectedStudent.name}</div>
                    <div style={{ fontSize:13, color:"#64748b", marginTop:3 }}>
                      Present {selectedStudent.presentDays} out of {selectedStudent.totalDays} days
                    </div>
                  </div>
                  <div style={{ textAlign:"center", padding:"14px 24px", borderRadius:14, background:getPctColor(selectedStudent.percentage)+"15", border:`1.5px solid ${getPctColor(selectedStudent.percentage)}33` }}>
                    <div style={{ fontSize:36, fontWeight:800, color:getPctColor(selectedStudent.percentage), lineHeight:1 }}>{selectedStudent.percentage}%</div>
                    <div style={{ fontSize:12, color:"#64748b", marginTop:4 }}>Attendance Rate</div>
                  </div>
                </div>

                {/* Progress bar */}
                <div style={{ marginBottom:24 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                    <span style={{ fontSize:13, fontWeight:600, color:"#475569" }}>Overall Attendance</span>
                    <span style={{ fontSize:13, fontWeight:700, color:getPctColor(selectedStudent.percentage) }}>{selectedStudent.percentage}%</span>
                  </div>
                  <div style={{ height:10, background:"#f1f5f9", borderRadius:99, overflow:"hidden" }}>
                    <div style={{ height:"100%", width:`${selectedStudent.percentage}%`, background:`linear-gradient(90deg,${getPctColor(selectedStudent.percentage)}aa,${getPctColor(selectedStudent.percentage)})`, borderRadius:99, transition:"width 0.8s ease" }} />
                  </div>
                </div>

                {/* All days grid */}
                <div style={{ fontSize:11, fontWeight:700, color:"#94a3b8", letterSpacing:"1px", textTransform:"uppercase", marginBottom:14 }}>
                  Day-wise Attendance
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(72px,1fr))", gap:8 }}>
                  {data.headers.map((day: string) => {
                    const st = getStatusColor(selectedStudent.attendance[day])
                    return (
                      <div key={day} style={{ background:st.bg, border:`1.5px solid ${st.border}`, borderRadius:10, padding:"10px 8px", textAlign:"center" }}>
                        <div style={{ fontSize:11, color:"#64748b", fontWeight:600, marginBottom:4 }}>{day}</div>
                        <div style={{ fontSize:16, fontWeight:800, color:st.color }}>{st.label}</div>
                      </div>
                    )
                  })}
                </div>

                {/* Summary */}
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12, marginTop:20 }}>
                  {[
                    { label:"Present", value:selectedStudent.presentDays, color:"#059669", bg:"#ecfdf5" },
                    { label:"Absent", value:selectedStudent.totalDays - selectedStudent.presentDays - Object.values(selectedStudent.attendance).filter((v:any)=>!v).length, color:"#dc2626", bg:"#fef2f2" },
                    { label:"Not Marked", value:Object.values(selectedStudent.attendance).filter((v:any)=>!v||v==="").length, color:"#94a3b8", bg:"#f8f9fe" },
                  ].map(s => (
                    <div key={s.label} style={{ background:s.bg, borderRadius:12, padding:"14px 16px", textAlign:"center" }}>
                      <div style={{ fontSize:28, fontWeight:800, color:s.color }}>{s.value}</div>
                      <div style={{ fontSize:12, color:"#64748b", marginTop:4, fontWeight:500 }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Empty state */}
      {!data && !loading && (
        <div style={{ background:"#fff", border:"1px solid #e5e9f5", borderRadius:16, padding:"60px 24px", textAlign:"center", boxShadow:"0 1px 3px rgba(0,0,0,0.04)" }}>
          <div style={{ fontSize:52, marginBottom:14 }}>📋</div>
          <p style={{ color:"#64748b", fontSize:16, fontWeight:500 }}>Paste your Google Sheet URL above and click Sync</p>
          <p style={{ color:"#94a3b8", fontSize:13, marginTop:6 }}>Make sure the sheet is set to "Anyone with the link can view"</p>
        </div>
      )}
    </div>
  )
}