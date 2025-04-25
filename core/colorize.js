
// >  DIR | /core/colorize.js

// --- < {{ style : color : text }} 처리 > ---


const colors = require('./colorManager.js')

const colorizeString = (message) => {
  const regex = /\{\{\s*(?:(\w+)\s*:\s*)?(\w+)\s*:\s*([^\}]+?)\s*\}\}/g;

  return message.replace(regex, (match, style, color, text) => {
    style = style?.toLowerCase();
    const colorFn = colors[color] || colors.dim;

    if (style && typeof colorFn[style] === 'function') {
      return colorFn[style](text);
    }

    return colorFn(text);
  });
};

module.exports = colorizeString;