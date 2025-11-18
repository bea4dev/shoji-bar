import { Gdk, Gtk } from "ags/gtk4"
import AstalHyprland from "gi://AstalHyprland"

const hyprland = AstalHyprland.get_default()

const LAUNCHERS: LauncherManager[] = []

export class LauncherManager {
    private windows: [Gtk.Window, Gdk.Monitor][] = []
    private enabledWindow: [Gtk.Window, Gdk.Monitor] | null = null

    public constructor() {
        LAUNCHERS.push(this)
    }

    public toggle_launcher() {
        const enabledWindow = this.enabledWindow
        const focusedMonitor = hyprland.get_focused_workspace().get_monitor()

        if (enabledWindow) {
            enabledWindow[0].visible = false
            this.enabledWindow = null
        } else {
            for (let candidateWindow of this.windows) {
                if (candidateWindow[1].get_connector() === focusedMonitor.get_name()) {
                    this.disable_other_launchers()
                    candidateWindow[0].visible = true
                    this.enabledWindow = candidateWindow
                    break
                }
            }
        }
    }

    disable_other_launchers() {
        for (let launcher of LAUNCHERS) {
            if (launcher != this) {
                launcher.disable_launcher()
            }
        }
    }

    public disable_launcher() {
        const enabledWindow = this.enabledWindow

        if (enabledWindow) {
            enabledWindow[0].visible = false
            this.enabledWindow = null
        }
    }

    public register_window(launcherWindow: Gtk.Window, gdkmonitor: Gdk.Monitor) {
        this.windows.push([launcherWindow, gdkmonitor])
    }
}
