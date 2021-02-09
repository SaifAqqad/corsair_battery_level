import { NotifyIcon, Icon, Menu } from "not-the-systray";
import HID from "node-hid"
const DATA_REQ = [0xC9, 0x64],
    CORSAIR_VID = 0x1B1C,
    KNOWN_PIDS = {
        0x0A38: "HS70 Wireless",
        0x0A4F: "HS70 PRO Wireless",
        0x0A14: "VOID PRO Wireless"
    },
    DEVICE_STATES = {
        0: "Disconnected",
        1: "Connected",
        2: "Low battery",
        4: "Fully charged",
        5: "Charging"
    },
    CON_COLOR = {
        default: "\x1b[0m",
        red: "\x1b[31m",
        green: "\x1b[32m"
    },
    TRAY_ICONS = {
        default: Icon.load("icons/headphones.ico", Icon.small),
        charging: Icon.load("icons/battery-charging.ico", Icon.small),
        10: Icon.load("icons/battery-wireless.ico", Icon.small),
        9: Icon.load("icons/battery-wireless-90.ico", Icon.small),
        7: Icon.load("icons/battery-wireless-70.ico", Icon.small),
        5: Icon.load("icons/battery-wireless-50.ico", Icon.small),
        3: Icon.load("icons/battery-wireless-30.ico", Icon.small),
        1: Icon.load("icons/battery-wireless-10.ico", Icon.small),
    },
    TRAY_OPTIONS = {
        icon: TRAY_ICONS["default"],
        tooltip: "Corsair battery level",
        onSelect: (event) => show_menu(event)
    },
    tray = new NotifyIcon(TRAY_OPTIONS),
    MENU_ITEMS = [
        { id: 1, text: "Exit" },
    ],
    menu = new Menu(MENU_ITEMS);
let device_info = null;
init();

function init() {
    let [hidDevice, infoObj] = get_device();
    if (!hidDevice) {
        console.error("could not find a device");
        process.exit(1);
    }
    device_info = infoObj;
    device_info.full_name = `${device_info.manufacturer} ${KNOWN_PIDS[device_info.productId]}`
    hidDevice.setNonBlocking(1);
    hidDevice.on('data', handle_data);
    process.stdout.write(`Found Device: ${device_info.full_name}\n`);
    process.stdout.write(`\tBattery level\t\tCurrent state\n`);
    hidDevice.resume();
}

function show_menu(event) {
    if (!event.rightButton)
        return;
    const ret = menu.showSync(event.mouseX, event.mouseY);
    if (ret === 1) {
        tray.remove()
        process.exit(0)
    }
}

function get_device() {
    let dList = HID.devices(),
        hidDevice, infoObj;
    for (let deviceObj of dList) {
        if (deviceObj.vendorId !== CORSAIR_VID || KNOWN_PIDS[deviceObj.productId] === undefined)
            continue;
        try {
            hidDevice = new HID.HID(deviceObj.path);
            hidDevice.write(DATA_REQ);
            hidDevice.pause();
            infoObj = deviceObj
            break;
        } catch {
            hidDevice = infoObj = null
            continue;
        }
    }
    return [hidDevice, infoObj];
}

// [  0    ,  1  ,   2   ,  3  ,  4  ]
// reportId,     ,battery,     ,state
function handle_data([, , battery, , state]) {
    update_console(battery, state)
    update_tray(battery, state)
}

function update_console(battery, state) {
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    let bColor = battery >= 40 ? CON_COLOR.green : CON_COLOR.red,
        sColor = state === 0 || state === 2 ? CON_COLOR.red : CON_COLOR.green;
    process.stdout.write(`\
    \t${bColor}${battery}\t\t\t${sColor}${DEVICE_STATES[state]}${CON_COLOR.default}`);

}

function update_tray(battery, state) {
    let icon, tooltip;
    if (state === 0 || DEVICE_STATES[state] === undefined) { //disconnected
        icon = TRAY_ICONS["default"], tooltip = `${device_info.full_name}: ${DEVICE_STATES[0]}`;
    } else if (state === 5) { // charging (not full)
        icon = TRAY_ICONS["charging"], tooltip = `${device_info.full_name}: ${DEVICE_STATES[state]}`;
    } else {
        icon = TRAY_ICONS[Math.ceil(battery / 10)]
            ?? TRAY_ICONS[Math.ceil(battery / 10 - 1)]
        tooltip = `${device_info.full_name}: ${DEVICE_STATES[state]}\nBattery: ${battery}%`
    }
    tray.update({ icon, tooltip });
}