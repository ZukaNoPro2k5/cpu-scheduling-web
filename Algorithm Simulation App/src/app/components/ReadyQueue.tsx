import { SchedulingResult, Process } from '../types';

interface ReadyQueueProps {
  result: SchedulingResult;
  currentTime: number;
  processes: Process[];
}

export function ReadyQueue({ result, currentTime, processes }: ReadyQueueProps) {
  const t = Math.min(Math.floor(currentTime), result.totalTime);
  const frame = result.timeline[t] ?? result.timeline[result.timeline.length - 1];

  if (!frame) return null;

  const processMap = new Map(processes.map((p) => [p.id, p]));
  const runningProc = frame.runningId ? processMap.get(frame.runningId) : null;
  const readyProcs = frame.readyIds
    .map((id) => processMap.get(id))
    .filter(Boolean) as Process[];

  // Processes that haven't arrived yet
  const arrivedIds = new Set([
    ...(frame.runningId ? [frame.runningId] : []),
    ...frame.readyIds,
  ]);

  // Find completion times
  const completionTimes = new Map<string, number>();
  for (const b of result.gantt) {
    if (b.processId !== 'idle') {
      completionTimes.set(b.processId, Math.max(completionTimes.get(b.processId) || 0, b.end));
    }
  }

  const waitingProcs = processes.filter(
    (p) => p.arrivalTime > t
  );
  const completedProcs = processes.filter(
    (p) =>
      !arrivedIds.has(p.id) &&
      p.arrivalTime <= t &&
      (completionTimes.get(p.id) ?? 0) <= t
  );

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
        className="flex items-center gap-2 px-5 py-3.5"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <span className="text-base">🔄</span>
        <h3 className="text-sm font-semibold text-slate-200">Hàng đợi sẵn sàng</h3>
        <span
          className="text-xs px-2 py-0.5 rounded-full"
          style={{ background: 'rgba(251,191,36,0.1)', color: '#fbbf24' }}
        >
          t = {t}
        </span>
      </div>

      <div className="px-5 py-4 space-y-4">
        {/* CPU / Running */}
        <div>
          <div className="text-xs font-medium text-slate-500 mb-2 uppercase tracking-wider">
            CPU — Đang thực thi
          </div>
          {runningProc ? (
            <div
              className="flex items-center gap-3 rounded-xl px-4 py-3"
              style={{
                background: `${runningProc.color}15`,
                border: `1px solid ${runningProc.color}35`,
              }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
                style={{
                  backgroundColor: runningProc.color,
                  boxShadow: `0 4px 10px ${runningProc.color}50`,
                  color: 'rgba(0,0,0,0.7)',
                  fontFamily: 'JetBrains Mono, monospace',
                }}
              >
                {runningProc.name}
              </div>
              <div>
                <div className="text-sm font-medium" style={{ color: runningProc.color }}>
                  {runningProc.name}
                </div>
                <div className="text-xs text-slate-500">
                  AT={runningProc.arrivalTime}, BT={runningProc.burstTime}
                </div>
              </div>
              <div className="ml-auto flex items-center gap-1.5">
                <div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: runningProc.color }}
                />
                <div
                  className="w-1 h-1 rounded-full opacity-60"
                  style={{ backgroundColor: runningProc.color }}
                />
                <div
                  className="w-0.5 h-0.5 rounded-full opacity-30"
                  style={{ backgroundColor: runningProc.color }}
                />
                <span className="text-xs ml-1" style={{ color: runningProc.color }}>
                  Đang chạy
                </span>
              </div>
            </div>
          ) : (
            <div
              className="flex items-center gap-3 rounded-xl px-4 py-3"
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.05)',
              }}
            >
              <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center">
                <span className="text-slate-600 text-xs">—</span>
              </div>
              <span className="text-sm text-slate-600">CPU rảnh</span>
            </div>
          )}
        </div>

        {/* Ready Queue */}
        <div>
          <div className="text-xs font-medium text-slate-500 mb-2 uppercase tracking-wider flex items-center gap-2">
            <span>Hàng đợi sẵn sàng</span>
            {readyProcs.length > 0 && (
              <span
                className="text-xs px-1.5 py-0.5 rounded-full"
                style={{ background: 'rgba(251,191,36,0.15)', color: '#fbbf24' }}
              >
                {readyProcs.length}
              </span>
            )}
          </div>

          {readyProcs.length === 0 ? (
            <div className="text-xs text-slate-600 py-2">Không có tiến trình nào đang chờ</div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {/* Queue arrow */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {readyProcs.map((proc, i) => (
                  <div key={proc.id} className="flex items-center gap-1.5">
                    <div
                      className="flex items-center gap-2 rounded-lg px-3 py-2"
                      style={{
                        background: `${proc.color}18`,
                        border: `1px solid ${proc.color}30`,
                      }}
                    >
                      <div
                        className="w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold"
                        style={{
                          backgroundColor: proc.color,
                          color: 'rgba(0,0,0,0.7)',
                          fontFamily: 'JetBrains Mono, monospace',
                        }}
                      >
                        {proc.name.slice(0, 2)}
                      </div>
                      <span className="text-xs" style={{ color: proc.color }}>
                        {proc.name}
                      </span>
                    </div>
                    {i < readyProcs.length - 1 && (
                      <svg
                        className="w-3 h-3 text-slate-600 flex-shrink-0"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Summary row */}
        <div
          className="grid grid-cols-3 gap-3 pt-2"
          style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
        >
          <div className="text-center">
            <div className="text-xs text-slate-600 mb-1">Chưa đến</div>
            <div className="text-sm font-semibold text-slate-400">
              {waitingProcs.length}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-slate-600 mb-1">Đang chờ</div>
            <div
              className="text-sm font-semibold"
              style={{ color: readyProcs.length > 0 ? '#fbbf24' : '#475569' }}
            >
              {readyProcs.length}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-slate-600 mb-1">Hoàn thành</div>
            <div
              className="text-sm font-semibold"
              style={{ color: completedProcs.length > 0 ? '#34d399' : '#475569' }}
            >
              {completedProcs.length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
