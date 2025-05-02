# Change Log of Spectra Log

## [v1.3.0] Minor - 2025-05-02
### Changes
- Changed method name `setDisplayStandby` to `setDisplayStandBy`.
- Internal refactoring to improve code maintainability.

## [v1.2.0] Minor - 2025-04-29
### Features
- Added a Change Log.
- Added the `setDisplayStandby` method, which continues to update the time even after the code execution is completed.

### Changes
- Significantly improved the output performance.

### Fixes
- Fixed an issue where unwanted line breaks occurred when there were excessive ANSI codes in a single line while the smooth print mode was active.