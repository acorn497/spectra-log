
// >  DIR | /util/stripAnsi.js

// --- < stringWidth > ---


const stripAnsi = require('./stripAnsi.js');

const fullWidthRegex = /[\u1100-\u115F\u2329\u232A\u2E80-\u303E\u3040-\uA4CF\uAC00-\uD7A3\uF900-\uFAFF\uFE10-\uFE19\uFE30-\uFE6F\uFF01-\uFF60\uFFE0-\uFFE6]|[\u{1F300}-\u{1F64F}]|[\u{1F900}-\u{1F9FF}]/u;

function stringWidth(str) {
  const clean = stripAnsi(str);
  let width = 0;

  for (const char of [...clean]) {
    width += fullWidthRegex.test(char) ? 2 : 1;
  }

  return width;
}

module.exports = stringWidth;