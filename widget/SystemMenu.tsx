import { Accessor, createState } from "ags";
import { Astal, Gdk, Gtk } from "ags/gtk4";
import GLib from "gi://GLib";
import { VolumeSlider, volumeString } from "./SystemMenuWidget/Volume";
import { BrightnessSlider, brightnessString } from "./SystemMenuWidget/Brightness";
import { CPUBar, cpuUsageString } from "./SystemMenuWidget/CPUMonitor";
import { MemoryBar, memoryUsageString } from "./SystemMenuWidget/MemoryMonitor";
import { MediaControl } from "./SystemMenuWidget/MediaControl";

export const [showSysMenu, setShowSysMenu] = createState(false);
export const [sysMenuClickLayerVisible, setSysMenuClickLayerVisible] = createState(false);

export function SystemMenuWindow(gdkmonitor: Gdk.Monitor) {
  const userName = GLib.getenv('USER')
    ?? GLib.get_user_name()
    ?? 'unknown';

  const sysMenuRevealer = (
    <revealer
      transitionType={Gtk.RevealerTransitionType.SLIDE_RIGHT}
      transitionDuration={250}
      revealChild={showSysMenu}
      halign={Gtk.Align.START}
      valign={Gtk.Align.START}
      vexpand={false}
    >
      <box>
        <box orientation={Gtk.Orientation.VERTICAL} spacing={12}>
          <box orientation={Gtk.Orientation.HORIZONTAL} spacing={12}>
            <box orientation={Gtk.Orientation.VERTICAL} spacing={6}>
              <label label={userName} css="font-size:18px;" />
              <image
                file={"/home/" + userName + "/Pictures/icon.png"}
                css="min-width:128px; min-height:128px;"
              />
            </box>
            <box orientation={Gtk.Orientation.VERTICAL} spacing={8} valign={Gtk.Align.END}>
              <box orientation={Gtk.Orientation.HORIZONTAL} spacing={8} valign={Gtk.Align.END}>
                <button valign={Gtk.Align.END}>
                  <label label="" xalign={0.48} />
                </button>
                <button valign={Gtk.Align.END}>
                  <label label="" xalign={0.48} />
                </button>
              </box>
              <box orientation={Gtk.Orientation.HORIZONTAL} spacing={8} valign={Gtk.Align.END}>
                <button valign={Gtk.Align.END}>
                  <label label="" xalign={0.45} />
                </button>
                <button valign={Gtk.Align.END}>
                  <label label="" xalign={0.48} />
                </button>
              </box>
            </box>
          </box>
          <box orientation={Gtk.Orientation.VERTICAL} spacing={16}>
            <box orientation={Gtk.Orientation.HORIZONTAL}>
              <label label=" " css="margin-top:-2px;" />
              <label label={volumeString} css="font-family:monospace;" />
              <label label="  " />
              <VolumeSlider />
            </box>
            <box orientation={Gtk.Orientation.HORIZONTAL}>
              <label label=" " css="margin-top:-2px;" />
              <label label={brightnessString} css="font-family:monospace;" />
              <label label="  " />
              <BrightnessSlider />
            </box>
          </box>
          <box orientation={Gtk.Orientation.VERTICAL} spacing={16}>
            <box orientation={Gtk.Orientation.HORIZONTAL}>
              <label label=" " css="margin-top:-2px;" />
              <label label={cpuUsageString} css="font-family:monospace;" />
              <label label="  " />
              <CPUBar />
            </box>
            <box orientation={Gtk.Orientation.HORIZONTAL}>
              <label label=" " css="margin-top:-2px;" />
              <label label={memoryUsageString} css="font-family:monospace;" />
              <label label="  " />
              <MemoryBar />
            </box>
          </box>
          <box orientation={Gtk.Orientation.VERTICAL} spacing={16}>
            <MediaControl />
          </box>
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
      visible={sysMenuClickLayerVisible}
      child={sysMenuRevealer}
    >
    </window>
  ) as Gtk.Window;

  sysMenuRevealer.connect('notify::child-revealed', () => {
    if (!sysMenuRevealer.child_revealed) {
      setSysMenuClickLayerVisible(false);
    }
  });

  const outsideClick = Gtk.GestureClick.new();
  outsideClick.set_propagation_phase(Gtk.PropagationPhase.CAPTURE);


  outsideClick.connect('pressed', (_g, _n, x, y) => {
    if (!sysMenuRevealer.contains(x, y)) {
      setShowSysMenu(false);
    }
  });
  windowLayer.add_controller(outsideClick);
}

