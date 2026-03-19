import { Process, GanttBlock, ScheduleResult, MLFQueueLevel, computeMetrics } from './types';

export function multilevelFeedbackQueue(
  processes: Process[],
  levels: MLFQueueLevel[]
): ScheduleResult {
  const gantt: GanttBlock[] = [];
  const completionTimes = new Map<string, number>();
  const firstRunTimes = new Map<string, number>();
  const remaining = new Map(processes.map((p) => [p.id, p.burstTime]));

  // Each process starts at level 0
  const processLevel = new Map(processes.map((p) => [p.id, 0]));
  // Per-level queues
  const queues: Process[][] = levels.map(() => []);
  const arrived = new Set<string>();

  const sorted = [...processes].sort((a, b) => a.arrivalTime - b.arrivalTime);
  let time = sorted[0]?.arrivalTime ?? 0;
  let contextSwitches = 0;
  let lastProcess: string | null = null;

  // Enqueue processes that arrive at or before current time
  function enqueueArrivals() {
    for (const p of sorted) {
      if (!arrived.has(p.id) && p.arrivalTime <= time && (remaining.get(p.id) ?? 0) > 0) {
        queues[0].push(p);
        arrived.add(p.id);
      }
    }
  }

  enqueueArrivals();

  const maxIter = processes.reduce((s, p) => s + p.burstTime, 0) * 3 + 100;
  let iter = 0;

  while (completionTimes.size < processes.length && iter < maxIter) {
    iter++;
    enqueueArrivals();

    // Find highest-priority non-empty queue
    let selectedLevel = -1;
    for (let i = 0; i < levels.length; i++) {
      if (queues[i].length > 0) { selectedLevel = i; break; }
    }

    if (selectedLevel === -1) {
      // Idle
      const nextArr = processes
        .filter((p) => !arrived.has(p.id) && (remaining.get(p.id) ?? 0) > 0)
        .map((p) => p.arrivalTime)
        .sort((a, b) => a - b)[0];
      if (nextArr === undefined) break;
      gantt.push({ processId: null, processName: 'Idle', startTime: time, endTime: nextArr, color: '#1e2230' });
      time = nextArr;
      lastProcess = null;
      enqueueArrivals();
      continue;
    }

    const levelConf = levels[selectedLevel];
    const p = queues[selectedLevel].shift()!;
    if ((remaining.get(p.id) ?? 0) === 0) continue;

    if (!firstRunTimes.has(p.id)) firstRunTimes.set(p.id, time);
    if (lastProcess !== null && lastProcess !== p.id) contextSwitches++;

    // Last level uses FCFS (run to completion)
    const isLastLevel = selectedLevel === levels.length - 1;
    const exec = isLastLevel
      ? remaining.get(p.id)!
      : Math.min(levelConf.quantum, remaining.get(p.id)!);

    if (gantt.length > 0 && gantt[gantt.length - 1].processId === p.id) {
      gantt[gantt.length - 1].endTime = time + exec;
    } else {
      gantt.push({ processId: p.id, processName: p.name, startTime: time, endTime: time + exec, color: p.color });
    }
    lastProcess = p.id;
    time += exec;
    remaining.set(p.id, remaining.get(p.id)! - exec);

    enqueueArrivals();

    if ((remaining.get(p.id) ?? 0) === 0) {
      completionTimes.set(p.id, time);
    } else {
      // Demote to next level (or stay at last level)
      const nextLevel = Math.min(selectedLevel + 1, levels.length - 1);
      processLevel.set(p.id, nextLevel);
      queues[nextLevel].push(p);
    }
  }

  const { metrics, summary } = computeMetrics(processes, completionTimes, firstRunTimes);
  summary.contextSwitches = contextSwitches;
  return { gantt, metrics, summary };
}
