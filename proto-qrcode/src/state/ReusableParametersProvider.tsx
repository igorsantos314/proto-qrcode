import type { ReactNode } from 'react'
import { useReusableParameters } from '../hooks/useReusableParameters'
import { ReusableParametersContext } from './ReusableParametersContext'

export function ReusableParametersProvider({
  children,
}: {
  children: ReactNode
}) {
  const value = useReusableParameters()
  return (
    <ReusableParametersContext.Provider value={value}>
      {children}
    </ReusableParametersContext.Provider>
  )
}
