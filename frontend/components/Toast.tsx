"use client"
import { useEffect, useState } from "react"

export type ToastType = "success" | "error" | "warning" | "info"

export interface ToastMessage {
  id: number
  message: string
  type: ToastType
}

interface Props {
  toasts: ToastMessage[]
  removeToast: (id: number) => void
}

export default function Toast({ toasts, removeToast }: Props) {
  const colors: any = {
    success: { bg:"#f0fdf4", border:"#86efac", color:"#16a34a", icon:"✅" },
    error:   { bg:"#fef2f2", border:"#fca5a5", color:"#dc2626", icon:"❌" },
    warning: { bg:"#fffbeb", border:"#fcd34d", color:"#d97706", icon:"⚠️" },
    info:    { bg:"#eff6ff", border:"#93c5fd", color:"#2563eb", icon:"ℹ️" },
  }

  return (
    <div style={{ position:"fixed", top:24, right:24, zIndex:9999, display:"flex", flexDirection:"column", gap:10 }}>
      {toasts.map(t => {
        const c = colors[t.type]
        return (
          <div key={t.id} style={{
            background:c.bg, border:`1.5px solid ${c.border}`, borderRadius:12,
            padding:"14px 18px", display:"flex", alignItems:"center", gap:10,
            boxShadow:"0 8px 24px rgba(0,0,0,0.1)", minWidth:280, maxWidth:360,
            animation:"slideIn 0.3s cubic-bezier(.16,1,.3,1)",
            fontFamily:"'Plus Jakarta Sans',sans-serif"
          }}>
            <style>{`@keyframes slideIn{from{opacity:0;transform:translateX(40px)}to{opacity:1;transform:translateX(0)}}`}</style>
            <span style={{ fontSize:18 }}>{c.icon}</span>
            <span style={{ flex:1, fontSize:14, fontWeight:600, color:c.color }}>{t.message}</span>
            <button onClick={() => removeToast(t.id)} style={{ background:"none", border:"none", cursor:"pointer", color:c.color, fontSize:16, padding:0, opacity:0.6 }}>✕</button>
          </div>
        )
      })}
    </div>
  )
}