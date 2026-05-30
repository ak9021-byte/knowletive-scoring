"use client"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"

interface Props {
  scores: any[]
}

export default function WeeklyChart({ scores }: Props) {
  const data = scores.slice(0, 7).reverse().map((s: any) => ({
    date: new Date(s.date).toLocaleDateString("en-US", { weekday:"short", month:"short", day:"numeric" }),
    total: s.total,
    attendance: s.attendance,
    speak_up: s.speak_up,
    activity: s.activity,
    technical: s.technical,
    behavior: s.behavior,
    initiative: s.initiative,
  }))

  const getColor = (val: number) =>
    val >= 90 ? "#7c3aed" : val >= 75 ? "#2563eb" : val >= 50 ? "#d97706" : "#dc2626"

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload
      return (
        <div style={{ background:"#fff", border:"1px solid #e2e8f0", borderRadius:12, padding:"14px 16px", boxShadow:"0 8px 24px rgba(0,0,0,0.1)", fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
          <div style={{ fontWeight:700, color:"#0f172a", marginBottom:8, fontSize:13 }}>{label}</div>
          <div style={{ fontSize:22, fontWeight:800, color:getColor(d.total), marginBottom:8 }}>{d.total}/100</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"4px 16px", fontSize:12, color:"#64748b" }}>
            <span>🟢 Attendance: {d.attendance}</span>
            <span>🎤 Speak Up: {d.speak_up}</span>
            <span>⚡ Activity: {d.activity}</span>
            <span>💻 Technical: {d.technical}</span>
            <span>🤝 Behavior: {d.behavior}</span>
            <span>🚀 Initiative: {d.initiative}</span>
          </div>
        </div>
      )
    }
    return null
  }

  if (data.length === 0) return (
    <div style={{ textAlign:"center", padding:"40px", color:"#94a3b8" }}>
      <div style={{ fontSize:40, marginBottom:8 }}>📊</div>
      <p>No score history yet</p>
    </div>
  )

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <div>
          <h3 style={{ fontFamily:"'Outfit',sans-serif", fontSize:16, fontWeight:700, color:"#0f172a", margin:0 }}>📈 Weekly Performance</h3>
          <p style={{ fontSize:12, color:"#94a3b8", margin:"4px 0 0" }}>Last {data.length} sessions</p>
        </div>
        <div style={{ display:"flex", gap:12, fontSize:12, color:"#64748b" }}>
          {[
            { color:"#7c3aed", label:"Pro (90+)" },
            { color:"#2563eb", label:"Skilled (75+)" },
            { color:"#d97706", label:"Learner (50+)" },
            { color:"#dc2626", label:"Beginner" },
          ].map(l => (
            <div key={l.label} style={{ display:"flex", alignItems:"center", gap:4 }}>
              <div style={{ width:10, height:10, borderRadius:3, background:l.color }} />
              <span>{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} barSize={36} margin={{ top:5, right:10, bottom:5, left:-10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis dataKey="date" tick={{ fontSize:11, fill:"#94a3b8", fontFamily:"'Plus Jakarta Sans',sans-serif" }} axisLine={false} tickLine={false} />
          <YAxis domain={[0,100]} tick={{ fontSize:11, fill:"#94a3b8" }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill:"rgba(99,102,241,0.05)", radius:8 }} />
          <Bar dataKey="total" radius={[8,8,0,0]}>
            {data.map((entry, i) => (
              <Cell key={i} fill={getColor(entry.total)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}