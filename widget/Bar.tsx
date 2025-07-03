import app from "ags/gtk4/app"
import { Astal, Gtk, Gdk } from "ags/gtk4"
import { execAsync } from "ags/process"
import { createPoll } from "ags/time"
import Calendar from "./CustomCalendar"
import { showSysMenu, setShowSysMenu, SystemMenuWindow } from "./SystemMenu"

export default function Bar(gdkmonitor: Gdk.Monitor) {
  const time = createPoll("", 1000, "date '+%m/%d %H:%M'")
  const { TOP, LEFT, RIGHT } = Astal.WindowAnchor

  const popover = new Gtk.Popover();
  const revealer = new Gtk.Revealer({
    transition_type: Gtk.RevealerTransitionType.SLIDE_DOWN,
    transition_duration: 250,
    reveal_child: false,
  });
  revealer.set_child(Calendar() as Gtk.Widget);
  popover.set_child(revealer);

  SystemMenuWindow(gdkmonitor);

  return (
    <window
      visible
      name="bar"
      class="Bar"
      gdkmonitor={gdkmonitor}
      exclusivity={Astal.Exclusivity.EXCLUSIVE}
      anchor={TOP | LEFT | RIGHT}
      application={app}
    >
      <centerbox cssName="centerbox">
        <button
          $type="start"
          onClicked={() => setShowSysMenu(!showSysMenu.get())}
          hexpand
          halign={Gtk.Align.START}
          css={`margin: 2px 8px;`}
        >
          <label label="   " xalign={0.0} css={`
            font-family: monospace;
            margin-left: 3px;
          `} />
        </button>
        <box $type="center" />
        <menubutton $type="center" popover={popover} hexpand halign={Gtk.Align.CENTER}
          onNotifyActive={(button, _) => {
            revealer.reveal_child = button.active;
          }}>
          <label label={time} />
        </menubutton>
        <button
          $type="end"
          onClicked={() => execAsync("echo hello").then(console.log)}
          hexpand
          halign={Gtk.Align.START}
        >
          <label label="Welcome to AGS!" />
        </button>
      </centerbox>
    </window>
  )
}
