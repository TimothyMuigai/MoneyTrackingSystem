import OverviewCards from '@/parts/analytics/OverviewCards'
import Header from '@/parts/common/Header'
import React from 'react'



function Analytics() {
  return (
    <div className='flex-1 overflow-auto relative z-10 bg-gray-900'>
			<Header title={"Analytics Dashboard"} />

			<main className='max-w-7xl mx-auto py-6 px-4 lg:px-8'>
				<OverviewCards/>

				<div className='grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8'>
					
				</div>
			</main>
		</div>
  )
}

export default Analytics