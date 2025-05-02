// >  DIR | /core/queueProcessor.js

// --- < printMessage, processQueue, standby 로그 > ---

import printSmooth from "./printer.js";
import { getPrefix, formatMultiline } from "./formatter.js";
import getDebugLevel from "../util/debugLevel.js";

import {
  getProcessLevel,
  getSmoothPrint,
  getIsProcessing,
  setIsProcessing,
  getDisplayStandby,
  messageQueue,
} from "../config/constants.js";

import colors from "./colorManager.js";
import getFormattedTime from "../util/time.js";
import sleep from "../util/sleep.js";

let isStandbyActive = false;

const printMessage = async (message, type, level, timestamp) => {
  const prefix = getPrefix(type, level, timestamp);
  const str =
    typeof message === "object"
      ? JSON.stringify(message, null, 2) || "[Unserializable Object]"
      : String(message);
  const lines = str.split("\n");

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
  const { message, type, level, timestamp } = item;
  await printMessage(message, type, level, timestamp);

  setIsProcessing(false);
  messageQueue.length === 0 ? startStandbyLog() : processQueue();
};

const startStandbyLog = () => {
  if (!getDisplayStandby() || isStandbyActive) return;
  isStandbyActive = true;

  (async function standbyLoop() {
    while (isStandbyActive) {
      const prefix = getPrefix(0, "INFO", Date.now()).replace(
        /\[.*?\]/,
        `[ ${colors.yellow.bold("STBY")}   | -            | ${getFormattedTime(
          Date.now()
        )} ]`
      );
      process.stdout.write(`\r${prefix}`);
      await sleep(1000);
    }
  })();
};

const stopStandbyLog = () => {
  isStandbyActive = false;
};

export default processQueue;
