import { createState } from "ags"
import AstalHyprland from "gi://AstalHyprland?version=0.1"

const [label, setLabel] = createState("0")
let forceUpdate = false

const FPS = 120
/**
 * forceUpdate = trueである限り更新し続ける
 */
setInterval(() => {
  if (forceUpdate) {
    if (label.get() === "0") {
      setLabel("1")
    } else {
      setLabel("0")
    }
  }
}, 1000 / FPS)

const hyprlandService = AstalHyprland.get_default()
/**
 * 連続でやっても問題ないようにカウンターを設置して増減で判定する
 */
let count = 0
/**
 * ワークスペース切り替え時
 */
hyprlandService.connect("notify::focused-workspace", () => {
  count = 1;
  forceUpdate = true
})

/**
 * 1秒後に遅延して更新を止める
 */
setInterval(() => {
  if (count > 0) {
    count -= 1;
  } else {
    forceUpdate = false
  }
}, 1000)

/**
 * Hyprland上で影の描画がちらつく問題を、描画を更新することで低減させる
 */
export default function ForceUpdate() {
  return (<label label={label} css="font-family:monospace; color:transparent;"></label>)
}
