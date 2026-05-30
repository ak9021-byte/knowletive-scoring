import { Student } from "@/lib/types"
import { Trash2 } from "lucide-react"

interface Props {
  student: Student
  onDelete: (id: number) => void
}

export default function StudentCard({ student, onDelete }: Props) {
  const levelColors: any = {
    Beginner: "bg-red-100 text-red-700",
    Learner: "bg-yellow-100 text-yellow-700",
    Skilled: "bg-blue-100 text-blue-700",
    Pro: "bg-purple-100 text-purple-700",
  }

  return (
    <div className="bg-white rounded-xl p-4 shadow flex justify-between items-center">
      <div>
        <h3 className="font-bold text-gray-800">{student.name}</h3>
        <p className="text-sm text-gray-500">{student.email}</p>
        <span className={`text-xs px-2 py-1 rounded-full font-semibold mt-1 inline-block ${levelColors[student.level]}`}>
          {student.level}
        </span>
      </div>
      <button
        onClick={() => onDelete(student.id)}
        className="text-red-400 hover:text-red-600 transition"
      >
        <Trash2 size={18} />
      </button>
    </div>
  )
}