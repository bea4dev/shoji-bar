import { createState } from "ags";
import { execAsync } from "ags/process";

export const [cpuUsage, setCPUUsage] = createState(0);
export const [cpuUsageString, setCPUUsageString] = createState("  0%");

let prevIdle = 0;
let prevTotal = 0;

/* 1 秒ごとに差分を取り使用率を計算 */
setInterval(async () => {
  /* /proc/stat の “cpu …” 行 (先頭行) を取得 */
  const line = await execAsync("grep '^cpu ' /proc/stat");
  const nums = line.trim().split(/\s+/).slice(1).map(Number);
  /*
     user, nice, system, idle, iowait, irq, softirq, steal
     → idle = idle+iowait
     → total = 全部
  */
  const idle = nums[3] + nums[4];
  const total = nums.reduce((a, b) => a + b);

  if (prevTotal !== 0) {
    const diffIdle = idle - prevIdle;
    const diffTotal = total - prevTotal;
    const usage = 100 * (1 - diffIdle / diffTotal);
    setCPUUsage(Math.max(Math.round(usage), 2));
    setCPUUsageString(Math.round(usage).toString().padStart(3, " ") + "%")
  }
  prevIdle = idle;
  prevTotal = total;
}, 1000);
