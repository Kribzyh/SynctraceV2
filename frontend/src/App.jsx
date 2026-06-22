import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import InitializeProject from './pages/InitializeProject.jsx'
import Analysis from './pages/Analysis.jsx'
import Artifacts from './pages/Artifacts.jsx'
import Continuity from './pages/Continuity.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Login from './pages/Login.jsx'
import Matrix from './pages/Matrix.jsx'
import TraceabilityMapping from './pages/TraceabilityMapping.jsx'
import Reports from './pages/Reports.jsx'
import SignUp from './pages/SignUp.jsx'
import Workspace from './pages/Workspace.jsx'
import AdviserDashboard from './pages/adviser/AdviserDashboard.jsx'
import ProjectReview from './pages/adviser/ProjectReview.jsx'
import AdviserMatrix from './pages/adviser/AdviserMatrix.jsx'
import ComponentInspection from './pages/adviser/ComponentInspection.jsx'
import AdviserContinuity from './pages/adviser/AdviserContinuity.jsx'
import EvaluationRemarks from './pages/adviser/EvaluationRemarks.jsx'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/initialize-project" element={<InitializeProject />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/workspace" element={<Workspace />} />
        <Route path="/artifacts" element={<Artifacts />} />
        <Route path="/mapping" element={<TraceabilityMapping />} />
        <Route path="/matrix" element={<Matrix />} />
        <Route path="/continuity" element={<Continuity />} />
        <Route path="/analysis" element={<Analysis />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/gap" element={<Navigate to="/continuity" replace />} />
        <Route path="/ai-config" element={<Navigate to="/analysis?tab=config" replace />} />
        <Route path="/adviser/dashboard" element={<AdviserDashboard />} />
        <Route path="/adviser/review/:projectId" element={<ProjectReview />} />
        <Route path="/adviser/matrix/:projectId" element={<AdviserMatrix />} />
        <Route path="/adviser/inspection/:projectId" element={<ComponentInspection />} />
        <Route path="/adviser/inspection/:projectId/:componentId" element={<ComponentInspection />} />
        <Route path="/adviser/continuity/:projectId" element={<AdviserContinuity />} />
        <Route path="/adviser/evaluation/:projectId" element={<EvaluationRemarks />} />
        <Route path="/gap-analysis" element={<Navigate to="/continuity" replace />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
