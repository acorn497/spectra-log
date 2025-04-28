# 🌈 SpectraLog

> Lightweight, colorful, and expressive terminal logging

**SpectraLog** transforms boring console logs into **vibrant**, **stylish** output that improves readability and makes your application logs more expressive. With customizable log levels, smooth printing animation, and rich text formatting, SpectraLog brings your terminal to life.

![npm version](https://img.shields.io/badge/npm-v11.3.0-blue) ![license](https://img.shields.io/badge/license-MIT-green)

## 📋 Table of Contents
- [Installation](#-installation)
- [Quick Start](#-quick-start)
- [Style and Color Syntax](#-style-and-color-syntax)
- [Log Levels](#-log-levels)
- [Log Method Parameters](#-log-method-parameters)
- [HTTP Status Code Support](#http-status-code-support)
- [Configuration](#️-configuration)
- [Queue Management](#-queue-management)
- [Standby Indicator](#-standby-indicator)
- [Complete Example](#-complete-example)
- [License](#-license)

## 📦 Installation

```bash
npm install spectra-log
```

## ✨ Quick Start

```javascript
const log = require('spectra-log');

// Simple log message
log("This is a standard log message");

// Styled log message with inline formatting
log("This is a {{ bold : blue : styled }} message");

// Error message with color
log("Error occurred: {{ red : Something went wrong! }}", 500, "ERROR");
```

> Whitespace between colons is optional. For example: `{{bold:green:text}}` or `{{ bold : green : text }}` are both valid.

## 📝 Style and Color Syntax

SpectraLog provides a powerful and intuitive syntax for styling your logs:

```javascript
log("Text {{ style : color : content }} more text");
```

### Style Options
- `bold` - Make text bold
- `italic` - Make text italic
- `underline` - Add underline to text

### Color Options
Any CSS-valid color or these predefined colors:
- `red`, `orange`, `yellow`, `green`, `blue`, `cyan`, `magenta`, `white`, `gray`

### Examples

```javascript
// Highlight important information
log("User {{ bold : green : successfully }} logged in");

// Emphasize warnings
log("Please note: {{ italic : yellow : This feature is experimental }}");

// Mark important segments
log("Critical config: {{ underline : cyan : database.json }}");

// Multiple styles in one message
log("Status: {{ bold : green : ONLINE }} - {{ italic : yellow : 3 pending tasks }}");
```

## 🔄 Log Levels

SpectraLog uses familiar log levels with appropriate colors:

| Level  | Color   | Purpose                   |
|--------|---------|---------------------------|
| TRACE  | Gray    | Fine-grained details      |
| DEBUG  | Cyan    | Debugging information     |
| INFO   | Yellow  | Standard information      |
| ERROR  | Red     | Error conditions          |
| FATAL  | Magenta | Critical system failures  |
| MUTE   | None    | Suppresses all logging    |

```javascript
// Set minimum display level
log.setDebugLevel('DEBUG');  // Only shows DEBUG and higher priority

// Full log with level
log("Server started on port 3000", 600, "INFO");
log("Connection failed", 500, "ERROR");
```

## 📤 Log Method Parameters

```javascript
log(message, type, level, options);
```

| Parameter | Type     | Description                                      | Default  |
|-----------|----------|--------------------------------------------------|----------|
| `message` | `string` | Text to display                                  | Required |
| `type`    | `number` | HTTP-style or custom numeric tag                 | `200`    |
| `level`   | `string` | Log level (INFO, DEBUG, ERROR, etc.)             | `"INFO"` |
| `options` | `object` | `{ urgent: boolean }` - Set true to bypass queue, { always-print: boolean } - set true to output regardless of debug level | `{}`     |

## HTTP Status Code Support

SpectraLog includes built-in support for HTTP status codes with appropriate colors and labels for each code. This feature makes it easy to log HTTP-related events with consistent formatting.

### Usage

When logging, you can pass an HTTP status code as the second parameter:

```javascript
const log = require('spectra-log');

// Log with HTTP status codes
log("User authentication successful", 200);               // Green "OK" tag
log("Redirect to login page", 302);                       // Yellow "FOUND" tag
log("Resource not found", 404, "ERROR");                  // Red "NOT-FOUND" tag
log("Internal server error", 500, "FATAL");               // Red "SERVER-ERROR" tag
```

### Supported HTTP Status Codes

#### 1xx Informational
| Code | Label      | Color   | Description              |
|------|------------|---------|--------------------------|
| 100  | CONTINUE   | Dim     | Continue with request    |
| 101  | SWITCHING  | Dim     | Switching protocols      |

#### 2xx Success
| Code | Label      | Color   | Description              |
|------|------------|---------|--------------------------|
| 200  | OK         | Green   | Request succeeded        |
| 201  | CREATED    | Green   | Resource created         |
| 202  | ACCEPTED   | Cyan    | Request accepted         |
| 204  | NO-CONTENT | Gray    | No content to return     |

#### 3xx Redirection
| Code | Label        | Color   | Description              |
|------|--------------|---------|--------------------------|
| 301  | MOVED        | Yellow  | Moved permanently        |
| 302  | FOUND        | Yellow  | Found (temporary redirect)|
| 304  | NOT-MODIFIED | Gray    | Not modified since       |

#### 4xx Client Errors
| Code | Label        | Color   | Description              |
|------|--------------|---------|--------------------------|
| 400  | BAD-REQUEST  | Orange  | Bad request              |
| 401  | UNAUTHZED    | Orange  | Unauthorized             |
| 402  | PAY-REQUEST  | Orange  | Payment required         |
| 403  | FORBIDDEN    | Red     | Forbidden                |
| 404  | NOT-FOUND    | Red     | Not found                |
| 405  | NO-METHOD    | Orange  | Method not allowed       |
| 408  | TIMEOUT      | Orange  | Request timeout          |
| 409  | CONFLICT     | Orange  | Conflict                 |
| 410  | GONE         | Orange  | Gone                     |
| 429  | TOO-MANY     | Orange  | Too many requests        |

#### 5xx Server Errors
| Code | Label        | Color   | Description              |
|------|--------------|---------|--------------------------|
| 500  | SERVER-ERROR | Red     | Internal server error    |
| 502  | BAD-GATEWAY  | Red     | Bad gateway              |
| 503  | SERVER-NAVAL | Red     | Service unavailable      |
| 504  | GW-TIMEOUT   | Red     | Gateway timeout          |

#### Custom Codes
| Code | Label        | Color   | Description              |
|------|--------------|---------|--------------------------|
| 600  | SERVER-START | Yellow  | Server startup (custom)  |

#### Default
If an unrecognized status code is provided, the logger will use:
| Label   | Color | Description              |
|---------|-------|--------------------------|
| UNKNOWN | Dim   | Unknown status code      |

## 🛠️ Configuration

### Set Debug Level
Control which log levels are displayed:

```javascript
// Only show ERROR and FATAL logs
log.setDebugLevel('ERROR');

// Silently update level (no confirmation message)
log.setDebugLevel('MUTE', { silent: true });
```

### Smooth Printing
Enable typewriter-like animation for logs:

```javascript
// Enable smooth printing animation
log.setSmoothPrint(true);

// Set animation speed (ms per character)
log.setPrintSpeed(10);
```

## 🔁 Queue Management

Logs are processed in order by default, unless marked urgent:

```javascript
// Normal queued log
log("This will print in queue order", 200, "INFO");

// Urgent log that jumps the queue
log("This prints immediately!", 500, "ERROR", { urgent: true });
```

## 🌙 Standby Indicator

When idle, SpectraLog displays a standby indicator that updates every second:
```
[ STBY   | -            | 21:00:00 ]
```

## 🧩 Complete Example

```javascript
const log = require('spectra-log');

// Configure logger
log.setDebugLevel('DEBUG');
log.setSmoothPrint(true);
log.setPrintSpeed(5);

// Information with styled content
log("Welcome to {{ bold : green : SpectraLog }}!");

// Error with status code
log("{{ bold : red : Not Found }}", 404, "ERROR");

// Debug message with custom type
log("This is a {{ italic : cyan : debug }} message", 103, "DEBUG");

// Urgent fatal error that bypasses queue
log("🚨 {{ bold : magenta : Critical system failure }}", 500, "FATAL", { urgent: true });
```

## 📜 License

MIT License  
2025 Copyright © [acorn497](https://github.com/acorn497)