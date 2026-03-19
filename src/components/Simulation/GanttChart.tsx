import { GanttBlock } from '../../algorithms/types';

interface GanttChartProps {
  gantt: GanttBlock[];
  totalTime: number;
}

export function GanttChart({ gantt, totalTime }: GanttChartProps) {
  if (gantt.length === 0) return null;

  // Merge consecutive same-process blocks for cleaner display
  const merged: GanttBlock[] = [];
  for (const block of gantt) {
    const prev = merged[merged.length - 1];
    if (prev && prev.processId === block.processId && prev.endTime === block.startTime) {
      merged[merged.length - 1] = { ...prev, endTime: block.endTime };
    } else {
      merged.push({ ...block });
    }
  }

  // Collect unique processes for legend
  const legendItems: { processId: string; processName: string; color: string }[] = [];
  const seen = new Set<string>();
  for (const b of merged) {
    if (b.processId && !seen.has(b.processId)) {
      seen.add(b.processId);
      legendItems.push({ processId: b.processId, processName: b.processName, color: b.color });
    }
  }

  // Calculate tick marks for x-axis
  const step = totalTime <= 20 ? 1 : totalTime <= 50 ? 5 : 10;
  const ticks: number[] = [];
  for (let t = 0; t <= totalTime; t += step) ticks.push(t);
  if (ticks[ticks.length - 1] !== totalTime) ticks.push(totalTime);

  const contextSwitches = merged.filter((b) => b.processId !== null).length - 1;

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-base">📊</span>
          <span className="text-text-primary font-semibold text-sm">Biểu đồ Gantt</span>
          <span className="text-text-muted text-xs bg-bg-tertiary rounded px-2 py-0.5">
            Tổng: {totalTime} đơn vị
          </span>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {legendItems.map((item) => (
            <div key={item.processId} className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: item.color }} />
              <span className="text-xs text-text-secondary">{item.processName}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Gantt bars */}
      <div className="overflow-x-auto pb-2">
        <div style={{ minWidth: `${Math.max(totalTime * 36, 400)}px` }}>
          {/* Bars */}
          <div className="flex h-12 rounded-lg overflow-hidden">
            {merged.map((block, i) => {
              const width = ((block.endTime - block.startTime) / totalTime) * 100;
              return (
                <div
                  key={i}
                  className="flex items-center justify-center text-white text-xs font-semibold relative group"
                  style={{
                    width: `${width}%`,
                    background: block.processId
                      ? `linear-gradient(135deg, ${block.color}cc, ${block.color})`
                      : '#1e2230',
                    borderRight: i < merged.length - 1 ? '1px solid rgba(0,0,0,0.3)' : undefined,
                  }}
                  title={`${block.processName}: ${block.startTime} → ${block.endTime}`}
                >
                  {block.processId && (block.endTime - block.startTime) * 36 >= 28 && (
                    <span className="truncate px-1 drop-shadow-sm">{block.processName}</span>
                  )}
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity
                    bg-bg-primary border border-bg-border rounded-md px-2 py-1 text-xs text-text-primary whitespace-nowrap z-10 pointer-events-none shadow-lg">
                    {block.processId ? block.processName : 'Idle'}: {block.startTime} → {block.endTime} ({block.endTime - block.startTime}ms)
                  </div>
                </div>
              );
            })}
          </div>

          {/* X-axis ticks */}
          <div className="relative h-5 mt-1">
            {ticks.map((t) => (
              <div
                key={t}
                className="absolute flex flex-col items-center"
                style={{ left: `${(t / totalTime) * 100}%`, transform: 'translateX(-50%)' }}
              >
                <div className="w-px h-1.5 bg-bg-border" />
                <span className="text-text-muted font-mono" style={{ fontSize: '10px' }}>{t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer stats */}
      <div className="flex gap-6 mt-2 pt-3 border-t border-bg-border/50">
        <span className="text-text-muted text-xs">Tổng thời gian: <span className="text-text-secondary font-mono">{totalTime}</span></span>
        <span className="text-text-muted text-xs">Số lần chuyển đổi: <span className="text-text-secondary font-mono">{Math.max(0, contextSwitches)}</span></span>
      </div>
    </div>
  );
}
