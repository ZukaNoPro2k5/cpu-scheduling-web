import { Process, GanttBlock, ScheduleResult, computeMetrics } from './types';

export function fcfs(processes: Process[]): ScheduleResult {
  const sorted = [...processes].sort((a, b) => a.arrivalTime - b.arrivalTime || a.id.localeCompare(b.id));
  const gantt: GanttBlock[] = [];
  const completionTimes = new Map<string, number>();
  const firstRunTimes = new Map<string, number>();

  let time = 0;
  for (const p of sorted) {
    if (time < p.arrivalTime) {
      gantt.push({ processId: null, processName: 'Idle', startTime: time, endTime: p.arrivalTime, color: '#1e2230' });
      time = p.arrivalTime;
    }
    firstRunTimes.set(p.id, time);
    gantt.push({ processId: p.id, processName: p.name, startTime: time, endTime: time + p.burstTime, color: p.color });
    time += p.burstTime;
    completionTimes.set(p.id, time);
  }

  const contextSwitches = gantt.filter((b) => b.processId !== null).length - 1;
  const { metrics, summary } = computeMetrics(processes, completionTimes, firstRunTimes);
  summary.contextSwitches = Math.max(0, contextSwitches);
  return { gantt, metrics, summary };
}
