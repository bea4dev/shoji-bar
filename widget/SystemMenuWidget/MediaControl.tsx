import { createState } from "ags"
import { Gtk } from "ags/gtk4"
import AstalMpris from "gi://AstalMpris?version=0.1"

const [isPlaying, setIsPlaying] = createState(false)
const [playingIcon, setPlayingIcon] = createState("")
/* 曲情報 */
const [title, setTitle] = createState("—")
const [artist, setArtist] = createState("—")

const [duration, setDuration] = createState(0)   // 曲全体 [s]
const [position, setPosition] = createState(0)   // 現在位置 [s]

const mpris = AstalMpris.get_default()
const connected = new WeakSet<AstalMpris.Player>()
const played = new Set<string>()

function initPlayer() {
  for (let player of mpris.get_players()) {
    if (connected.has(player)) {
      continue
    }
    connected.add(player)

    let prevTrack = ""
    player.connect("notify::trackid", () => {
      // ChromeのYoutubeミックスリストの再生切り替え時には"NoTrack"が挟まる
      // これを使ってpositionを0にすることで、Chromeが再生位置を更新しない問題を回避する
      if (prevTrack.includes("NoTrack")) {
        played.add(player.trackid)
        player.set_position(0)
      }

      prevTrack = player.trackid
    })
  }
}

initPlayer()
mpris.connect("notify::players", initPlayer)

setInterval(async () => {
  const player = mpris.get_players().at(0)

  if (!player || player.playback_status === AstalMpris.PlaybackStatus.STOPPED) {
    setArtist("—")
    setTitle("—")
    setIsPlaying(false)
    setPlayingIcon("")
    setPosition(0)
    setDuration(0)
    return
  }

  setArtist(player.artist)
  setTitle(player.title)

  if (player.playback_status === AstalMpris.PlaybackStatus.PLAYING) {
    setIsPlaying(true)
    setPlayingIcon("")
  } else {
    setIsPlaying(false)
    setPlayingIcon("")
  }

  setPosition(player.position)
  setDuration(player.length)
}, 1000)

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
        const player = mpris.get_players().at(0)
        if (!player) {
          return false
        }

        /* ボタンを離したタイミングでシークを確定 */
        const sec = widget.get_value()
        player.set_position(sec) /* ← 秒単位でシーク */
        setPosition(sec)                   // 即時UI更新
        return false;                           // イベントは後続へ流す
      }}
      cssName="slider"
    />
  )
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
          onClicked={() => {
            const player = mpris.get_players().at(0)
            if (!player) {
              return false
            }
            player.previous();
          }}
        >
          <label label="" />
        </button>

        {/* ⏯ play / pause トグル */}
        <button
          onClicked={() => {
            const player = mpris.get_players().at(0)
            if (!player) {
              return false
            }

            if (isPlaying.get()) {
              setIsPlaying(false)
              setPlayingIcon("")
              player.pause()
            } else {
              setIsPlaying(true)
              setPlayingIcon("")
              player.play()
            };
          }}
        >
          <label
            label={playingIcon}  /* Nerd Font icons */
          />
        </button>

        {/* ▶ next */}
        <button
          onClicked={() => {
            const player = mpris.get_players().at(0)
            if (!player) {
              return false
            }
            player.next();
          }}
        >
          <label label="" />
        </button>
      </box>
    </box>
  )
}
