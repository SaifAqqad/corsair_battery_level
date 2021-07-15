require('node-hide-console-window').hideConsole();
const HID = require('node-hid'),
    SysTray = require('systray2').default,
    path = require('path'),
    DATA_REQ = [0xC9, 0x64],
    CORSAIR_VID = 0x1B1C,
    KNOWN_PIDS = {
        0x0A38: "HS70 Wireless",
        0x0A4F: "HS70 PRO Wireless",
        0x1B27: "VOID Wireless",
        0x0A2B: "VOID Wireless",
        0x0A14: "VOID PRO Wireless",
        0x0A16: "VOID PRO Wireless",
        0x0A1A: "VOID PRO Wireless",
        0x0A55: "VOID ELITE Wireless",
        0x0A51: "VOID ELITE Wireless",
        0x0A3E: "Virtuoso RGB Wireless",
        0x0A40: "Virtuoso RGB Wireless",
        0x0A42: "Virtuoso RGB Wireless",
        0x0A44: "Virtuoso RGB Wireless",
        0x0A5C: "Virtuoso RGB Wireless",
        0x0A64: "Virtuoso RGB Wireless",
    },
    DEVICE_STATES = {
        0: "Disconnected",
        1: "Connected",
        2: "Low battery",
        4: "Fully charged",
        5: "Charging"
    },
    TRAY_ICONS = {
        default: path.join(__dirname, "icons/headphones.ico"),
        charging: path.join(__dirname, "icons/battery-charging.ico"),
        10: path.join(__dirname, "icons/battery-wireless.ico"),
        9: path.join(__dirname, "icons/battery-wireless-90.ico"),
        8: path.join(__dirname, "icons/battery-wireless-80.ico"),
        7: path.join(__dirname, "icons/battery-wireless-70.ico"),
        6: path.join(__dirname, "icons/battery-wireless-60.ico"),
        5: path.join(__dirname, "icons/battery-wireless-50.ico"),
        4: path.join(__dirname, "icons/battery-wireless-40.ico"),
        3: path.join(__dirname, "icons/battery-wireless-30.ico"),
        2: path.join(__dirname, "icons/battery-wireless-20.ico"),
        1: path.join(__dirname, "icons/battery-wireless-10.ico"),
        0: path.join(__dirname, "icons/battery-wireless-0.ico"),
    },
    MENU_ITEMS = [
        {
            title: "Refresh device",
            tooltip: "Refresh device",
            checked: false,
            enabled: true,
            click: init_device
        },
        {
            title: "Exit",
            tooltip: "Exit",
            checked: false,
            enabled: true,
            click: () => {
                tray.kill(false);
                process.exit(0);
            }
        }
    ],
    TRAY_OPTIONS = {
        menu: {
            icon: TRAY_ICONS["default"],
            title: "Corsair battery level",
            tooltip: "No device found",
            items: MENU_ITEMS
        },
        debug: false,
        copyDir: true
    },
    VOID_BATTERY_MICUP = 128,
    tray = new SysTray(TRAY_OPTIONS);
tray.onClick(event => {
    if (event.item.click != null) {
        event.item.click();
    }
})
let device_info = device_hid = null;
tray.ready().then(init_device);

function init_device() {
    [device_hid, device_info] = get_HID();
    if (!device_hid) {
        reset_tray();
        return;
    }
    device_info.full_name = `${device_info.manufacturer} ${KNOWN_PIDS[device_info.productId]}`;
    device_hid.setNonBlocking(1);
    device_hid.on('data', update_tray);
    device_hid.on('error', () => {
        reset_tray();
        device_info = device_hid = null;
    });
    device_hid.resume();
}

function get_HID() {
    let dList = HID.devices(), hidDevice, infoObj;
    for (let deviceObj of dList) {
        if (deviceObj.vendorId !== CORSAIR_VID || KNOWN_PIDS[deviceObj.productId] === undefined)
            continue;
        try {
            hidDevice = new HID.HID(deviceObj.path);
            hidDevice.write(DATA_REQ);
            hidDevice.pause();
            infoObj = deviceObj;
            break;
        } catch {
            hidDevice = infoObj = null;
            continue;
        }
    }
    return [hidDevice, infoObj];
}

function update_tray([, , battery, , state]) {
    if (battery > VOID_BATTERY_MICUP) {
        battery = battery - VOID_BATTERY_MICUP;
    }
    let icon, tooltip;
    if (state === 0 || DEVICE_STATES[state] === undefined) { //disconnected
        icon = TRAY_ICONS["default"];
        tooltip = `${device_info.full_name}: ${DEVICE_STATES[0]}`;
    } else if (state === 5) { // charging (not full)
        icon = TRAY_ICONS["charging"];
        tooltip = `${device_info.full_name}: ${DEVICE_STATES[state]}`;
    } else {
        icon = TRAY_ICONS[Math.floor(battery / 10)];
        tooltip = `${device_info.full_name}: ${DEVICE_STATES[state]} (${battery}%)`;
    }
    tray.sendAction({
        type: 'update-menu',
        menu: {
            icon,
            tooltip,
            title: tooltip,
            items: MENU_ITEMS
        }
    });
}

function reset_tray() {
    tray.sendAction({
        type: 'update-menu',
        menu: {
            icon: TRAY_ICONS["default"],
            title: "Corsair battery level",
            tooltip: "No device found",
            items: MENU_ITEMS
        }
    });
}
