import { Accessor, createState, Setter } from "ags";
import { Astal, Gdk, Gtk } from "ags/gtk4";

export class OverlayDialogStates {
  public showDialog: Accessor<boolean>
  public setShowDialog: Setter<boolean>

  public constructor() {
    const [showDialog, setShowDialog] = createState(false)

    this.showDialog = showDialog
    this.setShowDialog = setShowDialog
  }
}

export default function OverlayDialog(
  message: string,
  ok: () => void,
  gdkmonitor: Gdk.Monitor,
  states: OverlayDialogStates
) {
  return (
    <window
      name="overlay_dialog"
      class="OverlayDialog"
      gdkmonitor={gdkmonitor}
      layer={Astal.Layer.OVERLAY}
      anchor={Astal.WindowAnchor.LEFT
        | Astal.WindowAnchor.RIGHT
        | Astal.WindowAnchor.TOP
        | Astal.WindowAnchor.BOTTOM}
      exclusivity={Astal.Exclusivity.IGNORE}
      visible={states.showDialog}
    >
      <centerbox hexpand={true} vexpand={true}>
        <box $type="center" halign={Gtk.Align.CENTER} valign={Gtk.Align.CENTER} class="dialog-out">
          <box orientation={Gtk.Orientation.VERTICAL} spacing={24} class="dialog">
            <label label={message} />
            <box orientation={Gtk.Orientation.HORIZONTAL} spacing={24}>
              <button onClicked={() => { ok(); states.setShowDialog(false); }}>
                <label label={"OK"} css="min-width:45px;" />
              </button>
              <button onClicked={() => states.setShowDialog(false)}>
                <label label={"NO"} css="min-width:45px;" />
              </button>
            </box>
          </box>
        </box>
      </centerbox>
    </window>
  )
}
