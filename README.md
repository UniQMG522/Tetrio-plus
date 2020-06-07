# Tetrio plus
Tetr.io block skin, music, and sfx customizer

## Warnings
* **This software is not associated with or created by Tetr.io or osk**
* **This is provided AS-IS, it's not terribly polished, its not particularly
extensively tested, and it's not packaged into a proper extension.**
* **This can break your game. If your game fails to load or you encounter other
bugs, remove the extension and try again *before* reporting it**
* Chromium-based browsers are not supported as [they lack](https://bugs.chromium.org/p/chromium/issues/detail?id=487422) an [important API](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/webRequest/filterResponseData) used by this project.

## Electron packaging instructions

These are instructions for *packaging electron releases*. If you just want to install tetrio-plus, download an `app.asar` from the releases page and replace the existing `app.asar` file in your tetrio install directory (`C:\\Users\\%CURRENTUSER%\\AppData\\Local\\Programs\\tetrio-desktop\\resources\app.asar` on windows).

- `cd resources`
- Unpack the asar with `asar extract app.asar out`
- Clone tetrio+ into `out/tetrioplus`
- Modify main.js like so:
```javascript
// At the top of the file
const onMainWindow = require('./tetrioplus/source/electron/electron-main');

// In new BrowserWindow()
webPreferences: {
  ...,
  preload: require('path').join(
    __dirname,
    './tetrioplus/source/electron/preload.js'
  )
}

// At the end of createWindow()
onMainWindow(mainWindow);
```
- Repack the asar file: `asar pack out app.asar`
- Distribute the asar file!

## Directory structure
Tetrio plus is designed to be loaded in two contexts: As a firefox extension, and as a native modification for the desktop client.

### source/bootstrap/browser
Contains general purpose *extension background* scripts for bootstrapping other scripts that are executed in the extension sandbox.

### source/bootstrap/electron
Contains general purpose scripts for bootstrapping other scripts that are executed in a custom (non-secure) sandbox.

### source/electron
Contains scripts that are used in various contexts in the electron client.

**electron-main.js**: Exports a callback that should be called with the main window as an argument from the main electron process.
**electron-browser-polyfill.js**: Used to polyfill the firefox extension API. Used when loading filters, in the preload script, and in various extension pages.
**preload.js**: Used as an electron preload script in the tetrio window. Mainly responsible for loading content scripts.

### source/filters
Contains filters that modify incoming requests. Bootstrapped by background or electron scripts.

### source/content
Contains content scripts and stylesheets that are sandboxed with access to the tetrio DOM

### source/injected
Contains scripts that are loaded directly into the page via <script>

### source/lib
Contains various libraries for panels and popups

### source/panels
Code for various windows

### source/popup
Code for the main extension popup
