import DisplayBudgets from '@/parts/budget/DisplayBudget'
import Header from '@/parts/common/Header'
import React from 'react'

function Budget() {
  return (
    <div className="flex-1 overflow-auto relative z-10">
          <Header title="Budgets" />
          <DisplayBudgets/>
    </div>
  )
}

export default Budget