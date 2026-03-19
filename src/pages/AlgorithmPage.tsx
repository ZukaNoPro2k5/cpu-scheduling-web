import { useState, useCallback, useRef, useEffect } from 'react';
import { Process, ScheduleResult, MLQueueConfig, MLFQueueLevel, getProcessColor } from '../algorithms/types';
import { ProcessTable } from '../components/ProcessInput/ProcessTable';
import { MLQConfig } from '../components/ProcessInput/MLQConfig';
import { MLFQConfig, defaultLevels } from '../components/ProcessInput/MLFQConfig';
import { GanttChart } from '../components/Simulation/GanttChart';
import { MetricsPanel } from '../components/Results/MetricsPanel';

import { fcfs } from '../algorithms/fcfs';
import { sjfNonPreemptive, srtf } from '../algorithms/sjf';
import { priorityNonPreemptive, priorityPreemptive } from '../algorithms/priority';
import { roundRobin } from '../algorithms/roundRobin';
import { multilevelQueue } from '../algorithms/mlq';
import { multilevelFeedbackQueue } from '../algorithms/mlfq';

export type AlgorithmId = 'fcfs' | 'sjf' | 'srtf' | 'priority' | 'priority-p' | 'rr' | 'mlq' | 'mlfq';

interface AlgorithmPageProps {
  algorithmId: AlgorithmId;
  onDirtyChange?: (dirty: boolean) => void;
  onProcessCountChange?: (count: number) => void;
}

const DEFAULT_PROCESSES: Process[] = [
  { id: 'p1', name: 'P1', arrivalTime: 0, burstTime: 6, priority: 2, color: getProcessColor(0) },
  { id: 'p2', name: 'P2', arrivalTime: 1, burstTime: 4, priority: 1, color: getProcessColor(1) },
  { id: 'p3', name: 'P3', arrivalTime: 2, burstTime: 2, priority: 3, color: getProcessColor(2) },
  { id: 'p4', name: 'P4', arrivalTime: 3, burstTime: 5, priority: 2, color: getProcessColor(3) },
];

const DEFAULT_MLQ_QUEUES: MLQueueConfig[] = [
  { id: 'q1', name: 'Hàng đợi 1 (Hệ thống)', algorithm: 'RR', timeQuantum: 2 },
  { id: 'q2', name: 'Hàng đợi 2 (Người dùng)', algorithm: 'FCFS' },
];

export function AlgorithmPage({ algorithmId, onDirtyChange, onProcessCountChange }: AlgorithmPageProps) {
  const [processes, setProcesses] = useState<Process[]>(() =>
    DEFAULT_PROCESSES.map((p, i) => ({
      ...p,
      queueId: algorithmId === 'mlq' ? DEFAULT_MLQ_QUEUES[i < 1 ? 0 : 1].id : undefined,
    }))
  );
  const [result, setResult] = useState<ScheduleResult | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [timeQuantum, setTimeQuantum] = useState(2);
  const [mlqQueues, setMlqQueues] = useState<MLQueueConfig[]>(DEFAULT_MLQ_QUEUES);
  const [mlfqLevels, setMlfqLevels] = useState<MLFQueueLevel[]>(defaultLevels(4));
  const [error, setError] = useState<string | null>(null);
  const [priorityLowIsHigh, setPriorityLowIsHigh] = useState(true);
  const resultsRef = useRef<HTMLDivElement>(null);
  const prevAlgRef = useRef(algorithmId);

  // Clear result and mark dirty when switching algorithms
  useEffect(() => {
    if (prevAlgRef.current !== algorithmId) {
      prevAlgRef.current = algorithmId;
      setResult(null);
      setIsDirty(true);
      onDirtyChange?.(true);
    }
  }, [algorithmId, onDirtyChange]);

  // Sync process count to parent
  useEffect(() => {
    onProcessCountChange?.(processes.length);
  }, [processes.length, onProcessCountChange]);

  const showPriority = ['priority', 'priority-p'].includes(algorithmId);
  const showQueue = algorithmId === 'mlq';
  const isRR = algorithmId === 'rr';
  const isMLQ = algorithmId === 'mlq';
  const isMLFQ = algorithmId === 'mlfq';

  const handleProcessChange = useCallback((procs: Process[]) => {
    setProcesses(procs);
    setIsDirty(true);
    onDirtyChange?.(true);
  }, [onDirtyChange]);

  const handleMLQChange = useCallback((queues: MLQueueConfig[]) => {
    setMlqQueues(queues);
    setIsDirty(true);
    onDirtyChange?.(true);
  }, [onDirtyChange]);

  const compute = useCallback(() => {
    setError(null);
    if (processes.length === 0) { setError('Vui lòng thêm ít nhất 1 tiến trình.'); return; }

    try {
      let res: ScheduleResult;
      switch (algorithmId) {
        case 'fcfs':      res = fcfs(processes); break;
        case 'sjf':       res = sjfNonPreemptive(processes); break;
        case 'srtf':      res = srtf(processes); break;
        case 'priority':  res = priorityNonPreemptive(processes, priorityLowIsHigh); break;
        case 'priority-p':res = priorityPreemptive(processes, priorityLowIsHigh); break;
        case 'rr':        res = roundRobin(processes, timeQuantum); break;
        case 'mlq':       res = multilevelQueue(processes, mlqQueues); break;
        case 'mlfq':      res = multilevelFeedbackQueue(processes, mlfqLevels); break;
        default:          res = fcfs(processes);
      }
      setResult(res);
      setIsDirty(false);
      onDirtyChange?.(false);
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    } catch (e) {
      setError('Có lỗi xảy ra khi tính toán. Vui lòng kiểm tra dữ liệu đầu vào.');
      console.error(e);
    }
  }, [algorithmId, processes, timeQuantum, mlqQueues, mlfqLevels, priorityLowIsHigh, onDirtyChange]);

  const algLabels: Record<AlgorithmId, string> = {
    fcfs: 'FCFS', sjf: 'SJF', srtf: 'SRTF', priority: 'Priority NP',
    'priority-p': 'Priority P', rr: 'Round Robin', mlq: 'MLQ', mlfq: 'MLFQ',
  };

  return (
    <div className="max-w-6xl mx-auto px-5 py-6 pb-40 space-y-5">
      {/* MLQ Config */}
      {isMLQ && <MLQConfig queues={mlqQueues} onChange={handleMLQChange} />}

      {/* MLFQ Config */}
      {isMLFQ && <MLFQConfig levels={mlfqLevels} onChange={(l) => { setMlfqLevels(l); setIsDirty(true); }} />}

      {/* RR quantum */}
      {isRR && (
        <div className="card flex items-center gap-4">
          <span className="text-text-muted text-sm font-medium">Lượng thời gian (Quantum):</span>
          <input
            className="input-dark w-24 font-mono text-center"
            type="number"
            min={1}
            value={timeQuantum}
            onChange={(e) => { setTimeQuantum(Math.max(1, parseInt(e.target.value) || 1)); setIsDirty(true); }}
          />
          <span className="text-text-muted text-xs">đơn vị thời gian</span>
        </div>
      )}

      {/* Priority direction */}
      {showPriority && (
        <div className="card flex items-center gap-4">
          <span className="text-text-muted text-sm font-medium">Cơ chế ưu tiên:</span>
          <div className="flex gap-2">
            {[true, false].map((lowIsHigh) => (
              <button
                key={String(lowIsHigh)}
                onClick={() => { setPriorityLowIsHigh(lowIsHigh); setIsDirty(true); onDirtyChange?.(true); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  priorityLowIsHigh === lowIsHigh
                    ? 'bg-accent-purple/20 text-accent-purple border border-accent-purple/40'
                    : 'bg-bg-tertiary text-text-muted border border-bg-border hover:bg-bg-hover'
                }`}
              >
                {lowIsHigh ? '↓ Số nhỏ = Ưu tiên cao' : '↑ Số lớn = Ưu tiên cao'}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Process Table */}
      <ProcessTable
        processes={processes}
        onChange={handleProcessChange}
        showPriority={showPriority}
        priorityLowIsHigh={priorityLowIsHigh}
        showQueue={showQueue}
        queueOptions={showQueue ? mlqQueues.map((q) => ({ id: q.id, name: q.name })) : undefined}
      />

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-4 py-2 text-sm">
          {error}
        </div>
      )}

      {/* Compute button */}
      {(() => {
        const hasResult = result !== null;
        const needsUpdate = hasResult && isDirty;
        const isDone = hasResult && !isDirty;

        let bg: string, border: string, color: string, anim: string | undefined, label: string, icon: string;
        if (isDone) {
          bg = 'rgba(255,255,255,0.03)';
          border = '1px solid rgba(255,255,255,0.07)';
          color = '#475569';
          anim = undefined;
          label = `Kết quả — ${algLabels[algorithmId]}`;
          icon = '✓';
        } else if (needsUpdate) {
          bg = 'rgba(251,191,36,0.1)';
          border = '1px solid rgba(251,191,36,0.35)';
          color = '#fcd34d';
          anim = 'glow-pulse-amber 2s ease-in-out infinite';
          label = `Cập nhật kết quả — ${algLabels[algorithmId]}`;
          icon = '↻';
        } else {
          bg = 'rgba(99,102,241,0.15)';
          border = '1px solid rgba(99,102,241,0.4)';
          color = '#a5b4fc';
          anim = 'glow-pulse 2s ease-in-out infinite';
          label = `Tính kết quả — ${algLabels[algorithmId]}`;
          icon = '→';
        }

        return (
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-bg-border" />
            <button
              className="calc-btn"
              disabled={isDone}
              onClick={compute}
              style={{ background: bg, border, color, animation: anim }}
            >
              <span>{icon}</span>
              <span>{label}</span>
              {!isDone && (
                <span
                  className="w-1.5 h-1.5 rounded-full ml-1"
                  style={{
                    background: needsUpdate ? '#fbbf24' : '#818cf8',
                    animation: 'dot-pulse 2s ease-in-out infinite',
                  }}
                />
              )}
            </button>
            <div className="flex-1 h-px bg-bg-border" />
          </div>
        );
      })()}

      {/* Results */}
      {result && (
        <div ref={resultsRef} className="space-y-5">
          <GanttChart gantt={result.gantt} totalTime={result.summary.totalTime} />
          <MetricsPanel metrics={result.metrics} summary={result.summary} />
        </div>
      )}
    </div>
  );
}
