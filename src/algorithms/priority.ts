import { Process, GanttBlock, ScheduleResult, computeMetrics } from './types';

// Priority Non-Preemptive
export function priorityNonPreemptive(processes: Process[], lowIsHigh = true): ScheduleResult {
  const gantt: GanttBlock[] = [];
  const completionTimes = new Map<string, number>();
  const firstRunTimes = new Map<string, number>();
  const remaining = [...processes];
  let time = 0;

  while (remaining.length > 0) {
    const available = remaining.filter((p) => p.arrivalTime <= time);
    if (available.length === 0) {
      const next = remaining.reduce((a, b) => a.arrivalTime < b.arrivalTime ? a : b);
      gantt.push({ processId: null, processName: 'Idle', startTime: time, endTime: next.arrivalTime, color: '#1e2230' });
      time = next.arrivalTime;
      continue;
    }
    available.sort((a, b) => {
      const pa = a.priority ?? 0, pb = b.priority ?? 0;
      return (lowIsHigh ? pa - pb : pb - pa) || a.arrivalTime - b.arrivalTime || a.id.localeCompare(b.id);
    });
    const p = available[0];
    remaining.splice(remaining.indexOf(p), 1);

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

// Priority Preemptive
export function priorityPreemptive(processes: Process[], lowIsHigh = true): ScheduleResult {
  const gantt: GanttBlock[] = [];
  const completionTimes = new Map<string, number>();
  const firstRunTimes = new Map<string, number>();
  const remaining = new Map(processes.map((p) => [p.id, p.burstTime]));
  let time = Math.min(...processes.map((p) => p.arrivalTime));
  let lastProcess: string | null = null;
  let contextSwitches = 0;

  while (completionTimes.size < processes.length) {
    const available = processes.filter(
      (p) => p.arrivalTime <= time && (remaining.get(p.id) ?? 0) > 0
    );

    if (available.length === 0) {
      const next = processes
        .filter((p) => (remaining.get(p.id) ?? 0) > 0)
        .reduce((a, b) => a.arrivalTime < b.arrivalTime ? a : b);
      gantt.push({ processId: null, processName: 'Idle', startTime: time, endTime: next.arrivalTime, color: '#1e2230' });
      time = next.arrivalTime;
      lastProcess = null;
      continue;
    }

    available.sort((a, b) => {
      const pa = a.priority ?? 0, pb = b.priority ?? 0;
      return (lowIsHigh ? pa - pb : pb - pa) || a.arrivalTime - b.arrivalTime || a.id.localeCompare(b.id);
    });
    const p = available[0];

    if (!firstRunTimes.has(p.id)) firstRunTimes.set(p.id, time);

    if (lastProcess !== p.id) {
      if (lastProcess !== null) contextSwitches++;
      gantt.push({ processId: p.id, processName: p.name, startTime: time, endTime: time + 1, color: p.color });
    } else {
      gantt[gantt.length - 1].endTime = time + 1;
    }

    remaining.set(p.id, remaining.get(p.id)! - 1);
    if (remaining.get(p.id) === 0) completionTimes.set(p.id, time + 1);
    lastProcess = p.id;
    time++;
  }

  const { metrics, summary } = computeMetrics(processes, completionTimes, firstRunTimes);
  summary.contextSwitches = contextSwitches;
  return { gantt, metrics, summary };
}
