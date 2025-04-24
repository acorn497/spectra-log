
// >  DIR | /core/queueProcessor.js

// --- < printMessage, processQueue, standby 로그 > ---


const printSmooth = require('./printer.js');
const { getPrefix } = require('./formatter.js');

let { isProcessing, smoothPrint } = require('../config/constants.js');
const { messageQueue } = require('../config/constants.js');
const colors = require('./colorManager.js');
const getFormattedTime = require('../util/time.js');
const sleep = require('../util/sleep.js');

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

  const item = messageQueue.shift();
  const { message, type, level, timestamp } = item
  await printMessage(message, type, level, timestamp);

  isProcessing = false;
  messageQueue.length === 0 ? startStandbyLog() : processQueue();
};

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

module.exports = processQueue;