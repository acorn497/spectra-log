
// >  DIR | /config/levelTypes.js

// --- < LEVEL_TYPES 정의 > ---


const colors = require('../core/colorManager.js')

const LEVEL_TYPES = {
  FATAL: { levelLabel: 'FATAL', color: colors.red.bold },
  ERROR: { levelLabel: 'ERROR', color: colors.orange.bold },
  INFO: { levelLabel: 'INFO', color: colors.yellow.bold },
  DEBUG: { levelLabel: 'DEBUG', color: colors.brightCyan.bold },
  TRACE: { levelLabel: 'TRACE', color: colors.muteCyan.bold },

  default: { levelLabel: 'NOTLVL', color: colors.red.bold }
};

module.exports = LEVEL_TYPES;