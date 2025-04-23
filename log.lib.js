import color from 'ansi-colors';

const stripAnsi = (str) => str.replace(/\x1b\[[0-9;]*m/g, '');

const smoothPrint = true;
const interval = 5;

let isProcessing = false;
let isStandbyActive = false;
const messageQueue = [];

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const MESSAGE_TYPES = {
  100: { label: 'CONTINUE'  , color: color.gray },
  101: { label: 'SWITCHING' , color: color.gray },

  200: { label: 'OK'        , color: color.greenBright },
  201: { label: 'CREATED'   , color: color.green },
  202: { label: 'ACCEPTED'  , color: color.cyan },
  204: { label: 'NO-CONTENT', color: color.dim },

  301: { label: 'MOVED'     , color: color.yellow },
  302: { label: 'FOUND'     , color: color.yellow },
  304: { label: 'NOT-MODIF' , color: color.gray },

  400: { label: 'BAD-REQ'   , color: color.magenta },
  401: { label: 'UNAUTHZED' , color: color.magenta },
  402: { label: 'PAY-REQ'   , color: color.magenta },
  403: { label: 'FORBIDDEN' , color: color.magenta },
  404: { label: 'NOT-FOUND' , color: color.redBright },
  405: { label: 'NO-METHOD' , color: color.magenta },
  408: { label: 'TIMEOUT'   , color: color.magenta },
  409: { label: 'CONFLICT'  , color: color.magenta },
  410: { label: 'GONE'      , color: color.magenta },
  429: { label: 'TOO-MANY'  , color: color.magenta },

  500: { label: 'SERVER-ERR' , color: color.red },
  502: { label: 'BAD-GATEW' , color: color.red },
  503: { label: 'SRV-NAVAIL', color: color.red },
  504: { label: 'GW-TIMEOUT', color: color.red },

  600: { label: 'INFO'      , color: color.yellow },

  default: { label: 'UNKNOWN', color: color.white }
};

const getFormattedTime = (ts) => {
  const t = new Date(ts);
  return `${String(t.getHours()).padStart(2, '0')}:${String(t.getMinutes()).padStart(2, '0')}:${String(t.getSeconds()).padStart(2, '0')}`;
};

const getPrefix = (type, ts) => {
  const { label, color: colorize } = MESSAGE_TYPES[type] || MESSAGE_TYPES[600];
  return `[ ${colorize(label.padEnd(10))} | ${getFormattedTime(ts)} ] | `;
};

const formatMultiline = (lines, prefix, maxWidth = Math.floor(process.stdout.columns * 0.9) || 80) => {
  const visualPrefixLength = stripAnsi(prefix).length;
  const linePad = ' '.repeat(26) + '| ';
  const formatted = [];

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const availWidth = maxWidth - (i === 0 ? visualPrefixLength : 28);
    const chunks = rawLine.match(new RegExp(`.{1,${availWidth}}`, 'g')) || [''];

    for (let j = 0; j < chunks.length; j++) {
      const linePrefix = (i === 0 && j === 0) ? prefix : linePad;
      formatted.push(`${linePrefix}${chunks[j]}`);
    }
  }

  return formatted.join('\n');
};

const printMessage = async (msg, type, ts) => {
  const prefix = getPrefix(type, ts);
  const str = typeof msg === 'object' ? JSON.stringify(msg, null, 2) || '[Unserializable Object]' : String(msg);
  const lines = str.split('\n');

  if (smoothPrint && lines.length > 0) {
    await printSmooth(prefix, lines);
  } else {
    process.stdout.write(`\r${formatMultiline(lines, prefix)}\n`);
  }
};

const printSmooth = async (prefix, lines) => {
  const terminalWidth = Math.floor(process.stdout.columns * 0.9) || 80;
  const visualPrefixLength = stripAnsi(prefix).length;
  const linePad = ' '.repeat(26) + '| ';

  const printLineSmooth = async (line, currentPrefix) => {
    const avail = terminalWidth - stripAnsi(currentPrefix).length;
    const chunks = [line.slice(0, avail), ...(line.slice(avail).match(new RegExp(`.{1,${terminalWidth - 28}}`, 'g')) || [])];
    for (const chunk of chunks) {
      for (let i = 1; i <= chunk.length; i++) {
        process.stdout.write(`\r${currentPrefix}${chunk.slice(0, i)}`);
        await sleep(interval);
      }
      console.log();
      currentPrefix = linePad;
    }
  };

  await printLineSmooth(lines[0], prefix);
  for (let i = 1; i < lines.length; i++) {
    await printLineSmooth(lines[i], linePad);
  }
};

const processQueue = async () => {
  if (isProcessing || messageQueue.length === 0) return;

  stopStandbyLog();
  isProcessing = true;

  const { message, type, timestamp } = messageQueue.shift();
  await printMessage(message, type, timestamp);

  isProcessing = false;
  messageQueue.length === 0 ? startStandbyLog() : processQueue();
};

export default function log (message, type = 0) {
  messageQueue.push({ message, type, timestamp: Date.now() });
  processQueue();
};

const startStandbyLog = () => {
  if (isStandbyActive) return;
  isStandbyActive = true;

  (async function standbyLoop() {
    while (isStandbyActive) {
      const prefix = getPrefix(0, Date.now()).replace(
        /\[.*?\]/,
        `[ ${color.yellow('STAND BY  ')} | ${getFormattedTime(Date.now())} ]`
      );
      process.stdout.write(`\r${prefix}`);
      await sleep(1000);
    }
  })();
};

const stopStandbyLog = () => {
  isStandbyActive = false;
};