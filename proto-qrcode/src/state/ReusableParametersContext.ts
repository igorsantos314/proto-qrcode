import { createContext } from 'react'
import type { UseReusableParameters } from '../hooks/useReusableParameters'

export const ReusableParametersContext =
  createContext<UseReusableParameters | null>(null)
