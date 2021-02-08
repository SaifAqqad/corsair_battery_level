const HID = require('node-hid'),
    DATA_REQ = [0xC9, 0x64],
    CORSAIR_VID = 0x1B1C,
    KNOWN_PIDS = {
        0x0A38: "HS70 Wireless",
        0x0A4F: "HS70 PRO Wireless",
        0x0A14: "VOID PRO Wireless"
    },
    DEVICE_STATES = {
        0: "Disconnected",
        1: "Connected",
        4: "Fully charged",
        5: "Charging"
    },
    CON_COLOR = {
        default: "\x1b[0m",
        red: "\x1b[31m",
        green: "\x1b[32m"
    };

init();

function init() {
    let [hidDevice, infoObj] = get_device();
    if (!hidDevice) {
        console.error("could not find a device");
        process.exit(1);
    }
    hidDevice.setNonBlocking(1);
    hidDevice.on('data', handle_data);
    process.stdout.write(`Found Device: ${infoObj.manufacturer} ${KNOWN_PIDS[infoObj.productId]}\n`)
    process.stdout.write(`\tBattery level\t\tCurrent state\n`);
    hidDevice.resume();
}

function get_device() {
    let dList = HID.devices(),
        hidDevice, infoObj;

    for (let deviceObj of dList) {
        hidDevice = infoObj = null
        if (deviceObj.vendorId !== CORSAIR_VID || KNOWN_PIDS[deviceObj.productId] === undefined)
            continue;
        try {
            hidDevice = new HID.HID(deviceObj.path);
            hidDevice.write(DATA_REQ);
            hidDevice.pause();
            infoObj = deviceObj
            break;
        } catch {
            continue;
        }
    }
    return [hidDevice, infoObj];
}


function handle_data(data) {
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    let bColor = data[2] >= 40 ? CON_COLOR.green : CON_COLOR.red,
        sColor = data[4] !== 0 ? CON_COLOR.green : CON_COLOR.red;
    process.stdout.write(`\
    \t${bColor}${data[2]}\t\t\t${sColor}${DEVICE_STATES[data[4]]}${CON_COLOR.default}`);
}
