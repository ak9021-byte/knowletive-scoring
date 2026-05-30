export interface Student {
  id: number
  name: string
  email: string
  level: string
  joined_at: string
}

export interface Score {
  id: number
  student_id: number
  date: string
  attendance: number
  speak_up: number
  activity: number
  technical: number
  behavior: number
  initiative: number
  total: number
  rank: number
}

export interface LeaderboardEntry {
  name: string
  total: number
  rank: number
}

export interface StudentOfDay {
  student_of_the_day: string
  score: number
}