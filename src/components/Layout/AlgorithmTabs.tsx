import { useNavigate, useLocation } from 'react-router-dom';

interface AlgorithmTab {
  id: string;
  path: string;
  label: string;
  shortLabel: string;
  icon: string;
  group: 'nonpreemptive' | 'preemptive' | 'advanced';
}

const ALGORITHMS: AlgorithmTab[] = [
  { id: 'fcfs',       path: '/fcfs',      label: 'First Come First Served', shortLabel: 'FCFS',        icon: '→',  group: 'nonpreemptive' },
  { id: 'sjf',        path: '/sjf',       label: 'Shortest Job First',      shortLabel: 'SJF',         icon: '⚡', group: 'nonpreemptive' },
  { id: 'priority',   path: '/priority',  label: 'Priority (Non-preemptive)',shortLabel: 'Priority NP',icon: '★',  group: 'nonpreemptive' },
  { id: 'srtf',       path: '/srtf',      label: 'Shortest Remaining Time', shortLabel: 'SRTF',        icon: '⚡', group: 'preemptive' },
  { id: 'priority-p', path: '/priority-p',label: 'Priority (Preemptive)',   shortLabel: 'Priority P',  icon: '★',  group: 'preemptive' },
  { id: 'rr',         path: '/rr',        label: 'Round Robin',             shortLabel: 'Round Robin', icon: '↻',  group: 'preemptive' },
  { id: 'mlq',        path: '/mlq',       label: 'Multilevel Queue',        shortLabel: 'MLQ',         icon: '≡',  group: 'advanced' },
  { id: 'mlfq',       path: '/mlfq',      label: 'Multilevel Feedback Queue',shortLabel: 'MLFQ',       icon: '↕',  group: 'advanced' },
];

const GROUP_LABELS: Record<string, string> = {
  nonpreemptive: 'Không chiếm quyền',
  preemptive: 'Chiếm quyền',
  advanced: 'Nâng cao',
};

const GROUP_COLORS: Record<string, { text: string; dot: string; activeBg: string; activeBorder: string; underline: string }> = {
  nonpreemptive: { text: 'text-indigo-300', dot: 'bg-indigo-400', activeBg: 'rgba(99,102,241,0.15)', activeBorder: 'rgba(99,102,241,0.45)', underline: '#818cf8' },
  preemptive:    { text: 'text-emerald-300', dot: 'bg-emerald-400', activeBg: 'rgba(52,211,153,0.15)', activeBorder: 'rgba(52,211,153,0.45)', underline: '#34d399' },
  advanced:      { text: 'text-pink-300', dot: 'bg-pink-400', activeBg: 'rgba(244,114,182,0.15)', activeBorder: 'rgba(244,114,182,0.45)', underline: '#f472b6' },
};

interface AlgorithmTabsProps {
  processCount: number;
  isDirty: boolean;
}

export function AlgorithmTabs({ processCount, isDirty }: AlgorithmTabsProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const currentAlg = ALGORITHMS.find((a) => a.path === location.pathname) ?? ALGORITHMS[0];
  const groups = ['nonpreemptive', 'preemptive', 'advanced'] as const;

  const gc = GROUP_COLORS[currentAlg.group];

  return (
    <div>
      {/* Sticky header bar */}
      <div
        className="sticky top-0 z-50 flex items-center gap-4 px-6 py-3"
        style={{ background: 'rgba(10,22,40,0.92)', backdropFilter: 'blur(14px)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}
      >
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center text-sm"
          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 3px 10px rgba(99,102,241,0.45)' }}
        >
          ⚙
        </div>
        <div>
          <div className="text-sm font-bold text-white">CPU Scheduling Visualizer</div>
          <div className="text-xs" style={{ color: '#475569' }}>Mô phỏng thuật toán lập lịch CPU</div>
        </div>

        {/* Breadcrumb */}
        <div className="hidden sm:flex items-center gap-2 ml-2 pl-4" style={{ borderLeft: '1px solid rgba(255,255,255,0.08)' }}>
          <span className="text-xs" style={{ color: '#475569' }}>{GROUP_LABELS[currentAlg.group]}</span>
          <span className="text-xs" style={{ color: '#334155' }}>›</span>
          <span className="text-xs font-semibold" style={{ color: '#cbd5e1' }}>{currentAlg.shortLabel}</span>
        </div>

        <div className="flex-1" />

        {/* Status */}
        <div className="flex items-center gap-3">
          {isDirty && (
            <div className="flex items-center gap-1.5 text-xs" style={{ color: '#fbbf24' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
              Dữ liệu thay đổi
            </div>
          )}
          <div
            className="text-xs px-2.5 py-1 rounded-lg"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', color: '#64748b' }}
          >
            {processCount} tiến trình
          </div>
        </div>
      </div>

      {/* Algorithm picker card */}
      <div className="max-w-6xl mx-auto px-5 py-4">
        <div className="rounded-2xl" style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.07)' }}>
          {/* Header bar */}
          <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            <span className="text-xs font-medium uppercase tracking-wider" style={{ color: '#475569' }}>Thuật toán CPU</span>
            <div className="flex items-center gap-2">
              <span className="text-xs" style={{ color: '#475569' }}>{GROUP_LABELS[currentAlg.group]}</span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${gc.text}`} style={{ background: GROUP_COLORS[currentAlg.group].activeBg }}>
                {currentAlg.shortLabel}
              </span>
            </div>
          </div>

          {/* Algorithm groups */}
          <div className="flex items-stretch">
            {groups.map((group, gi) => {
              const g = GROUP_COLORS[group];
              const algs = ALGORITHMS.filter((a) => a.group === group);
              return (
                <div key={group} className="flex-1" style={gi > 0 ? { borderLeft: '1px solid rgba(255,255,255,0.06)' } : undefined}>
                  {/* Group label */}
                  <div className="flex items-center gap-1.5 px-4 pt-3 pb-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${g.dot}`} />
                    <span className="text-xs" style={{ color: '#64748b' }}>{GROUP_LABELS[group]}</span>
                  </div>
                  {/* Buttons */}
                  <div className="flex gap-1 px-3 pb-3">
                    {algs.map((alg) => {
                      const isActive = location.pathname === alg.path;
                      return (
                        <button
                          key={alg.id}
                          onClick={() => navigate(alg.path)}
                          className="relative flex flex-col items-center justify-center px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer min-w-[56px]"
                          style={isActive
                            ? { background: g.activeBg, border: `1px solid ${g.activeBorder}`, color: g.underline }
                            : { background: 'transparent', border: '1px solid transparent', color: '#64748b' }
                          }
                          onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#94a3b8'; } }}
                          onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748b'; } }}
                        >
                          <span className="text-base leading-none mb-0.5">{alg.icon}</span>
                          <span>{alg.shortLabel}</span>
                          {isActive && (
                            <span className="absolute -bottom-px left-2 right-2 h-0.5 rounded-full" style={{ background: g.underline }} />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Description bar */}
          <div
            className="flex items-center gap-2 px-5 py-2.5 rounded-b-2xl flex-wrap"
            style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.2)' }}
          >
            <span className="text-lg">{currentAlg.icon}</span>
            <span className={`font-semibold text-sm ${gc.text}`}>{currentAlg.label}</span>
            <span style={{ color: '#334155' }}>—</span>
            <span className="text-xs" style={{ color: '#64748b' }}>{getDescription(currentAlg.id)}</span>
            {(currentAlg.id === 'mlq' || currentAlg.id === 'mlfq') && (
              <span className="ml-auto text-xs text-pink-400 border border-pink-400/30 rounded px-2 py-0.5">⚙ Config</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function getDescription(id: string): string {
  const map: Record<string, string> = {
    fcfs: 'Tiến trình đến trước được phục vụ trước',
    sjf: 'Tiến trình có burst time ngắn nhất được ưu tiên',
    priority: 'Tiến trình có mức ưu tiên cao nhất được chọn',
    srtf: 'Luôn ưu tiên tiến trình có thời gian còn lại ngắn nhất',
    'priority-p': 'Tiến trình ưu tiên cao hơn có thể chiếm quyền',
    rr: 'Mỗi tiến trình nhận một lượng thời gian cố định (quantum)',
    mlq: 'Tiến trình được gắn vĩnh viễn vào một hàng đợi',
    mlfq: 'Tiến trình có thể di chuyển giữa các hàng đợi',
  };
  return map[id] ?? '';
}

export { ALGORITHMS };
export type { AlgorithmTab };
