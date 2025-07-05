import app from "ags/gtk4/app"
import style from "./style.scss"
import BarApp from "./widget/Bar";

app.start({
  css: style,
  main() {
    BarApp();
  },
})
