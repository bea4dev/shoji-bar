import app from "ags/gtk4/app"
import style from "./style.scss"
import BarApp from "./widget/Bar";
import { APP_LAUNCHER } from "./widget/Launcher/AppLauncher";
import { CLIPBOARD_LAUNCHER } from "./widget/Launcher/ClipboardLauncher";

app.start({
  css: style,
  main() {
    BarApp();
  },
  requestHandler(request, _) {
    if (request.includes("launcher")) {
      APP_LAUNCHER.toggle_launcher()
    }
    if (request.includes("clipboard")) {
      CLIPBOARD_LAUNCHER.toggle_launcher()
    }
    return null
  },
})
