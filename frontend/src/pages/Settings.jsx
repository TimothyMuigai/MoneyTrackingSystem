import Header from '@/parts/common/Header'
import Currency from '@/parts/settings/Currency'
import DangerZone from '@/parts/settings/DangerZone'
import NotificationSettings from '@/parts/settings/NotificationSettings'
import Profile from '@/parts/settings/Profile'
import Security from '@/parts/settings/Security'
import React from 'react'

function Settings() {
  return (
    <div className='flex-1 overflow-auto relative z-10 bg-gray-900'>
      <Header title='Settings' />
      <main className='max-w-4xl mx-auto py-6 px-4 lg:px-8'>
          <Profile />
          <NotificationSettings/>
          <Currency/>
          <Security/>
          <DangerZone/>
      </main>
    </div>
  )
}

export default Settings