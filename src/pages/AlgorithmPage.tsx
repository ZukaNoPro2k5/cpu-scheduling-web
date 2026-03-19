import { useState, useCallback } from 'react';
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

export function AlgorithmPage({ algorithmId, onDirtyChange }: AlgorithmPageProps) {
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
        case 'priority':  res = priorityNonPreemptive(processes); break;
        case 'priority-p':res = priorityPreemptive(processes); break;
        case 'rr':        res = roundRobin(processes, timeQuantum); break;
        case 'mlq':       res = multilevelQueue(processes, mlqQueues); break;
        case 'mlfq':      res = multilevelFeedbackQueue(processes, mlfqLevels); break;
        default:          res = fcfs(processes);
      }
      setResult(res);
      setIsDirty(false);
      onDirtyChange?.(false);
    } catch (e) {
      setError('Có lỗi xảy ra khi tính toán. Vui lòng kiểm tra dữ liệu đầu vào.');
      console.error(e);
    }
  }, [algorithmId, processes, timeQuantum, mlqQueues, mlfqLevels, onDirtyChange]);

  const algLabels: Record<AlgorithmId, string> = {
    fcfs: 'FCFS', sjf: 'SJF', srtf: 'SRTF', priority: 'Priority NP',
    'priority-p': 'Priority P', rr: 'Round Robin', mlq: 'MLQ', mlfq: 'MLFQ',
  };

  return (
    <div className="max-w-6xl mx-auto px-5 py-6 space-y-5">
      {/* MLQ Config */}
      {isMLQ && <MLQConfig queues={mlqQueues} onChange={handleMLQChange} />}

      {/* MLFQ Config */}
      {isMLFQ && <MLFQConfig levels={mlfqLevels} onChange={(l) => { setMlfqLevels(l); setIsDirty(true); }} />}

      {/* RR quantum */}
      {isRR && (
        <div className="card flex items-center gap-4">
          <span className="text-text-muted text-sm font-medium">Time Quantum:</span>
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

      {/* Process Table */}
      <ProcessTable
        processes={processes}
        onChange={handleProcessChange}
        showPriority={showPriority}
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
      <div className="flex justify-center">
        <button className="btn-primary px-8 py-3 text-base rounded-xl shadow-lg shadow-accent-purple/20" onClick={compute}>
          <span>↻</span>
          <span>Cập nhật kết quả — {algLabels[algorithmId]}</span>
          {isDirty && <span className="w-2 h-2 rounded-full bg-yellow-400 ml-1" />}
        </button>
      </div>

      {/* Results */}
      {result && (
        <>
          <GanttChart gantt={result.gantt} totalTime={result.summary.totalTime} />
          <MetricsPanel metrics={result.metrics} summary={result.summary} />
        </>
      )}
    </div>
  );
}
