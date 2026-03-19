import { SchedulingResult } from '../types';

interface MetricsTableProps {
  result: SchedulingResult;
}

function val(n: number, good: number, ok: number) {
  if (n <= good) return '#34d399';
  if (n <= ok) return '#fbbf24';
  return '#fb7185';
}

export function MetricsTable({ result }: MetricsTableProps) {
  const {
    metrics,
    avgWaitingTime,
    avgTurnaroundTime,
    avgResponseTime,
    throughput,
    totalTime,
  } = result;

  const thC =
    'text-xs font-medium text-slate-500 px-3 py-2.5 text-center uppercase tracking-wider select-none';
  const thL =
    'text-xs font-medium text-slate-500 px-4 py-2.5 text-left uppercase tracking-wider select-none';
  const tdC = 'px-3 py-2.5 text-center';

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: '#111827',
        border: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      {/* ── Top summary ── */}
      <div
        className="grid grid-cols-4 divide-x"
        style={{
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          divideColor: 'rgba(255,255,255,0.06)',
        }}
      >
        {[
          {
            label: 'Avg Waiting Time',
            abbr: 'Avg WT',
            value: avgWaitingTime,
            good: 3,
            ok: 6,
            unit: 't',
          },
          {
            label: 'Avg Turnaround',
            abbr: 'Avg TAT',
            value: avgTurnaroundTime,
            good: 5,
            ok: 10,
            unit: 't',
          },
          {
            label: 'Avg Response Time',
            abbr: 'Avg RT',
            value: avgResponseTime,
            good: 3,
            ok: 6,
            unit: 't',
          },
          {
            label: 'Throughput',
            abbr: 'Throughput',
            value: throughput,
            good: Infinity,
            ok: Infinity,
            unit: '/t',
            isThruput: true,
          },
        ].map((m) => (
          <div
            key={m.abbr}
            className="flex flex-col items-center justify-center py-3 px-4 gap-1"
            style={{ borderRight: '1px solid rgba(255,255,255,0.05)' }}
          >
            <span className="text-xs text-slate-600">{m.abbr}</span>
            <span
              className="text-lg font-bold"
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                color: m.isThruput ? '#818cf8' : val(m.value, m.good, m.ok),
              }}
            >
              {m.value.toFixed(2)}
            </span>
            <span style={{ fontSize: '10px', color: '#334155' }}>{m.unit}</span>
          </div>
        ))}
      </div>

      {/* ── Header row ── */}
      <div className="flex items-center justify-between px-5 py-2.5"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="flex items-center gap-2">
          <span className="text-base">📈</span>
          <h3 className="text-sm font-semibold text-slate-200">Bảng hiệu suất</h3>
          <span
            className="text-xs px-2 py-0.5 rounded-md"
            style={{ background: 'rgba(255,255,255,0.04)', color: '#475569' }}
          >
            {metrics.length} tiến trình
          </span>
        </div>
        {/* Color legend */}
        <div className="flex items-center gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
            Tốt
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
            Trung bình
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-400 inline-block" />
            Kém
          </div>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <th className={thL}>Tiến trình</th>
              <th className={thC}>AT</th>
              <th className={thC}>BT</th>
              <th className={thC}>CT</th>
              <th className={thC}>WT</th>
              <th className={thC}>TAT</th>
              <th className={thC}>RT</th>
            </tr>
          </thead>
          <tbody>
            {metrics.map((m, idx) => (
              <tr
                key={m.processId}
                style={{
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                  background:
                    idx % 2 === 0
                      ? 'rgba(255,255,255,0.015)'
                      : 'transparent',
                }}
              >
                {/* Name */}
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{
                        backgroundColor: m.color,
                        boxShadow: `0 0 5px ${m.color}80`,
                      }}
                    />
                    <span
                      className="text-sm font-semibold text-slate-200"
                      style={{ fontFamily: 'JetBrains Mono, monospace' }}
                    >
                      {m.processName}
                    </span>
                  </div>
                </td>

                {/* AT */}
                <td className={tdC}>
                  <span
                    className="text-sm text-slate-400"
                    style={{ fontFamily: 'JetBrains Mono, monospace' }}
                  >
                    {m.arrivalTime}
                  </span>
                </td>

                {/* BT */}
                <td className={tdC}>
                  <span
                    className="text-sm text-slate-400"
                    style={{ fontFamily: 'JetBrains Mono, monospace' }}
                  >
                    {m.burstTime}
                  </span>
                </td>

                {/* CT */}
                <td className={tdC}>
                  <span
                    className="text-sm text-slate-300"
                    style={{ fontFamily: 'JetBrains Mono, monospace' }}
                  >
                    {m.completionTime}
                  </span>
                </td>

                {/* WT */}
                <td className={tdC}>
                  <span
                    className="text-sm font-medium px-2 py-0.5 rounded-md inline-block"
                    style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      color: val(m.waitingTime, 3, 6),
                      background: `${val(m.waitingTime, 3, 6)}18`,
                    }}
                  >
                    {m.waitingTime}
                  </span>
                </td>

                {/* TAT */}
                <td className={tdC}>
                  <span
                    className="text-sm font-medium px-2 py-0.5 rounded-md inline-block"
                    style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      color: val(m.turnaroundTime, 5, 10),
                      background: `${val(m.turnaroundTime, 5, 10)}18`,
                    }}
                  >
                    {m.turnaroundTime}
                  </span>
                </td>

                {/* RT */}
                <td className={tdC}>
                  <span
                    className="text-sm font-medium px-2 py-0.5 rounded-md inline-block"
                    style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      color: val(m.responseTime, 3, 6),
                      background: `${val(m.responseTime, 3, 6)}18`,
                    }}
                  >
                    {m.responseTime}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>

          {/* Average footer */}
          <tfoot>
            <tr
              style={{
                borderTop: '1px solid rgba(255,255,255,0.08)',
                background: 'rgba(99,102,241,0.05)',
              }}
            >
              <td className="px-4 py-2.5">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Trung bình
                </span>
              </td>
              <td className={tdC}>
                <span className="text-xs text-slate-600">—</span>
              </td>
              <td className={tdC}>
                <span className="text-xs text-slate-600">—</span>
              </td>
              <td className={tdC}>
                <span className="text-xs text-slate-600">—</span>
              </td>
              <td className={tdC}>
                <span
                  className="text-sm font-bold"
                  style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    color: val(avgWaitingTime, 3, 6),
                  }}
                >
                  {avgWaitingTime.toFixed(2)}
                </span>
              </td>
              <td className={tdC}>
                <span
                  className="text-sm font-bold"
                  style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    color: val(avgTurnaroundTime, 5, 10),
                  }}
                >
                  {avgTurnaroundTime.toFixed(2)}
                </span>
              </td>
              <td className={tdC}>
                <span
                  className="text-sm font-bold"
                  style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    color: val(avgResponseTime, 3, 6),
                  }}
                >
                  {avgResponseTime.toFixed(2)}
                </span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Legend footer */}
      <div
        className="px-5 py-2.5 flex flex-wrap gap-4 text-xs text-slate-700"
        style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
      >
        {[
          ['AT', 'Arrival Time — Thời gian đến'],
          ['BT', 'Burst Time — Thời gian CPU cần'],
          ['CT', 'Completion Time — Thời gian hoàn thành'],
          ['WT', 'Waiting Time = TAT − BT'],
          ['TAT', 'Turnaround Time = CT − AT'],
          ['RT', 'Response Time — Lần đầu tiên được CPU'],
        ].map(([abbr, desc]) => (
          <span key={abbr}>
            <span className="text-slate-500 font-medium">{abbr}</span>{' '}
            {desc}
          </span>
        ))}
      </div>
    </div>
  );
}
