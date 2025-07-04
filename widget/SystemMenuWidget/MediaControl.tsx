import { createState } from "ags";
import { Gtk } from "ags/gtk4";
import { execAsync } from "ags/process";

const [isPlaying, setIsPlaying] = createState(false);
const [playingIcon, setPlayingIcon] = createState("");
/* 曲情報 */
const [title, setTitle] = createState("—");
const [artist, setArtist] = createState("—");

/* 2 秒ごとに playerctl で最新状態を取得 */
setInterval(async () => {
  try {
    /* metadata: {{artist}}\t{{title}} */
    const meta = await execAsync(
      `playerctl metadata --format '{{artist}}\\t{{title}}'`
    );
    const [a, t] = meta.trim().split("\\t");
    setArtist(a || "Unknown");
    setTitle(t || "No Title");

    /* status: Playing / Paused / Stopped */
    const stat = (await execAsync("playerctl status")).trim();
    if (stat === "Playing") {
      setIsPlaying(true);
      setPlayingIcon("");
    } else {
      setIsPlaying(false);
      setPlayingIcon("");
    }
  } catch {
    /* 再生していない or playerctl なし */
    setArtist("—");
    setTitle("—");
    setIsPlaying(false);
    setPlayingIcon("");
  }
}, 2000);

export function MediaControl() {
  return (
    <box orientation={Gtk.Orientation.VERTICAL} spacing={6}>

      {/* ─ 曲情報 ─────────────────────── */}
      <label
        label={title}
        css="font-weight:bold;"
        maxWidthChars={30}
        wrap={true}
      />
      <label
        label={artist}
        maxWidthChars={30}
        css="color:#cdd6f4;"
        wrap={true}
      />

      {/* ─ 3 ボタン横並び ───────────────── */}
      <box orientation={Gtk.Orientation.HORIZONTAL} spacing={8} halign={Gtk.Align.CENTER}>

        {/* ◀ previous */}
        <button
          onClicked={() => execAsync("playerctl previous")}
        >
          <label label="" />
        </button>

        {/* ⏯ play / pause トグル */}
        <button
          onClicked={() => {
            execAsync("playerctl play-pause");

            if (isPlaying.get()) {
              setIsPlaying(false);
              setPlayingIcon("");
            } else {
              setIsPlaying(false);
              setPlayingIcon("");
            }
          }}
        >
          <label
            label={playingIcon}  /* Nerd Font icons */
          />
        </button>

        {/* ▶ next */}
        <button
          onClicked={() => execAsync("playerctl next")}
        >
          <label label="" />
        </button>
      </box>
    </box>
  );
}
