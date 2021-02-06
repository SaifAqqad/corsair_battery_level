import { NotifyIcon, Icon, Menu } from "not-the-systray";
const HID = require('node-hid'),
    CORSAIR_VID = 0x1B1C,
    KNOWN_PIDS = {
        0x0A38: "hs70"
    },
    DEVICE_STATES = {
        0: "Disconnected",
        1: "Connected",
        4: "Fully charged",
        5: "Charging"
    };

init();

function init() {
    let hidDevice = get_device();
    if (!hidDevice) {
        console.error("could not find a device");
        process.exit(1);
    }
    hidDevice.setNonBlocking(1);
    hidDevice.on('data', handle_data);
    process.stdout.write(`\tBattery level\t\tCurrent state\n`);
    hidDevice.resume();
}

function get_device() {
    let dList = HID.devices()
        , hidDevice = null;

    for (let deviceObj of dList) {
        if (deviceObj.vendorId !== CORSAIR_VID || KNOWN_PIDS[deviceObj.productId] === undefined)
            continue;
        try {
            hidDevice = new HID.HID(deviceObj.path);
            hidDevice.write([0xC9, 0x64]);
            hidDevice.pause();
            break;
        } catch {
            continue;
        }
    }
    return hidDevice;
}


function handle_data(data) {
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    process.stdout.write(`\
    \t${data[2]}\t\t\t${DEVICE_STATES[data[4]]}`);
}