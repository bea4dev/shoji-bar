import { createState } from "ags";
import GLib from "gi://GLib";

export const [memoryUsage, setMemoryUsage] = createState(0);
export const [memoryUsageString, setmemoryUsageString] = createState("  0%");

setInterval(async () => {
  /* 例:
     MemTotal:       32664860 kB
     MemAvailable:   21123420 kB
  */
  const [, bytes] = GLib.file_get_contents("/proc/meminfo");
  const text = new TextDecoder("utf-8").decode(bytes);

  /* MemTotal / MemAvailable を抽出 */
  const total = Number(text.match(/^MemTotal:\s+(\d+)/m)?.[1] ?? 0);
  const avail = Number(text.match(/^MemAvailable:\s+(\d+)/m)?.[1] ?? 0);

  if (total > 0 && avail >= 0) {
    const usedPct = 100 * (1 - avail / total);
    setMemoryUsage(Math.round(usedPct));
    setmemoryUsageString(Math.round(usedPct).toString().padStart(3, " ") + "%");
  }
}, 1000);

