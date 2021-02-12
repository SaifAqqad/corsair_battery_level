# Corsair Battery Level
Displays the current state and battery level of a Corsair headset and adds a tray icon on the task bar.

It should work with most corsair headsets.

![](https://user-images.githubusercontent.com/47293197/107494250-3c401b00-6b97-11eb-902e-2fbc47553d89.png)

## Requirments:
* Windows 10 (64 bit)
* Node (and npm)
* git

##### just install [scoop](https://scoop.sh) and run `scoop install git nodejs-lts`

## Usage 
1. Clone the repository
    ```powershell
        git clone https://github.com/SaifAqqad/corsair_battery_level.git
    ```
2. Run npm install
    ```powershell
        cd .\corsair_battery_level
        npm install
    ```
3. Run index.js
    ```powershell
        node .\index.js
    ```

## Running without a console window
To run it without the console window appearing, launch `app.vbs` instead of running node directly.

you can also add a shortcut to `app.vbs` in `C:\Users\saifo\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Startup\` to run it on startup with the tray icon only.

##

This is just an attempt to rewrite a version of [mx0c/Corsair-Void-Pro-Battery-Overlay](https://github.com/mx0c/Corsair-Void-Pro-Battery-Overlay) in node, mostly as an exercise. so all credits to them.
