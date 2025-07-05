import app from "ags/gtk4/app"
import { Astal, Gtk, Gdk } from "ags/gtk4"
import { createPoll } from "ags/time"
import {
  showSysMenu,
  setShowSysMenu,
  SystemMenuWindow,
  setSysMenuClickLayerVisible,
  sysMenuClickLayerVisible,
} from "./SystemMenu"
import {
  calendarClickLayerVisible,
  CalendarWindow,
  setCalendarMenuClickLayerVisible,
  setShowCalendar,
  showCalendar
} from "./CustomCalendar"
import WorkspaceBar from "./WorkspaceBar"
import SystemTray from "./SystemTray"
import NotificationCenterWindow, {
  notificationClickLayerVisible,
  setNotificationClickLayerVisible,
  setShowNotificationCenter,
  showNotificationCenter
} from "./Notifications"
import NotificationPopups, { notifications } from "./NotificationPopup"

export default function Bar(gdkmonitor: Gdk.Monitor) {
  const time = createPoll("", 1000, "date '+%m/%d %H:%M'")
  const { TOP, LEFT, RIGHT } = Astal.WindowAnchor

  SystemMenuWindow(gdkmonitor);
  CalendarWindow(gdkmonitor);
  NotificationCenterWindow(gdkmonitor);
  NotificationPopups(gdkmonitor);

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
              if (!sysMenuClickLayerVisible.get()) {
                setSysMenuClickLayerVisible(true);
              }
              setShowSysMenu(!showSysMenu.get());
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
            if (!calendarClickLayerVisible.get()) {
              setCalendarMenuClickLayerVisible(true);
            }
            setShowCalendar(!showCalendar.get());
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
              if (!notificationClickLayerVisible.get()) {
                setNotificationClickLayerVisible(true);
              }
              setShowNotificationCenter(!showNotificationCenter.get());
            }}
            hexpand
            css={`margin: 2px 8px;`}
          >
            <label
              label={notifications(notifications => 
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
