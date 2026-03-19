import { MLQueueConfig, MLQAlgorithm } from '../../algorithms/types';

interface MLQConfigProps {
  queues: MLQueueConfig[];
  onChange: (queues: MLQueueConfig[]) => void;
}

const ALGORITHMS: MLQAlgorithm[] = ['FCFS', 'RR', 'SJF', 'Priority'];

export function MLQConfig({ queues, onChange }: MLQConfigProps) {
  const addQueue = () => {
    if (queues.length >= 5) return;
    const id = `q${Date.now()}`;
    onChange([...queues, { id, name: `Hàng đợi ${queues.length + 1}`, algorithm: 'FCFS', timeQuantum: 2 }]);
  };

  const removeQueue = (id: string) => {
    if (queues.length <= 2) return;
    onChange(queues.filter((q) => q.id !== id));
  };

  const update = (id: string, field: keyof MLQueueConfig, value: string | number) => {
    onChange(queues.map((q) => q.id === id ? { ...q, [field]: value } : q));
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span>⚙️</span>
          <span className="text-text-primary font-semibold text-sm">Cấu hình Multilevel Queue</span>
          <span className="bg-bg-tertiary text-text-secondary rounded-full text-xs px-2 py-0.5">{queues.length} hàng đợi</span>
        </div>
        <button
          className="btn-primary text-xs py-1.5"
          onClick={addQueue}
          disabled={queues.length >= 5}
        >
          + Thêm hàng đợi
        </button>
      </div>

      <div className="space-y-2">
        {queues.map((q, i) => (
          <div key={q.id} className="flex items-center gap-3 bg-bg-tertiary border border-bg-border rounded-lg px-3 py-2.5">
            <div className="w-6 h-6 rounded-full bg-accent-purple/20 text-accent-purple text-xs font-bold flex items-center justify-center flex-shrink-0">
              {i + 1}
            </div>
            <input
              className="input-dark flex-1 min-w-0"
              value={q.name}
              onChange={(e) => update(q.id, 'name', e.target.value)}
              placeholder="Tên hàng đợi"
            />
            <select
              className="input-dark w-36"
              value={q.algorithm}
              onChange={(e) => update(q.id, 'algorithm', e.target.value)}
            >
              {ALGORITHMS.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
            {q.algorithm === 'RR' && (
              <div className="flex items-center gap-1.5">
                <span className="text-text-muted text-xs">q=</span>
                <input
                  className="input-dark w-14 font-mono text-center"
                  type="number"
                  min={1}
                  value={q.timeQuantum ?? 2}
                  onChange={(e) => update(q.id, 'timeQuantum', Math.max(1, parseInt(e.target.value) || 1))}
                />
              </div>
            )}
            <div className="flex-shrink-0 text-text-muted text-xs">
              {i === 0 ? '↑ Cao nhất' : i === queues.length - 1 ? '↓ Thấp nhất' : ''}
            </div>
            <button
              onClick={() => removeQueue(q.id)}
              disabled={queues.length <= 2}
              className="text-text-muted hover:text-red-400 transition-colors disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed p-1 flex-shrink-0"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <p className="mt-3 text-text-muted text-xs flex items-start gap-1.5">
        <span>💡</span>
        <span>Hàng đợi 1 có ưu tiên cao nhất và sẽ chiếm quyền các hàng đợi bên dưới</span>
      </p>
    </div>
  );
}
