import { MLFQueueLevel } from '../../algorithms/types';

interface MLFQConfigProps {
  levels: MLFQueueLevel[];
  onChange: (levels: MLFQueueLevel[]) => void;
}

const levelCounts = [2, 3, 4, 5];

function defaultLevels(count: number): MLFQueueLevel[] {
  return Array.from({ length: count }, (_, i) => ({
    level: i,
    quantum: Math.pow(2, i + 1), // 2, 4, 8, 16...
  }));
}

export function MLFQConfig({ levels, onChange }: MLFQConfigProps) {
  const setCount = (n: number) => {
    if (n === levels.length) return;
    onChange(defaultLevels(n));
  };

  const updateQuantum = (level: number, quantum: number) => {
    onChange(levels.map((l) => l.level === level ? { ...l, quantum } : l));
  };

  return (
    <div className="card">
      <div className="flex items-center gap-3 mb-4">
        <span>⚙️</span>
        <span className="text-text-primary font-semibold text-sm">Cấu hình MLFQ</span>
        <span className="text-text-muted text-sm">Số cấp:</span>
        <div className="flex gap-1">
          {levelCounts.map((n) => (
            <button
              key={n}
              onClick={() => setCount(n)}
              className={`w-8 h-8 rounded-lg text-sm font-semibold transition-all cursor-pointer
                ${n === levels.length
                  ? 'bg-accent-purple text-white'
                  : 'bg-bg-tertiary text-text-secondary hover:bg-bg-hover hover:text-text-primary border border-bg-border'
                }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {levels.map((l, i) => (
          <div
            key={l.level}
            className={`bg-bg-tertiary border rounded-lg p-3 ${
              i === 0 ? 'border-accent-purple/50' : 'border-bg-border'
            }`}
          >
            <div className="text-xs font-semibold text-text-primary mb-1">
              {i === 0 ? '1 Ưu tiên cao nhất' : i === levels.length - 1 ? `${i + 1} Ưu tiên thấp nhất` : `${i + 1} Cấp ${i + 1}`}
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="text-text-muted text-xs">Quantum:</span>
              <input
                className="input-dark w-16 font-mono text-center text-sm"
                type="number"
                min={1}
                value={l.quantum}
                onChange={(e) => updateQuantum(l.level, Math.max(1, parseInt(e.target.value) || 1))}
                disabled={i === levels.length - 1}
              />
            </div>
            <div className="text-text-muted text-xs mt-1.5">
              {i === 0 ? 'Tiến trình mới vào đây' : i === levels.length - 1 ? 'Bị giáng cấp từ cấp trên — dùng FCFS' : `Bị giáng cấp từ cấp ${i}`}
            </div>
          </div>
        ))}
      </div>

      <p className="mt-3 text-text-muted text-xs flex items-start gap-1.5">
        <span>💡</span>
        <span>Nếu tiến trình dùng hết quantum ở cấp i, nó sẽ xuống cấp i+1. Cấp cuối dùng FCFS</span>
      </p>
    </div>
  );
}

export { defaultLevels };
