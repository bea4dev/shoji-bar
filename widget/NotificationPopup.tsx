import { Astal, Gdk, Gtk } from "ags/gtk4"
import AstalNotifd from "gi://AstalNotifd"
import { Accessor, For, Setter, createState } from "ags"
import { autoHideNotifications, NotificationBox } from "./Notifications"

export class NotificationPopupStates {
  public notifications: Accessor<Array<AstalNotifd.Notification>>
  public setNotifications: Setter<Array<AstalNotifd.Notification>>

  public notificationCount: Accessor<number>
  public setNotificationCount: Setter<number>

  public constructor() {
    const [notifications, setNotifications] = createState(
      new Array<AstalNotifd.Notification>(),
    )
    const [notificationCount, setNotificationCount] = createState(0)

    this.notifications = notifications
    this.setNotifications = setNotifications
    this.notificationCount = notificationCount
    this.setNotificationCount = setNotificationCount
  }
}

export default function NotificationPopups(gdkmonitor: Gdk.Monitor, states: NotificationPopupStates) {
  const notifd = AstalNotifd.get_default()

  states.setNotifications(notifd.notifications)
  states.setNotificationCount(notifd.notifications.length)

  notifd.connect("notified", (_, id, replaced) => {
    const notification = notifd.get_notification(id)

    if (replaced && states.notifications.get().some(n => n.id === id)) {
      states.setNotifications((ns) => ns.map((n) => (n.id === id ? notification : n)))
    } else {
      states.setNotifications((ns) => [notification, ...ns])
      states.setNotificationCount((count) => count + 1)
    }
  });

  notifd.connect("resolved", (_, id) => {
    // delay remove (avoid freeze popdown animation)
    setTimeout(() => {
      states.setNotifications((ns) => ns.filter((n) => n.id !== id))
    }, 5000)

    // non delayed count
    if (states.notifications.get().find((notif) => notif.id === id)) {
      states.setNotificationCount((count) => Math.max(count - 1, 0))
    }
  });

  return (
    <window
      class="NotificationPopups"
      gdkmonitor={gdkmonitor}
      visible={autoHideNotifications(notifications => notifications > 0)}
      anchor={Astal.WindowAnchor.TOP | Astal.WindowAnchor.RIGHT}
    >
      <box orientation={Gtk.Orientation.VERTICAL} spacing={12}>
        <For each={states.notifications}>
          {(notification) => (
            <NotificationBox notification={notification} autoHide={true} outLine={true} />
          )}
        </For>
      </box>
    </window>
  );
}
