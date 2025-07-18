import { createState } from "ags"
import AstalBattery from "gi://AstalBattery"

export const [batteryPercent, setBatteryPercent] = createState(100)
export const [batteryString, setBatteryString] = createState("")
export const [batteryTime, setBatteryTime] = createState("")
export const [hasBattery, setHasBattery] = createState(true)

const updateBatteryStatus = () => {
  const astalBattery = AstalBattery.get_default()

  if (!astalBattery.is_battery) {
    setHasBattery(false)
    return
  }

  const percent = Math.floor(astalBattery.get_percentage() * 100.0)
  setBatteryPercent(percent)

  var batteryIcon
  if (percent >= 95) { batteryIcon = " " }
  else if (percent >= 75) { batteryIcon = " " }
  else if (percent >= 35) { batteryIcon = " " }
  else if (percent >= 10) { batteryIcon = " " }
  else { batteryIcon = " " }

  if (astalBattery.get_state() === AstalBattery.State.CHARGING) {
    setBatteryString(`${batteryIcon} ${percent}%`)
    setBatteryTime(`Time to full : ${secondsToHM(astalBattery.get_time_to_full())}`)
  } else if (astalBattery.get_state() === AstalBattery.State.DISCHARGING) {
    setBatteryString(`${batteryIcon} ${percent}%`)
    setBatteryTime(`Time to empty : ${secondsToHM(astalBattery.get_time_to_empty())}`)
  } else {
    setBatteryString(`${batteryIcon} ${percent}%`)
    setBatteryTime(`Charged! `)
  }
}

updateBatteryStatus()

setInterval(updateBatteryStatus, 10000)

function secondsToHM(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);

  /* 桁を 2 桁で 0 埋め */
  const hh = h.toString().padStart(2, "0");
  const mm = m.toString().padStart(2, "0");

  return `${hh}:${mm}`;
}
