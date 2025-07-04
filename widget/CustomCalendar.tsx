import { Accessor, createState } from "ags";
import { Astal, Gdk, Gtk } from "ags/gtk4";
import { createPoll } from "ags/time";

export const [showCalendar, setShowCalendar] = createState(false);
export const [calendarClickLayerVisible, setCalendarMenuClickLayerVisible] = createState(false);

export function CalendarWindow(gdkmonitor: Gdk.Monitor) {
  const calendarRevealer = (
    <revealer
      transitionType={Gtk.RevealerTransitionType.SLIDE_DOWN}
      transitionDuration={250}
      revealChild={showCalendar}
      halign={Gtk.Align.CENTER}
      valign={Gtk.Align.START}
      vexpand={false}
    >
      <box>
        <box orientation={Gtk.Orientation.VERTICAL}>
          <Calendar />
        </box>
      </box>
    </revealer>
  ) as Gtk.Revealer;

  const windowLayer = (
    <window
      name="calandarmenu"
      class="CalandarMenu"
      gdkmonitor={gdkmonitor}
      layer={Astal.Layer.OVERLAY}
      anchor={Astal.WindowAnchor.LEFT
        | Astal.WindowAnchor.RIGHT
        | Astal.WindowAnchor.TOP
        | Astal.WindowAnchor.BOTTOM}
      exclusivity={Astal.Exclusivity.NORMAL}
      visible={calendarClickLayerVisible}
      child={calendarRevealer}
    >
    </window>
  ) as Gtk.Window;

  calendarRevealer.connect('notify::child-revealed', () => {
    if (!calendarRevealer.child_revealed) {
      setCalendarMenuClickLayerVisible(false);
    }
  });

  const outsideClick = Gtk.GestureClick.new();
  outsideClick.set_propagation_phase(Gtk.PropagationPhase.CAPTURE);

  outsideClick.connect('pressed', (_g, _n, xWin, yWin) => {
    const alloc = calendarRevealer.get_allocation();
    if (!(xWin >= alloc.x && xWin <= alloc.x + alloc.width &&
      yWin >= alloc.y && yWin <= alloc.y + alloc.height)) {
      setShowCalendar(false);
    }

  });
  windowLayer.add_controller(outsideClick);
}

function Calendar() {
  const time = createPoll("", 1000, "date '+%H:%M:%S'")

  return (
    <Gtk.Box spacing={6} orientation={Gtk.Orientation.VERTICAL} children={[
      <Gtk.Label label={time} />,
      <Gtk.Calendar
        showDayNames
        showWeekNumbers={false}
      />
    ]} />
  )
}
