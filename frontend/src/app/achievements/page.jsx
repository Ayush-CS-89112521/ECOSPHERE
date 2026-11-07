'use client'

import Header from '@/components/common/Header'
import Footer from '@/components/common/Footer'
import AchievementSystem from '@/components/spectacular/AchievementSystem'

export default function AchievementsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0e110f] text-[#f5f2ea] selection:bg-[#d49a50] selection:text-[#0e110f]">
      <Header />
      <main className="flex-1 pt-20">
        <AchievementSystem />
      </main>
      <Footer />
    </div>
  )
}
