import { ALGORITHMS, AlgorithmId, AlgorithmInfo } from '../types';

interface AlgorithmPickerProps {
  selected: AlgorithmId;
  onSelect: (id: AlgorithmId) => void;
}

const GROUPS = [
  {
    key: 'non-preemptive',
    label: 'Không chiếm quyền',
    shortLabel: 'Không chiếm quyền',
    color: '#818cf8',
    colorMuted: 'rgba(99,102,241,0.12)',
    colorBorder: 'rgba(99,102,241,0.25)',
    colorActive: 'rgba(99,102,241,0.2)',
    colorActiveBorder: 'rgba(99,102,241,0.45)',
    dot: '#6366f1',
  },
  {
    key: 'preemptive',
    label: 'Chiếm quyền',
    shortLabel: 'Chiếm quyền',
    color: '#34d399',
    colorMuted: 'rgba(52,211,153,0.1)',
    colorBorder: 'rgba(52,211,153,0.2)',
    colorActive: 'rgba(52,211,153,0.15)',
    colorActiveBorder: 'rgba(52,211,153,0.4)',
    dot: '#10b981',
  },
  {
    key: 'advanced',
    label: 'Nâng cao',
    shortLabel: 'Nâng cao',
    color: '#f472b6',
    colorMuted: 'rgba(244,114,182,0.1)',
    colorBorder: 'rgba(244,114,182,0.2)',
    colorActive: 'rgba(244,114,182,0.15)',
    colorActiveBorder: 'rgba(244,114,182,0.4)',
    dot: '#ec4899',
    note: 'Yêu cầu cấu hình thêm',
  },
] as const;

function AlgoButton({
  algo,
  isSelected,
  group,
  onClick,
}: {
  algo: AlgorithmInfo;
  isSelected: boolean;
  group: (typeof GROUPS)[number];
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="relative flex flex-col items-center gap-1 px-4 py-2.5 rounded-xl transition-all duration-150 min-w-fit"
      style={{
        background: isSelected ? group.colorActive : 'transparent',
        border: isSelected
          ? `1px solid ${group.colorActiveBorder}`
          : '1px solid transparent',
        color: isSelected ? group.color : '#64748b',
      }}
      onMouseEnter={(e) => {
        if (!isSelected) {
          (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.04)';
          (e.currentTarget as HTMLButtonElement).style.color = '#94a3b8';
        }
      }}
      onMouseLeave={(e) => {
        if (!isSelected) {
          (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
          (e.currentTarget as HTMLButtonElement).style.color = '#64748b';
        }
      }}
    >
      <span className="text-base leading-none">{algo.icon}</span>
      <span
        className="text-xs font-semibold whitespace-nowrap leading-tight"
        style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
      >
        {algo.shortName}
      </span>
      {isSelected && (
        <span
          className="absolute -bottom-px left-4 right-4 h-0.5 rounded-full"
          style={{ background: group.color }}
        />
      )}
    </button>
  );
}

export function AlgorithmPicker({ selected, onSelect }: AlgorithmPickerProps) {
  const selectedInfo = ALGORITHMS.find((a) => a.id === selected)!;
  const selectedGroup = GROUPS.find((g) => g.key === selectedInfo.category)!;

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: '#111827',
        border: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-3"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Thuật toán CPU
          </span>
        </div>
        {/* Selected algo badge */}
        <div className="flex items-center gap-2">
          <span
            className="text-xs px-2.5 py-1 rounded-lg font-medium"
            style={{
              background: selectedGroup.colorMuted,
              color: selectedGroup.color,
              border: `1px solid ${selectedGroup.colorBorder}`,
            }}
          >
            {selectedGroup.shortLabel}
          </span>
          <span
            className="text-xs font-semibold"
            style={{ color: selectedGroup.color }}
          >
            {selectedInfo.shortName}
          </span>
        </div>
      </div>

      {/* Groups row */}
      <div className="px-4 py-3 flex items-stretch gap-0">
        {GROUPS.map((group, gi) => {
          const groupAlgos = ALGORITHMS.filter((a) => a.category === group.key);
          const isGroupSelected = selectedInfo.category === group.key;

          return (
            <div
              key={group.key}
              className="flex items-stretch"
            >
              {/* Group section */}
              <div className="flex flex-col gap-1.5">
                {/* Group label */}
                <div className="flex items-center gap-1.5 px-1">
                  <div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{
                      backgroundColor: isGroupSelected ? group.dot : '#334155',
                      transition: 'background-color 0.2s',
                    }}
                  />
                  <span
                    className="text-xs font-medium transition-colors duration-150"
                    style={{
                      color: isGroupSelected ? group.color : '#475569',
                    }}
                  >
                    {group.shortLabel}
                  </span>
                  {group.key === 'advanced' && (
                    <span
                      className="text-xs px-1.5 py-0.5 rounded-md"
                      style={{
                        background: 'rgba(244,114,182,0.1)',
                        color: '#f472b6',
                        fontSize: '10px',
                      }}
                    >
                      ⚙ Config
                    </span>
                  )}
                </div>

                {/* Algo buttons */}
                <div className="flex items-center gap-1 pb-1">
                  {groupAlgos.map((algo) => (
                    <AlgoButton
                      key={algo.id}
                      algo={algo}
                      isSelected={selected === algo.id}
                      group={group}
                      onClick={() => onSelect(algo.id)}
                    />
                  ))}
                </div>
              </div>

              {/* Divider between groups */}
              {gi < GROUPS.length - 1 && (
                <div
                  className="mx-3 self-stretch"
                  style={{
                    width: '1px',
                    background: 'rgba(255,255,255,0.06)',
                    flexShrink: 0,
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Selected algorithm description bar */}
      <div
        className="px-5 py-2.5 flex items-center gap-3"
        style={{
          borderTop: '1px solid rgba(255,255,255,0.05)',
          background: 'rgba(0,0,0,0.2)',
        }}
      >
        <div
          className="w-6 h-6 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
          style={{ background: selectedGroup.colorMuted }}
        >
          {selectedInfo.icon}
        </div>
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span
            className="text-xs font-semibold"
            style={{ color: selectedGroup.color }}
          >
            {selectedInfo.name}
          </span>
          <span className="text-slate-700 text-xs">—</span>
          <span className="text-xs text-slate-500 truncate">
            {selectedInfo.description}
          </span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {selectedInfo.needsPriority && (
            <span
              className="text-xs px-2 py-0.5 rounded-md"
              style={{ background: 'rgba(251,191,36,0.1)', color: '#fbbf24' }}
            >
              ★ Ưu tiên
            </span>
          )}
          {selectedInfo.needsQuantum && (
            <span
              className="text-xs px-2 py-0.5 rounded-md"
              style={{ background: 'rgba(52,211,153,0.1)', color: '#34d399' }}
            >
              ⏱ Quantum
            </span>
          )}
          {selectedInfo.needsQueue && (
            <span
              className="text-xs px-2 py-0.5 rounded-md"
              style={{
                background: 'rgba(244,114,182,0.1)',
                color: '#f472b6',
              }}
            >
              ≡ Đa hàng đợi
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
