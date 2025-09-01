// >  DIR | /core/formatter.ts

import LEVEL_TYPES from "../config/levelTypes.js";
import HTTP_MESSAGE_TYPES from "../config/httpTypes.js";
import getFormattedTime from "../util/time.js";
import stripAnsi from "../util/stripAnsi.js";
import stringWidth from "../util/stringWidth.js";

export type LevelKey = keyof typeof LEVEL_TYPES;
export type HttpTypeKey = keyof typeof HTTP_MESSAGE_TYPES;

const getPrefix = (type: HttpTypeKey, level: LevelKey, timestamp: number) => {
  const { levelLabel, color: levelColor } = LEVEL_TYPES[level] || LEVEL_TYPES.default;
  const { httpLabel, color: typeColor } = HTTP_MESSAGE_TYPES[type] || HTTP_MESSAGE_TYPES.default;

  const shortLabel = levelLabel.substring(0, 2);
  const fullLabel = shortLabel + levelLabel.substring(2);

  return `[ ${levelColor(fullLabel.padEnd(6))} | ${typeColor(
    httpLabel.padEnd(12)
  )} | ${getFormattedTime(timestamp)} ] | `;
};

const formatMultiline = (
  lines,
  prefix,
  maxWidth = Math.floor(process.stdout.columns * 0.9) || 80
) => {
  const visualPrefixLength = stripAnsi(prefix).length;
  const linePad = " ".repeat(36) + " | ";
  const formatted: string[] = [];

  lines.forEach((line, i) => {
    const availWidth =
      maxWidth - (i === 0 ? visualPrefixLength : stripAnsi(linePad).length);

    if (!line) {
      formatted.push(`${i === 0 ? prefix : linePad}`);
      return;
    }
    const ansiLength = line.length - stripAnsi(line).length;
    let chunks = splitIntoVisualChunks(line, availWidth + ansiLength);

    if (chunks.length === 0) {
      chunks = [line];
    }

    chunks.forEach((chunk, chunkIndex) => {
      const linePrefix = i === 0 && chunkIndex === 0 ? prefix : linePad;
      formatted.push(`${linePrefix}${chunk}`);
    });
  });

  return formatted.join("\n");
};

const splitIntoVisualChunks = (text: string, maxWidth: number): string[] => {
  if (!text) return [];

  const ansiCodesMap = new Map();
  const visibleText = stripAnsi(text);

  let originalIndex: number = 0;
  let strippedIndex: number = 0;
  let activeAnsiCodes: string[] = [];

  while (originalIndex < text.length) {
    const ansiMatch = text.slice(originalIndex).match(/^\x1B\[[0-9;]*m/);

    if (ansiMatch) {
      const ansiCode = ansiMatch[0];

      if (!ansiCodesMap.has(strippedIndex)) {
        ansiCodesMap.set(strippedIndex, []);
      }
      ansiCodesMap.get(strippedIndex).push(ansiCode);

      if (ansiCode === "\u001b[0m") {
        activeAnsiCodes = [];
      } else {
        activeAnsiCodes.push(ansiCode);
      }

      originalIndex += ansiCode.length;
    } else {
      originalIndex++;
      strippedIndex++;
    }
  }

  const chunks: string[] = [];
  let start: number = 0;

  while (start < visibleText.length) {
    let visibleWidth = 0;
    let end = start;

    while (end < visibleText.length && visibleWidth < maxWidth) {
      const charWidth = stringWidth(visibleText[end]);
      if (visibleWidth + charWidth <= maxWidth) {
        visibleWidth += charWidth;
        end++;
      } else {
        break;
      }
    }

    if (end === start && start < visibleText.length) {
      end = start + 1;
    }

    let chunk: string = "";
    let activeCodesForNextChunk: string[] = [];

    for (let i = start; i <= end; i++) {
      if (ansiCodesMap.has(i)) {
        const codes = ansiCodesMap.get(i);
        for (const code of codes) {
          chunk += code;

          if (code === "\u001b[0m") {
            activeCodesForNextChunk = [];
          } else {
            activeCodesForNextChunk.push(code);
          }
        }
      }

      if (i < end && i < visibleText.length) {
        chunk += visibleText[i];
      }
    }

    chunks.push(chunk);
    start = end;

    activeAnsiCodes = [...activeCodesForNextChunk];
  }

  if (chunks.length === 0 && text) {
    chunks.push(text);
  }

  return chunks;
};

export { getPrefix, getFormattedTime, formatMultiline, splitIntoVisualChunks };