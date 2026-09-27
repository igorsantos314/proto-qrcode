import { createContext } from 'react'
import type { UseSavedQrcodes } from '../hooks/useSavedQrcodes'

export const SavedQrcodesContext = createContext<UseSavedQrcodes | null>(null)