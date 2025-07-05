import { Accessor, createState, Setter } from "ags";
import { Astal, Gdk, Gtk } from "ags/gtk4";
import { createPoll } from "ags/time";

export class CalendarStates {
  public showCalendar: Accessor<boolean>
  public setShowCalendar: Setter<boolean>

  public calendarClickLayerVisible: Accessor<boolean>
  public setCalendarMenuClickLayerVisible: Setter<boolean>

  public constructor() {
    const [showCalendar, setShowCalendar] = createState(false)
    const [calendarClickLayerVisible, setCalendarMenuClickLayerVisible] = createState(false)

    this.showCalendar = showCalendar
    this.setShowCalendar = setShowCalendar
    this.calendarClickLayerVisible = calendarClickLayerVisible
    this.setCalendarMenuClickLayerVisible = setCalendarMenuClickLayerVisible
  }
}

export function CalendarWindow(gdkmonitor: Gdk.Monitor, states: CalendarStates) {
  const calendarRevealer = (
    <revealer
      transitionType={Gtk.RevealerTransitionType.SLIDE_DOWN}
      transitionDuration={250}
      revealChild={states.showCalendar}
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
      visible={states.calendarClickLayerVisible}
      child={calendarRevealer}
    >
    </window>
  ) as Gtk.Window;

  calendarRevealer.connect('notify::child-revealed', () => {
    if (!calendarRevealer.child_revealed) {
      states.setCalendarMenuClickLayerVisible(false);
    }
  });

  const outsideClick = Gtk.GestureClick.new();
  outsideClick.set_propagation_phase(Gtk.PropagationPhase.CAPTURE);

  outsideClick.connect('pressed', (_g, _n, xWin, yWin) => {
    const alloc = calendarRevealer.get_allocation();
    if (!(xWin >= alloc.x && xWin <= alloc.x + alloc.width &&
      yWin >= alloc.y && yWin <= alloc.y + alloc.height)) {
      states.setShowCalendar(false);
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
