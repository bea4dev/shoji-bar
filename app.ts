import app from "ags/gtk4/app"
import style from "./style.scss"
import BarApp from "./widget/Bar";
import { toggle_app_launcher } from "./widget/Launcher/AppLauncher";
import { toggle_clipboard_launcher } from "./widget/Launcher/ClipboardLauncher";

app.start({
  css: style,
  main() {
    BarApp();
  },
  requestHandler(request, _) {
    if (request.includes("launcher")) {
      toggle_app_launcher()
    }
    if (request.includes("clipboard")) {
      toggle_clipboard_launcher()
    }
    return null
  },
})
