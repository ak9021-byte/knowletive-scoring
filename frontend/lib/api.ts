import axios from "axios"

const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
})

// Students
export const getStudents = () => API.get("/students/")
export const createStudent = (data: { name: string; email: string }) =>
  API.post("/students/", data)
export const deleteStudent = (id: number) => API.delete(`/students/${id}`)
export const studentLogin = (email: string) =>
  API.post(`/students/login?email=${email}`)

// Scores
export const submitScore = (data: any) => API.post("/scores/", data)
export const getLeaderboard = () => API.get("/scores/leaderboard/today")
export const getWeeklyLeaderboard = () => API.get("/scores/leaderboard/weekly")   // ✅ added
export const getMonthlyLeaderboard = () => API.get("/scores/leaderboard/monthly") // ✅ added
export const getStudentOfDay = () => API.get("/scores/student-of-the-day")
export const getWeeklyScores = (studentId: number) =>
  API.get(`/scores/weekly/${studentId}`)
export const getMyScores = (studentId: number) =>
  API.get(`/scores/my-scores/${studentId}`)

// Rewards
export const giveReward = (data: any) =>
  API.post("/students/rewards/give", data)
export const getStudentRewards = (studentId: number) =>
  API.get(`/students/rewards/student/${studentId}`)
export const getAllRewards = () => API.get("/students/rewards/all")