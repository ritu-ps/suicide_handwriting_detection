import { useState } from 'react'
import LandingSection from './components/LandingSection'
import Dashboard from './components/Dashboard'

function App() {
  const [analysisType, setAnalysisType] = useState(null) // null, 'typing', 'handwriting'

  return (
    <main className="min-h-screen text-slate-200 selection:bg-purple-500/30">
      {!analysisType ? (
        <LandingSection onSelect={setAnalysisType} />
      ) : (
        <Dashboard type={analysisType} onBack={() => setAnalysisType(null)} />
      )}
    </main>
  )
}

export default App
