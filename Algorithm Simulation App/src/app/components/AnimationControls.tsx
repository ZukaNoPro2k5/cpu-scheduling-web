import { SchedulingResult } from '../types';

interface AnimationControlsProps {
  result: SchedulingResult;
  currentTime: number;
  isPlaying: boolean;
  speed: number;
  onSetCurrentTime: (t: number) => void;
  onTogglePlay: () => void;
  onSetSpeed: (s: number) => void;
  onReset: () => void;
  onStepForward: () => void;
  onStepBackward: () => void;
  onSkipToEnd: () => void;
}

const SPEEDS = [0.5, 1, 2, 4];

export function AnimationControls({
  result,
  currentTime,
  isPlaying,
  speed,
  onSetCurrentTime,
  onTogglePlay,
  onSetSpeed,
  onReset,
  onStepForward,
  onStepBackward,
  onSkipToEnd,
}: AnimationControlsProps) {
  const { totalTime } = result;
  const progress = totalTime > 0 ? currentTime / totalTime : 0;
  const isAtEnd = currentTime >= totalTime;

  const btnBase =
    'flex items-center justify-center rounded-xl transition-all duration-150 font-medium select-none';
  const iconBtn = `${btnBase} w-9 h-9 text-slate-400 hover:text-slate-200 hover:bg-slate-700`;
  const iconBtnSm = `${btnBase} w-8 h-8 text-slate-500 hover:text-slate-300 hover:bg-slate-700`;

  return (
    <div
      className="rounded-2xl px-5 py-4 space-y-3"
      style={{
        background: '#111827',
        border: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      {/* Controls row */}
      <div className="flex items-center gap-2">
        {/* Reset */}
        <button
          onClick={onReset}
          title="Về đầu"
          className={iconBtnSm}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
          </svg>
        </button>

        {/* Step back */}
        <button
          onClick={onStepBackward}
          disabled={currentTime <= 0}
          title="Lùi 1 bước"
          className={`${iconBtnSm} disabled:opacity-30 disabled:cursor-not-allowed`}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" transform="scale(-1,1) translate(-24,0)" />
          </svg>
        </button>

        {/* Play / Pause */}
        <button
          onClick={onTogglePlay}
          title={isPlaying ? 'Tạm dừng' : 'Phát'}
          className={`${btnBase} w-12 h-12 text-white transition-all duration-150`}
          style={{
            background: isAtEnd
              ? 'rgba(99,102,241,0.3)'
              : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            boxShadow: !isAtEnd ? '0 4px 14px rgba(99,102,241,0.4)' : undefined,
          }}
          onMouseEnter={(e) => {
            if (!isAtEnd) (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 20px rgba(99,102,241,0.6)';
          }}
          onMouseLeave={(e) => {
            if (!isAtEnd) (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 14px rgba(99,102,241,0.4)';
          }}
        >
          {isPlaying ? (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 ml-0.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        {/* Step forward */}
        <button
          onClick={onStepForward}
          disabled={isAtEnd}
          title="Tiến 1 bước"
          className={`${iconBtnSm} disabled:opacity-30 disabled:cursor-not-allowed`}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 18l8.5-6L6 6v12zm2.5-6l5.5 3.92V8.08L8.5 12zM16 6h2v12h-2z" />
          </svg>
        </button>

        {/* Skip to end */}
        <button
          onClick={onSkipToEnd}
          disabled={isAtEnd}
          title="Đến cuối"
          className={`${iconBtnSm} disabled:opacity-30 disabled:cursor-not-allowed`}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
          </svg>
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-slate-700 mx-1" />

        {/* Speed */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-slate-500">Tốc độ:</span>
          <div className="flex items-center gap-1">
            {SPEEDS.map((s) => (
              <button
                key={s}
                onClick={() => onSetSpeed(s)}
                className="text-xs px-2 py-1 rounded-lg transition-all duration-150"
                style={{
                  background:
                    speed === s
                      ? 'rgba(99,102,241,0.25)'
                      : 'rgba(255,255,255,0.04)',
                  color: speed === s ? '#818cf8' : '#64748b',
                  border:
                    speed === s
                      ? '1px solid rgba(99,102,241,0.35)'
                      : '1px solid rgba(255,255,255,0.05)',
                  fontFamily: 'JetBrains Mono, monospace',
                }}
              >
                {s}×
              </button>
            ))}
          </div>
        </div>

        {/* Time display */}
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-slate-500">Thời gian:</span>
          <span
            className="text-sm font-semibold"
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              color: '#818cf8',
            }}
          >
            {Math.floor(currentTime)}
          </span>
          <span className="text-xs text-slate-600">/</span>
          <span
            className="text-sm text-slate-400"
            style={{ fontFamily: 'JetBrains Mono, monospace' }}
          >
            {totalTime}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative">
        <div
          className="w-full h-2 rounded-full overflow-hidden cursor-pointer"
          style={{ background: 'rgba(255,255,255,0.06)' }}
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const ratio = Math.max(0, Math.min(1, x / rect.width));
            onSetCurrentTime(Math.round(ratio * totalTime * 2) / 2);
          }}
        >
          <div
            className="h-full rounded-full transition-all duration-75"
            style={{
              width: `${progress * 100}%`,
              background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)',
              boxShadow: '0 0 8px rgba(99,102,241,0.5)',
            }}
          />
        </div>

        {/* Block markers on progress bar */}
        {result.gantt.map((block, idx) => (
          <div
            key={idx}
            className="absolute top-1/2 -translate-y-1/2 w-0.5 h-3 rounded-full opacity-30"
            style={{
              left: `${(block.start / totalTime) * 100}%`,
              background: block.processId === 'idle' ? '#475569' : block.color,
            }}
          />
        ))}
      </div>

      {/* Status */}
      {isAtEnd && (
        <div className="flex items-center gap-2 text-xs">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span className="text-emerald-400">
            Hoàn thành! Mô phỏng đã kết thúc tại thời điểm {totalTime}.
          </span>
        </div>
      )}
    </div>
  );
}
