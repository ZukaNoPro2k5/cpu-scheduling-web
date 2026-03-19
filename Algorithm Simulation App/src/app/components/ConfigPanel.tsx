import { AlgorithmId, AlgorithmConfig, MLQueueConfig } from '../types';

interface ConfigPanelProps {
  algorithm: AlgorithmId;
  config: AlgorithmConfig;
  onChange: (config: AlgorithmConfig) => void;
}

export function ConfigPanel({ algorithm, config, onChange }: ConfigPanelProps) {
  if (
    algorithm !== 'round-robin' &&
    algorithm !== 'mlq' &&
    algorithm !== 'mlfq'
  ) {
    return null;
  }

  const inputClass =
    'bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all duration-150 w-20 text-center';

  /* ── Round Robin ── */
  if (algorithm === 'round-robin') {
    return (
      <div
        className="rounded-2xl px-5 py-4 flex items-center gap-6"
        style={{
          background: '#111827',
          border: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        <div className="flex items-center gap-2">
          <span className="text-base">⚙️</span>
          <span className="text-sm font-semibold text-slate-200">
            Cấu hình Round Robin
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-400">Quantum (q):</span>
          <input
            type="number"
            min={1}
            max={20}
            value={config.timeQuantum}
            onChange={(e) =>
              onChange({ ...config, timeQuantum: Math.max(1, parseInt(e.target.value) || 1) })
            }
            className={inputClass}
            style={{ fontFamily: 'JetBrains Mono, monospace' }}
          />
          <span className="text-sm text-slate-500">đơn vị thời gian</span>
        </div>
        <div
          className="ml-auto px-3 py-1.5 rounded-lg text-xs"
          style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8' }}
        >
          Mỗi tiến trình chạy tối đa {config.timeQuantum} đơn vị
        </div>
      </div>
    );
  }

  /* ── MLQ ── */
  if (algorithm === 'mlq') {
    const setQueues = (queues: MLQueueConfig[]) =>
      onChange({ ...config, mlqQueues: queues });

    const addQueue = () => {
      if (config.mlqQueues.length >= 5) return;
      const newId = config.mlqQueues.length;
      setQueues([
        ...config.mlqQueues,
        { id: newId, name: `Hàng đợi ${newId + 1}`, algorithm: 'fcfs', timeQuantum: 2 },
      ]);
    };

    const removeQueue = (id: number) => {
      if (config.mlqQueues.length <= 2) return;
      const updated = config.mlqQueues
        .filter((q) => q.id !== id)
        .map((q, i) => ({ ...q, id: i }));
      setQueues(updated);
    };

    const updateQueue = (id: number, field: keyof MLQueueConfig, value: string | number) =>
      setQueues(
        config.mlqQueues.map((q) =>
          q.id === id ? { ...q, [field]: value } : q
        )
      );

    return (
      <div
        className="rounded-2xl px-5 py-4 space-y-4"
        style={{
          background: '#111827',
          border: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base">⚙️</span>
            <span className="text-sm font-semibold text-slate-200">
              Cấu hình Multilevel Queue
            </span>
            <span
              className="text-xs px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8' }}
            >
              {config.mlqQueues.length} hàng đợi
            </span>
          </div>
          <button
            onClick={addQueue}
            disabled={config.mlqQueues.length >= 5}
            className="text-xs px-3 py-1.5 rounded-lg transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8' }}
          >
            + Thêm hàng đợi
          </button>
        </div>

        <div className="space-y-2">
          {config.mlqQueues.map((q, idx) => (
            <div
              key={q.id}
              className="flex items-center gap-3 rounded-xl p-3"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.05)',
              }}
            >
              <div
                className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{
                  background:
                    idx === 0
                      ? 'rgba(99,102,241,0.3)'
                      : 'rgba(255,255,255,0.06)',
                  color: idx === 0 ? '#818cf8' : '#64748b',
                }}
              >
                {idx + 1}
              </div>

              <input
                type="text"
                value={q.name}
                onChange={(e) => updateQueue(q.id, 'name', e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-200 outline-none focus:border-indigo-500 transition-all duration-150"
                placeholder="Tên hàng đợi"
              />

              <select
                value={q.algorithm}
                onChange={(e) =>
                  updateQueue(q.id, 'algorithm', e.target.value as 'fcfs' | 'rr')
                }
                className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-200 outline-none focus:border-indigo-500 transition-all duration-150"
              >
                <option value="fcfs">FCFS</option>
                <option value="rr">Round Robin</option>
              </select>

              {q.algorithm === 'rr' && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">q=</span>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={q.timeQuantum}
                    onChange={(e) =>
                      updateQueue(q.id, 'timeQuantum', Math.max(1, parseInt(e.target.value) || 1))
                    }
                    className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-sm text-slate-200 outline-none focus:border-indigo-500 transition-all duration-150 w-14 text-center"
                    style={{ fontFamily: 'JetBrains Mono, monospace' }}
                  />
                </div>
              )}

              <div className="text-xs text-slate-600">
                {idx === 0 ? '↑ Cao nhất' : idx === config.mlqQueues.length - 1 ? '↓ Thấp nhất' : `Mức ${idx + 1}`}
              </div>

              <button
                onClick={() => removeQueue(q.id)}
                disabled={config.mlqQueues.length <= 2}
                className="w-6 h-6 rounded-lg flex items-center justify-center text-slate-600 hover:text-red-400 hover:bg-red-400/10 transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <div className="text-xs text-slate-600 flex items-center gap-1">
          <span>💡</span>
          <span>Hàng đợi 1 có ưu tiên cao nhất và sẽ chiếm quyền các hàng đợi bên dưới</span>
        </div>
      </div>
    );
  }

  /* ── MLFQ ── */
  if (algorithm === 'mlfq') {
    const setLevels = (levels: number) => {
      const quanta = [...config.mlfqQuanta];
      while (quanta.length < levels) quanta.push(quanta[quanta.length - 1] * 2 || 8);
      onChange({ ...config, mlfqLevels: levels, mlfqQuanta: quanta.slice(0, levels) });
    };

    const setQuantum = (idx: number, val: number) => {
      const q = [...config.mlfqQuanta];
      q[idx] = Math.max(1, val);
      onChange({ ...config, mlfqQuanta: q });
    };

    return (
      <div
        className="rounded-2xl px-5 py-4 space-y-4"
        style={{
          background: '#111827',
          border: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-base">⚙️</span>
            <span className="text-sm font-semibold text-slate-200">
              Cấu hình MLFQ
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-400">Số cấp:</span>
            <div className="flex items-center gap-1">
              {[2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onClick={() => setLevels(n)}
                  className="w-8 h-8 rounded-lg text-sm font-medium transition-all duration-150"
                  style={{
                    background:
                      config.mlfqLevels === n
                        ? 'rgba(99,102,241,0.3)'
                        : 'rgba(255,255,255,0.04)',
                    color:
                      config.mlfqLevels === n ? '#818cf8' : '#64748b',
                    border:
                      config.mlfqLevels === n
                        ? '1px solid rgba(99,102,241,0.4)'
                        : '1px solid rgba(255,255,255,0.05)',
                  }}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}>
          {Array.from({ length: config.mlfqLevels }, (_, i) => (
            <div
              key={i}
              className="rounded-xl p-3 space-y-2"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.05)',
              }}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold"
                  style={{
                    background:
                      i === 0
                        ? 'rgba(99,102,241,0.3)'
                        : i === config.mlfqLevels - 1
                        ? 'rgba(244,63,94,0.2)'
                        : 'rgba(255,255,255,0.06)',
                    color:
                      i === 0
                        ? '#818cf8'
                        : i === config.mlfqLevels - 1
                        ? '#fb7185'
                        : '#64748b',
                  }}
                >
                  {i + 1}
                </div>
                <span className="text-xs text-slate-400 font-medium">
                  {i === 0
                    ? 'Ưu tiên cao nhất'
                    : i === config.mlfqLevels - 1
                    ? 'Ưu tiên thấp nhất'
                    : `Cấp ${i + 1}`}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Quantum:</span>
                <input
                  type="number"
                  min={1}
                  value={config.mlfqQuanta[i] ?? 2}
                  onChange={(e) => setQuantum(i, parseInt(e.target.value) || 1)}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-sm text-slate-200 outline-none focus:border-indigo-500 transition-all duration-150 text-center"
                  style={{ fontFamily: 'JetBrains Mono, monospace' }}
                />
              </div>
              <div className="text-xs text-slate-600">
                {i === 0
                  ? 'Tiến trình mới vào đây'
                  : `Bị giáng cấp từ cấp ${i}`}
              </div>
            </div>
          ))}
        </div>

        <div className="text-xs text-slate-600 flex items-center gap-1">
          <span>💡</span>
          <span>
            Nếu tiến trình dùng hết quantum ở cấp i, nó sẽ xuống cấp i+1. Cấp
            cuối dùng FCFS
          </span>
        </div>
      </div>
    );
  }

  return null;
}
