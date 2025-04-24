import colors from './logger/node_modules/ansi-colors/types';

let smoothPrint = true;
let interval = 5;
let processLevel = 2;

let isProcessing = false;
let isStandbyActive = false;
const messageQueue = [];

// --- Define custom colors with color codes ---

// --- Message Type and Level Metadata ---

const stripAnsi = (str) => str.replace(/\x1b\[[0-9;]*m/g, '');
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getProcessLevel = (levelLabel) => {
  switch (levelLabel) {
    case 'MUTE': return -1;
    case 'FATAL': return 0;
    case 'ERROR': return 1;
    case 'INFO': return 2;
    case 'DEBUG': return 3;
    case 'TRACE': return 4;
    default: return 5;
  }
}

// --- Formatting Helpers ---

const getFormattedTime = (timestamp) => {
  const time = new Date(timestamp);
  return `${String(time.getHours()).padStart(2, '0')}:${String(time.getMinutes()).padStart(2, '0')}:${String(time.getSeconds()).padStart(2, '0')}`;
};

const getPrefix = (type, level, timestamp) => {
  const { levelLabel, color: levelColor } = LEVEL_TYPES[level] || LEVEL_TYPES.default;
  const { httpLabel, color: typeColor } = HTTP_MESSAGE_TYPES[type] || HTTP_MESSAGE_TYPES.default;

  const shortLabel = levelLabel.substring(0, 2);
  const fullLabel = shortLabel + levelLabel.substring(2);

  return `[ ${levelColor(fullLabel.padEnd(6))} | ${typeColor(httpLabel.padEnd(12))} | ${getFormattedTime(timestamp)} ] | `;
};

const formatMultiline = (lines, prefix, maxWidth = Math.floor(process.stdout.columns * 0.9) || 80) => {
  const visualPrefixLength = stripAnsi(prefix).length;
  const linePad = ' '.repeat(26) + '| ';
  const formatted = [];

  lines.forEach((line, i) => {
    const availWidth = maxWidth - (i === 0 ? visualPrefixLength : 28);
    const chunks = line.match(new RegExp(`.{1,${availWidth}}`, 'g')) || [''];
    chunks.forEach((chunk, j) => {
      const linePrefix = (i === 0 && j === 0) ? prefix : linePad;
      formatted.push(`${linePrefix}${chunk}`);
    });
  });

  return formatted.join('\n');
};

// --- Smooth Printing Logic ---

const matchAnsiCode = (str) => {
  const match = str.match(/\u001b\[[0-9;]*m/);
  if (match && match.index === 0) {
    return match[0];
  }
  return null;
};

const printLineSmooth = async (line, currentPrefix, terminalWidth) => {
  const avail = terminalWidth - stripAnsi(currentPrefix).length;
  const chunks = [line.slice(0, avail), ...(line.slice(avail).match(new RegExp(`.{1,${terminalWidth - 28}}`, 'g')) || [])];

  for (const chunk of chunks) {
    process.stdout.write(`\r${currentPrefix}`);

    for (let i = 0; i < chunk.length;) {
      const remaining = chunk.slice(i);
      const ansi = matchAnsiCode(remaining);

      if (ansi) {
        process.stdout.write(ansi);
        i += ansi.length; 
        continue;
      }

      process.stdout.write(chunk[i]);
      await sleep(interval);
      i += 1;
    }

    console.log();
    currentPrefix = ' '.repeat(36) + ' | ';
  }
};

const printSmooth = async (prefix, lines) => {
  const terminalWidth = Math.floor(process.stdout.columns * 0.9) || 80;
  await printLineSmooth(lines[0], prefix, terminalWidth);
  for (let i = 1; i < lines.length; i++) {
    await printLineSmooth(lines[i], ' '.repeat(36) + ' | ', terminalWidth);
  }
};

// --- Main Logging Logic ---

const printMessage = async (message, type, level, timestamp) => {
  const prefix = getPrefix(type, level, timestamp);
  const str = typeof message === 'object' ? JSON.stringify(message, null, 2) || '[Unserializable Object]' : String(message);
  const lines = str.split('\n');

  if (smoothPrint && lines.length > 0) {
    await printSmooth(prefix, lines);
  } else {
    process.stdout.write(`\r${formatMultiline(lines, prefix)}\n`);
  }
};

const processQueue = async () => {
  if (isProcessing || messageQueue.length === 0) return;

  stopStandbyLog();
  isProcessing = true;

  const { message, type, level, timestamp } = messageQueue.shift();
  await printMessage(message, type, level, timestamp);

  isProcessing = false;
  messageQueue.length === 0 ? startStandbyLog() : processQueue();
};

const colorizeString = (message) => {
  const regex = /\{\{\s*(?:(\w+)\s*:\s*)?(\w+)\s*:\s*([^\}]+?)\s*\}\}/g;

  return message.replace(regex, (match, style, color, text) => {
    style = style?.toLowerCase();
    color = color.toLowerCase();
    const colorFn = colors[color] || colors.dim;

    if (style && typeof colorFn[style] === 'function') {
      return colorFn[style](text);
    }

    return colorFn(text);
  });
};

export default function log(message, type = 200, level = 'INFO', option = {}) {
  if (processLevel >= getProcessLevel(level)) {
    const { urgent = false } = option;
    message = colorizeString(message);
    if (!urgent) messageQueue.push({ message, type, level, timestamp: Date.now() });
    else messageQueue.unshift({ message, type, level, timestamp: Date.now() })
    processQueue();
  }
}

// --- Standby Output ---

const startStandbyLog = () => {
  if (isStandbyActive) return;
  isStandbyActive = true;

  (async function standbyLoop() {
    while (isStandbyActive) {
      const prefix = getPrefix(0, 'INFO', Date.now()).replace(
        /\[.*?\]/,
        `[ ${colors.yellow.bold('STBY')}   | -            | ${getFormattedTime(Date.now())} ]`
      );
      process.stdout.write(`\r${prefix}`);
      await sleep(1000);
    }
  })();
};

const stopStandbyLog = () => {
  isStandbyActive = false;
};

// --- Configuration Functions ---

log.setDebugLevel = (level, options = {}) => {
  const { silent = false } = options;

  processLevel = getProcessLevel(level);
  silentHandler(silent, `{{ bold : yellow : Debug level }} has been changed to {{ bold : ${LEVEL_TYPES[getProcessLevel(level)]} : ${level} }}.`);
}

log.setPrintSpeed = (delay, options = {}) => {
  const { silent = false } = options;

  interval = delay;
  silentHandler(silent, `{{ bold : yellow : Smooth process level }} has been set to {{ bold : green : ${interval}ms Per Character }}.`);
}

log.setSmoothPrint = (value, options = {}) => {
  const { silent = false } = options;

  smoothPrint = value;
  silentHandler(silent, `{{ bold : yellow : Smooth print }} mode has been {{ bold : ${smoothPrint ? "green : ACTIVATED" : "red : DEACTIVATED"} }}.`);
}

const silentHandler = (silent, message) => {
  if (!silent) {
    log(message, 202, 'INFO', { urgent: true });
    processQueue();
  }
}