import { useState, useCallback } from 'react';
import {
  AlgorithmId,
  AlgorithmConfig,
  Process,
  SchedulingResult,
  ALGORITHMS,
  DEFAULT_CONFIG,
  DEFAULT_PROCESSES,
} from './types';
import { runAlgorithm } from './algorithms';
import { AlgorithmPicker } from './components/AlgorithmPicker';
import { ProcessTable } from './components/ProcessTable';
import { ConfigPanel } from './components/ConfigPanel';
import { GanttChart } from './components/GanttChart';
import { MetricsTable } from './components/MetricsTable';

export default function App() {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<AlgorithmId>('fcfs');
  const [processes, setProcesses] = useState<Process[]>(DEFAULT_PROCESSES);
  const [config, setConfig] = useState<AlgorithmConfig>(DEFAULT_CONFIG);
  const [result, setResult] = useState<SchedulingResult | null>(null);
  // Stores the algo used for the last successful calc (for display in results header)
  const [resultAlgo, setResultAlgo] = useState<AlgorithmId>('fcfs');
  const [error, setError] = useState<string | null>(null);
  const [computing, setComputing] = useState(false);
  // isDirty = inputs changed since last calculation
  const [isDirty, setIsDirty] = useState(true);

  // ── Handlers that mark dirty ─────────────────────────────────────────
  const handleAlgorithmSelect = (id: AlgorithmId) => {
    setSelectedAlgorithm(id);
    setIsDirty(true);
  };

  const handleConfigChange = (cfg: AlgorithmConfig) => {
    setConfig(cfg);
    setIsDirty(true);
  };

  const handleProcessesChange = (procs: Process[]) => {
    setProcesses(procs);
    setIsDirty(true);
  };

  // ── Compute ──────────────────────────────────────────────────────────
  const compute = useCallback(() => {
    setError(null);
    setComputing(true);

    if (!processes.length) {
      setError('Chưa có tiến trình nào để tính toán!');
      setComputing(false);
      return;
    }
    if (processes.some((p) => p.burstTime < 1)) {
      setError('CPU Burst Time phải ≥ 1 cho tất cả tiến trình!');
      setComputing(false);
      return;
    }

    try {
      const r = runAlgorithm(selectedAlgorithm, processes, config);
      setResult(r);
      setResultAlgo(selectedAlgorithm);
      setIsDirty(false);
    } catch (e) {
      setError('Đã xảy ra lỗi khi tính toán. Vui lòng kiểm tra dữ liệu.');
      console.error(e);
    }

    setComputing(false);
  }, [selectedAlgorithm, processes, config]);

  const algoInfo = ALGORITHMS.find((a) => a.id === selectedAlgorithm)!;
  const resultAlgoInfo = ALGORITHMS.find((a) => a.id === resultAlgo)!;

  // Button state derivation
  const hasResult = result !== null;
  // "pending" = dirty with no result yet OR dirty after result
  const isPending = isDirty;

  return (
    <div
      className="min-h-screen"
      style={{
        background: '#0a1628',
        fontFamily: 'Inter, system-ui, sans-serif',
        color: '#e2e8f0',
      }}
    >
      {/* ── Header ────────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-20 flex items-center gap-4 px-6 py-3"
        style={{
          background: 'rgba(10,22,40,0.92)',
          backdropFilter: 'blur(14px)',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-base flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              boxShadow: '0 3px 10px rgba(99,102,241,0.45)',
            }}
          >
            🖥️
          </div>
          <div>
            <div className="text-sm font-bold text-white leading-tight">
              CPU Scheduling Visualizer
            </div>
            <div className="text-xs text-slate-600 leading-tight">
              Mô phỏng thuật toán lập lịch CPU
            </div>
          </div>
        </div>

        {/* Breadcrumb */}
        <div
          className="hidden sm:flex items-center gap-2 ml-4"
          style={{ borderLeft: '1px solid rgba(255,255,255,0.08)', paddingLeft: '16px' }}
        >
          <span className="text-xs text-slate-600">{algoInfo.categoryLabel}</span>
          <span className="text-slate-700 text-xs">›</span>
          <span className="text-xs font-semibold text-slate-300">{algoInfo.shortName}</span>
        </div>

        <div className="ml-auto flex items-center gap-3">
          {/* Status pill in header */}
          {computing ? (
            <div className="flex items-center gap-2 text-xs text-indigo-400">
              <div
                className="w-3 h-3 rounded-full border-2 border-indigo-400 border-t-transparent"
                style={{ animation: 'spin 0.8s linear infinite' }}
              />
              Đang tính...
            </div>
          ) : hasResult && !isPending ? (
            <div className="flex items-center gap-1.5 text-xs text-emerald-400">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Đã tính — {resultAlgoInfo.shortName}
            </div>
          ) : isPending && hasResult ? (
            <div className="flex items-center gap-1.5 text-xs text-amber-400">
              <div
                className="w-1.5 h-1.5 rounded-full bg-amber-400"
                style={{ animation: 'pulse 1.5s ease-in-out infinite' }}
              />
              Dữ liệu thay đổi
            </div>
          ) : null}

          <div
            className="text-xs px-2.5 py-1 rounded-lg"
            style={{
              background: 'rgba(255,255,255,0.04)',
              color: '#475569',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            {processes.length} tiến trình
          </div>
        </div>
      </header>

      {/* ── Main ──────────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-5 py-5 space-y-5 pb-12">
        <AlgorithmPicker selected={selectedAlgorithm} onSelect={handleAlgorithmSelect} />

        <ConfigPanel algorithm={selectedAlgorithm} config={config} onChange={handleConfigChange} />

        <ProcessTable
          processes={processes}
          onChange={handleProcessesChange}
          algorithm={selectedAlgorithm}
          mlqQueues={config.mlqQueues}
        />

        {/* Error banner */}
        {error && (
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm"
            style={{
              background: 'rgba(244,63,94,0.1)',
              border: '1px solid rgba(244,63,94,0.2)',
              color: '#fb7185',
            }}
          >
            <span>⚠️</span>
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-auto opacity-60 hover:opacity-100 transition-opacity"
            >
              ✕
            </button>
          </div>
        )}

        {/* ── Calculate Button / Divider ──────────────────────────── */}
        <CalcButton
          isDirty={isPending}
          hasResult={hasResult}
          algoShortName={algoInfo.shortName}
          resultAlgoShortName={resultAlgoInfo.shortName}
          computing={computing}
          onCompute={compute}
        />

        {/* ── Results ─────────────────────────────────────────────── */}
        {hasResult && (
          <div className="space-y-5">
            <GanttChart result={result!} processes={processes} />
            <MetricsTable result={result!} />
          </div>
        )}
      </main>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @keyframes glow-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(99,102,241,0), 0 0 20px rgba(99,102,241,0.3); }
          50% { box-shadow: 0 0 0 4px rgba(99,102,241,0.15), 0 0 32px rgba(99,102,241,0.5); }
        }
        @keyframes glow-pulse-amber {
          0%, 100% { box-shadow: 0 0 0 0 rgba(251,191,36,0), 0 0 20px rgba(251,191,36,0.2); }
          50% { box-shadow: 0 0 0 4px rgba(251,191,36,0.12), 0 0 28px rgba(251,191,36,0.4); }
        }
      `}</style>
    </div>
  );
}

// ── CalcButton component ─────────────────────────────────────────────────────
interface CalcButtonProps {
  isDirty: boolean;
  hasResult: boolean;
  algoShortName: string;
  resultAlgoShortName: string;
  computing: boolean;
  onCompute: () => void;
}

function CalcButton({
  isDirty,
  hasResult,
  algoShortName,
  resultAlgoShortName,
  computing,
  onCompute,
}: CalcButtonProps) {
  // 3 visual states:
  // 1. No result yet + dirty → "Tính kết quả" — indigo glow
  // 2. Has result + dirty (algo/data changed) → "Cập nhật kết quả" — amber glow
  // 3. Has result + clean → "Kết quả ..." — calm, no glow

  const isFirstCalc = !hasResult && isDirty;
  const isUpdate = hasResult && isDirty;
  const isDone = hasResult && !isDirty;

  let bg: string;
  let border: string;
  let color: string;
  let glowAnim: string | undefined;
  let label: string;
  let icon: string;
  let lineColor: string;

  if (computing) {
    bg = 'rgba(99,102,241,0.12)';
    border = '1px solid rgba(99,102,241,0.3)';
    color = '#818cf8';
    glowAnim = undefined;
    label = 'Đang tính toán...';
    icon = '⟳';
    lineColor = 'rgba(99,102,241,0.2)';
  } else if (isFirstCalc) {
    bg = 'rgba(99,102,241,0.15)';
    border = '1px solid rgba(99,102,241,0.4)';
    color = '#a5b4fc';
    glowAnim = 'glow-pulse 2s ease-in-out infinite';
    label = `Tính kết quả  —  ${algoShortName}`;
    icon = '→';
    lineColor = 'rgba(99,102,241,0.25)';
  } else if (isUpdate) {
    bg = 'rgba(251,191,36,0.1)';
    border = '1px solid rgba(251,191,36,0.35)';
    color = '#fcd34d';
    glowAnim = 'glow-pulse-amber 2s ease-in-out infinite';
    label = `Cập nhật kết quả  —  ${algoShortName}`;
    icon = '↻';
    lineColor = 'rgba(251,191,36,0.2)';
  } else {
    // isDone
    bg = 'rgba(255,255,255,0.03)';
    border = '1px solid rgba(255,255,255,0.07)';
    color = '#475569';
    glowAnim = undefined;
    label = `Kết quả  —  ${resultAlgoShortName}`;
    icon = '✓';
    lineColor = 'rgba(255,255,255,0.06)';
  }

  return (
    <div className="flex items-center gap-4 py-1">
      {/* Left line */}
      <div className="flex-1 h-px" style={{ background: lineColor }} />

      {/* The button */}
      <button
        onClick={!computing && (isFirstCalc || isUpdate) ? onCompute : undefined}
        disabled={computing || isDone}
        className="flex items-center gap-2.5 px-5 py-2.5 rounded-2xl transition-all duration-200 select-none"
        style={{
          background: bg,
          border,
          color,
          animation: glowAnim,
          cursor: isDone || computing ? 'default' : 'pointer',
          minWidth: '220px',
          justifyContent: 'center',
        }}
        onMouseEnter={(e) => {
          if (!isDone && !computing) {
            const el = e.currentTarget as HTMLButtonElement;
            if (isFirstCalc) el.style.background = 'rgba(99,102,241,0.25)';
            else if (isUpdate) el.style.background = 'rgba(251,191,36,0.18)';
          }
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget as HTMLButtonElement;
          el.style.background = bg;
        }}
      >
        {/* Icon */}
        <span
          className="text-sm leading-none"
          style={{
            animation: computing ? 'spin 0.8s linear infinite' : undefined,
            display: 'inline-block',
          }}
        >
          {icon}
        </span>

        {/* Label */}
        <span
          className="text-sm font-semibold tracking-wide"
          style={{ fontFamily: 'Inter, system-ui, sans-serif', letterSpacing: '0.01em' }}
        >
          {label}
        </span>

        {/* Dirty indicator dot */}
        {(isFirstCalc || isUpdate) && !computing && (
          <span
            className="w-1.5 h-1.5 rounded-full ml-1 flex-shrink-0"
            style={{
              background: isUpdate ? '#fbbf24' : '#818cf8',
              animation: 'pulse 1.5s ease-in-out infinite',
            }}
          />
        )}
      </button>

      {/* Right line */}
      <div className="flex-1 h-px" style={{ background: lineColor }} />
    </div>
  );
}
