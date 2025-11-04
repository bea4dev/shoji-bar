import app from "ags/gtk4/app"
import style from "./style.scss"
import BarApp from "./widget/Bar";
import { toggle_app_launcher } from "./widget/AppLauncher";

app.start({
  css: style,
  main() {
    BarApp();
  },
  requestHandler(request, _) {
    if (request[0] === "launcher") {
      toggle_app_launcher()
    }
    return null
  },
})
