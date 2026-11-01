import { useContext } from 'react'
import { ReusableParametersContext } from '../state/ReusableParametersContext'
import type { UseReusableParameters } from './useReusableParameters'

export function useReusableParametersContext(): UseReusableParameters {
  const context = useContext(ReusableParametersContext)
  if (!context) {
    throw new Error(
      'useReusableParametersContext must be used within a ReusableParametersProvider',
    )
  }
  return context
}
