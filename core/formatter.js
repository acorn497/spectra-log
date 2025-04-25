
// >  DIR | /core/formatter.js

// --- < getPrefix, formatMultiline, etc. > ---


const LEVEL_TYPES = require('../config/levelTypes.js');
const HTTP_MESSAGE_TYPES = require('../config/httpTypes.js');
const getFormattedTime = require('../logger/util/time.js');
const stripAnsi = require('../logger/util/stripAnsi.js');

const getPrefix = (type, level, timestamp) => {
  const { levelLabel, color: levelColor } = LEVEL_TYPES[level] || LEVEL_TYPES.default;
  const { httpLabel, color: typeColor } = HTTP_MESSAGE_TYPES[type] || HTTP_MESSAGE_TYPES.default;

  const shortLabel = levelLabel.substring(0, 2);
  const fullLabel = shortLabel + levelLabel.substring(2);

  return `[ ${levelColor(fullLabel.padEnd(6))} | ${typeColor(httpLabel.padEnd(12))} | ${getFormattedTime(timestamp)} ] | `;
};

const formatMultiline = (lines, prefix, maxWidth = Math.floor(process.stdout.columns * 0.9) || 80) => {
  const visualPrefixLength = stripAnsi(prefix).length;
  const linePad = ' '.repeat(36) + ' | ';
  const formatted = [];

  lines.forEach((line, i) => {
    const availWidth = maxWidth - (i === 0 ? visualPrefixLength : 28);
    const chunks = line.match(new RegExp(`.{1,${availWidth}}`, 'g')) || [''];
    chunks.forEach((chunk, j) => {
      const linePrefix = (i === 0 && j === 0) ? prefix : linePad;
      formatted.push(`${linePrefix}${chunk}`);
    });
  });

  return formatted.join('\n');
};

module.exports = {
  getPrefix,
  formatMultiline
}