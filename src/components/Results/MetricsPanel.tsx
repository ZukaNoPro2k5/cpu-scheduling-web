import { ProcessMetric, SummaryMetrics } from '../../algorithms/types';

interface MetricsProps {
  metrics: ProcessMetric[];
  summary: SummaryMetrics;
}

function badge(value: number, avg: number) {
  if (value <= avg * 0.8) return <span className="badge-good">Tốt</span>;
  if (value <= avg * 1.3) return <span className="badge-avg">TB</span>;
  return <span className="badge-poor">Kém</span>;
}

function fmt(n: number) { return n.toFixed(2); }

export function MetricsPanel({ metrics, summary }: MetricsProps) {
  const avgWt = summary.avgWaitingTime;
  const avgTat = summary.avgTurnaroundTime;
  const avgRt = summary.avgResponseTime;

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Avg WT', value: fmt(avgWt), sub: 'Trung bình thời gian chờ' },
          { label: 'Avg TAT', value: fmt(avgTat), sub: 'Turnaround time trung bình' },
          { label: 'Avg RT', value: fmt(avgRt), sub: 'Response time trung bình' },
          { label: 'Throughput', value: fmt(summary.throughput), sub: 'Tiến trình / đơn vị thời gian' },
        ].map((card) => (
          <div key={card.label} className="card text-center">
            <div className="text-text-muted text-xs mb-1">{card.label}</div>
            <div className="text-2xl font-bold text-accent-cyan font-mono">{card.value}</div>
            <div className="text-text-muted text-xs mt-1">{card.sub}</div>
          </div>
        ))}
      </div>

      {/* Detail table */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span>☑️</span>
            <span className="text-text-primary font-semibold text-sm">Bảng hiệu suất</span>
            <span className="text-text-secondary text-xs bg-bg-tertiary rounded px-2 py-0.5">{metrics.length} tiến trình</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-text-muted">
            <span className="flex items-center gap-1"><span className="badge-good">Tốt</span></span>
            <span className="flex items-center gap-1"><span className="badge-avg">Trung bình</span></span>
            <span className="flex items-center gap-1"><span className="badge-poor">Kém</span></span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-text-muted text-xs border-b border-bg-border uppercase tracking-wide">
                <th className="text-left pb-3 pr-4 font-medium">Tiến trình</th>
                <th className="text-right pb-3 pr-4 font-medium">AT</th>
                <th className="text-right pb-3 pr-4 font-medium">BT</th>
                <th className="text-right pb-3 pr-4 font-medium">CT</th>
                <th className="text-right pb-3 pr-4 font-medium">WT</th>
                <th className="text-right pb-3 pr-4 font-medium">TAT</th>
                <th className="text-right pb-3 font-medium">RT</th>
              </tr>
            </thead>
            <tbody>
              {metrics.map((m) => (
                <tr key={m.processId} className="border-b border-bg-border/40 hover:bg-bg-hover/50 transition-colors">
                  <td className="py-2.5 pr-4">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: m.color }} />
                      <span className="font-medium text-text-primary">{m.processName}</span>
                    </div>
                  </td>
                  <td className="py-2.5 pr-4 text-right font-mono text-text-secondary">{m.arrivalTime}</td>
                  <td className="py-2.5 pr-4 text-right font-mono text-text-secondary">{m.burstTime}</td>
                  <td className="py-2.5 pr-4 text-right font-mono text-text-secondary">{m.completionTime}</td>
                  <td className="py-2.5 pr-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <span className="font-mono text-text-primary">{m.waitingTime}</span>
                      {badge(m.waitingTime, avgWt)}
                    </div>
                  </td>
                  <td className="py-2.5 pr-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <span className="font-mono text-text-primary">{m.turnaroundTime}</span>
                      {badge(m.turnaroundTime, avgTat)}
                    </div>
                  </td>
                  <td className="py-2.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <span className="font-mono text-text-primary">{m.responseTime}</span>
                      {badge(m.responseTime, avgRt)}
                    </div>
                  </td>
                </tr>
              ))}
              {/* Average row */}
              <tr className="bg-bg-tertiary/50">
                <td className="py-2.5 pr-4 font-semibold text-text-primary text-xs uppercase tracking-wide">Trung bình</td>
                <td className="py-2.5 pr-4 text-right text-text-muted">—</td>
                <td className="py-2.5 pr-4 text-right text-text-muted">—</td>
                <td className="py-2.5 pr-4 text-right text-text-muted">—</td>
                <td className="py-2.5 pr-4 text-right font-mono font-semibold text-accent-cyan">{fmt(avgWt)}</td>
                <td className="py-2.5 pr-4 text-right font-mono font-semibold text-accent-cyan">{fmt(avgTat)}</td>
                <td className="py-2.5 text-right font-mono font-semibold text-accent-cyan">{fmt(avgRt)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
