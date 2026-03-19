import { ALGORITHMS, AlgorithmId, AlgorithmInfo } from '../types';

interface SidebarProps {
  selectedAlgorithm: AlgorithmId;
  onSelect: (id: AlgorithmId) => void;
  open: boolean;
  onToggle: () => void;
}

const categoryOrder = ['non-preemptive', 'preemptive', 'advanced'] as const;
const categoryLabels: Record<string, string> = {
  'non-preemptive': 'Không chiếm quyền',
  preemptive: 'Chiếm quyền',
  advanced: 'Nâng cao',
};
const categoryIcons: Record<string, string> = {
  'non-preemptive': '🔒',
  preemptive: '⚡',
  advanced: '🧠',
};

function AlgorithmItem({
  algo,
  selected,
  onClick,
}: {
  algo: AlgorithmInfo;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-start gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200 group ${
        selected
          ? 'bg-indigo-600 shadow-lg shadow-indigo-500/20'
          : 'hover:bg-slate-800'
      }`}
    >
      <span
        className={`text-lg mt-0.5 flex-shrink-0 ${
          selected ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'
        }`}
      >
        {algo.icon}
      </span>
      <div className="min-w-0">
        <div
          className={`text-sm font-semibold leading-tight ${
            selected ? 'text-white' : 'text-slate-200'
          }`}
        >
          {algo.shortName}
        </div>
        <div
          className={`text-xs mt-0.5 leading-tight ${
            selected ? 'text-indigo-200' : 'text-slate-500 group-hover:text-slate-400'
          }`}
        >
          {algo.description.length > 38
            ? algo.description.slice(0, 38) + '…'
            : algo.description}
        </div>
      </div>
      {selected && (
        <div className="ml-auto flex-shrink-0 w-1.5 h-1.5 rounded-full bg-white mt-2" />
      )}
    </button>
  );
}

export function Sidebar({ selectedAlgorithm, onSelect, open, onToggle }: SidebarProps) {
  const grouped = categoryOrder.map((cat) => ({
    cat,
    algos: ALGORITHMS.filter((a) => a.category === cat),
  }));

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-20 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full z-30 flex flex-col transition-transform duration-300 lg:static lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          width: '272px',
          background: '#080f1a',
          borderRight: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {/* Logo */}
        <div
          className="flex items-center gap-3 px-5 py-5"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              boxShadow: '0 4px 12px rgba(99,102,241,0.4)',
            }}
          >
            🖥️
          </div>
          <div>
            <div className="text-sm font-bold text-white leading-tight">
              CPU Scheduler
            </div>
            <div className="text-xs text-slate-500 leading-tight">
              Mô phỏng lập lịch
            </div>
          </div>
          <button
            onClick={onToggle}
            className="ml-auto lg:hidden text-slate-500 hover:text-slate-300 transition-colors p-1"
          >
            ✕
          </button>
        </div>

        {/* Algorithm list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {grouped.map(({ cat, algos }) => (
            <div key={cat}>
              <div className="flex items-center gap-2 px-2 mb-2">
                <span className="text-xs">{categoryIcons[cat]}</span>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {categoryLabels[cat]}
                </span>
              </div>
              <div className="space-y-0.5">
                {algos.map((algo) => (
                  <AlgorithmItem
                    key={algo.id}
                    algo={algo}
                    selected={selectedAlgorithm === algo.id}
                    onClick={() => onSelect(algo.id)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div
          className="px-5 py-4"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="text-xs text-slate-600 text-center">
            CPU Scheduling Visualizer v1.0
          </div>
        </div>
      </aside>
    </>
  );
}
