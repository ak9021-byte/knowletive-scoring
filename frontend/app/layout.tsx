import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Knowletive Scoring System",
  description: "Student Performance Tracking",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Outfit:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body style={{ fontFamily:"'Plus Jakarta Sans', sans-serif", margin:0, background:"#f8f9fc" }}>
        {children}
      </body>
    </html>
  )
}