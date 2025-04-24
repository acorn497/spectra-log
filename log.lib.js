import colors from 'ansi-colors';

let smoothPrint = true;
let interval = 5;
let processLevel = 2;

let isProcessing = false;
let isStandbyActive = false;
const messageQueue = [];

// --- Define custom colors with color codes ---

const defineColor = (code) => {
  const colorFn = (text) => `\u001b[38;5;${code}m${text}\u001b[0m`;
  colorFn.colorCode = code;
  return colorFn;
};

colors.red = defineColor(196);
colors.green = defineColor(82);
colors.blue = defineColor(33);
colors.brightCyan = defineColor(116);
colors.cyan = defineColor(51);
colors.muteCyan = defineColor(67);
colors.white = defineColor(255);
colors.gray = defineColor(245);
colors.dim = defineColor(240);
colors.orange = defineColor(202);

const addStyleMethod = (colorFn, styleName, styleCode) => {
  colorFn[styleName] = text => {
    return `\u001b[38;5;${colorFn.colorCode}m${styleCode}${text}\u001b[0m`;
  };
};

Object.keys(colors).forEach(color => {
  if (typeof colors[color] === 'function' && colors[color].colorCode) {
    addStyleMethod(colors[color], 'bold', '\u001b[1m');
    addStyleMethod(colors[color], 'dim', '\u001b[2m');
    addStyleMethod(colors[color], 'italic', '\u001b[3m');
    addStyleMethod(colors[color], 'underline', '\u001b[4m');
  }
});

// --- Message Type and Level Metadata ---

const LEVEL_TYPES = {
  FATAL: { levelLabel: 'FATAL', color: colors.red.bold },
  ERROR: { levelLabel: 'ERROR', color: colors.orange.bold },
  INFO: { levelLabel: 'INFO', color: colors.yellow.bold },
  DEBUG: { levelLabel: 'DEBUG', color: colors.brightCyan.bold },
  TRACE: { levelLabel: 'TRACE', color: colors.muteCyan.bold },

  default: { levelLabel: 'NOTLVL', color: colors.red.bold }
};

const HTTP_MESSAGE_TYPES = {
  100: { httpLabel: 'CONTINUE', color: colors.dim },
  101: { httpLabel: 'SWITCHING', color: colors.dim },

  200: { httpLabel: 'OK', color: colors.green },
  201: { httpLabel: 'CREATED', color: colors.green },
  202: { httpLabel: 'ACCEPTED', color: colors.cyan },
  204: { httpLabel: 'NO-CONTENT', color: colors.gray },

  301: { httpLabel: 'MOVED', color: colors.yellow },
  302: { httpLabel: 'FOUND', color: colors.yellow },
  304: { httpLabel: 'NOT-MODIFIED', color: colors.gray },

  400: { httpLabel: 'BAD-REQUEST', color: colors.orange },
  401: { httpLabel: 'UNAUTHZED', color: colors.orange },
  402: { httpLabel: 'PAY-REQUEST', color: colors.orange },
  403: { httpLabel: 'FORBIDDEN', color: colors.red },
  404: { httpLabel: 'NOT-FOUND', color: colors.red },
  405: { httpLabel: 'NO-METHOD', color: colors.orange },
  408: { httpLabel: 'TIMEOUT', color: colors.orange },
  409: { httpLabel: 'CONFLICT', color: colors.orange },
  410: { httpLabel: 'GONE', color: colors.orange },
  429: { httpLabel: 'TOO-MANY', color: colors.orange },

  500: { httpLabel: 'SERVER-ERROR', color: colors.red },
  502: { httpLabel: 'BAD-GATEWAY', color: colors.red },
  503: { httpLabel: 'SERVER-NAVAL', color: colors.red },
  504: { httpLabel: 'GW-TIMEOUT', color: colors.red },

  600: { httpLabel: 'SERVER-START', color: colors.yellow },

  default: { httpLabel: 'UNKNOWN', color: colors.dim }
};

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
    return match[0]; // 시작 위치에 있는 ANSI 코드만 감지
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
        i += ansi.length; // ANSI 코드 길이만큼 점프
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
    message = colorizeString(message);  // 💡 수정됨!
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