import { createState } from "ags";
import { Gtk } from "ags/gtk4";
import { execAsync } from "ags/process";

const [brightness, setBrightness] = createState(0);
export const [brightnessString, setBrightnessString] = createState("  0");

setInterval(async () => {
  /* brightnessctl は小数点なし整数を返す */
  const out = await execAsync("brightnessctl g");
  const max = await execAsync("brightnessctl m");
  const pct = Math.round((Number(out) / Number(max)) * 100);
  setBrightness(pct);
}, 1000);

export function BrightnessSlider() {
  return (
    <slider
      orientation={Gtk.Orientation.HORIZONTAL}
      min={0}
      max={100}
      step={1}
      drawValue={false}
      value={brightness}            /* ← 双方向バインド */
      hexpand={true}
      onValueChanged={(slider) => {
        const val = Math.round(slider.get_value());
        /* ③ 変更を反映 */
        execAsync(`brightnessctl s ${val}%`);
        try {
          execAsync(`blctl s ${val}`);
        } catch {
          console.warn("'blctl' is not found.");
        };
        setBrightness(val);            // 即座に状態へ反映
        setBrightnessString(val.toString().padStart(3, " "));
      }}
      cssName="slider"
    />
  ) as Gtk.Scale;
}
