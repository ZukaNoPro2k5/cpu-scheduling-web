import { Process, GanttBlock, ScheduleResult, computeMetrics } from './types';

export function roundRobin(processes: Process[], timeQuantum: number): ScheduleResult {
  const gantt: GanttBlock[] = [];
  const completionTimes = new Map<string, number>();
  const firstRunTimes = new Map<string, number>();
  const remaining = new Map(processes.map((p) => [p.id, p.burstTime]));
  const sorted = [...processes].sort((a, b) => a.arrivalTime - b.arrivalTime || a.id.localeCompare(b.id));

  let time = sorted[0]?.arrivalTime ?? 0;
  const queue: Process[] = [];
  const arrived = new Set<string>();
  let contextSwitches = 0;
  let lastProcess: string | null = null;

  // Enqueue processes that have arrived at time 0
  for (const p of sorted) {
    if (p.arrivalTime <= time) { queue.push(p); arrived.add(p.id); }
  }

  while (completionTimes.size < processes.length) {
    if (queue.length === 0) {
      // CPU idle
      const nextArrival = sorted.find((p) => !arrived.has(p.id));
      if (!nextArrival) break;
      gantt.push({ processId: null, processName: 'Idle', startTime: time, endTime: nextArrival.arrivalTime, color: '#1e2230' });
      time = nextArrival.arrivalTime;
      lastProcess = null;

      // Enqueue newly arrived
      for (const p of sorted) {
        if (!arrived.has(p.id) && p.arrivalTime <= time) { queue.push(p); arrived.add(p.id); }
      }
      continue;
    }

    const p = queue.shift()!;
    if (!firstRunTimes.has(p.id)) firstRunTimes.set(p.id, time);

    const exec = Math.min(timeQuantum, remaining.get(p.id)!);

    if (lastProcess !== null && lastProcess !== p.id) contextSwitches++;
    if (gantt.length > 0 && gantt[gantt.length - 1].processId === p.id) {
      gantt[gantt.length - 1].endTime = time + exec;
    } else {
      gantt.push({ processId: p.id, processName: p.name, startTime: time, endTime: time + exec, color: p.color });
    }

    lastProcess = p.id;
    time += exec;
    remaining.set(p.id, remaining.get(p.id)! - exec);

    // Enqueue processes that arrived during this slice
    for (const sp of sorted) {
      if (!arrived.has(sp.id) && sp.arrivalTime <= time) { queue.push(sp); arrived.add(sp.id); }
    }

    if (remaining.get(p.id) === 0) {
      completionTimes.set(p.id, time);
    } else {
      queue.push(p); // re-enqueue
    }
  }

  const { metrics, summary } = computeMetrics(processes, completionTimes, firstRunTimes);
  summary.contextSwitches = contextSwitches;
  return { gantt, metrics, summary };
}
