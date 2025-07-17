import { Accessor, createState, Setter } from "ags";
import { Astal, Gdk, Gtk } from "ags/gtk4";
import GLib from "gi://GLib";
import { VolumeSlider, volumeString } from "./SystemMenuWidget/Volume";
import { BrightnessSlider, brightnessString } from "./SystemMenuWidget/Brightness";
import { CPUBar } from "./SystemMenuWidget/CPUMonitor";
import { MediaControl } from "./SystemMenuWidget/MediaControl";
import OverlayDialog, { OverlayDialogStates } from "./OverlayDialog";
import { execAsync } from "ags/process";
import { cpuUsageString } from "./Service/CPUMonitorService";
import { MemoryBar } from "./SystemMenuWidget/MemoryMonitor";
import { memoryUsageString } from "./Service/MemoryMonitorService";

export class SystemMenuStates {
  public showSysMenu: Accessor<boolean>
  public setShowSysMenu: Setter<boolean>

  public sysMenuClickLayerVisible: Accessor<boolean>
  public setSysMenuClickLayerVisible: Setter<boolean>

  public constructor() {
    const [showSysMenu, setShowSysMenu] = createState(false);
    const [sysMenuClickLayerVisible, setSysMenuClickLayerVisible] = createState(false);

    this.showSysMenu = showSysMenu
    this.setShowSysMenu = setShowSysMenu
    this.sysMenuClickLayerVisible = sysMenuClickLayerVisible
    this.setSysMenuClickLayerVisible = setSysMenuClickLayerVisible
  }
}

export function SystemMenuWindow(gdkmonitor: Gdk.Monitor, states: SystemMenuStates) {
  const userName = GLib.getenv('USER')
    ?? GLib.get_user_name()
    ?? 'unknown';

  const shutdownDialogStates = new OverlayDialogStates()
  OverlayDialog("Shutdown?", () => execAsync("systemctl poweroff"), gdkmonitor, shutdownDialogStates)

  const restartDialogStates = new OverlayDialogStates()
  OverlayDialog("Restart?", () => execAsync("systemctl reboot"), gdkmonitor, restartDialogStates)

  const logoutDialogStates = new OverlayDialogStates()
  OverlayDialog("Logout?", () => execAsync("hyprctl dispatch exit"), gdkmonitor, logoutDialogStates)

  const lockDialogStates = new OverlayDialogStates()
  OverlayDialog("Lock?", () => execAsync("hyprlock"), gdkmonitor, lockDialogStates)

  const sysMenuRevealer = (
    <revealer
      transitionType={Gtk.RevealerTransitionType.SLIDE_RIGHT}
      transitionDuration={250}
      revealChild={states.showSysMenu}
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
                <button valign={Gtk.Align.END} onClicked={() => shutdownDialogStates.setShowDialog(true)}>
                  <label label="" xalign={0.48} />
                </button>
                <button valign={Gtk.Align.END} onClicked={() => restartDialogStates.setShowDialog(true)}>
                  <label label="" xalign={0.48} />
                </button>
              </box>
              <box orientation={Gtk.Orientation.HORIZONTAL} spacing={8} valign={Gtk.Align.END}>
                <button valign={Gtk.Align.END} onClicked={() => logoutDialogStates.setShowDialog(true)}>
                  <label label="" xalign={0.42} />
                </button>
                <button valign={Gtk.Align.END} onClicked={() => lockDialogStates.setShowDialog(true)}>
                  <label label="" xalign={0.48} />
                </button>
              </box>
            </box>
          </box>
          <box orientation={Gtk.Orientation.VERTICAL} spacing={16}>
            <box orientation={Gtk.Orientation.HORIZONTAL}>
              <label label=" " css="margin-top:-2px;font-family:monospace;" />
              <label label={volumeString} css="font-family:monospace;" />
              <label label="  " />
              <VolumeSlider />
            </box>
            <box orientation={Gtk.Orientation.HORIZONTAL}>
              <label label=" " css="margin-top:-2px;font-family:monospace;" />
              <label label={brightnessString} css="font-family:monospace;" />
              <label label="  " />
              <BrightnessSlider />
            </box>
          </box>
          <box orientation={Gtk.Orientation.VERTICAL} spacing={16}>
            <box orientation={Gtk.Orientation.HORIZONTAL}>
              <label label=" " css="margin-top:-2px;font-family:monospace;" />
              <label label={cpuUsageString} css="font-family:monospace;" />
              <label label="  " />
              <CPUBar />
            </box>
            <box orientation={Gtk.Orientation.HORIZONTAL}>
              <label label=" " css="margin-top:-2px;font-family:monospace;" />
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
      visible={states.sysMenuClickLayerVisible}
      child={sysMenuRevealer}
    >
    </window>
  ) as Gtk.Window;

  sysMenuRevealer.connect('notify::child-revealed', () => {
    if (!sysMenuRevealer.child_revealed) {
      states.setSysMenuClickLayerVisible(false);
    }
  });

  const outsideClick = Gtk.GestureClick.new();
  outsideClick.set_propagation_phase(Gtk.PropagationPhase.CAPTURE);


  outsideClick.connect('pressed', (_g, _n, x, y) => {
    if (!sysMenuRevealer.contains(x, y)) {
      states.setShowSysMenu(false);
    }
  });
  windowLayer.add_controller(outsideClick);
}

