import { ProcessMetric, SummaryMetrics } from '../../algorithms/types';

interface MetricsProps {
  metrics: ProcessMetric[];
  summary: SummaryMetrics;
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
          { label: 'TB T.gian chờ (WT)', value: fmt(avgWt)},
          { label: 'TB T.gian hoàn thành (TAT)', value: fmt(avgTat)},
          { label: 'TB T.gian phản hồi (RT)', value: fmt(avgRt)},
          { label: 'Thông lượng', value: fmt(summary.throughput)},
        ].map((card) => (
          <div key={card.label} className="card text-center hover:border-accent-purple/30 transition-colors duration-200">
            <div className="text-text-muted text-xs mb-1">{card.label}</div>
            <div className="text-2xl font-bold text-accent-cyan font-mono">{card.value}</div>
          </div>
        ))}
      </div>

      {/* Detail table */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span>📊</span>
            <span className="text-text-primary font-semibold text-sm">Bảng kết quả</span>
            <span className="text-text-secondary text-xs bg-bg-tertiary rounded px-2 py-0.5">{metrics.length} tiến trình</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm table-fixed">
            <colgroup>
              <col className="w-28" />
              <col className="w-20" />
              <col className="w-20" />
              <col className="w-20" />
              <col className="w-20" />
              <col className="w-24" />
              <col className="w-24" />
            </colgroup>
            <thead>
              <tr className="text-text-muted text-xs border-b border-bg-border uppercase tracking-wide">
                <th className="text-left pb-3 font-medium">Tiến trình</th>
                <th className="text-center pb-3 font-medium">T.gian đến</th>
                <th className="text-center pb-3 font-medium">T.gian chạy</th>
                <th className="text-center pb-3 font-medium">T.gian k.thúc</th>
                <th className="text-center pb-3 font-medium">T.gian chờ</th>
                <th className="text-center pb-3 font-medium">T.gian hoàn thành</th>
                <th className="text-center pb-3 font-medium">T.gian phản hồi</th>
              </tr>
            </thead>
            <tbody>
              {metrics.map((m, idx) => (
                <tr
                  key={m.processId}
                  className="border-b border-bg-border/40 hover:bg-bg-hover/50 transition-colors"
                  style={idx % 2 === 1 ? { backgroundColor: 'rgba(255,255,255,0.015)' } : undefined}
                >
                  <td className="py-2.5">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: m.color, boxShadow: `0 0 4px ${m.color}80` }} />
                      <span className="font-medium text-text-primary">{m.processName}</span>
                    </div>
                  </td>
                  <td className="py-2.5 text-center font-mono text-text-secondary">{m.arrivalTime}</td>
                  <td className="py-2.5 text-center font-mono text-text-secondary">{m.burstTime}</td>
                  <td className="py-2.5 text-center font-mono text-text-secondary">{m.completionTime}</td>
                  <td className="py-2.5 text-center font-mono text-text-primary">{m.waitingTime}</td>
                  <td className="py-2.5 text-center font-mono text-text-primary">{m.turnaroundTime}</td>
                  <td className="py-2.5 text-center font-mono text-text-primary">{m.responseTime}</td>
                </tr>
              ))}
              {/* Average row */}
              <tr className="bg-bg-tertiary/50">
                <td className="py-2.5 font-semibold text-text-primary text-xs uppercase tracking-wide">TB</td>
                <td className="py-2.5 text-center text-text-muted">—</td>
                <td className="py-2.5 text-center text-text-muted">—</td>
                <td className="py-2.5 text-center text-text-muted">—</td>
                <td className="py-2.5 text-center font-mono font-semibold text-accent-cyan">{fmt(avgWt)}</td>
                <td className="py-2.5 text-center font-mono font-semibold text-accent-cyan">{fmt(avgTat)}</td>
                <td className="py-2.5 text-center font-mono font-semibold text-accent-cyan">{fmt(avgRt)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
