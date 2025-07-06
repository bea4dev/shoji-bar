import { Astal, Gdk, Gtk } from "ags/gtk4"
import AstalNotifd from "gi://AstalNotifd"
import { Accessor, For, Setter, createState } from "ags"
import { autoHideNotifications, NotificationBox } from "./Notifications"

export class NotificationPopupStates {
  public notifications: Accessor<Array<AstalNotifd.Notification>>
  public setNotifications: Setter<Array<AstalNotifd.Notification>>

  public constructor() {
    const [notifications, setNotifications] = createState(
      new Array<AstalNotifd.Notification>(),
    )

    this.notifications = notifications
    this.setNotifications = setNotifications
  }
}

export default function NotificationPopups(gdkmonitor: Gdk.Monitor, states: NotificationPopupStates) {
  const notifd = AstalNotifd.get_default()

  states.setNotifications(notifd.notifications)

  notifd.connect("notified", (_, id, replaced) => {
    const notification = notifd.get_notification(id)

    if (replaced && states.notifications.get().some(n => n.id === id)) {
      states.setNotifications((ns) => ns.map((n) => (n.id === id ? notification : n)))
    } else {
      states.setNotifications((ns) => [notification, ...ns])
    }
  });

  notifd.connect("resolved", (_, id) => {
    // delay remove (avoid freeze popdown animation)
    setTimeout(() => {
      states.setNotifications((ns) => ns.filter((n) => n.id !== id))
    }, 5000)
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
