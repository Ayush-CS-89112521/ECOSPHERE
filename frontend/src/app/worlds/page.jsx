'use client'

import Header from '@/components/common/Header'
import Footer from '@/components/common/Footer'
import EnvironmentalWorlds from '@/components/dashboard/EnvironmentalWorlds'
import AuthGuard from '@/components/auth/AuthGuard'

export default function WorldsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0e110f] text-[#f5f2ea] selection:bg-[#d49a50] selection:text-[#0e110f]">
      <Header />
      <main className="flex-1 pt-20">
        <AuthGuard requireAuth={false}>
          <p className="mx-auto max-w-6xl px-6 py-3 text-xs text-ochre border-b border-white/10">Illustrative exhibit: example values and achievements are not live measurements or saved user activity.</p>
          <EnvironmentalWorlds />
        </AuthGuard>
      </main>
      <Footer />
    </div>
  )
}
