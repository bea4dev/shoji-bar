import { Gtk } from "ags/gtk4";
import { batteryPercent, batteryString, batteryTime } from "./Service/BatteryService";

export default function BatteryMenu() {
  return (
    <menubutton>
      <label label={batteryString} css="font-family:monospace;" />
      <popover>
        <box
          orientation={Gtk.Orientation.VERTICAL}
          spacing={16}
          marginTop={8}
          marginBottom={8}
          marginStart={8}
          marginEnd={8}
        >
          <box orientation={Gtk.Orientation.HORIZONTAL} spacing={16}>
            <levelbar
              orientation={Gtk.Orientation.HORIZONTAL}
              minValue={0}
              maxValue={100}
              value={batteryPercent}
              hexpand={true}
              mode={Gtk.LevelBarMode.CONTINUOUS}
            />
            <label label={batteryPercent((percent) => `${percent}%`)} css="font-family:monospace;" />
          </box>
          <label label={batteryTime} css="font-family:monospace;" />
        </box>
      </popover>
    </menubutton>
  )
}
