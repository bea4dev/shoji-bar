import { Gtk } from "ags/gtk4";
import { cpuUsage } from "../Service/CPUMonitorService";

export function CPUBar() {
  return (
    <levelbar
      orientation={Gtk.Orientation.HORIZONTAL}
      minValue={0}
      maxValue={100}
      value={cpuUsage}            /* ← 双方向バインド (read-only) */
      hexpand={true}
      mode={Gtk.LevelBarMode.CONTINUOUS}
    />
  );
}
