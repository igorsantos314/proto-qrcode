import {
  HashRouter,
  Navigate,
  useLocation,
} from 'react-router-dom'
import { AppBar } from './components/AppBar'
import { Footer } from './components/Footer'
import { QrCodePage } from './pages/QrCodePage'
import { BudgetsPage } from './pages/BudgetsPage'
import { SavedQrcodesProvider } from './state/SavedQrcodesProvider'
import { BudgetsProvider } from './state/BudgetsProvider'
import { ReusableParametersProvider } from './state/ReusableParametersProvider'
import './App.css'

function AppContent() {
  const location = useLocation()
  const isQrRoute = location.pathname === '/'
  const isBudgetsRoute = location.pathname === '/orcamentos'

  if (!isQrRoute && !isBudgetsRoute) {
    return <Navigate to="/" replace />
  }

  return (
    <>
      <div hidden={!isQrRoute}>
        <QrCodePage />
      </div>
      {isBudgetsRoute && <BudgetsPage />}
    </>
  )
}

export default function App() {
  return (
    <SavedQrcodesProvider>
      <ReusableParametersProvider>
        <BudgetsProvider>
          <HashRouter>
            <div className="app">
              <AppBar />
              <AppContent />
              <Footer />
            </div>
          </HashRouter>
        </BudgetsProvider>
      </ReusableParametersProvider>
    </SavedQrcodesProvider>
  )
}
