import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { AlgorithmTabs } from './components/Layout/AlgorithmTabs';
import { AlgorithmPage, AlgorithmId } from './pages/AlgorithmPage';

const ALGORITHM_IDS: AlgorithmId[] = ['fcfs', 'sjf', 'srtf', 'priority', 'priority-p', 'rr', 'mlq', 'mlfq'];

function AppContent() {
  const [isDirty, setIsDirty] = useState(false);
  const [processCount] = useState(4);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-bg-primary">
      <AlgorithmTabs processCount={processCount} isDirty={isDirty} />
      <Routes>
        <Route path="/" element={<Navigate to="/fcfs" replace />} />
        {ALGORITHM_IDS.map((id) => (
          <Route
            key={id}
            path={`/${id}`}
            element={
              <AlgorithmPage
                key={location.pathname}
                algorithmId={id}
                onDirtyChange={setIsDirty}
              />
            }
          />
        ))}
        <Route path="*" element={<Navigate to="/fcfs" replace />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <HashRouter>
      <AppContent />
    </HashRouter>
  );
}
