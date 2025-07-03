import { Accessor, createState } from "ags";
import { Astal, Gdk, Gtk } from "ags/gtk4";

export var [showSysMenu, setShowSysMenu] = createState(false);

export function SystemMenuWindow(gdkmonitor: Gdk.Monitor) {
  return (
    <window
      name="sysmenu"
      class="SysMenu"
      gdkmonitor={gdkmonitor}   /* マルチモニタ用に渡す */
      /* overlay layer に貼り付け、左端に固定 */
      layer={Astal.Layer.OVERLAY}
      anchor={Astal.WindowAnchor.LEFT}
      exclusivity={Astal.Exclusivity.NORMAL}
      /* ▼ Variable バインドで表示／非表示を制御 */
      visible={true}
    >
      <revealer
        transitionType={Gtk.RevealerTransitionType.SLIDE_RIGHT}
        transitionDuration={250}
        revealChild={showSysMenu}
        halign={Gtk.Align.START}
      >
        <box>
          <box
            orientation={Gtk.Orientation.VERTICAL}
            spacing={12}
          >
            <label label="System Menu" css="font-weight:bold;" />
            <button onClicked={() => console.log("poweroff")}>
              <label label="⏻  Power Off" />
            </button>
            <button onClicked={() => console.log("setting")}>
              <label label="⚙  Settings" />
            </button>
          </box>
        </box>
      </revealer>
    </window>
  );
}

