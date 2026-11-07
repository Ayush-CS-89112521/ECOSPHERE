'use client'

import { useCallback } from 'react'
import Header from '@/components/common/Header'
import Footer from '@/components/common/Footer'
import Dashboard from '@/components/dashboard/Dashboard'
import PersonalSettings from '@/components/dashboard/PersonalSettings'
import { useClerkStatus } from '@/components/auth/ClerkSafeProvider'
import { useAccountDatabase } from '@/lib/use-account-database'

function AccountDashboard() {
  const { client, userId } = useAccountDatabase()
  const recordAqiCheck = useCallback(async () => {
    const { error } = await client.rpc('ecosphere_record_aqi_check')
    if (error) throw error
  }, [client])

  return <Dashboard key={userId ?? 'guest'} recordAqiCheck={client ? recordAqiCheck : undefined} />
}

export default function DashboardPage() {
  const { isConfigured } = useClerkStatus()
  return (
    <div className="min-h-screen flex flex-col bg-[#0e110f] text-[#f5f2ea] selection:bg-[#d49a50] selection:text-[#0e110f]">
      <Header />
      <main className="flex-1 pt-20">
        <PersonalSettings />
        {isConfigured ? <AccountDashboard /> : <Dashboard />}
      </main>
      <Footer />
    </div>
  )
}
