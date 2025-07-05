import { createState } from "ags";
import { Gtk } from "ags/gtk4";
import { execAsync } from "ags/process";

const [isPlaying, setIsPlaying] = createState(false);
const [playingIcon, setPlayingIcon] = createState("");
/* 曲情報 */
const [title, setTitle] = createState("—");
const [artist, setArtist] = createState("—");

/* 1 秒ごとに playerctl で最新状態を取得 */
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
}, 1000);

const [duration, setDuration] = createState(0);   // 曲全体 [s]
const [position, setPosition] = createState(0);   // 現在位置 [s]

setInterval(async () => {
  try {
    /* --- 再生位置 (s) --- */
    const posUs = Number(await execAsync("playerctl position")) || 0;
    setPosition(Math.round(posUs));

    /* --- 曲全長 (µs) --- */
    const lenUs = Number(
      await execAsync("playerctl metadata -f '{{mpris:length}}'")
    ) || 0;
    setDuration(Math.round(lenUs / 1e6));
  } catch {
    setPosition(0);
    setDuration(0);
  }
}, 1000);

function SeekBar() {
  return (
    <slider
      orientation={Gtk.Orientation.HORIZONTAL}
      min={0}
      max={duration}        /* 曲の長さに合わせてスケール */
      value={position}      /* 現在位置をリアルタイム反映 */
      drawValue={false}
      step={1}
      onChangeValue={(widget) => {
        /* ボタンを離したタイミングでシークを確定 */
        const sec = Math.round(widget.get_value());
        execAsync(`playerctl position ${sec}`); /* ← 秒単位でシーク */
        setPosition(sec);                   // 即時UI更新
        return false;                           // イベントは後続へ流す
      }}
      cssName="slider"
    />
  );
}

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

      <SeekBar />

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
