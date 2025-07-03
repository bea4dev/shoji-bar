import { Gtk } from "ags/gtk4";
import { createPoll } from "ags/time";

export default function Calendar() {
  const time = createPoll("", 1000, "date '+%H:%M:%S'")

  return (
    <Gtk.Box spacing={6} orientation={Gtk.Orientation.VERTICAL} children={[
      <Gtk.Label label={time} css={`
        font-family: monospace;
        border: 1px solid rgba(71, 83, 88, 1); /* 枠線の色と太さ */
        background: rgba(71, 83, 88, 0.24);
        border-radius: 6px;             /* 角丸 */
        padding: 8px 8px;               /* 枠と文字の余白 */
        font-size: 16pt;                /* 文字サイズ */
        font-weight: bold;              /* 太字 */
        color: rgba(235, 235, 235, 1);  /* 文字色（任意） */
      `} />,
      <Gtk.Calendar
        showDayNames
        showWeekNumbers={false}
      />
    ]} />
  )
}
