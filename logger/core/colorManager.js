
// >  DIR | /config/colorManager

// --- < ansi-colors 확장 + 스타일 추가 > ---


const colors = require('ansi-colors');

const defineColor = (code) => {
  const colorFn = (text) => `\u001b[38;5;${code}m${text}\u001b[0m`;
  colorFn.colorCode = code;
  return colorFn;
};

colors.red = defineColor(196);
colors.green = defineColor(82);
colors.blue = defineColor(33);
colors.brightCyan = defineColor(116);
colors.cyan = defineColor(51);
colors.muteCyan = defineColor(67);
colors.white = defineColor(255);
colors.gray = defineColor(245);
colors.dim = defineColor(240);
colors.orange = defineColor(202);

const addStyleMethod = (colorFn, styleName, styleCode) => {
  colorFn[styleName] = text => {
    return `\u001b[38;5;${colorFn.colorCode}m${styleCode}${text}\u001b[0m`;
  };
};

Object.keys(colors).forEach(color => {
  if (typeof colors[color] === 'function' && colors[color].colorCode) {
    addStyleMethod(colors[color], 'bold', '\u001b[1m');
    addStyleMethod(colors[color], 'dim', '\u001b[2m');
    addStyleMethod(colors[color], 'italic', '\u001b[3m');
    addStyleMethod(colors[color], 'underline', '\u001b[4m');
  }
});

module.exports = colors