// The native implementations should return their status as ['string':'string']
// dictionaries. Boolean values are encoded to '0' and '1', respectively.
const stringToBool = (string) => {
  switch (string) {
    case "1":
      return true;
    case "0":
      return false;
    default:
      throw new Error(
        "QRScanner plugin returned an invalid boolean number-string: " + string
      );
  }
};

// Converts the returned ['string':'string'] dictionary to a status object.
const convertStatus = (statusDictionary) => ({
  authorized: stringToBool(statusDictionary.authorized),
  denied: stringToBool(statusDictionary.denied),
  restricted: stringToBool(statusDictionary.restricted),
  prepared: stringToBool(statusDictionary.prepared),
  scanning: stringToBool(statusDictionary.scanning),
  previewing: stringToBool(statusDictionary.previewing),
  showing: stringToBool(statusDictionary.showing),
  lightEnabled: stringToBool(statusDictionary.lightEnabled),
  canOpenSettings: stringToBool(statusDictionary.canOpenSettings),
  canEnableLight: stringToBool(statusDictionary.canEnableLight),
  canChangeCamera: stringToBool(statusDictionary.canChangeCamera),
  currentCamera: parseInt(statusDictionary.currentCamera),
});

// Simple utility method to ensure the background is transparent. Used by the
// plugin to force re-rendering immediately after the native webview background
// is made transparent.
const clearBackground = () => {
  const body = document.body;
  if (body.style) {
    body.style.backgroundColor = "rgba(0,0,0,0.01)";
    body.style.backgroundImage = "";
    setTimeout(() => (body.style.backgroundColor = "transparent"), 1);
  }
};

const errorCallback = (callback) => {
  if (!callback) return null;
  return (error) => {
    const errorCode = parseInt(error);
    switch (errorCode) {
      case 0:
        return callback({
          name: "UNEXPECTED_ERROR",
          code: 0,
          _message: "QRScanner experienced an unexpected error.",
        });
      case 1:
        return callback({
          name: "CAMERA_ACCESS_DENIED",
          code: 1,
          _message: "The user denied camera access.",
        });
      case 2:
        return callback({
          name: "CAMERA_ACCESS_RESTRICTED",
          code: 2,
          _message: "Camera access is restricted.",
        });
      case 3:
        return callback({
          name: "BACK_CAMERA_UNAVAILABLE",
          code: 3,
          _message: "The back camera is unavailable.",
        });
      case 4:
        return callback({
          name: "FRONT_CAMERA_UNAVAILABLE",
          code: 4,
          _message: "The front camera is unavailable.",
        });
      case 5:
        return callback({
          name: "CAMERA_UNAVAILABLE",
          code: 5,
          _message: "The camera is unavailable.",
        });
      case 6:
        return callback({
          name: "SCAN_CANCELED",
          code: 6,
          _message: "Scan was canceled.",
        });
      case 7:
        return callback({
          name: "LIGHT_UNAVAILABLE",
          code: 7,
          _message: "The device light is unavailable.",
        });
      case 8:
        return callback({
          name: "OPEN_SETTINGS_UNAVAILABLE",
          code: 8,
          _message: "The device is unable to open settings.",
        });
      default:
        return callback({
          name: "UNEXPECTED_ERROR",
          code: 0,
          _message: "QRScanner returned an invalid error code.",
        });
    }
  };
};

const successCallback = (callback) => {
  if (!callback) return null;
  return (statusDict) => callback(null, convertStatus(statusDict));
};

const doneCallback = (callback, clear) => {
  if (!callback) return null;
  return (statusDict) => {
    if (clear) clearBackground();
    return callback(convertStatus(statusDict));
  };
};

const QRScanner = {
  prepare: (callback) =>
    cordova.exec(
      successCallback(callback),
      errorCallback(callback),
      "QRScanner",
      "prepare",
      []
    ),

  destroy: (callback) =>
    cordova.exec(
      doneCallback(callback, true),
      null,
      "QRScanner",
      "destroy",
      []
    ),

  scan: (callback) => {
    if (!callback) throw new Error("No callback provided to scan method.");
    const success = (result) => callback(null, result);
    cordova.exec(success, errorCallback(callback), "QRScanner", "scan", []);
  },

  cancelScan: (callback) =>
    cordova.exec(doneCallback(callback), null, "QRScanner", "cancelScan", []),

  show: (callback) =>
    cordova.exec(doneCallback(callback, true), null, "QRScanner", "show", []),

  hide: (callback) =>
    cordova.exec(doneCallback(callback, true), null, "QRScanner", "hide", []),

  pausePreview: (callback) =>
    cordova.exec(doneCallback(callback), null, "QRScanner", "pausePreview", []),

  resumePreview: (callback) =>
    cordova.exec(
      doneCallback(callback),
      null,
      "QRScanner",
      "resumePreview",
      []
    ),

  enableLight: (callback) =>
    cordova.exec(
      successCallback(callback),
      errorCallback(callback),
      "QRScanner",
      "enableLight",
      []
    ),

  disableLight: (callback) =>
    cordova.exec(
      successCallback(callback),
      errorCallback(callback),
      "QRScanner",
      "disableLight",
      []
    ),

  useCamera: (index, callback) =>
    cordova.exec(
      successCallback(callback),
      errorCallback(callback),
      "QRScanner",
      "useCamera",
      [index]
    ),

  useFrontCamera: (callback) => window.QRScanner.useCamera(1, callback),

  useBackCamera: (callback) => window.QRScanner.useCamera(0, callback),

  openSettings: (callback) =>
    cordova.exec(
      successCallback(callback),
      errorCallback(callback),
      "QRScanner",
      "openSettings",
      []
    ),

  getStatus: (callback) => {
    if (!callback) throw new Error("No callback provided to getStatus method.");
    cordova.exec(doneCallback(callback), null, "QRScanner", "getStatus", []);
  },
};

window.QRScanner = QRScanner;

export default QRScanner;
