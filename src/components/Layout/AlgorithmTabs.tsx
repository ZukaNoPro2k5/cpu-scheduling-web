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

const GROUP_COLORS: Record<string, string> = {
  nonpreemptive: 'text-blue-400',
  preemptive: 'text-orange-400',
  advanced: 'text-pink-400',
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

  return (
    <div className="bg-bg-secondary border-b border-bg-border">
      {/* Header row */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-bg-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent-purple/20 flex items-center justify-center">
            <span className="text-accent-purple text-sm font-bold">CPU</span>
          </div>
          <div>
            <div className="text-text-primary font-semibold text-sm">CPU Scheduling Visualizer</div>
            <div className="text-text-muted text-xs">Mô phỏng thuật toán lập lịch CPU</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isDirty && (
            <div className="flex items-center gap-1.5 text-yellow-400 text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
              Dữ liệu thay đổi
            </div>
          )}
          <div className="bg-bg-card border border-bg-border rounded-lg px-3 py-1 text-text-secondary text-xs">
            {processCount} tiến trình
          </div>
        </div>
      </div>

      {/* Algorithm box */}
      <div className="px-5 py-4">
        <div className="bg-bg-card border border-bg-border rounded-xl p-4">
          {/* Label */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-text-muted text-xs font-medium uppercase tracking-wider">THUẬT TOÁN CPU</span>
            <div className="flex items-center gap-2">
              <span className="text-text-muted text-xs">{GROUP_LABELS[currentAlg.group]}</span>
              <span className="text-bg-border">·</span>
              <span className={`text-xs font-semibold ${GROUP_COLORS[currentAlg.group]}`}>{currentAlg.shortLabel}</span>
            </div>
          </div>

          {/* Tab groups */}
          <div className="flex items-center gap-1 flex-wrap">
            {groups.map((group, gi) => (
              <div key={group} className="flex items-center gap-1">
                {gi > 0 && <div className="w-px h-6 bg-bg-border mx-1" />}
                <div className="flex items-center gap-0.5">
                  <span className={`text-xs mr-1 ${GROUP_COLORS[group]}`}>●</span>
                  <span className="text-text-muted text-xs mr-1">{GROUP_LABELS[group]}</span>
                  {ALGORITHMS.filter((a) => a.group === group).map((alg) => {
                    const isActive = location.pathname === alg.path;
                    return (
                      <button
                        key={alg.id}
                        onClick={() => navigate(alg.path)}
                        className={`
                          flex flex-col items-center justify-center px-3 py-2 rounded-lg text-xs font-medium
                          transition-all duration-150 cursor-pointer min-w-[56px]
                          ${isActive
                            ? 'bg-accent-purple text-white shadow-lg shadow-accent-purple/30'
                            : 'text-text-secondary hover:text-text-primary hover:bg-bg-hover'
                          }
                        `}
                      >
                        <span className="text-base leading-none mb-0.5">{alg.icon}</span>
                        <span>{alg.shortLabel}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Current algorithm description */}
          <div className="mt-3 pt-3 border-t border-bg-border flex items-center gap-2">
            <span className="text-lg">{currentAlg.icon}</span>
            <span className={`font-semibold text-sm ${GROUP_COLORS[currentAlg.group]}`}>{currentAlg.label}</span>
            <span className="text-bg-border">—</span>
            <span className="text-text-muted text-xs">{getDescription(currentAlg.id)}</span>
            {(currentAlg.id === 'mlq' || currentAlg.id === 'mlfq') && (
              <span className="ml-auto text-xs text-pink-400 border border-pink-400/30 rounded px-2 py-0.5">
                ⚙ Config
              </span>
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
