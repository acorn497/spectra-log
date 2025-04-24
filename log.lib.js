import colors from 'ansi-colors';

let smoothPrint = true;
let interval = 0;
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
colors.yellow = defineColor(220);  // Added yellow definition

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
  FATAL:   { levelLabel: 'FATAL',  color: colors.red.bold },
  ERROR:   { levelLabel: 'ERROR',  color: colors.orange.bold },
  INFO:    { levelLabel: 'INFO',   color: colors.yellow.bold },  
  DEBUG:   { levelLabel: 'DEBUG',  color: colors.brightCyan.bold },  
  TRACE:   { levelLabel: 'TRACE',  color: colors.muteCyan.bold },

  default: { levelLabel: 'NOTLVL', color: colors.red.bold }
};

const HTTP_MESSAGE_TYPES = {
  100: { httpLabel: 'CONTINUE',     color: colors.dim },
  101: { httpLabel: 'SWITCHING',    color: colors.dim },

  200: { httpLabel: 'OK',           color: colors.green },
  201: { httpLabel: 'CREATED',      color: colors.green },
  202: { httpLabel: 'ACCEPTED',     color: colors.cyan },
  204: { httpLabel: 'NO-CONTENT',   color: colors.gray },

  301: { httpLabel: 'MOVED',        color: colors.yellow },
  302: { httpLabel: 'FOUND',        color: colors.yellow },
  304: { httpLabel: 'NOT-MODIFIED', color: colors.gray },

  400: { httpLabel: 'BAD-REQUEST',  color: colors.orange },
  401: { httpLabel: 'UNAUTHZED',    color: colors.orange },
  402: { httpLabel: 'PAY-REQUEST',  color: colors.orange },
  403: { httpLabel: 'FORBIDDEN',    color: colors.red },
  404: { httpLabel: 'NOT-FOUND',    color: colors.red },
  405: { httpLabel: 'NO-METHOD',    color: colors.orange },
  408: { httpLabel: 'TIMEOUT',      color: colors.orange },
  409: { httpLabel: 'CONFLICT',     color: colors.orange },
  410: { httpLabel: 'GONE',         color: colors.orange },
  429: { httpLabel: 'TOO-MANY',     color: colors.orange },

  500: { httpLabel: 'SERVER-ERROR', color: colors.red },
  502: { httpLabel: 'BAD-GATEWAY',  color: colors.red },
  503: { httpLabel: 'SERVER-NAVAL', color: colors.red },
  504: { httpLabel: 'GW-TIMEOUT',   color: colors.red },

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

// --- Parse colored message syntax ---
// New function to parse color tags in messages
const parseColoredMessage = (message) => {
  if (typeof message !== 'string') {
    return message;
  }
  
  // Match patterns like {{color:text}} or {{color.style:text}}
  return message.replace(/{{(\w+)(\.(\w+))?:(.*?)}}/g, (match, color, _, style, text) => {
    if (!colors[color]) return text; // If color doesn't exist, return just the text
    
    if (style && colors[color][style]) {
      return colors[color][style](text);
    } else {
      return colors[color](text);
    }
  });
};

const formatMultiline = (lines, prefix, maxWidth = Math.floor(process.stdout.columns * 0.9) || 80) => {
  const visualPrefixLength = stripAnsi(prefix).length;
  const linePad = ' '.repeat(26) + '| ';
  const formatted = [];

  lines.forEach((line, i) => {
    const availWidth = maxWidth - (i === 0 ? visualPrefixLength : 28);
    // Don't split ANSI color codes when wrapping text
    const processedLine = parseColoredMessage(line);
    const strippedLine = stripAnsi(processedLine);
    
    // Handle wrapping with consideration for color codes
    if (strippedLine.length <= availWidth) {
      formatted.push(`${i === 0 ? prefix : linePad}${processedLine}`);
    } else {
      // For colored text that needs wrapping, we need a more sophisticated approach
      let currentLine = '';
      let currentStripped = '';
      let remainingProcessed = processedLine;
      let remainingStripped = strippedLine;
      
      while (remainingStripped.length > 0) {
        const nextChar = remainingProcessed[0];
        const nextStrippedChar = remainingStripped[0];
        
        currentLine += nextChar;
        if (nextChar !== nextStrippedChar) {
          // This is part of a color code, don't count against width
        } else {
          currentStripped += nextStrippedChar;
          if (currentStripped.length >= availWidth) {
            formatted.push(`${formatted.length === 0 && i === 0 ? prefix : linePad}${currentLine}`);
            currentLine = '';
            currentStripped = '';
          }
        }
        
        remainingProcessed = remainingProcessed.slice(1);
        remainingStripped = remainingStripped.slice(1);
      }
      
      if (currentLine) {
        formatted.push(`${formatted.length === 0 && i === 0 ? prefix : linePad}${currentLine}`);
      }
    }
  });

  return formatted.join('\n');
};

// --- Smooth Printing Logic ---

const printLineSmooth = async (line, currentPrefix, terminalWidth) => {
  const processedLine = parseColoredMessage(line);
  const avail = terminalWidth - stripAnsi(currentPrefix).length;
  
  // Handle colored text carefully for smooth printing
  const totalLength = stripAnsi(processedLine).length;
  
  if (totalLength <= avail) {
    // If the line fits, print it character by character
    for (let i = 1; i <= processedLine.length; i++) {
      const segment = processedLine.slice(0, i);
      process.stdout.write(`\r${currentPrefix}${segment}`);
      await sleep(interval);
    }
    console.log();
  } else {
    // For longer lines, need a more complex approach to handle color codes
    let currentPosition = 0;
    let visiblePosition = 0;
    
    while (currentPosition < processedLine.length) {
      // Find the next position where we'd wrap
      let endPos = currentPosition;
      let visibleCounter = 0;
      
      while (endPos < processedLine.length && visibleCounter < avail) {
        // Check if we're at the start of a color code
        if (processedLine[endPos] === '\u001b') {
          // Skip the entire color code without counting it as visible character
          while (endPos < processedLine.length && processedLine[endPos] !== 'm') {
            endPos++;
          }
          if (endPos < processedLine.length) endPos++; // Skip the 'm' too
        } else {
          // Normal character
          visibleCounter++;
          endPos++;
        }
      }
      
      // Now print this chunk character by character
      let chunkEndPos = Math.min(endPos, processedLine.length);
      for (let i = currentPosition + 1; i <= chunkEndPos; i++) {
        process.stdout.write(`\r${currentPrefix}${processedLine.slice(currentPosition, i)}`);
        await sleep(interval);
      }
      console.log();
      
      currentPosition = chunkEndPos;
      currentPrefix = ' '.repeat(26) + '| ';
    }
  }
};

const printSmooth = async (prefix, lines) => {
  const terminalWidth = Math.floor(process.stdout.columns * 0.9) || 80;
  for (let i = 0; i < lines.length; i++) {
    await printLineSmooth(
      lines[i], 
      i === 0 ? prefix : ' '.repeat(26) + '| ', 
      terminalWidth
    );
  }
};

// --- Main Logging Logic ---

const printMessage = async (message, type, level, timestamp) => {
  const prefix = getPrefix(type, level, timestamp);
  
  // Handle both object and string messages
  let processedMessage;
  if (typeof message === 'object') {
    processedMessage = JSON.stringify(message, null, 2) || '[Unserializable Object]';
  } else {
    // String messages can contain color tags
    processedMessage = String(message);
  }
  
  const lines = processedMessage.split('\n');

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

export default function log(message, type = 200, level = 'INFO') {
  if (processLevel >= getProcessLevel(level)) {
    messageQueue.push({ message, type, level, timestamp: Date.now() });
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
  if (!silent) {

    messageQueue.push({
      message: `DEBUG LEVEL has been changed to ${level}`,
      type: 202,
      level: 'INFO',
      timestamp: Date.now()
    });
    processQueue();
  }
}

log.setSmoothPrint = (isActive = false, printSpeed = 5, options = {}) => {
  const { silent = false } = options;

  smoothPrint = isActive;
  interval = printSpeed;
  if (!silent) {
    messageQueue.push({
      message: `SMOOTH PRINT status has been ${smoothPrint ? `Activated with speed: ${interval}` : `Deactivated`}`,
      type: 202,
      level: 'INFO',
      timestamp: Date.now()
    });
    processQueue();
  }
}

log.colors = {
  ...Object.keys(colors).reduce((acc, color) => {
    if (typeof colors[color] === 'function') {
      acc[color] = colors[color];
    }
    return acc;
  }, {})
};