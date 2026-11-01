import { createContext } from 'react'
import type { UseBudgets } from '../hooks/useBudgets'

export const BudgetsContext = createContext<UseBudgets | null>(null)
