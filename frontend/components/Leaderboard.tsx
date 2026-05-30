import { LeaderboardEntry } from "@/lib/types"
import { Trophy } from "lucide-react"

interface Props {
  data: LeaderboardEntry[]
}

export default function Leaderboard({ data }: Props) {
  const medals = ["🥇", "🥈", "🥉"]

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        <Trophy size={22} className="text-yellow-500" />
        Today's Leaderboard
      </h2>
      {data.length === 0 ? (
        <p className="text-gray-400 text-center py-4">No scores yet today</p>
      ) : (
        <div className="space-y-3">
          {data.map((entry, index) => (
            <div
              key={index}
              className={`flex justify-between items-center p-3 rounded-lg ${
                index === 0 ? "bg-yellow-50 border border-yellow-200" :
                index === 1 ? "bg-gray-50 border border-gray-200" :
                index === 2 ? "bg-orange-50 border border-orange-200" :
                "bg-white border border-gray-100"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{medals[index] || `#${index + 1}`}</span>
                <span className="font-semibold text-gray-800">{entry.name}</span>
              </div>
              <span className="font-bold text-lg text-indigo-600">{entry.total}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}