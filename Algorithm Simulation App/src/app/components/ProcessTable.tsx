import { useState } from 'react';
import { Process, PROCESS_COLORS, AlgorithmId, MLQueueConfig } from '../types';

interface ProcessTableProps {
  processes: Process[];
  onChange: (processes: Process[]) => void;
  algorithm: AlgorithmId;
  mlqQueues?: MLQueueConfig[];
}

const MAX_PROCESSES = 10;

let pidCounter = 5;
function newProcessId() {
  return `p${pidCounter++}`;
}

export function ProcessTable({
  processes,
  onChange,
  algorithm,
  mlqQueues = [],
}: ProcessTableProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const showPriority =
    algorithm === 'priority-np' || algorithm === 'priority-p';
  const showQueue = algorithm === 'mlq';

  const update = (id: string, field: keyof Process, rawValue: string) => {
    const numVal = parseInt(rawValue, 10);
    let errMsg = '';

    if (field === 'burstTime' && (isNaN(numVal) || numVal < 1)) {
      errMsg = 'BT ≥ 1';
    } else if (
      (field === 'arrivalTime' || field === 'priority') &&
      (isNaN(numVal) || numVal < 0)
    ) {
      errMsg = '≥ 0';
    }

    setErrors((prev) => ({ ...prev, [`${id}-${field}`]: errMsg }));

    if (!errMsg) {
      onChange(
        processes.map((p) =>
          p.id === id
            ? { ...p, [field]: field === 'name' ? rawValue : numVal }
            : p
        )
      );
    } else if (field === 'name') {
      onChange(
        processes.map((p) => (p.id === id ? { ...p, name: rawValue } : p))
      );
    }
  };

  const addProcess = () => {
    if (processes.length >= MAX_PROCESSES) return;
    const id = newProcessId();
    const name = `P${processes.length + 1}`;
    const color = PROCESS_COLORS[processes.length % PROCESS_COLORS.length];
    const newP: Process = {
      id,
      name,
      arrivalTime: 0,
      burstTime: 1,
      priority: 1,
      color,
      queue: 0,
    };
    onChange([...processes, newP]);
  };

  const removeProcess = (id: string) => {
    onChange(processes.filter((p) => p.id !== id));
  };

  const resetToDefault = () => {
    onChange([
      { id: 'p1', name: 'P1', arrivalTime: 0, burstTime: 6, priority: 3, color: PROCESS_COLORS[0], queue: 0 },
      { id: 'p2', name: 'P2', arrivalTime: 2, burstTime: 4, priority: 1, color: PROCESS_COLORS[1], queue: 1 },
      { id: 'p3', name: 'P3', arrivalTime: 4, burstTime: 2, priority: 4, color: PROCESS_COLORS[2], queue: 0 },
      { id: 'p4', name: 'P4', arrivalTime: 6, burstTime: 5, priority: 2, color: PROCESS_COLORS[3], queue: 1 },
    ]);
  };

  const inputClass = (id: string, field: string) =>
    `w-full bg-slate-900 border rounded-lg px-2 py-1.5 text-center text-sm text-slate-200 outline-none transition-all duration-150 focus:ring-1 ${
      errors[`${id}-${field}`]
        ? 'border-red-500 focus:ring-red-500'
        : 'border-slate-700 focus:border-indigo-500 focus:ring-indigo-500'
    }`;

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
          <span className="text-base">📋</span>
          <h3 className="text-sm font-semibold text-slate-200">
            Danh sách tiến trình
          </h3>
          <span
            className="text-xs px-2 py-0.5 rounded-full font-medium"
            style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8' }}
          >
            {processes.length}/{MAX_PROCESSES}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={resetToDefault}
            className="text-xs px-3 py-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition-all duration-150"
          >
            Mẫu mặc định
          </button>
          <button
            onClick={addProcess}
            disabled={processes.length >= MAX_PROCESSES}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background:
                processes.length >= MAX_PROCESSES
                  ? undefined
                  : 'rgba(99,102,241,0.15)',
              color:
                processes.length >= MAX_PROCESSES ? undefined : '#818cf8',
            }}
            onMouseEnter={(e) => {
              if (processes.length < MAX_PROCESSES) {
                (e.currentTarget as HTMLButtonElement).style.background =
                  'rgba(99,102,241,0.25)';
              }
            }}
            onMouseLeave={(e) => {
              if (processes.length < MAX_PROCESSES) {
                (e.currentTarget as HTMLButtonElement).style.background =
                  'rgba(99,102,241,0.15)';
              }
            }}
          >
            <span>+</span>
            <span>Thêm tiến trình</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <th className="text-left px-4 py-2.5 text-xs font-medium text-slate-500 w-20">
                Tiến trình
              </th>
              <th className="text-center px-3 py-2.5 text-xs font-medium text-slate-500 w-20">
                Tên
              </th>
              <th className="text-center px-3 py-2.5 text-xs font-medium text-slate-500 w-24">
                Đến (AT)
              </th>
              <th className="text-center px-3 py-2.5 text-xs font-medium text-slate-500 w-24">
                Burst (BT)
              </th>
              {showPriority && (
                <th className="text-center px-3 py-2.5 text-xs font-medium text-slate-500 w-24">
                  Ưu tiên
                </th>
              )}
              {showQueue && (
                <th className="text-center px-3 py-2.5 text-xs font-medium text-slate-500 w-32">
                  Hàng đợi
                </th>
              )}
              <th className="text-center px-3 py-2.5 text-xs font-medium text-slate-500 w-12">
                Xóa
              </th>
            </tr>
          </thead>
          <tbody>
            {processes.length === 0 && (
              <tr>
                <td
                  colSpan={showPriority || showQueue ? 6 : 5}
                  className="text-center py-10 text-slate-600 text-sm"
                >
                  Chưa có tiến trình nào. Nhấn{' '}
                  <span className="text-indigo-400">+ Thêm tiến trình</span>{' '}
                  để bắt đầu.
                </td>
              </tr>
            )}
            {processes.map((p, idx) => (
              <tr
                key={p.id}
                className="transition-colors duration-100 group"
                style={{
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                  background:
                    idx % 2 === 0
                      ? 'rgba(255,255,255,0.01)'
                      : 'transparent',
                }}
              >
                {/* Process badge */}
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{
                        backgroundColor: p.color,
                        boxShadow: `0 0 6px ${p.color}60`,
                      }}
                    />
                    <span className="text-xs text-slate-500 font-mono">
                      #{idx + 1}
                    </span>
                  </div>
                </td>

                {/* Name */}
                <td className="px-3 py-2">
                  <input
                    type="text"
                    value={p.name}
                    maxLength={4}
                    onChange={(e) => update(p.id, 'name', e.target.value)}
                    className={inputClass(p.id, 'name')}
                    style={{ fontFamily: 'JetBrains Mono, monospace' }}
                  />
                </td>

                {/* Arrival Time */}
                <td className="px-3 py-2">
                  <input
                    type="number"
                    min={0}
                    value={p.arrivalTime}
                    onChange={(e) => update(p.id, 'arrivalTime', e.target.value)}
                    className={inputClass(p.id, 'arrivalTime')}
                    style={{ fontFamily: 'JetBrains Mono, monospace' }}
                  />
                </td>

                {/* Burst Time */}
                <td className="px-3 py-2">
                  <input
                    type="number"
                    min={1}
                    value={p.burstTime}
                    onChange={(e) => update(p.id, 'burstTime', e.target.value)}
                    className={inputClass(p.id, 'burstTime')}
                    style={{ fontFamily: 'JetBrains Mono, monospace' }}
                  />
                </td>

                {/* Priority */}
                {showPriority && (
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      min={1}
                      value={p.priority}
                      onChange={(e) => update(p.id, 'priority', e.target.value)}
                      className={inputClass(p.id, 'priority')}
                      style={{ fontFamily: 'JetBrains Mono, monospace' }}
                    />
                  </td>
                )}

                {/* Queue selector for MLQ */}
                {showQueue && (
                  <td className="px-3 py-2">
                    <select
                      value={p.queue}
                      onChange={(e) =>
                        update(p.id, 'queue', e.target.value)
                      }
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-200 outline-none focus:border-indigo-500 transition-all duration-150"
                    >
                      {mlqQueues.map((q) => (
                        <option key={q.id} value={q.id}>
                          {q.name}
                        </option>
                      ))}
                    </select>
                  </td>
                )}

                {/* Delete */}
                <td className="px-3 py-2 text-center">
                  <button
                    onClick={() => removeProcess(p.id)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center mx-auto text-slate-600 hover:text-red-400 hover:bg-red-400/10 transition-all duration-150"
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Hint */}
      {showPriority && (
        <div
          className="px-5 py-2.5 text-xs text-slate-600 flex items-center gap-1"
          style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
        >
          <span>💡</span>
          <span>Số ưu tiên nhỏ hơn = Ưu tiên cao hơn (VD: ưu tiên 1 &gt; ưu tiên 4)</span>
        </div>
      )}
    </div>
  );
}