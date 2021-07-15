# Corsair Battery Level
Displays the current state and battery level of a Corsair headset as a tray icon on the task bar.

It should work with most corsair headsets.

![](https://user-images.githubusercontent.com/47293197/107494250-3c401b00-6b97-11eb-902e-2fbc47553d89.png)

## Usage 
You can either download the [latest build](https://github.com/SaifAqqad/corsair_battery_level/releases/latest/) and run it, or if you have node installed. you can clone the repo, run `npm i` then `node app.js`

## Build instructions
1. Install [pkg](https://github.com/vercel/pkg): `npm i -g pkg`

2. Run `pkg .`

## Dependencies:
* [node-hid](https://github.com/node-hid/node-hid)
* [node-hide-console-window](https://github.com/hetrodoo/hetrodo-node-hide-console-window-napi)
* [systray2](https://github.com/felixhao28/node-systray)

##

This is just an attempt to rewrite a version of [mx0c/Corsair-Void-Pro-Battery-Overlay](https://github.com/mx0c/Corsair-Void-Pro-Battery-Overlay) in node, mostly as an exercise. so all credits to them.
