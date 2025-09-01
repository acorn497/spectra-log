// >  DIR | /index.js

// --- < main controller of modern-cli-logger > ---

import colorizeString from "./core/colorize.js";
import processQueue from "./core/queueProcessor.js";
import getDebugLevel from "./util/debugLevel.js";

import {
  setProcessLevel,
  getProcessLevel,
  setSmoothPrint,
  setPrintSpeed,
  setDisplayStandby,
} from "./config/constants.js";
import type { DebugLevelString } from "./config/constants.js";
import { messageQueue } from "./config/constants.js";

export type LogOption = {
  urgent?: boolean;
  force?: boolean;
  silent?: boolean
};

const log = (message: any, type: number = 200, level: DebugLevelString = "INFO", option: LogOption = {}) => {
  const { urgent = false, force = false } = option;
  if (force === true || getProcessLevel() <= getDebugLevel(level).level) {
    message = colorizeString(message);
    if (urgent === true)
      messageQueue.unshift({ message, type, level, timestamp: Date.now() });
    else
      messageQueue.push({ message, type, level, timestamp: Date.now() });

    processQueue();
  }
};

log.setDebugLevel = (level: DebugLevelString, options = { silent: false }) => {
  const { silent } = options;

  const temp = getDebugLevel(level);
  setProcessLevel(level);
  silentHandler(
    silent,
    `{{ bold : yellow : Debug level }} has been changed to {{ bold : ${temp.color} : ${level} }}.`
  );
};

log.setPrintSpeed = (delay: number, option: LogOption = {}) => {
  const { silent = false } = option;

  setPrintSpeed(delay);
  silentHandler(
    silent,
    `{{ bold : yellow : Smooth process level }} has been set to {{ bold : green : ${delay}ms Per Character }}.`
  );
};

log.setSmoothPrint = (value, options: LogOption = {}) => {
  const { silent = false } = options;

  setSmoothPrint(value);
  silentHandler(
    silent,
    `{{ bold : yellow : Smooth print }} mode has been {{ bold : ${value ? "green : ACTIVATED" : "red : DEACTIVATED"} }}.`
  );
};

log.setDisplayStandby = (value: boolean, options = {}) => {
  setDisplayStandby(value);
  deprecationHandler(
    `{{ bold : yellow : Stand by }} mode has been {{ bold : ${value ? "green : ACTIVATED" : "red : DEACTIVATED"} }}`,
    "setDisplayStandby()",
    "setDisplayStandBy()"
  );
  processQueue();
};

log.setDisplayStandBy = (value: boolean, options: LogOption = {}) => {
  const { silent = false } = options;

  setDisplayStandby(value);
  silentHandler(
    silent,
    `{{ bold : yellow : Stand by }} mode has been {{ bold : ${value ? "green : ACTIVATED" : "red : DEACTIVATED"} }}.`
  );
};

const silentHandler = (silent: boolean = false, message: string) => {
  if (!silent) {
    log(message, 202, "INFO", { force: true });
    processQueue();
  }
};

const deprecationHandler = (message: string, before: string, after: string) => {
  log(
    `${message}\n    \n[{{ bold : red : DEPRECATION WARNING }}] {{ bold : yellow : ${before} }} is deprecated. Use {{ bold : green : ${after} }} instead.\nIt will be removed at next Major update.\n`
  );
}

export default log;
