# CPU Scheduling Visualizer

Mô phỏng trực quan các thuật toán lập lịch CPU — Project môn **Nguyên lí Hệ điều hành**.

## Thuật toán hỗ trợ

| # | Thuật toán | Loại |
|---|---|---|
| 1 | **FCFS** — First Come First Served | Không chiếm quyền |
| 2 | **SJF** — Shortest Job First | Không chiếm quyền |
| 3 | **Priority NP** — Priority Non-preemptive | Không chiếm quyền |
| 4 | **SRTF** — Shortest Remaining Time First | Chiếm quyền |
| 5 | **Priority P** — Priority Preemptive | Chiếm quyền |
| 6 | **Round Robin** | Chiếm quyền |
| 7 | **MLQ** — Multilevel Queue | Nâng cao |
| 8 | **MLFQ** — Multilevel Feedback Queue | Nâng cao |

## Tính năng

- Biểu đồ Gantt trực quan với colorful process blocks
- Bảng hiệu suất: CT, WT, TAT, RT với badge Tốt/TB/Kém
- Summary cards: Avg WT, Avg TAT, Avg RT, Throughput
- MLQ: Tùy chỉnh 2-5 hàng đợi, thuật toán con FCFS/RR/SJF/Priority NP
- MLFQ: Tùy chỉnh 2-5 cấp, quantum mỗi cấp, cấp cuối FCFS
- Dữ liệu mẫu mặc định
- Responsive dark theme

## Tech Stack

- React 18 + TypeScript + Vite 5 + TailwindCSS 3

## Chạy

```bash
npm install
npm run dev
```

## Build & Deploy

```bash
npm run build
npx gh-pages -d dist
```
