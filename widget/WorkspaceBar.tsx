import { Accessor, createState, For, With } from "ags";
import { Gtk } from "ags/gtk4";
import AstalHyprland from "gi://AstalHyprland";

const hyprlandService = AstalHyprland.get_default()

const [workspaceArray, setWorkspaceArray] = createState<Array<number>>([]);
const [currentWorkspace, setCurrentWorkspace] = createState(0);

export const maxOf = (arr: number[]): number | undefined =>
  arr.length ? Math.max(...arr) : undefined;

function update() {
  const currentWorkspace = hyprlandService.focused_workspace.id

  const activeWorkspaceIds = hyprlandService.workspaces
    .filter(workspace => workspace.clients.length !== 0)
    .map(workspace => workspace.id);

  const newWorkspaceIds: number[] = [];

  for (let i = 1; i <= 30; i++) {
    if (i <= 5 || activeWorkspaceIds.includes(i) || currentWorkspace === i) {
      newWorkspaceIds.push(i);
    }
  }

  setWorkspaceArray(newWorkspaceIds);
  setCurrentWorkspace(currentWorkspace);
}

// init
update();

// on workspace update?
hyprlandService.connect('notify::focused-workspace', update);

function WorkspaceButton({ workspace }: { workspace: number }) {
  return (
    <box>
      <With value={currentWorkspace}>
        {(currentWorkspace) => <button
          class={currentWorkspace === workspace ? "ws-btn active" : "ws-btn"}
          onClicked={() => AstalHyprland.get_default().dispatch("workspace", `${workspace}`)}
        >
          <label label={workspace.toString()} />
        </button>}
      </With>

    </box>
  );
}

export default function WorkspaceBar() {
  return (
    <box orientation={Gtk.Orientation.HORIZONTAL} spacing={0}>
      <For each={workspaceArray}>
        {(item) => (
          <WorkspaceButton workspace={item} />
        )}
      </For>
    </box>
  ) as Gtk.Box;
}
