import { Accessor, createBinding, createState, For, Setter } from "ags";
import { Astal, Gdk } from "ags/gtk4";
import AstalNotifd from "gi://AstalNotifd?version=0.1";
import Gtk from "gi://Gtk?version=4.0";

export class NotificationCenterStates {
  public showNotificationCenter: Accessor<boolean>
  public setShowNotificationCenter: Setter<boolean>

  public notificationClickLayerVisible: Accessor<boolean>
  public setNotificationClickLayerVisible: Setter<boolean>

  public constructor() {
    const [showNotificationCenter, setShowNotificationCenter] = createState(false)
    const [notificationClickLayerVisible, setNotificationClickLayerVisible] = createState(false)

    this.showNotificationCenter = showNotificationCenter
    this.setShowNotificationCenter = setShowNotificationCenter
    this.notificationClickLayerVisible = notificationClickLayerVisible
    this.setNotificationClickLayerVisible = setNotificationClickLayerVisible
  }
}

export default function NotificationCenterWindow(gdkmonitor: Gdk.Monitor, states: NotificationCenterStates) {
  const notificationRevealer = (
    <revealer
      transitionType={Gtk.RevealerTransitionType.SLIDE_LEFT}
      transitionDuration={250}
      revealChild={states.showNotificationCenter}
      halign={Gtk.Align.END}
      valign={Gtk.Align.START}
      vexpand={false}
    >
      <box>
        <box>
          <box>
            <NotificationCenter />
          </box>
        </box>
      </box>
    </revealer>
  ) as Gtk.Revealer;

  const windowLayer = (
    <window
      name="notificationcenter"
      class="NotificationCenter"
      gdkmonitor={gdkmonitor}
      layer={Astal.Layer.OVERLAY}
      anchor={Astal.WindowAnchor.LEFT
        | Astal.WindowAnchor.RIGHT
        | Astal.WindowAnchor.TOP
        | Astal.WindowAnchor.BOTTOM}
      exclusivity={Astal.Exclusivity.NORMAL}
      visible={states.notificationClickLayerVisible}
      child={notificationRevealer}
    >
    </window>
  ) as Gtk.Window;

  notificationRevealer.connect('notify::child-revealed', () => {
    if (!notificationRevealer.child_revealed) {
      states.setNotificationClickLayerVisible(false);
    }
  });

  const outsideClick = Gtk.GestureClick.new();
  outsideClick.set_propagation_phase(Gtk.PropagationPhase.CAPTURE);

  outsideClick.connect('pressed', (_g, _n, xWin, yWin) => {
    const alloc = notificationRevealer.get_allocation();
    if (!(xWin >= alloc.x && xWin <= alloc.x + alloc.width &&
      yWin >= alloc.y && yWin <= alloc.y + alloc.height)) {
      states.setShowNotificationCenter(false);
    }
  });
  windowLayer.add_controller(outsideClick);
}

export const [autoHideNotifications, setAutoHideNotifications] = createState(0);

export function NotificationBox({ notification, autoHide, outLine }
  : { notification: AstalNotifd.Notification, autoHide: boolean, outLine: boolean }) {

  const [showNotification, setShowNotification] = createState(false);

  var isDismiss = false;

  if (autoHide) {
    setAutoHideNotifications(autoHideNotifications.get() + 1);
  }

  var image
  if (notification.image) {
    image = <image file={notification.image} pixelSize={32} />
  } else if (notification.appIcon) {
    image = <image file={notification.appIcon} pixelSize={32} />
  } else {
    image = <image iconName="dialog-information-symbolic" pixelSize={32} />
  }

  const closeButton = (
    <button
      class="close-btn"
      halign={Gtk.Align.END}
      onClicked={() => {
        isDismiss = true;
        setShowNotification(false);
      }}
    >
      <label label="" />
    </button>
  ) as Gtk.Button

  const box = (
    <box class={outLine ? "notify-out" : "box"}>
      <box class="notify" orientation={Gtk.Orientation.HORIZONTAL} spacing={12}>
        {/* アイコン */}
        {image}

        {/* タイトル+本文 */}
        <box orientation={Gtk.Orientation.VERTICAL} spacing={4}>
          <label label={notification.summary} css="font-weight:bold;" wrap
            maxWidthChars={25}
            widthChars={25}
            wrapMode={Gtk.WrapMode.CHAR} />
          <label
            label={notification.body}
            wrap
            maxWidthChars={25}
            widthChars={25}
            wrapMode={Gtk.WrapMode.CHAR}
          />
          {notification.actions.filter(action => action.label !== "view" && action.label !== "View").map(action => (
            <button label={action.label} onClicked={() => notification.invoke(action.id)} class="notify-action-button" />
          ))}
        </box>

        {/* × ボタン */}
        {closeButton}
      </box>
    </box>
  ) as Gtk.Box

  const click = Gtk.GestureClick.new();
  click.set_propagation_phase(Gtk.PropagationPhase.CAPTURE);
  click.connect('pressed', (_g, _n, xRow, yRow) => {
    const [_flag, inCloseX, inCloseY] = box.translate_coordinates(closeButton, xRow, yRow);

    if (closeButton.contains(inCloseX, inCloseY)) {
      return
    }

    notification.invoke("default")
  });

  box.add_controller(click);

  const revealer = (
    <revealer
      transitionType={Gtk.RevealerTransitionType.SLIDE_LEFT}
      transitionDuration={250}
      revealChild={showNotification}
      halign={Gtk.Align.END}
      valign={Gtk.Align.START}
      vexpand={false}
    >
      {box}
    </revealer>
  ) as Gtk.Revealer;

  setTimeout(() => setShowNotification(true), 100);

  if (autoHide) {
    setTimeout(() => setShowNotification(false), 5000);
  }

  revealer.connect("notify::child-revealed", () => {
    if (!showNotification.get() && isDismiss) {
      notification.dismiss();
    }

    if (!showNotification.get() && autoHide) {
      setAutoHideNotifications(autoHideNotifications.get() - 1);
    }
  });

  return revealer;
}

function NotificationCenter() {
  const notify = AstalNotifd.get_default();
  const notifications = createBinding(notify, "notifications")

  return (
    <scrolledwindow
      overlayScrolling={false}
      kineticScrolling={true}
      css="min-width:350px;min-height:600px;"
    >
      <box orientation={Gtk.Orientation.VERTICAL} spacing={12}>
        <For each={notifications}>
          {(notification) => (
            <NotificationBox notification={notification} autoHide={false} outLine={false} />
          )}
        </For>
      </box>
    </scrolledwindow>
  );
}
