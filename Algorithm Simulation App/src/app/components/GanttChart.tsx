import { SchedulingResult, Process } from '../types';

interface GanttChartProps {
  result: SchedulingResult;
  processes: Process[];
}

export function GanttChart({ result, processes }: GanttChartProps) {
  const { gantt, totalTime } = result;

  if (!gantt.length || totalTime === 0) return null;

  const MIN_BLOCK_PX = 32;
  const MAX_BLOCK_PX = 80;
  const availableWidth = 900;
  const cellW = Math.min(MAX_BLOCK_PX, Math.max(MIN_BLOCK_PX, availableWidth / totalTime));
  const chartWidth = totalTime * cellW;

  // Boundary ticks from all block edges
  const boundaryTicks = Array.from(
    new Set(gantt.flatMap((b) => [b.start, b.end]))
  ).sort((a, b) => a - b);

  // Limit tick density
  const maxTicks = 30;
  const showTicks: number[] =
    boundaryTicks.length <= maxTicks
      ? boundaryTicks
      : boundaryTicks.filter((_, i) => i % Math.ceil(boundaryTicks.length / maxTicks) === 0 || i === boundaryTicks.length - 1);

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
        className="flex items-center justify-between px-5 py-3.5"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="flex items-center gap-2">
          <span className="text-base">📊</span>
          <h3 className="text-sm font-semibold text-slate-200">Biểu đồ Gantt</h3>
          <span
            className="text-xs px-2 py-0.5 rounded-md"
            style={{ background: 'rgba(255,255,255,0.05)', color: '#64748b' }}
          >
            Tổng: {totalTime} đơn vị
          </span>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 flex-wrap justify-end">
          {processes.map((p) => (
            <div key={p.id} className="flex items-center gap-1.5">
              <div
                className="w-2.5 h-2.5 rounded-sm"
                style={{ backgroundColor: p.color, boxShadow: `0 0 4px ${p.color}80` }}
              />
              <span
                className="text-xs text-slate-400"
                style={{ fontFamily: 'JetBrains Mono, monospace' }}
              >
                {p.name}
              </span>
            </div>
          ))}
          {gantt.some((b) => b.processId === 'idle') && (
            <div className="flex items-center gap-1.5">
              <div
                className="w-2.5 h-2.5 rounded-sm"
                style={{
                  background:
                    'repeating-linear-gradient(45deg, #1e293b, #1e293b 3px, #0f172a 3px, #0f172a 6px)',
                }}
              />
              <span className="text-xs text-slate-500">Rảnh</span>
            </div>
          )}
        </div>
      </div>

      {/* Chart */}
      <div className="overflow-x-auto px-5 py-5">
        <div style={{ width: `${chartWidth}px`, minWidth: '100%' }}>
          {/* Blocks */}
          <div className="relative" style={{ height: '52px' }}>
            {/* Background grid */}
            {showTicks.map((t) => (
              <div
                key={t}
                className="absolute top-0 bottom-0"
                style={{
                  left: `${(t / totalTime) * 100}%`,
                  width: '1px',
                  background: 'rgba(255,255,255,0.04)',
                  pointerEvents: 'none',
                }}
              />
            ))}

            {/* Gantt blocks */}
            {gantt.map((block, idx) => {
              const isIdle = block.processId === 'idle';
              const blockLeft = (block.start / totalTime) * 100;
              const blockWidth = ((block.end - block.start) / totalTime) * 100;
              const duration = block.end - block.start;
              const showLabel = duration * cellW > 28 && !isIdle;

              return (
                <div
                  key={`${block.processId}-${idx}`}
                  className="absolute top-1 bottom-1 group"
                  style={{
                    left: `${blockLeft}%`,
                    width: `calc(${blockWidth}% - 2px)`,
                  }}
                  title={
                    isIdle
                      ? `Rảnh: [${block.start} → ${block.end}]`
                      : `${block.processName}: [${block.start} → ${block.end}]`
                  }
                >
                  {/* Block body */}
                  <div
                    className="h-full rounded-lg flex items-center justify-center overflow-hidden relative cursor-default"
                    style={{
                      background: isIdle
                        ? 'repeating-linear-gradient(45deg, #1c2d42, #1c2d42 4px, #14202e 4px, #14202e 8px)'
                        : block.color,
                      boxShadow: !isIdle
                        ? `0 0 12px ${block.color}30, inset 0 1px 0 rgba(255,255,255,0.18)`
                        : undefined,
                      transition: 'filter 0.15s',
                    }}
                    onMouseEnter={(e) => {
                      if (!isIdle)
                        (e.currentTarget as HTMLDivElement).style.filter = 'brightness(1.15)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLDivElement).style.filter = '';
                    }}
                  >
                    {/* Shine overlay */}
                    {!isIdle && (
                      <div
                        className="absolute inset-0"
                        style={{
                          background:
                            'linear-gradient(180deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0) 55%)',
                          borderRadius: 'inherit',
                          pointerEvents: 'none',
                        }}
                      />
                    )}
                    {showLabel && (
                      <span
                        className="relative z-10 text-xs select-none"
                        style={{
                          color: 'rgba(255,255,255,0.92)',
                          fontFamily: 'JetBrains Mono, monospace',
                          fontWeight: 700,
                          textShadow: '0 1px 3px rgba(0,0,0,0.5)',
                          letterSpacing: '0.02em',
                        }}
                      >
                        {block.processName}
                      </span>
                    )}
                  </div>

                  {/* Hover tooltip */}
                  <div
                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 rounded-lg text-xs whitespace-nowrap pointer-events-none z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                    style={{
                      background: '#0f172a',
                      border: '1px solid rgba(255,255,255,0.12)',
                      color: '#e2e8f0',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                      fontFamily: 'JetBrains Mono, monospace',
                    }}
                  >
                    {isIdle ? 'Rảnh' : block.processName} [{block.start} → {block.end}]
                    {!isIdle && (
                      <span className="text-slate-400"> ({duration}t)</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Time axis */}
          <div className="relative mt-2" style={{ height: '22px' }}>
            {showTicks.map((t) => (
              <div
                key={t}
                className="absolute flex flex-col items-center"
                style={{
                  left: `${(t / totalTime) * 100}%`,
                  transform: 'translateX(-50%)',
                }}
              >
                <div className="w-px h-1.5" style={{ background: 'rgba(255,255,255,0.18)' }} />
                <span
                  className="text-slate-500 mt-0.5"
                  style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '10px',
                    lineHeight: '1',
                  }}
                >
                  {t}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Summary stats */}
      <div
        className="px-5 py-2.5 flex items-center gap-6 flex-wrap"
        style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
      >
        <div className="flex items-center gap-1.5 text-xs text-slate-600">
          <span>Tổng thời gian:</span>
          <span
            className="text-slate-400 font-medium"
            style={{ fontFamily: 'JetBrains Mono, monospace' }}
          >
            {totalTime}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-600">
          <span>Số lần chuyển đổi:</span>
          <span
            className="text-slate-400 font-medium"
            style={{ fontFamily: 'JetBrains Mono, monospace' }}
          >
            {gantt.filter((b) => b.processId !== 'idle').length}
          </span>
        </div>
        {gantt.some((b) => b.processId === 'idle') && (
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <span>Thời gian rảnh:</span>
            <span
              className="text-amber-500 font-medium"
              style={{ fontFamily: 'JetBrains Mono, monospace' }}
            >
              {gantt
                .filter((b) => b.processId === 'idle')
                .reduce((s, b) => s + (b.end - b.start), 0)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
