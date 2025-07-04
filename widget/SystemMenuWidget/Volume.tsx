import { createState } from "ags";
import { Gtk } from "ags/gtk4";
import { execAsync } from "ags/process";

const [volume, setVolume] = createState(0);
export const [volumeString, setVolumeString] = createState("  0");

setInterval(async () => {
  const out = await execAsync('pactl get-sink-volume @DEFAULT_SINK@');
  /* 出力例: "Volume: front-left: 39382 /  60% / -7.78 dB, ..." */
  const match = out.match(/.*?\s(\d+)%/);
  if (match) {
    setVolume(parseInt(match[1], 10));
  }
}, 1000);

export function VolumeSlider() {
  /* Gtk.Scale (横向き) */
  return (
    <slider
      orientation={Gtk.Orientation.HORIZONTAL}
      min={0}
      max={100}
      step={1}
      drawValue={false}
      /* Variable と双方向バインド */
      value={volume}
      hexpand={true}
      /* ユーザ操作 → pactl へ反映 */
      onValueChanged={(slider) => {
        const val = Math.round(slider.get_value());
        execAsync(`pactl set-sink-volume @DEFAULT_SINK@ ${val}%`);
        setVolume(val);               // 即時反映
        setVolumeString(val.toString().padStart(3, " "));
      }}
      /* CSS クラスで後からまとめて装飾 */
      cssName="slider"
    />
  );
}
