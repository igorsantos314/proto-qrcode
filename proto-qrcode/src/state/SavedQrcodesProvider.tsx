import type { ReactNode } from 'react'
import { useSavedQrcodes } from '../hooks/useSavedQrcodes'
import { SavedQrcodesContext } from './SavedQrcodesContext'

export function SavedQrcodesProvider({ children }: { children: ReactNode }) {
  const value = useSavedQrcodes()
  return (
    <SavedQrcodesContext.Provider value={value}>
      {children}
    </SavedQrcodesContext.Provider>
  )
}