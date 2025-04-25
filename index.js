
// >  DIR | /index.js

// --- < main controller of modern-cli-logger > ---


const colorizeString = require('./core/colorize.js');
const processQueue = require('./core/queueProcessor.js');
const getDebugLevel = require('./util/debugLevel.js');

let { setProcessLevel, getProcessLevel, setSmoothPrint, setPrintSpeed } = require('./config/constants.js');
const { messageQueue } = require('./config/constants.js');

function log(message, type = 200, level = 'INFO', option = {}) {
  const { urgent = false } = option;
  if (urgent || getProcessLevel() >= getDebugLevel(level).level) {
    message = colorizeString(message);
    if (!urgent) messageQueue.push({ message, type, level, timestamp: Date.now() });
    else messageQueue.unshift({ message, type, level, timestamp: Date.now() })

    processQueue();
  }
}

log.setDebugLevel = (level, options = {}) => {
  const { silent = false } = options;

  const temp = getDebugLevel(level);
  setProcessLevel(temp.level);
  silentHandler(silent, `{{ bold : yellow : Debug level }} has been changed to {{ bold : ${temp.color} : ${level} }}.`);
}

log.setPrintSpeed = (delay, options = {}) => {
  const { silent = false } = options;

  setPrintSpeed(delay);
  silentHandler(silent, `{{ bold : yellow : Smooth process level }} has been set to {{ bold : green : ${delay}ms Per Character }}.`);
}

log.setSmoothPrint = (value, options = {}) => {
  const { silent = false } = options;

  setSmoothPrint(value);
  silentHandler(silent, `{{ bold : yellow : Smooth print }} mode has been {{ bold : ${value ? "green : ACTIVATED" : "red : DEACTIVATED"} }}.`);
}

const silentHandler = (silent, message) => {
  if (!silent) {
    log(message, 202, 'INFO', { urgent: true });
    processQueue();
  }
}

module.exports = log;