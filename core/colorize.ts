// >  DIR | /core/colorize.js

import colors from "./colorManager.js";

const colorizeString = (message: any): string => {
  let processedMessage: string;
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
    
    const trimmedText = text.replace(/^ /, '').replace(/ $/, '');
    
    const colorFn = colors[color] || colors.dim;
    if (style && typeof colorFn[style] === "function") {
      return colorFn[style](trimmedText);
    }
    return colorFn(trimmedText);
  });
};

export default colorizeString;