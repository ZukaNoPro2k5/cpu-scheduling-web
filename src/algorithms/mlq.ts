import { Process, GanttBlock, ScheduleResult, MLQueueConfig, MLQAlgorithm, computeMetrics } from './types';

// Run the chosen algorithm within a MLQ queue slice
function runQueueSlice(
  queue: Process[],
  alg: MLQAlgorithm,
  quantum: number,
  time: number
): { selected: Process | null; runTime: number } {
  // Filter available (arrived)
  const available = queue.filter((p) => p.arrivalTime <= time);
  if (available.length === 0) return { selected: null, runTime: 0 };

  switch (alg) {
    case 'FCFS': {
      available.sort((a, b) => a.arrivalTime - b.arrivalTime || a.id.localeCompare(b.id));
      return { selected: available[0], runTime: Infinity }; // run to completion within slice
    }
    case 'SJF': {
      available.sort((a, b) => a.burstTime - b.burstTime || a.arrivalTime - b.arrivalTime);
      return { selected: available[0], runTime: Infinity };
    }
    case 'Priority': {
      available.sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0) || a.arrivalTime - b.arrivalTime);
      return { selected: available[0], runTime: Infinity };
    }
    case 'RR': {
      available.sort((a, b) => a.arrivalTime - b.arrivalTime || a.id.localeCompare(b.id));
      return { selected: available[0], runTime: quantum };
    }
  }
}

export function multilevelQueue(
  processes: Process[],
  queueConfigs: MLQueueConfig[]
): ScheduleResult {
  const gantt: GanttBlock[] = [];
  const completionTimes = new Map<string, number>();
  const firstRunTimes = new Map<string, number>();
  const remaining = new Map(processes.map((p) => [p.id, p.burstTime]));

  // Map process → queue config
  const processQueue = new Map<string, MLQueueConfig>();
  for (const p of processes) {
    const qc = queueConfigs.find((q) => q.id === p.queueId) ?? queueConfigs[queueConfigs.length - 1];
    processQueue.set(p.id, qc);
  }

  let time = Math.min(...processes.map((p) => p.arrivalTime));
  let contextSwitches = 0;
  let lastProcess: string | null = null;
  const rrQueues = new Map<string, Process[]>(); // RR queue per queue config id
  for (const qc of queueConfigs) rrQueues.set(qc.id, []);
  const rrArrived = new Set<string>();

  const maxIter = processes.reduce((s, p) => s + p.burstTime, 0) * 2 + 100;
  let iter = 0;

  while (completionTimes.size < processes.length && iter < maxIter) {
    iter++;
    let ran = false;

    // Process queues in priority order (index 0 = highest)
    for (const qc of queueConfigs) {
      // Collect all processes belonging to this queue that still have work
      const queueProcs = processes.filter(
        (p) => processQueue.get(p.id)?.id === qc.id && (remaining.get(p.id) ?? 0) > 0
      );

      if (queueProcs.length === 0) continue;

      const available = queueProcs.filter((p) => p.arrivalTime <= time);
      if (available.length === 0) continue;

      if (qc.algorithm === 'RR') {
        // Maintain a proper FIFO queue for RR
        const rrQ = rrQueues.get(qc.id)!;
        // Add newly arrived processes to rrQ
        for (const p of queueProcs) {
          if (p.arrivalTime <= time && !rrArrived.has(p.id + qc.id) && (remaining.get(p.id) ?? 0) > 0) {
            rrQ.push(p);
            rrArrived.add(p.id + qc.id);
          }
        }
        if (rrQ.length === 0) continue;

        const p = rrQ.shift()!;
        if ((remaining.get(p.id) ?? 0) === 0) continue;

        const quantum = qc.timeQuantum ?? 2;
        const exec = Math.min(quantum, remaining.get(p.id)!);
        if (!firstRunTimes.has(p.id)) firstRunTimes.set(p.id, time);
        if (lastProcess !== null && lastProcess !== p.id) contextSwitches++;

        if (gantt.length > 0 && gantt[gantt.length - 1].processId === p.id) {
          gantt[gantt.length - 1].endTime = time + exec;
        } else {
          gantt.push({ processId: p.id, processName: p.name, startTime: time, endTime: time + exec, color: p.color });
        }
        lastProcess = p.id;
        time += exec;
        remaining.set(p.id, remaining.get(p.id)! - exec);

        // Add processes that arrived during this slice
        for (const sp of queueProcs) {
          if (sp.arrivalTime <= time && !rrArrived.has(sp.id + qc.id) && (remaining.get(sp.id) ?? 0) > 0) {
            rrQ.push(sp);
            rrArrived.add(sp.id + qc.id);
          }
        }

        if ((remaining.get(p.id) ?? 0) === 0) {
          completionTimes.set(p.id, time);
        } else {
          rrQ.push(p); // re-enqueue
        }
        ran = true;
        break;
      } else {
        // Non-preemptive algorithms: pick one and run to completion
        const { selected } = runQueueSlice(available, qc.algorithm, qc.timeQuantum ?? 2, time);
        if (!selected) continue;

        const exec = remaining.get(selected.id)!;
        if (!firstRunTimes.has(selected.id)) firstRunTimes.set(selected.id, time);
        if (lastProcess !== null && lastProcess !== selected.id) contextSwitches++;

        gantt.push({ processId: selected.id, processName: selected.name, startTime: time, endTime: time + exec, color: selected.color });
        lastProcess = selected.id;
        time += exec;
        remaining.set(selected.id, 0);
        completionTimes.set(selected.id, time);
        ran = true;
        break;
      }
    }

    if (!ran) {
      // CPU idle: advance to next arrival
      const nextArr = processes
        .filter((p) => (remaining.get(p.id) ?? 0) > 0 && p.arrivalTime > time)
        .map((p) => p.arrivalTime)
        .sort((a, b) => a - b)[0];
      if (nextArr === undefined) break;
      gantt.push({ processId: null, processName: 'Idle', startTime: time, endTime: nextArr, color: '#1e2230' });
      time = nextArr;
      lastProcess = null;
    }
  }

  const { metrics, summary } = computeMetrics(processes, completionTimes, firstRunTimes);
  summary.contextSwitches = contextSwitches;
  return { gantt, metrics, summary };
}
