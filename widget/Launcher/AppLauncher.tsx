import { For, createState } from "ags"
import { Astal, Gtk, Gdk } from "ags/gtk4"
import AstalApps from "gi://AstalApps"
import Graphene from "gi://Graphene"
import { LauncherManager } from "./LauncherManager"

const { TOP, BOTTOM, LEFT, RIGHT } = Astal.WindowAnchor

export const APP_LAUNCHER = new LauncherManager()

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
      APP_LAUNCHER.disable_launcher()
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
      APP_LAUNCHER.disable_launcher()
      return
    }
  }

  function onClick(_e: Gtk.GestureClick, _: number, x: number, y: number) {
    const [, rect] = contentbox.compute_bounds(win)
    const position = new Graphene.Point({ x, y })

    if (!rect.contains_point(position)) {
      APP_LAUNCHER.disable_launcher()
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
        searchentry.grab_focus()
      }
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
  APP_LAUNCHER.register_window(launcher_window, gdkmonitor)

  return launcher_window
}
