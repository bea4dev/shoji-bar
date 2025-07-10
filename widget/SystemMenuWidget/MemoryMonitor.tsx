import { Gtk } from "ags/gtk4";
import { memoryUsage } from "../Service/MemoryMonitorService";

export function MemoryBar() {
  return (
    <levelbar
      orientation={Gtk.Orientation.HORIZONTAL}
      minValue={0}
      maxValue={100}
      value={memoryUsage}
      hexpand={true}
      mode={Gtk.LevelBarMode.CONTINUOUS}
    />
  );
}
