# 📝 **Change Log of Spectra Log**

**Note:** This changelog includes only **STABLE** versions.

---

## \[v1.3.0] - 2025-05-02

### Changes

* Renamed the method `setDisplayStandby` to `setDisplayStandBy`.
* Performed internal refactoring to improve code maintainability.

---

## \[v1.2.0] - 2025-04-29

### Features

* Added MIT License notification.

### Changes

* Improved the output logic for better reliability.
* Renamed the method `setStandby` to `setDisplayStandby`.
* Significantly enhanced output performance.

### Fixes

* Fixed an issue where excessive color formatting on a single line caused unintended line breaks.
* Fixed an issue where unwanted line breaks occurred in **smooth print** mode when too many ANSI codes were used on a line.

---

## \[v1.1.1] - 2025-04-28

### Features

* Separated the `urgent` option into two distinct options: `urgent` (for immediate output) and `force` (for forced output).

### Changes

* Updated default setting for smooth print(was true, now false).
* Updated default setting for displayStandby(was true, now false).
* Renamed the method `setStandby` to `setDisplayStandby`.

---

## \[v1.1.0] - 2025-04-28

### Features

* Added the `setStandby` method to keep updating the timestamp even after code execution completes.

### Fixes

* Fixed a bug where invalid relative file paths caused runtime errors.

---

## \[v1.0.0] - 2025-04-25

> **NOTE:** This version may contain a known issue that could cause an error.

### Changes

* Added `.gitignore`.
* Published the package to npm.

---

## \[v0.3.7] - 2025-04-25

### Features

* Added `urgent` option to immediately print a message, bypassing queued output.
* Added `setProcessLevel` method to filter logs below a specified importance level.
* Added `setPrintSpeed` method to control character-by-character output speed.

### Changes

* Refactored internal files:

  * Split `log.lib.js` into **core**, **util**, and **config** modules.

---

## \[v0.3.0] - 2025-04-24

### Features

* Added color formatting support for log messages.

---

## \[v0.2.1] - 2025-04-23

### Features

* Added Debug level(Process level) filtering.

---

## \[v0.2.0] - 2025-04-23

### Features

* Added HTTP level filtering.
* Added color palette

---

## \[v0.1.0] - 2025-04-23

### Features

* Added formatted timestamp output.
* Added **smooth print** mode.
