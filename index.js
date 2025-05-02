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
import { messageQueue } from "./config/constants.js";

const log = (message, type = 200, level = "INFO", option = {}) => {
  const { urgent = false, force = false } = option;
  if (force || getProcessLevel() >= getDebugLevel(level).level) {
    message = colorizeString(message);
    if (!urgent)
      messageQueue.push({ message, type, level, timestamp: Date.now() });
    else messageQueue.unshift({ message, type, level, timestamp: Date.now() });

    processQueue();
  }
};

log.setDebugLevel = (level, options = {}) => {
  const { silent = false } = options;

  const temp = getDebugLevel(level);
  setProcessLevel(temp.level);
  silentHandler(
    silent,
    `{{ bold : yellow : Debug level }} has been changed to {{ bold : ${temp.color} : ${level} }}.`
  );
};

log.setPrintSpeed = (delay, options = {}) => {
  const { silent = false } = options;

  setPrintSpeed(delay);
  silentHandler(
    silent,
    `{{ bold : yellow : Smooth process level }} has been set to {{ bold : green : ${delay}ms Per Character }}.`
  );
};

log.setSmoothPrint = (value, options = {}) => {
  const { silent = false } = options;

  setSmoothPrint(value);
  silentHandler(
    silent,
    `{{ bold : yellow : Smooth print }} mode has been {{ bold : ${value ? "green : ACTIVATED" : "red : DEACTIVATED"} }}.`
  );
};

log.setDisplayStandby = (value, options = {}) => {
  setDisplayStandby(value);
  deprecationHandler(
    `{{ bold : yellow : Stand by }} mode has been {{ bold : ${value ? "green : ACTIVATED" : "red : DEACTIVATED"} }}`,
    "setDisplayStandby()",
    "setDisplayStandBy()"
  );
  processQueue();
};

log.setDisplayStandBy = (value, options = {}) => {
  const { silent = false } = options;

  setDisplayStandby(value);
  silentHandler(
    silent,
    `{{ bold : yellow : Stand by }} mode has been {{ bold : ${value ? "green : ACTIVATED" : "red : DEACTIVATED"} }}.`
  );
};

const silentHandler = (silent, message) => {
  if (!silent) {
    log(message, 202, "INFO", { force: true });
    processQueue();
  }
};

const deprecationHandler = (message, before, after) => {
  log(
    `${message}
    \n[{{ bold : red : DEPRECATION WARNING }}] {{ bold : yellow : ${before} }} is deprecated. Use {{ bold : green : ${after} }} instead.\nIt will be removed at next Major update.\n`
  );
}

export default log;
