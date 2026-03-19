import {
  Process,
  GanttBlock,
  ProcessMetrics,
  TimelineFrame,
  SchedulingResult,
  MLQueueConfig,
  AlgorithmId,
  AlgorithmConfig,
} from './types';

// ─── Helpers ────────────────────────────────────────────────────────────────

function idleBlock(start: number, end: number): GanttBlock {
  return { processId: 'idle', processName: 'Rảnh', start, end, color: '#1e293b' };
}

function pushBlock(gantt: GanttBlock[], block: GanttBlock) {
  const last = gantt[gantt.length - 1];
  if (last && last.processId === block.processId) {
    last.end = block.end;
  } else {
    gantt.push({ ...block });
  }
}

function buildTimeline(
  gantt: GanttBlock[],
  processes: Process[],
  totalTime: number
): TimelineFrame[] {
  const ct: Record<string, number> = {};
  for (const b of gantt) {
    if (b.processId !== 'idle') {
      ct[b.processId] = Math.max(ct[b.processId] || 0, b.end);
    }
  }

  const timeline: TimelineFrame[] = [];
  for (let t = 0; t <= totalTime; t++) {
    const runningBlock = gantt.find(
      (b) => b.processId !== 'idle' && b.start <= t && b.end > t
    );
    const runningId = runningBlock?.processId || null;
    const readyIds = processes
      .filter(
        (p) =>
          p.arrivalTime <= t && (ct[p.id] || 0) > t && p.id !== runningId
      )
      .map((p) => p.id);
    timeline.push({ time: t, runningId, readyIds });
  }
  return timeline;
}

function buildResult(
  gantt: GanttBlock[],
  processes: Process[],
  firstRun: Record<string, number>
): SchedulingResult {
  if (!gantt.length || !processes.length) {
    return {
      gantt: [],
      metrics: [],
      timeline: [],
      avgWaitingTime: 0,
      avgTurnaroundTime: 0,
      avgResponseTime: 0,
      throughput: 0,
      totalTime: 0,
    };
  }

  const totalTime = gantt[gantt.length - 1].end;
  const ct: Record<string, number> = {};
  for (const b of gantt) {
    if (b.processId !== 'idle') {
      ct[b.processId] = Math.max(ct[b.processId] || 0, b.end);
    }
  }

  const metrics: ProcessMetrics[] = processes.map((p) => ({
    processId: p.id,
    processName: p.name,
    color: p.color,
    arrivalTime: p.arrivalTime,
    burstTime: p.burstTime,
    priority: p.priority,
    completionTime: ct[p.id] || 0,
    waitingTime: (ct[p.id] || 0) - p.arrivalTime - p.burstTime,
    turnaroundTime: (ct[p.id] || 0) - p.arrivalTime,
    responseTime: (firstRun[p.id] ?? ct[p.id] ?? 0) - p.arrivalTime,
  }));

  const n = processes.length;
  const avgWaitingTime =
    n > 0 ? metrics.reduce((s, m) => s + m.waitingTime, 0) / n : 0;
  const avgTurnaroundTime =
    n > 0 ? metrics.reduce((s, m) => s + m.turnaroundTime, 0) / n : 0;
  const avgResponseTime =
    n > 0 ? metrics.reduce((s, m) => s + m.responseTime, 0) / n : 0;
  const throughput = totalTime > 0 ? n / totalTime : 0;
  const timeline = buildTimeline(gantt, processes, totalTime);

  return {
    gantt,
    metrics,
    timeline,
    avgWaitingTime,
    avgTurnaroundTime,
    avgResponseTime,
    throughput,
    totalTime,
  };
}

// ─── FCFS ───────────────────────────────────────────────────────────────────

export function scheduleFCFS(processes: Process[]): SchedulingResult {
  if (!processes.length) return buildResult([], [], {});

  const sorted = [...processes].sort(
    (a, b) => a.arrivalTime - b.arrivalTime || a.name.localeCompare(b.name)
  );
  const gantt: GanttBlock[] = [];
  const firstRun: Record<string, number> = {};
  let t = 0;

  for (const p of sorted) {
    if (t < p.arrivalTime) pushBlock(gantt, idleBlock(t, p.arrivalTime));
    t = Math.max(t, p.arrivalTime);
    firstRun[p.id] = t;
    pushBlock(gantt, {
      processId: p.id,
      processName: p.name,
      start: t,
      end: t + p.burstTime,
      color: p.color,
    });
    t += p.burstTime;
  }

  return buildResult(gantt, processes, firstRun);
}

// ─── SJF Non-preemptive ─────────────────────────────────────────────────────

export function scheduleSJFNP(processes: Process[]): SchedulingResult {
  if (!processes.length) return buildResult([], [], {});

  const gantt: GanttBlock[] = [];
  const firstRun: Record<string, number> = {};
  const done = new Set<string>();
  let t = 0;

  while (done.size < processes.length) {
    const available = processes.filter(
      (p) => !done.has(p.id) && p.arrivalTime <= t
    );

    if (!available.length) {
      const next = Math.min(
        ...processes.filter((p) => !done.has(p.id)).map((p) => p.arrivalTime)
      );
      pushBlock(gantt, idleBlock(t, next));
      t = next;
      continue;
    }

    const sel = available.reduce((best, p) =>
      p.burstTime < best.burstTime ||
      (p.burstTime === best.burstTime && p.arrivalTime < best.arrivalTime)
        ? p
        : best
    );

    firstRun[sel.id] = t;
    pushBlock(gantt, {
      processId: sel.id,
      processName: sel.name,
      start: t,
      end: t + sel.burstTime,
      color: sel.color,
    });
    t += sel.burstTime;
    done.add(sel.id);
  }

  return buildResult(gantt, processes, firstRun);
}

// ─── SRTF (SJF Preemptive) ──────────────────────────────────────────────────

export function scheduleSRTF(processes: Process[]): SchedulingResult {
  if (!processes.length) return buildResult([], [], {});

  const gantt: GanttBlock[] = [];
  const firstRun: Record<string, number> = {};
  const remaining = new Map(processes.map((p) => [p.id, p.burstTime]));
  let t = 0;
  let done = 0;
  const maxTime =
    processes.reduce((s, p) => s + p.burstTime, 0) +
    Math.max(...processes.map((p) => p.arrivalTime)) +
    5;

  while (done < processes.length && t <= maxTime) {
    const available = processes.filter(
      (p) => p.arrivalTime <= t && (remaining.get(p.id) ?? 0) > 0
    );

    if (!available.length) {
      const next = Math.min(
        ...processes
          .filter((p) => (remaining.get(p.id) ?? 0) > 0)
          .map((p) => p.arrivalTime)
      );
      pushBlock(gantt, idleBlock(t, next));
      t = next;
      continue;
    }

    const sel = available.reduce((best, p) => {
      const pr = remaining.get(p.id)!;
      const br = remaining.get(best.id)!;
      return pr < br || (pr === br && p.arrivalTime < best.arrivalTime)
        ? p
        : best;
    });

    if (!(sel.id in firstRun)) firstRun[sel.id] = t;
    pushBlock(gantt, {
      processId: sel.id,
      processName: sel.name,
      start: t,
      end: t + 1,
      color: sel.color,
    });
    remaining.set(sel.id, remaining.get(sel.id)! - 1);
    t++;
    if (remaining.get(sel.id) === 0) done++;
  }

  return buildResult(gantt, processes, firstRun);
}

// ─── Priority Non-preemptive ─────────────────────────────────────────────────

export function schedulePriorityNP(processes: Process[]): SchedulingResult {
  if (!processes.length) return buildResult([], [], {});

  const gantt: GanttBlock[] = [];
  const firstRun: Record<string, number> = {};
  const done = new Set<string>();
  let t = 0;

  while (done.size < processes.length) {
    const available = processes.filter(
      (p) => !done.has(p.id) && p.arrivalTime <= t
    );

    if (!available.length) {
      const next = Math.min(
        ...processes.filter((p) => !done.has(p.id)).map((p) => p.arrivalTime)
      );
      pushBlock(gantt, idleBlock(t, next));
      t = next;
      continue;
    }

    const sel = available.reduce((best, p) =>
      p.priority < best.priority ||
      (p.priority === best.priority && p.arrivalTime < best.arrivalTime)
        ? p
        : best
    );

    firstRun[sel.id] = t;
    pushBlock(gantt, {
      processId: sel.id,
      processName: sel.name,
      start: t,
      end: t + sel.burstTime,
      color: sel.color,
    });
    t += sel.burstTime;
    done.add(sel.id);
  }

  return buildResult(gantt, processes, firstRun);
}

// ─── Priority Preemptive ────────────────────────────────────────────────────

export function schedulePriorityP(processes: Process[]): SchedulingResult {
  if (!processes.length) return buildResult([], [], {});

  const gantt: GanttBlock[] = [];
  const firstRun: Record<string, number> = {};
  const remaining = new Map(processes.map((p) => [p.id, p.burstTime]));
  let t = 0;
  let done = 0;
  const maxTime =
    processes.reduce((s, p) => s + p.burstTime, 0) +
    Math.max(...processes.map((p) => p.arrivalTime)) +
    5;

  while (done < processes.length && t <= maxTime) {
    const available = processes.filter(
      (p) => p.arrivalTime <= t && (remaining.get(p.id) ?? 0) > 0
    );

    if (!available.length) {
      const next = Math.min(
        ...processes
          .filter((p) => (remaining.get(p.id) ?? 0) > 0)
          .map((p) => p.arrivalTime)
      );
      pushBlock(gantt, idleBlock(t, next));
      t = next;
      continue;
    }

    const sel = available.reduce((best, p) =>
      p.priority < best.priority ||
      (p.priority === best.priority && p.arrivalTime < best.arrivalTime)
        ? p
        : best
    );

    if (!(sel.id in firstRun)) firstRun[sel.id] = t;
    pushBlock(gantt, {
      processId: sel.id,
      processName: sel.name,
      start: t,
      end: t + 1,
      color: sel.color,
    });
    remaining.set(sel.id, remaining.get(sel.id)! - 1);
    t++;
    if (remaining.get(sel.id) === 0) done++;
  }

  return buildResult(gantt, processes, firstRun);
}

// ─── Round Robin ─────────────────────────────────────────────────────────────

export function scheduleRR(
  processes: Process[],
  quantum: number
): SchedulingResult {
  if (!processes.length) return buildResult([], [], {});

  const gantt: GanttBlock[] = [];
  const firstRun: Record<string, number> = {};
  const remaining = new Map(processes.map((p) => [p.id, p.burstTime]));
  const sorted = [...processes].sort(
    (a, b) => a.arrivalTime - b.arrivalTime || a.name.localeCompare(b.name)
  );

  const queue: Process[] = [];
  const inQueue = new Set<string>();
  let t = 0;
  let done = 0;

  for (const p of sorted) {
    if (p.arrivalTime <= 0) {
      queue.push(p);
      inQueue.add(p.id);
    }
  }

  while (done < processes.length) {
    if (!queue.length) {
      const notDone = sorted.filter(
        (p) => (remaining.get(p.id) ?? 0) > 0 && !inQueue.has(p.id)
      );
      const next = Math.min(...notDone.map((p) => p.arrivalTime));
      pushBlock(gantt, idleBlock(t, next));
      t = next;
      for (const p of sorted) {
        if (
          p.arrivalTime <= t &&
          !inQueue.has(p.id) &&
          (remaining.get(p.id) ?? 0) > 0
        ) {
          queue.push(p);
          inQueue.add(p.id);
        }
      }
      continue;
    }

    const current = queue.shift()!;
    inQueue.delete(current.id);

    if (!(current.id in firstRun)) firstRun[current.id] = t;

    const rem = remaining.get(current.id)!;
    const run = Math.min(quantum, rem);
    const endT = t + run;

    pushBlock(gantt, {
      processId: current.id,
      processName: current.name,
      start: t,
      end: endT,
      color: current.color,
    });
    remaining.set(current.id, rem - run);

    // Add new arrivals during this quantum
    const newArrivals = sorted.filter(
      (p) =>
        p.id !== current.id &&
        p.arrivalTime > t &&
        p.arrivalTime <= endT &&
        !inQueue.has(p.id) &&
        (remaining.get(p.id) ?? 0) > 0
    );
    for (const p of newArrivals) {
      queue.push(p);
      inQueue.add(p.id);
    }

    t = endT;

    if (remaining.get(current.id) === 0) {
      done++;
    } else {
      queue.push(current);
      inQueue.add(current.id);
    }
  }

  return buildResult(gantt, processes, firstRun);
}

// ─── Multilevel Queue ────────────────────────────────────────────────────────

export function scheduleMLQ(
  processes: Process[],
  queueConfigs: MLQueueConfig[]
): SchedulingResult {
  if (!processes.length) return buildResult([], [], {});

  const sortedQueues = [...queueConfigs].sort((a, b) => a.id - b.id);
  const gantt: GanttBlock[] = [];
  const firstRun: Record<string, number> = {};
  const remaining = new Map(processes.map((p) => [p.id, p.burstTime]));

  // Per-queue order for RR
  const queueOrder: Map<number, string[]> = new Map(
    sortedQueues.map((q) => [q.id, []])
  );
  const rrQuantumLeft: Record<string, number> = {};
  const addedToOrder = new Set<string>();

  let t = 0;
  let done = 0;
  const maxTime =
    processes.reduce((s, p) => s + p.burstTime, 0) +
    Math.max(...processes.map((p) => p.arrivalTime)) +
    5;

  const addArrivals = (time: number) => {
    const sorted = [...processes].sort(
      (a, b) => a.arrivalTime - b.arrivalTime || a.name.localeCompare(b.name)
    );
    for (const p of sorted) {
      if (
        p.arrivalTime <= time &&
        (remaining.get(p.id) ?? 0) > 0 &&
        !addedToOrder.has(p.id)
      ) {
        const qId = p.queue ?? 0;
        queueOrder.get(qId)?.push(p.id);
        addedToOrder.add(p.id);
        const qcfg = sortedQueues.find((q) => q.id === qId);
        rrQuantumLeft[p.id] = qcfg?.timeQuantum ?? 1;
      }
    }
  };

  addArrivals(0);

  while (done < processes.length && t <= maxTime) {
    addArrivals(t);

    let selProcess: Process | null = null;
    let selQueueConfig: MLQueueConfig | null = null;

    for (const qc of sortedQueues) {
      if (qc.algorithm === 'fcfs') {
        const available = processes.filter(
          (p) =>
            (p.queue ?? 0) === qc.id &&
            p.arrivalTime <= t &&
            (remaining.get(p.id) ?? 0) > 0
        );
        if (available.length > 0) {
          selProcess = available.reduce((best, p) =>
            p.arrivalTime <= best.arrivalTime ? p : best
          );
          selQueueConfig = qc;
          break;
        }
      } else {
        const order = queueOrder.get(qc.id) ?? [];
        const frontId = order.find((id) => (remaining.get(id) ?? 0) > 0);
        if (frontId) {
          selProcess = processes.find((p) => p.id === frontId) ?? null;
          selQueueConfig = qc;
          break;
        }
      }
    }

    if (!selProcess || !selQueueConfig) {
      const next = Math.min(
        ...processes
          .filter((p) => (remaining.get(p.id) ?? 0) > 0 && p.arrivalTime > t)
          .map((p) => p.arrivalTime)
      );
      if (!isFinite(next)) break;
      pushBlock(gantt, idleBlock(t, next));
      t = next;
      addArrivals(t);
      continue;
    }

    if (!(selProcess.id in firstRun)) firstRun[selProcess.id] = t;

    pushBlock(gantt, {
      processId: selProcess.id,
      processName: selProcess.name,
      start: t,
      end: t + 1,
      color: selProcess.color,
    });
    remaining.set(selProcess.id, remaining.get(selProcess.id)! - 1);
    t++;
    addArrivals(t);

    if (remaining.get(selProcess.id) === 0) {
      done++;
      const order = queueOrder.get(selQueueConfig.id);
      if (order) {
        const idx = order.indexOf(selProcess.id);
        if (idx >= 0) order.splice(idx, 1);
      }
    } else if (selQueueConfig.algorithm === 'rr') {
      rrQuantumLeft[selProcess.id]--;
      if (rrQuantumLeft[selProcess.id] <= 0) {
        const order = queueOrder.get(selQueueConfig.id) ?? [];
        const idx = order.indexOf(selProcess.id);
        if (idx >= 0) order.splice(idx, 1);
        order.push(selProcess.id);
        rrQuantumLeft[selProcess.id] = selQueueConfig.timeQuantum;
      }
    }
  }

  return buildResult(gantt, processes, firstRun);
}

// ─── Multilevel Feedback Queue ───────────────────────────────────────────────

export function scheduleMFLQ(
  processes: Process[],
  levels: number,
  quanta: number[]
): SchedulingResult {
  if (!processes.length) return buildResult([], [], {});

  const gantt: GanttBlock[] = [];
  const firstRun: Record<string, number> = {};
  const remaining = new Map(processes.map((p) => [p.id, p.burstTime]));
  const processLevel: Record<string, number> = {};
  const levelQueues: string[][] = Array.from({ length: levels }, () => []);
  const quantumLeft: Record<string, number> = {};
  const addedToQueue = new Set<string>();

  processes.forEach((p) => {
    processLevel[p.id] = 0;
  });

  let t = 0;
  let done = 0;
  const maxTime =
    processes.reduce((s, p) => s + p.burstTime, 0) +
    Math.max(...processes.map((p) => p.arrivalTime)) +
    5;

  const addArrivals = (time: number) => {
    const sorted = [...processes].sort(
      (a, b) => a.arrivalTime - b.arrivalTime || a.name.localeCompare(b.name)
    );
    for (const p of sorted) {
      if (
        p.arrivalTime <= time &&
        (remaining.get(p.id) ?? 0) > 0 &&
        !addedToQueue.has(p.id)
      ) {
        levelQueues[0].push(p.id);
        addedToQueue.add(p.id);
        quantumLeft[p.id] = quanta[0] ?? 2;
      }
    }
  };

  addArrivals(0);

  while (done < processes.length && t <= maxTime) {
    addArrivals(t);

    let selId: string | null = null;
    let selLevel = -1;

    for (let lvl = 0; lvl < levels; lvl++) {
      const frontId = levelQueues[lvl].find(
        (id) => (remaining.get(id) ?? 0) > 0
      );
      if (frontId) {
        selId = frontId;
        selLevel = lvl;
        break;
      }
    }

    if (!selId) {
      const next = Math.min(
        ...processes
          .filter((p) => (remaining.get(p.id) ?? 0) > 0 && p.arrivalTime > t)
          .map((p) => p.arrivalTime)
      );
      if (!isFinite(next)) break;
      pushBlock(gantt, idleBlock(t, next));
      t = next;
      addArrivals(t);
      continue;
    }

    const sel = processes.find((p) => p.id === selId)!;
    if (!(sel.id in firstRun)) firstRun[sel.id] = t;

    pushBlock(gantt, {
      processId: sel.id,
      processName: sel.name,
      start: t,
      end: t + 1,
      color: sel.color,
    });
    remaining.set(sel.id, remaining.get(sel.id)! - 1);
    quantumLeft[sel.id]--;
    t++;
    addArrivals(t);

    if (remaining.get(sel.id) === 0) {
      done++;
      const idx = levelQueues[selLevel].indexOf(sel.id);
      if (idx >= 0) levelQueues[selLevel].splice(idx, 1);
    } else if (quantumLeft[sel.id] <= 0) {
      const idx = levelQueues[selLevel].indexOf(sel.id);
      if (idx >= 0) levelQueues[selLevel].splice(idx, 1);
      const nextLevel = Math.min(selLevel + 1, levels - 1);
      processLevel[sel.id] = nextLevel;
      levelQueues[nextLevel].push(sel.id);
      quantumLeft[sel.id] = quanta[nextLevel] ?? 8;
    }
  }

  return buildResult(gantt, processes, firstRun);
}

// ─── Dispatcher ─────────────────────────────────────────────────────────────

export function runAlgorithm(
  algorithmId: AlgorithmId,
  processes: Process[],
  config: AlgorithmConfig
): SchedulingResult {
  switch (algorithmId) {
    case 'fcfs':
      return scheduleFCFS(processes);
    case 'sjf-np':
      return scheduleSJFNP(processes);
    case 'srtf':
      return scheduleSRTF(processes);
    case 'priority-np':
      return schedulePriorityNP(processes);
    case 'priority-p':
      return schedulePriorityP(processes);
    case 'round-robin':
      return scheduleRR(processes, Math.max(1, config.timeQuantum));
    case 'mlq':
      return scheduleMLQ(processes, config.mlqQueues);
    case 'mlfq':
      return scheduleMFLQ(
        processes,
        config.mlfqLevels,
        config.mlfqQuanta
      );
    default:
      return buildResult([], [], {});
  }
}
