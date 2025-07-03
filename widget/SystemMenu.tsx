import { Accessor, createState } from "ags";
import { Astal, Gdk, Gtk } from "ags/gtk4";

export const [showSysMenu, setShowSysMenu] = createState(false);
export const [clickLayerVisible, setClickLayerVisible] = createState(false);

export function SystemMenuWindow(gdkmonitor: Gdk.Monitor) {
  const revealer = (
    <revealer
      transitionType={Gtk.RevealerTransitionType.SLIDE_RIGHT}
      transitionDuration={250}
      revealChild={showSysMenu}
      halign={Gtk.Align.START}
      valign={Gtk.Align.START}
      vexpand={false}
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
  ) as Gtk.Revealer;

  const windowLayer = (
    <window
      name="sysmenu"
      class="SysMenu"
      gdkmonitor={gdkmonitor}
      layer={Astal.Layer.OVERLAY}
      anchor={Astal.WindowAnchor.LEFT
        | Astal.WindowAnchor.RIGHT
        | Astal.WindowAnchor.TOP
        | Astal.WindowAnchor.BOTTOM}
      exclusivity={Astal.Exclusivity.NORMAL}
      visible={clickLayerVisible}
      children={[revealer]}
    >
    </window>
  ) as Gtk.Window;

  revealer.connect('notify::child-revealed', () => {
    if (revealer.child_revealed) {
      console.log("open!")
    } else {
      console.log("close!");
      setClickLayerVisible(false);
    }
  });

  const outsideClick = Gtk.GestureClick.new();
  outsideClick.set_propagation_phase(Gtk.PropagationPhase.CAPTURE);


  outsideClick.connect('pressed', (_g, _n, x, y) => {
    console.log("click!");
    if (!revealer.contains(x, y))
      setShowSysMenu(false);
  });
  windowLayer.add_controller(outsideClick);
}

