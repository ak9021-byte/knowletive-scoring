"use client"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function WeeklyPage() {
  const router = useRouter()
  useEffect(() => { router.push("/faculty") }, [])
  return null
}