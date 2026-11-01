import { useContext } from 'react'
import { BudgetsContext } from '../state/BudgetsContext'
import type { UseBudgets } from './useBudgets'

export function useBudgetsContext(): UseBudgets {
  const context = useContext(BudgetsContext)
  if (!context) {
    throw new Error('useBudgetsContext must be used within a BudgetsProvider')
  }
  return context
}
