export type AlgorithmId =
  | 'fcfs'
  | 'sjf-np'
  | 'srtf'
  | 'priority-np'
  | 'priority-p'
  | 'round-robin'
  | 'mlq'
  | 'mlfq';

export const PROCESS_COLORS = [
  '#818cf8', // indigo-400
  '#fb7185', // rose-400
  '#34d399', // emerald-400
  '#fbbf24', // amber-400
  '#60a5fa', // blue-400
  '#a78bfa', // violet-400
  '#22d3ee', // cyan-400
  '#f472b6', // pink-400
  '#a3e635', // lime-400
  '#2dd4bf', // teal-400
];

export interface Process {
  id: string;
  name: string;
  arrivalTime: number;
  burstTime: number;
  priority: number;
  color: string;
  queue: number; // for MLQ: queue index (0 = highest priority)
}

export interface GanttBlock {
  processId: string;
  processName: string;
  start: number;
  end: number;
  color: string;
}

export interface ProcessMetrics {
  processId: string;
  processName: string;
  color: string;
  arrivalTime: number;
  burstTime: number;
  priority: number;
  completionTime: number;
  waitingTime: number;
  turnaroundTime: number;
  responseTime: number;
}

export interface TimelineFrame {
  time: number;
  runningId: string | null;
  readyIds: string[];
}

export interface SchedulingResult {
  gantt: GanttBlock[];
  metrics: ProcessMetrics[];
  timeline: TimelineFrame[];
  avgWaitingTime: number;
  avgTurnaroundTime: number;
  avgResponseTime: number;
  throughput: number;
  totalTime: number;
}

export interface MLQueueConfig {
  id: number;
  name: string;
  algorithm: 'fcfs' | 'rr';
  timeQuantum: number;
}

export interface AlgorithmConfig {
  timeQuantum: number;
  mlqQueues: MLQueueConfig[];
  mlfqLevels: number;
  mlfqQuanta: number[];
}

export interface AlgorithmInfo {
  id: AlgorithmId;
  name: string;
  shortName: string;
  description: string;
  category: 'non-preemptive' | 'preemptive' | 'advanced';
  needsPriority: boolean;
  needsQueue: boolean;
  needsQuantum: boolean;
  icon: string;
  categoryLabel: string;
}

export const ALGORITHMS: AlgorithmInfo[] = [
  {
    id: 'fcfs',
    name: 'First Come First Served',
    shortName: 'FCFS',
    description: 'Tiến trình đến trước được phục vụ trước',
    category: 'non-preemptive',
    needsPriority: false,
    needsQueue: false,
    needsQuantum: false,
    icon: '→',
    categoryLabel: 'Không chiếm quyền',
  },
  {
    id: 'sjf-np',
    name: 'Shortest Job First',
    shortName: 'SJF',
    description: 'Chọn tiến trình có CPU burst ngắn nhất khi CPU rảnh',
    category: 'non-preemptive',
    needsPriority: false,
    needsQueue: false,
    needsQuantum: false,
    icon: '⚡',
    categoryLabel: 'Không chiếm quyền',
  },
  {
    id: 'priority-np',
    name: 'Priority (Non-preemptive)',
    shortName: 'Priority NP',
    description: 'Chọn tiến trình có độ ưu tiên cao nhất khi CPU rảnh',
    category: 'non-preemptive',
    needsPriority: true,
    needsQueue: false,
    needsQuantum: false,
    icon: '★',
    categoryLabel: 'Không chiếm quyền',
  },
  {
    id: 'srtf',
    name: 'Shortest Remaining Time First',
    shortName: 'SRTF',
    description: 'Luôn chọn tiến trình có thời gian còn lại ngắn nhất',
    category: 'preemptive',
    needsPriority: false,
    needsQueue: false,
    needsQuantum: false,
    icon: '⚡',
    categoryLabel: 'Chiếm quyền',
  },
  {
    id: 'priority-p',
    name: 'Priority (Preemptive)',
    shortName: 'Priority P',
    description: 'Tiến trình ưu tiên cao hơn có thể chiếm CPU',
    category: 'preemptive',
    needsPriority: true,
    needsQueue: false,
    needsQuantum: false,
    icon: '★',
    categoryLabel: 'Chiếm quyền',
  },
  {
    id: 'round-robin',
    name: 'Round Robin',
    shortName: 'Round Robin',
    description: 'Mỗi tiến trình được phân một khoảng thời gian đều nhau',
    category: 'preemptive',
    needsPriority: false,
    needsQueue: false,
    needsQuantum: true,
    icon: '↻',
    categoryLabel: 'Chiếm quyền',
  },
  {
    id: 'mlq',
    name: 'Multilevel Queue',
    shortName: 'MLQ',
    description: 'Tiến trình được gán vĩnh viễn vào một hàng đợi',
    category: 'advanced',
    needsPriority: false,
    needsQueue: true,
    needsQuantum: false,
    icon: '≡',
    categoryLabel: 'Nâng cao',
  },
  {
    id: 'mlfq',
    name: 'Multilevel Feedback Queue',
    shortName: 'MLFQ',
    description: 'Tiến trình có thể di chuyển giữa các hàng đợi',
    category: 'advanced',
    needsPriority: false,
    needsQueue: false,
    needsQuantum: false,
    icon: '⇅',
    categoryLabel: 'Nâng cao',
  },
];

export const DEFAULT_CONFIG: AlgorithmConfig = {
  timeQuantum: 2,
  mlqQueues: [
    { id: 0, name: 'Hàng đợi 1 (Hệ thống)', algorithm: 'rr', timeQuantum: 2 },
    { id: 1, name: 'Hàng đợi 2 (Người dùng)', algorithm: 'fcfs', timeQuantum: 4 },
  ],
  mlfqLevels: 3,
  mlfqQuanta: [2, 4, 8],
};

export const DEFAULT_PROCESSES: Process[] = [
  { id: 'p1', name: 'P1', arrivalTime: 0, burstTime: 6, priority: 3, color: PROCESS_COLORS[0], queue: 0 },
  { id: 'p2', name: 'P2', arrivalTime: 2, burstTime: 4, priority: 1, color: PROCESS_COLORS[1], queue: 1 },
  { id: 'p3', name: 'P3', arrivalTime: 4, burstTime: 2, priority: 4, color: PROCESS_COLORS[2], queue: 0 },
  { id: 'p4', name: 'P4', arrivalTime: 6, burstTime: 5, priority: 2, color: PROCESS_COLORS[3], queue: 1 },
];
