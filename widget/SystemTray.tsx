import { createBinding, For } from "ags";
import AstalTray from "gi://AstalTray?version=0.1";

export default function SystemTray() {
  var tray = AstalTray.get_default();
  var items = createBinding(tray, "items");

  return (
    <box>
      <For each={items}>
        {(item) => (
          <menubutton
            tooltipMarkup={item.tooltip_markup}
            menuModel={item.menu_model}
            class="tray-item"
            $={(self) => {
              self.insert_action_group("dbusmenu", item.actionGroup)
            }}
          >
            <image gicon={createBinding(item, "gicon")} />
          </menubutton>
        )}
      </For>
    </box>
  );
}
