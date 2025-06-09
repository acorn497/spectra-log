// >  DIR | /core/colorize.js

// --- < {{ style : color : text }} 처리 > ---

import colors from "./colorManager.js";

const colorizeString = (message) => {
  // 입력값을 안전하게 문자열로 변환
  let processedMessage;
  if (typeof message === 'object' && message !== null) {
    processedMessage = JSON.stringify(message, null, 2);
  } else if (message === null || message === undefined) {
    processedMessage = String(message);
  } else {
    processedMessage = String(message);
  }
  
  const regex = /\{\{\s*(?:(\w+)\s*:\s*)?(\w+)\s*:\s*([^\}]+?)\s*\}\}/g;

  return processedMessage.replace(regex, (match, style, color, text) => {
    style = style?.toLowerCase();
    const colorFn = colors[color] || colors.dim;

    if (style && typeof colorFn[style] === "function") {
      return colorFn[style](text);
    }

    return colorFn(text);
  });
};

export default colorizeString;
