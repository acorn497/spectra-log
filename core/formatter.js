// >  DIR | /core/formatter.js

// --- < getPrefix, formatMultiline, etc. > ---

import LEVEL_TYPES from "../config/levelTypes.js";
import HTTP_MESSAGE_TYPES from "../config/httpTypes.js";
import getFormattedTime from "../util/time.js";
import stripAnsi from "../util/stripAnsi.js";
import stringWidth from "../util/stringWidth.js";

const getPrefix = (type, level, timestamp) => {
  const { levelLabel, color: levelColor } =
    LEVEL_TYPES[level] || LEVEL_TYPES.default;
  const { httpLabel, color: typeColor } =
    HTTP_MESSAGE_TYPES[type] || HTTP_MESSAGE_TYPES.default;

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
  const formatted = [];

  lines.forEach((line, i) => {
    const availWidth =
      maxWidth - (i === 0 ? visualPrefixLength : stripAnsi(linePad).length);

    // If the line is empty, just add the prefix
    if (!line) {
      formatted.push(`${i === 0 ? prefix : linePad}`);
      return;
    }
    const ansiLength = line.length - stripAnsi(line).length;
    let chunks = splitIntoVisualChunks(line, availWidth + ansiLength);

    // If no chunks were created (e.g., only ANSI codes), treat as a single chunk
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

const splitIntoVisualChunks = (text, maxWidth) => {
  // If text is empty, return an empty array
  if (!text) return [];

  // Extract and track all ANSI codes and their positions
  const ansiCodesMap = new Map(); // Map to store ANSI codes by position
  const visibleText = stripAnsi(text); // Text with all ANSI codes removed

  let originalIndex = 0;
  let strippedIndex = 0;
  let activeAnsiCodes = [];

  while (originalIndex < text.length) {
    const ansiMatch = text.slice(originalIndex).match(/^\x1B\[[0-9;]*m/);

    if (ansiMatch) {
      const ansiCode = ansiMatch[0];

      // Store the ANSI code at the current visible text position
      if (!ansiCodesMap.has(strippedIndex)) {
        ansiCodesMap.set(strippedIndex, []);
      }
      ansiCodesMap.get(strippedIndex).push(ansiCode);

      // Track active codes for line wrapping
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

  // Now split the visible text based on width
  const chunks = [];
  let start = 0;

  while (start < visibleText.length) {
    let visibleWidth = 0;
    let end = start;

    // Find how many characters we can fit
    while (end < visibleText.length && visibleWidth < maxWidth) {
      const charWidth = stringWidth(visibleText[end]);
      if (visibleWidth + charWidth <= maxWidth) {
        visibleWidth += charWidth;
        end++;
      } else {
        break;
      }
    }

    // If we couldn't fit anything, force at least one character
    if (end === start && start < visibleText.length) {
      end = start + 1;
    }

    // Build the chunk with all ANSI codes in their proper positions
    let chunk = "";
    let activeCodesForNextChunk = [];

    for (let i = start; i <= end; i++) {
      // Insert any ANSI codes that belong at this position
      if (ansiCodesMap.has(i)) {
        const codes = ansiCodesMap.get(i);
        for (const code of codes) {
          chunk += code;

          // Track active codes for next chunk
          if (code === "\u001b[0m") {
            activeCodesForNextChunk = [];
          } else {
            activeCodesForNextChunk.push(code);
          }
        }
      }

      // Add the character if we're not at the end boundary
      if (i < end && i < visibleText.length) {
        chunk += visibleText[i];
      }
    }

    chunks.push(chunk);
    start = end;

    // Apply active ANSI codes to the beginning of the next chunk
    activeAnsiCodes = [...activeCodesForNextChunk];
  }

  // If we have no chunks (e.g., pure ANSI string), make sure we add it
  if (chunks.length === 0 && text) {
    chunks.push(text);
  }

  return chunks;
};

export { getPrefix, getFormattedTime, formatMultiline, splitIntoVisualChunks };
