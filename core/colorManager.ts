// >  DIR | /config/colorManager.ts

import colors from "ansi-colors";

interface ColorFunction {
  (text: string): string;
  colorCode: number;
  bold?: (text: string) => string;
  dim?: (text: string) => string;
  italic?: (text: string) => string;
  underline?: (text: string) => string;
}

interface ExtendedColors {
  [key: string]: ColorFunction | any;
}

const defineColor = (code: number): ColorFunction => {
  const colorFn = (text: string) => `\u001b[38;5;${code}m${text}\u001b[0m`;
  colorFn.colorCode = code;
  return colorFn as ColorFunction;
};

const customColors = {
  red: defineColor(196),
  green: defineColor(82),
  blue: defineColor(33),
  brightCyan: defineColor(116),
  cyan: defineColor(51),
  muteCyan: defineColor(67),
  white: defineColor(255),
  gray: defineColor(245),
  dim: defineColor(240),
  orange: defineColor(202),
  pink: defineColor(213),
  purple: defineColor(135),
  violet: defineColor(129),
  teal: defineColor(37),
  brightYellow: defineColor(226),
  brightGreen: defineColor(118),
  brightRed: defineColor(196),
  brightBlue: defineColor(75),
  brown: defineColor(130),
  gold: defineColor(220),
  lime: defineColor(154),
  silver: defineColor(250),
  maroon: defineColor(88),
};

const extendedColors = Object.create(colors);
Object.assign(extendedColors, customColors);

const addStyleMethod = (
  colorFn: ColorFunction, 
  styleName: string, 
  styleCode: string
): void => {
  (colorFn as any)[styleName as keyof ColorFunction] = (text: string) => {
    return `\u001b[38;5;${colorFn.colorCode}m${styleCode}${text}\u001b[0m`;
  };
};

// 스타일 메서드 추가
Object.keys(customColors).forEach((color) => {
  const colorFn = extendedColors[color];
  if (typeof colorFn === "function" && colorFn.colorCode !== undefined) {
    addStyleMethod(colorFn as ColorFunction, "bold", "\u001b[1m");
    addStyleMethod(colorFn as ColorFunction, "dim", "\u001b[2m");
    addStyleMethod(colorFn as ColorFunction, "italic", "\u001b[3m");
    addStyleMethod(colorFn as ColorFunction, "underline", "\u001b[4m");
  }
});

export default extendedColors;