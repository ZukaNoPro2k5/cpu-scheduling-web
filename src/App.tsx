import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { AlgorithmTabs } from './components/Layout/AlgorithmTabs';
import { AlgorithmPage, AlgorithmId } from './pages/AlgorithmPage';

const ALGORITHM_IDS: AlgorithmId[] = ['fcfs', 'sjf', 'srtf', 'priority', 'priority-p', 'rr', 'mlq', 'mlfq'];

const PATH_TO_ID: Record<string, AlgorithmId> = {
  '/fcfs': 'fcfs', '/sjf': 'sjf', '/srtf': 'srtf',
  '/priority': 'priority', '/priority-p': 'priority-p',
  '/rr': 'rr', '/mlq': 'mlq', '/mlfq': 'mlfq',
};

function AppContent() {
  const [isDirty, setIsDirty] = useState(false);
  const [processCount, setProcessCount] = useState(4);
  const location = useLocation();

  const algorithmId: AlgorithmId = PATH_TO_ID[location.pathname] ?? 'fcfs';

  return (
    <div className="min-h-screen bg-bg-primary">
      <AlgorithmTabs processCount={processCount} isDirty={isDirty} />
      <Routes>
        <Route path="/" element={<Navigate to="/fcfs" replace />} />
        {ALGORITHM_IDS.map((id) => (
          <Route key={id} path={`/${id}`} element={<span />} />
        ))}
        <Route path="*" element={<Navigate to="/fcfs" replace />} />
      </Routes>
      <AlgorithmPage
        algorithmId={algorithmId}
        onDirtyChange={setIsDirty}
        onProcessCountChange={setProcessCount}
      />
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
