import { For, createState } from "ags"
import { Astal, Gtk, Gdk } from "ags/gtk4"
import { execAsync } from "ags/process"
import Graphene from "gi://Graphene"
import { disable_app_launcher } from "./AppLauncher"

const { TOP, BOTTOM, LEFT, RIGHT } = Astal.WindowAnchor

const windows: Array<Gtk.Window> = []

type ClipEntry = {
  id: string;
  text: string;
};

export async function getClipboardHistory(limit = 20): Promise<ClipEntry[]> {
  const out = await execAsync(['bash', '-c', 'cliphist list | head -n ' + limit]);

  // cliphist の出力形式に合わせてパース
  // 例: "12345  copied text..."
  return out
    .split('\n')
    .filter(line => line.trim().length > 0)
    .map(line => {
      const firstSpace = line.indexOf(' ');
      if (firstSpace === -1) return null;
      const id = line.slice(0, firstSpace).trim();
      const text = line.slice(firstSpace + 1).trim();
      return { id, text };
    })
    .filter((x): x is ClipEntry => x !== null);
}

// 選択したエントリを復元する
export async function restoreClipboard(id: string): Promise<void> {
  await execAsync(['bash', '-c', `cliphist decode ${id} | wl-copy`]);
}

export function toggle_clipboard_launcher() {
  for (let launcher_window of windows) {
    launcher_window.visible = !launcher_window.visible
  }
  disable_app_launcher()
}

export function disable_clipboard_launcher() {
  for (let launcher_window of windows) {
    launcher_window.visible = false
  }
}

export default function ClipboardLauncher({ gdkmonitor }: { gdkmonitor: Gdk.Monitor }) {
  let contentbox: Gtk.Box
  let win: Astal.Window

  const [list, setList] = createState(new Array<ClipEntry>())

  async function refreshList() {
    setList(await getClipboardHistory())
  }

  function onKey(
    _e: Gtk.EventControllerKey,
    keyval: number,
    _: number,
    _mod: number,
  ) {
    if (keyval === Gdk.KEY_Escape) {
      disable_clipboard_launcher()
      return
    }
  }

  function onClick(_e: Gtk.GestureClick, _: number, x: number, y: number) {
    const [, rect] = contentbox.compute_bounds(win)
    const position = new Graphene.Point({ x, y })

    if (!rect.contains_point(position)) {
      disable_clipboard_launcher()
      return true
    }
  }

  const launcher_window = (<window
    $={(ref) => (win = ref)}
    name="launcher"
    class="launcher"
    gdkmonitor={gdkmonitor}
    anchor={TOP | BOTTOM | LEFT | RIGHT}
    exclusivity={Astal.Exclusivity.IGNORE}
    keymode={Astal.Keymode.EXCLUSIVE}
    onNotifyVisible={({ visible }) => {
      if (visible) {
        refreshList()
      }
    }}
  >
    <Gtk.EventControllerKey onKeyPressed={onKey} />
    <Gtk.GestureClick onPressed={onClick} />
    <box
      class="launcher-out"
      valign={Gtk.Align.CENTER}
      halign={Gtk.Align.CENTER}
      orientation={Gtk.Orientation.VERTICAL}>
      <box class="launcher">
        <box
          $={(ref) => (contentbox = ref)}
          name="launcher-content"
          valign={Gtk.Align.CENTER}
          halign={Gtk.Align.CENTER}
          orientation={Gtk.Orientation.VERTICAL}
          spacing={5}
        >
          <scrolledwindow
            overlayScrolling={false}
            kineticScrolling={true}
            css="min-width:350px;min-height:300px;"
          >
            <box orientation={Gtk.Orientation.VERTICAL} spacing={5}>
              <For each={list}>
                {(clip, index) => (
                  <button
                    $={(ref) => {
                      if (index.get() === 0) {
                        setTimeout(() => ref.grab_focus(), 1)
                      }
                    }}
                    onClicked={() => { restoreClipboard(clip.id); disable_clipboard_launcher() }}
                    class="launcher-button">
                    <box>
                      <label label={clip.text} maxWidthChars={40} wrap />
                      <label
                        hexpand
                        halign={Gtk.Align.END}
                      />
                    </box>
                  </button>
                )}
              </For>
            </box>
          </scrolledwindow>
        </box>
      </box>
    </box>
  </window>) as Gtk.Window

  launcher_window.visible = false
  windows.push(launcher_window)

  return launcher_window
}
