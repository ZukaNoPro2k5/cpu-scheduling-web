// ─── Core Data Types ────────────────────────────────────────────────────────

export interface Process {
  id: string;          // unique identifier (e.g. "p1")
  name: string;        // display name (e.g. "P1")
  arrivalTime: number;
  burstTime: number;
  priority?: number;   // lower number = higher priority (for priority algorithms)
  queueId?: string;    // for MLQ: which queue this process belongs to
  color: string;       // color for Gantt chart visualization
}

// A single block in the Gantt chart
export interface GanttBlock {
  processId: string | null; // null = idle/CPU idle
  processName: string;
  startTime: number;
  endTime: number;
  color: string;
}

// Per-process computed metrics
export interface ProcessMetric {
  processId: string;
  processName: string;
  arrivalTime: number;
  burstTime: number;
  completionTime: number;
  waitingTime: number;       // WT = TAT - BT
  turnaroundTime: number;    // TAT = CT - AT
  responseTime: number;      // RT = first time on CPU - AT
  color: string;
}

// Summary metrics for the entire run
export interface SummaryMetrics {
  avgWaitingTime: number;
  avgTurnaroundTime: number;
  avgResponseTime: number;
  throughput: number;          // processes / total time
  totalTime: number;
  contextSwitches: number;
}

// Full result returned by every algorithm
export interface ScheduleResult {
  gantt: GanttBlock[];
  metrics: ProcessMetric[];
  summary: SummaryMetrics;
}

// ─── Algorithm Config Types ──────────────────────────────────────────────────

export type MLQAlgorithm = 'FCFS' | 'RR' | 'SJF' | 'Priority';

export interface MLQueueConfig {
  id: string;
  name: string;
  algorithm: MLQAlgorithm;
  timeQuantum?: number; // only for RR
}

export interface MLFQueueLevel {
  level: number; // 0 = highest priority
  quantum: number;
}

// ─── Process color palette ───────────────────────────────────────────────────

export const PROCESS_COLORS = [
  '#6366f1', // indigo
  '#f59e0b', // amber
  '#06b6d4', // cyan
  '#a855f7', // purple
  '#22c55e', // green
  '#f43f5e', // rose
  '#3b82f6', // blue
  '#10b981', // emerald
  '#fb923c', // orange
  '#e879f9', // fuchsia
];

export function getProcessColor(index: number): string {
  return PROCESS_COLORS[index % PROCESS_COLORS.length];
}

// ─── Utility ─────────────────────────────────────────────────────────────────

export function computeMetrics(
  processes: Process[],
  completionTimes: Map<string, number>,
  firstRunTimes: Map<string, number>
): { metrics: ProcessMetric[]; summary: SummaryMetrics } {
  const metrics: ProcessMetric[] = processes.map((p) => {
    const ct = completionTimes.get(p.id) ?? 0;
    const ft = firstRunTimes.get(p.id) ?? ct;
    const tat = ct - p.arrivalTime;
    const wt = tat - p.burstTime;
    const rt = ft - p.arrivalTime;
    return {
      processId: p.id,
      processName: p.name,
      arrivalTime: p.arrivalTime,
      burstTime: p.burstTime,
      completionTime: ct,
      turnaroundTime: tat,
      waitingTime: wt,
      responseTime: rt,
      color: p.color,
    };
  });

  const n = metrics.length;
  const totalTime = Math.max(...metrics.map((m) => m.completionTime), 0);
  const summary: SummaryMetrics = {
    avgWaitingTime: metrics.reduce((s, m) => s + m.waitingTime, 0) / n,
    avgTurnaroundTime: metrics.reduce((s, m) => s + m.turnaroundTime, 0) / n,
    avgResponseTime: metrics.reduce((s, m) => s + m.responseTime, 0) / n,
    throughput: n / totalTime,
    totalTime,
    contextSwitches: 0, // will be set by caller
  };

  return { metrics, summary };
}
