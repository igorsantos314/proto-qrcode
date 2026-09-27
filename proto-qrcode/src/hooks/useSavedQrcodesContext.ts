import { useContext } from 'react'
import { SavedQrcodesContext } from '../state/SavedQrcodesContext'
import type { UseSavedQrcodes } from './useSavedQrcodes'

export function useSavedQrcodesContext(): UseSavedQrcodes {
  const context = useContext(SavedQrcodesContext)
  if (!context) {
    throw new Error(
      'useSavedQrcodesContext must be used within a SavedQrcodesProvider',
    )
  }
  return context
}