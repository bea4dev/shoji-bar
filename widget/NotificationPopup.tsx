import { Astal, Gdk, Gtk } from "ags/gtk4"
import AstalNotifd from "gi://AstalNotifd"
import { For, createState } from "ags"
import { autoHideNotifications, NotificationBox } from "./Notifications"

const notifd = AstalNotifd.get_default()

export const [notifications, setNotifications] = createState(
  new Array<AstalNotifd.Notification>(),
);

notifd.connect("notified", (_, id, replaced) => {
  const notification = notifd.get_notification(id)

  if (replaced && notifications.get().some(n => n.id === id)) {
    setNotifications((ns) => ns.map((n) => (n.id === id ? notification : n)))
  } else {
    setNotifications((ns) => [notification, ...ns])
  }
});

notifd.connect("resolved", (_, id) => {
  setNotifications((ns) => ns.filter((n) => n.id !== id))
});

export default function NotificationPopups(gdkmonitor: Gdk.Monitor) {
  return (
    <window
      class="NotificationPopups"
      gdkmonitor={gdkmonitor}
      visible={autoHideNotifications(notifications => notifications > 0)}
      anchor={Astal.WindowAnchor.TOP | Astal.WindowAnchor.RIGHT}
    >
      <box orientation={Gtk.Orientation.VERTICAL} spacing={12}>
        <For each={notifications}>
          {(notification) => (
            <NotificationBox notification={notification} autoHide={true} outLine={true} />
          )}
        </For>
      </box>
    </window>
  );
}
