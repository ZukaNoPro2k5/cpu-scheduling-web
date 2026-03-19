import { useCallback, useRef, useEffect } from 'react';
import { Process, getProcessColor } from '../../algorithms/types';

interface NumericInputProps {
  value: number;
  min: number;
  className?: string;
  onChange: (v: number) => void;
}

function NumericInput({ value, min, className, onChange }: NumericInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const callbackRef = useRef(onChange);
  callbackRef.current = onChange;

  // Sync from parent only when input is NOT focused
  useEffect(() => {
    if (inputRef.current && inputRef.current !== document.activeElement) {
      inputRef.current.value = String(value);
    }
  }, [value]);

  const commit = useCallback(() => {
    if (!inputRef.current) return;
    const parsed = Math.max(min, parseInt(inputRef.current.value) || min);
    inputRef.current.value = String(parsed);
    callbackRef.current(parsed);
  }, [min]);

  return (
    <input
      ref={inputRef}
      type="number"
      min={min}
      className={className}
      defaultValue={value}
      onFocus={(e) => setTimeout(() => e.target.select(), 0)}
      onBlur={commit}
      onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }}
    />
  );
}

interface ProcessTableProps {
  processes: Process[];
  onChange: (processes: Process[]) => void;
  showPriority?: boolean;
  priorityLowIsHigh?: boolean;
  queueOptions?: { id: string; name: string }[];
  showQueue?: boolean;
}

let nextId = 100;
function genId() { return `p${nextId++}`; }

export function ProcessTable({ processes, onChange, showPriority = false, queueOptions, showQueue = false }: ProcessTableProps) {
  const addProcess = useCallback(() => {
    if (processes.length >= 10) return;
    const id = genId();
    const newP: Process = {
      id,
      name: `P${processes.length + 1}`,
      arrivalTime: 0,
      burstTime: 1,
      priority: 1,
      queueId: queueOptions?.[0]?.id,
      color: getProcessColor(processes.length),
    };
    onChange([...processes, newP]);
  }, [processes, onChange, queueOptions]);

  const removeProcess = useCallback((id: string) => {
    onChange(processes.filter((p) => p.id !== id));
  }, [processes, onChange]);

  const updateProcess = useCallback((id: string, field: keyof Process, value: string | number) => {
    onChange(processes.map((p) => p.id === id ? { ...p, [field]: value } : p));
  }, [processes, onChange]);

  const loadDefault = useCallback(() => {
    const defaults: Omit<Process, 'id' | 'color'>[] = [
      { name: 'P1', arrivalTime: 0, burstTime: 1, priority: 1 },
      { name: 'P2', arrivalTime: 1, burstTime: 1, priority: 1 },
      { name: 'P3', arrivalTime: 2, burstTime: 1, priority: 1 },
      { name: 'P4', arrivalTime: 3, burstTime: 1, priority: 1 },
    ];
    nextId = 1;
    onChange(defaults.map((d, i) => ({
      ...d,
      id: genId(),
      color: getProcessColor(i),
      queueId: queueOptions?.[i % (queueOptions?.length ?? 1)]?.id,
    })));
  }, [onChange, queueOptions]);

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-base">📋</span>
          <span className="text-text-primary font-semibold text-sm">Danh sách tiến trình</span>
          <span className="bg-accent-purple/20 text-accent-purple rounded-full text-xs px-2 py-0.5 font-medium">
            {processes.length}/10
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-ghost text-xs" onClick={loadDefault}>
            Mẫu mặc định
          </button>
          <button
            className="btn-primary text-xs py-1.5"
            onClick={addProcess}
            disabled={processes.length >= 10}
          >
            + Thêm tiến trình
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-text-muted text-xs border-b border-bg-border">
              <th className="text-left pb-2 pr-4 font-medium w-16">STT</th>
              <th className="text-left pb-2 pr-4 font-medium">Tên</th>
              <th className="text-left pb-2 pr-4 font-medium">T.gian đến (AT)</th>
              <th className="text-left pb-2 pr-4 font-medium">T.gian chạy (BT)</th>
              {showPriority && <th className="text-left pb-2 pr-4 font-medium">Ưu tiên (Pri)</th>}
              {showQueue && <th className="text-left pb-2 pr-4 font-medium">Hàng đợi</th>}
              <th className="pb-2 w-8" />
            </tr>
          </thead>
          <tbody>
            {processes.map((p, i) => (
              <tr key={p.id} className="border-b border-bg-border/50 hover:bg-bg-hover/50 transition-colors">
                <td className="py-2 pr-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: p.color, boxShadow: `0 0 4px ${p.color}80` }} />
                    <span className="text-text-muted font-mono text-xs">#{i + 1}</span>
                  </div>
                </td>
                <td className="py-2 pr-4">
                  <input
                    className="input-dark w-24"
                    value={p.name}
                    maxLength={8}
                    onChange={(e) => updateProcess(p.id, 'name', e.target.value)}
                  />
                </td>
                <td className="py-2 pr-4">
                  <NumericInput
                    className="input-dark w-20 font-mono"
                    value={p.arrivalTime}
                    min={0}
                    onChange={(v) => updateProcess(p.id, 'arrivalTime', v)}
                  />
                </td>
                <td className="py-2 pr-4">
                  <NumericInput
                    className="input-dark w-20 font-mono"
                    value={p.burstTime}
                    min={1}
                    onChange={(v) => updateProcess(p.id, 'burstTime', v)}
                  />
                </td>
                {showPriority && (
                  <td className="py-2 pr-4">
                    <NumericInput
                      className="input-dark w-20 font-mono"
                      value={p.priority ?? 1}
                      min={1}
                      onChange={(v) => updateProcess(p.id, 'priority', v)}
                    />
                  </td>
                )}
                {showQueue && queueOptions && (
                  <td className="py-2 pr-4">
                    <select
                      className="input-dark"
                      value={p.queueId ?? queueOptions[0]?.id}
                      onChange={(e) => updateProcess(p.id, 'queueId', e.target.value)}
                    >
                      {queueOptions.map((q) => (
                        <option key={q.id} value={q.id}>{q.name}</option>
                      ))}
                    </select>
                  </td>
                )}
                <td className="py-2">
                  <button
                    onClick={() => removeProcess(p.id)}
                    disabled={processes.length <= 1}
                    className="text-text-muted hover:text-red-400 transition-colors disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed p-1"
                    title="Xóa tiến trình"
                  >
                    🗑
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {processes.length === 0 && (
          <div className="text-center py-8 text-text-muted text-sm">
            Chưa có tiến trình nào. Nhấn "+ Thêm tiến trình" hoặc "Mẫu mặc định".
          </div>
        )}
      </div>
    </div>
  );
}
