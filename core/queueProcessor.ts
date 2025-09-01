// >  DIR | /core/queueProcessor.js

import printSmooth from "./printer.js";
import { getPrefix, formatMultiline } from "./formatter.js";
import type { HttpTypeKey, LevelKey } from "./formatter.js";

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

const printMessage = async (message: string, type: HttpTypeKey, level: LevelKey, timestamp: number) => {
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
  if (!item || typeof item !== "object" || item === null) {
    setIsProcessing(false);
    if (messageQueue.length === 0) {
      startStandbyLog();
    } else {
      processQueue();
    }
    return;
  }
  const { message, type, level, timestamp } = item as {
    message?: any;
    type?: any;
    level?: any;
    timestamp?: any;
  };
  await printMessage(message, type, level, timestamp);

  setIsProcessing(false);
  if (messageQueue.length === 0) {
    startStandbyLog();
  } else {
    processQueue();
  }
};

const startStandbyLog = () => {
  if (!getDisplayStandby() || isStandbyActive) return;
  isStandbyActive = true;

  (async function standbyLoop() {
    while (isStandbyActive) {
      const prefix = getPrefix("default", "INFO", Date.now()).replace(
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
