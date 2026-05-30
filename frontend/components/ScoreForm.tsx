"use client"
import { useState } from "react"
import { Student } from "@/lib/types"
import { submitScore } from "@/lib/api"

interface Props {
  students: Student[]
  onScoreSubmitted: () => void
}

export default function ScoreForm({ students, onScoreSubmitted }: Props) {
  const [form, setForm] = useState({
    student_id: "",
    date: new Date().toISOString().split("T")[0],
    attendance: 0,
    speak_up: 0,
    activity: 0,
    technical: 0,
    behavior: 0,
    initiative: 0,
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const scoreOptions: any = {
    attendance: [0, 5, 10],
    speak_up: [0, 5, 10, 15],
    activity: [0, 10, 15, 20],
    technical: [0, 10, 20, 30],
    behavior: [0, 5, 10],
    initiative: [0, 5, 10, 15],
  }

  const labels: any = {
    attendance: "🟢 Attendance (10)",
    speak_up: "🎤 Speak Up (15)",
    activity: "⚡ Activity (20)",
    technical: "💻 Technical (30)",
    behavior: "🤝 Behavior (10)",
    initiative: "🚀 Initiative (15)",
  }

  const total = Object.keys(scoreOptions).reduce(
    (sum, key) => sum + Number((form as any)[key]), 0
  )

  const handleSubmit = async () => {
    if (!form.student_id) return alert("Please select a student!")
    setLoading(true)
    try {
      await submitScore({ ...form, student_id: Number(form.student_id), total })
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
      onScoreSubmitted()
    } catch (err) {
      alert("Error submitting score!")
    }
    setLoading(false)
  }

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">📝 Submit Daily Score</h2>

      <div className="mb-4">
        <label className="text-sm font-medium text-gray-600">Select Student</label>
        <select
          className="w-full mt-1 border rounded-lg p-2 text-gray-800"
          value={form.student_id}
          onChange={(e) => setForm({ ...form, student_id: e.target.value })}
        >
          <option value="">-- Select --</option>
          {students.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label className="text-sm font-medium text-gray-600">Date</label>
        <input
          type="date"
          className="w-full mt-1 border rounded-lg p-2 text-gray-800"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
        />
      </div>

      <div className="space-y-3">
        {Object.keys(scoreOptions).map((key) => (
          <div key={key} className="flex justify-between items-center">
            <label className="text-sm font-medium text-gray-700">{labels[key]}</label>
            <div className="flex gap-2">
              {scoreOptions[key].map((val: number) => (
                <button
                  key={val}
                  onClick={() => setForm({ ...form, [key]: val })}
                  className={`px-3 py-1 rounded-lg text-sm font-semibold border transition ${
                    (form as any)[key] === val
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-white text-gray-600 border-gray-300 hover:border-indigo-400"
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-between items-center">
        <div className="text-2xl font-bold text-indigo-600">
          Total: {total}/100
        </div>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition"
        >
          {loading ? "Submitting..." : "Submit Score"}
        </button>
      </div>

      {success && (
        <div className="mt-3 text-green-600 font-semibold text-center">
          ✅ Score submitted successfully!
        </div>
      )}
    </div>
  )
}