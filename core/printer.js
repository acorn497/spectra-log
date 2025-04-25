
// >  DIR | /core/printer.js

// --- < printSmooth, printLineSmooth > ---


const stripAnsi = require('../logger/util/stripAnsi.js');
const sleep = require('../logger/util/sleep.js');
const { getPrintSpeed } = require('../config/constants.js');

const matchAnsiCode = (str) => {
  const match = str.match(/\u001b\[[0-9;]*m/);
  if (match && match.index === 0) {
    return match[0];
  }
  return null;
};

const printLineSmooth = async (line, currentPrefix, terminalWidth) => {
  const avail = terminalWidth - stripAnsi(currentPrefix).length;
  const chunks = [line.slice(0, avail), ...(line.slice(avail).match(new RegExp(`.{1,${terminalWidth - 28}}`, 'g')) || [])];

  for (const chunk of chunks) {
    process.stdout.write(`\r${currentPrefix}`);

    for (let i = 0; i < chunk.length;) {
      const remaining = chunk.slice(i);
      const ansi = matchAnsiCode(remaining);

      if (ansi) {
        process.stdout.write(ansi);
        i += ansi.length;
        continue;
      }

      process.stdout.write(chunk[i]);
      await sleep(getPrintSpeed());
      i += 1;
    }

    process.stdout.write('\n');
    currentPrefix = ' '.repeat(36) + ' | ';
  }
};

const printSmooth = async (prefix, lines) => {
  const terminalWidth = Math.floor(process.stdout.columns * 0.9) || 80;
  await printLineSmooth(lines[0], prefix, terminalWidth);
  for (let i = 1; i < lines.length; i++) {
    await printLineSmooth(lines[i], ' '.repeat(36) + ' | ', terminalWidth);
  }
};

module.exports = printSmooth;