import app from "ags/gtk4/app"
import { Astal, Gtk, Gdk } from "ags/gtk4"
import { createPoll } from "ags/time"
import { SystemMenuWindow, SystemMenuStates } from "./SystemMenu"
import { CalendarStates, CalendarWindow } from "./CustomCalendar"
import WorkspaceBar from "./WorkspaceBar"
import SystemTray from "./SystemTray"
import NotificationCenterWindow, { NotificationCenterStates } from "./Notifications"
import NotificationPopups, { enableNotificationPopup, NotificationPopupStates, setEnableNotificationPopup } from "./NotificationPopup"
import { Accessor, createBinding, createState, For } from "ags"
import { memoryUsageString } from "./Service/MemoryMonitorService"
import { cpuUsageString } from "./Service/CPUMonitorService"
import BatteryMenu from "./BatteryMenu"
import ForceUpdate from "./ForceUpdate"
import Applauncher from "./AppLauncher"
import ClipboardLauncher from "./ClipboardLauncher"

export default function BarApp() {
  const monitors = createBinding(app, "monitors")
  return (
    <For each={monitors} cleanup={(win) => (win as Gtk.Window).destroy()}>
      {(monitor, _) => {
        <Applauncher gdkmonitor={monitor} />;
        <ClipboardLauncher gdkmonitor={monitor} />;
        return <Bar gdkmonitor={monitor} />;
      }}
    </For>
  );
}

function Bar({ gdkmonitor }: { gdkmonitor: Gdk.Monitor }) {
  const time = createPoll("", 1000, "date '+%m/%d %H:%M'")
  const { TOP, LEFT, RIGHT } = Astal.WindowAnchor;

  const sysMenuStates = new SystemMenuStates()
  SystemMenuWindow(gdkmonitor, sysMenuStates)

  const calendarStates = new CalendarStates()
  CalendarWindow(gdkmonitor, calendarStates)

  const notificationCenterStates = new NotificationCenterStates()
  NotificationCenterWindow(gdkmonitor, notificationCenterStates)

  const notificationPopupStates = new NotificationPopupStates()
  NotificationPopups(gdkmonitor, notificationPopupStates)

  const [notificationLabel, setNotificationLabel] = createState("")

  const updateNotificationLabel = () => {
    const count = notificationPopupStates.notificationCount.get()
    setNotificationLabel(
      !enableNotificationPopup.get() ? `   ${count} ` : count > 0 ? `   ${count} ` : `   ${count} `
    )
  }
  updateNotificationLabel()

  enableNotificationPopup.subscribe(updateNotificationLabel)
  notificationPopupStates.notificationCount.subscribe(updateNotificationLabel)

  const notificationButton = (
    <button
      onClicked={() => {
        if (!notificationCenterStates.notificationClickLayerVisible.get()) {
          notificationCenterStates.setNotificationClickLayerVisible(true);
        }
        notificationCenterStates.setShowNotificationCenter(!notificationCenterStates.showNotificationCenter.get());
      }}
      hexpand
      css={`margin: 2px 8px;`}
    >
      <label
        label={notificationLabel}
        css={`font-family: monospace;margin-left: 3px;`}
      />
    </button>
  ) as Gtk.Button

  const gesture = Gtk.GestureClick.new()
  gesture.set_propagation_phase(Gtk.PropagationPhase.CAPTURE)
  gesture.set_button(3)

  // 右クリック時
  gesture.connect("pressed", () => {
    setEnableNotificationPopup(!enableNotificationPopup.get())
    createState
  });

  enableNotificationPopup.subscribe(() =>
    notificationPopupStates.setNotificationCount(notificationPopupStates.notificationCount.get())
  )

  notificationButton.add_controller(gesture)

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
        <box
          $type="start"
          orientation={Gtk.Orientation.HORIZONTAL}
          spacing={8}
          halign={Gtk.Align.START}
        >
          <button
            onClicked={() => {
              if (!sysMenuStates.sysMenuClickLayerVisible.get()) {
                sysMenuStates.setSysMenuClickLayerVisible(true);
              }
              sysMenuStates.setShowSysMenu(!sysMenuStates.showSysMenu.get());
            }}
            hexpand
            css={`margin: 2px 8px;`}
          >
            <label label="   " xalign={0.0} css={`
            font-family: monospace;
            margin-left: 3px;
          `} />
          </button>
          <WorkspaceBar />
        </box>
        <button $type="center" hexpand halign={Gtk.Align.CENTER}
          onClicked={() => {
            if (!calendarStates.calendarClickLayerVisible.get()) {
              calendarStates.setCalendarMenuClickLayerVisible(true);
            }
            calendarStates.setShowCalendar(!calendarStates.showCalendar.get());
          }}>
          <label label={time} />
        </button>
        <box
          $type="end"
          halign={Gtk.Align.END}
          orientation={Gtk.Orientation.HORIZONTAL}
          spacing={16}
        >
          <ForceUpdate />
          <box orientation={Gtk.Orientation.HORIZONTAL}>
            <label label=" " css="margin-top:-2px;font-family:monospace;" class="resource-label" />
            <label label={cpuUsageString} css="font-family:monospace;" class="resource-label" />
          </box>
          <box orientation={Gtk.Orientation.HORIZONTAL}>
            <label label=" " css="margin-top:-2px;font-family:monospace;" class="resource-label" />
            <label label={memoryUsageString} css="font-family:monospace;" class="resource-label" />
          </box>
          <BatteryMenu />
          <SystemTray />
          {notificationButton}
        </box>
      </centerbox>
    </window>
  )
}
