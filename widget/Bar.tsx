import app from "ags/gtk4/app"
import { Astal, Gtk, Gdk } from "ags/gtk4"
import { createPoll } from "ags/time"
import { SystemMenuWindow, SystemMenuStates } from "./SystemMenu"
import { CalendarStates, CalendarWindow } from "./CustomCalendar"
import WorkspaceBar from "./WorkspaceBar"
import SystemTray from "./SystemTray"
import NotificationCenterWindow, { NotificationCenterStates } from "./Notifications"
import NotificationPopups, { NotificationPopupStates } from "./NotificationPopup"
import { createBinding, For } from "ags"

export default function BarApp() {
  const monitors = createBinding(app, "monitors")
  return (
    <For each={monitors} cleanup={(win) => (win as Gtk.Window).destroy()}>
      {(monitor) => <Bar gdkmonitor={monitor} />}
    </For>
  );
}

function Bar({ gdkmonitor }: { gdkmonitor: Gdk.Monitor }) {
  const time = createPoll("", 1000, "date '+%m/%d %H:%M'")
  const { TOP, LEFT, RIGHT } = Astal.WindowAnchor

  const sysMenuStates = new SystemMenuStates()
  SystemMenuWindow(gdkmonitor, sysMenuStates)

  const calendarStates = new CalendarStates()
  CalendarWindow(gdkmonitor, calendarStates)

  const notificationCenterStates = new NotificationCenterStates()
  NotificationCenterWindow(gdkmonitor, notificationCenterStates)

  const notificationPopupStates = new NotificationPopupStates()
  NotificationPopups(gdkmonitor, notificationPopupStates)

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
          spacing={8}
        >
          <SystemTray />
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
              label={notificationPopupStates.notifications(notifications =>
                notifications.length > 0 ? `   ${notifications.length} ` : `   ${notifications.length} `
              )}
              css={`font-family: monospace;margin-left: 3px;`}
            />
          </button>
        </box>
      </centerbox>
    </window>
  )
}
