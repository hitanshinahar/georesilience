import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';

import { CommandCenter } from './pages/CommandCenter';
import { RiskAnalysis } from './pages/RiskAnalysis';
import { CascadingSimulation } from './pages/CascadingSimulation';
import { FieldSentinel } from './pages/FieldSentinel';
import { Incidents } from './pages/Incidents';
import { Alerts } from './pages/Alerts';
import { SystemHealth } from './pages/SystemHealth';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AppShell />}>
          <Route index element={<Navigate to="/command-center" replace />} />
          <Route path="command-center" element={<CommandCenter />} />
          <Route path="risk-analysis" element={<RiskAnalysis />} />
          <Route path="simulator" element={<CascadingSimulation />} />
          <Route path="sentinel" element={<FieldSentinel />} />
          <Route path="incidents" element={<Incidents />} />
          <Route path="alerts" element={<Alerts />} />
          <Route path="system" element={<SystemHealth />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
