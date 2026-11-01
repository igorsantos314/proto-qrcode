import type { ReactNode } from 'react'
import { useBudgets } from '../hooks/useBudgets'
import { BudgetsContext } from './BudgetsContext'

export function BudgetsProvider({ children }: { children: ReactNode }) {
  const value = useBudgets()
  return (
    <BudgetsContext.Provider value={value}>{children}</BudgetsContext.Provider>
  )
}
