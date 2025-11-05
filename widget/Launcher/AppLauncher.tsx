import { For, createState } from "ags"
import { Astal, Gtk, Gdk } from "ags/gtk4"
import AstalApps from "gi://AstalApps"
import Graphene from "gi://Graphene"
import { disable_clipboard_launcher } from "./ClipboardLauncher"

const { TOP, BOTTOM, LEFT, RIGHT } = Astal.WindowAnchor

const windows: Array<Gtk.Window> = []

export function toggle_app_launcher() {
  for (let launcher_window of windows) {
    launcher_window.visible = !launcher_window.visible
  }
  disable_clipboard_launcher()
}

export function disable_app_launcher() {
  for (let launcher_window of windows) {
    launcher_window.visible = false
  }
}

export default function Applauncher({ gdkmonitor }: { gdkmonitor: Gdk.Monitor }) {
  let contentbox: Gtk.Box
  let searchentry: Gtk.Entry
  let win: Astal.Window

  const apps = new AstalApps.Apps()
  const [list, setList] = createState(new Array<AstalApps.Application>())

  function search(text: string) {
    if (text === "") setList([])
    else setList(apps.fuzzy_query(text).slice(0, 8))
  }

  function launch(app?: AstalApps.Application) {
    if (app) {
      win.hide()
      app.launch()
    }
  }

  function onKey(
    _e: Gtk.EventControllerKey,
    keyval: number,
    _: number,
    _mod: number,
  ) {
    if (keyval === Gdk.KEY_Escape) {
      disable_app_launcher()
      return
    }
  }

  function onClick(_e: Gtk.GestureClick, _: number, x: number, y: number) {
    const [, rect] = contentbox.compute_bounds(win)
    const position = new Graphene.Point({ x, y })

    if (!rect.contains_point(position)) {
      disable_app_launcher()
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
      if (visible) searchentry.grab_focus()
      else searchentry.set_text("")
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
          <entry
            $={(ref) => (searchentry = ref)}
            onNotifyText={({ text }) => search(text)}
            onActivate={() => launch(list.get()[0])}
            placeholderText="Search..."
            class="launcher-text-box"
          />
          <Gtk.Separator />
          <scrolledwindow
            overlayScrolling={false}
            kineticScrolling={true}
            css="min-width:350px;min-height:300px;"
          >
            <box orientation={Gtk.Orientation.VERTICAL} spacing={5}>
              <For each={list}>
                {(app) => (
                  <button onClicked={() => launch(app)} class="launcher-button">
                    <box>
                      <image iconName={app.iconName} />
                      <label label={"  " + app.name} maxWidthChars={40} wrap />
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
