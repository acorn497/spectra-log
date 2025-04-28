
// >  DIR | /core/queueProcessor.js

// --- < printMessage, processQueue, standby 로그 > ---


const printSmooth = require('./printer.js');
const { getPrefix, formatMultiline } = require('./formatter.js');
const getDebugLevel = require('../util/debugLevel.js');

let { getProcessLevel, getSmoothPrint, getIsProcessing, setIsProcessing, getDisplayStandby } = require('../config/constants.js');
const { messageQueue } = require('../config/constants.js');
const colors = require('./colorManager.js');
const getFormattedTime = require('../util/time.js');
const sleep = require('../util/sleep.js');
let isStandbyActive = false;

const printMessage = async (message, type, level, timestamp) => {
  const prefix = getPrefix(type, level, timestamp);
  const str = typeof message === 'object' ? JSON.stringify(message, null, 2) || '[Unserializable Object]' : String(message);
  const lines = str.split('\n');

  if (getSmoothPrint() && lines.length > 0) {
    await printSmooth(prefix, lines);
  } else {
    process.stdout.write(`\r${formatMultiline(lines, prefix)}\n`);
  }
};

const processQueue = async () => {
  if (getIsProcessing() || messageQueue.length === 0) return;
  stopStandbyLog();
  setIsProcessing(true);

  const item = messageQueue.shift();
  if (getProcessLevel() >= getDebugLevel(item.level)) {
  }
  const { message, type, level, timestamp } = item
  await printMessage(message, type, level, timestamp);

  setIsProcessing(false);
  messageQueue.length === 0 ? startStandbyLog() : processQueue();
};

const startStandbyLog = () => {
  if (!getDisplayStandby() || isStandbyActive) return;
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