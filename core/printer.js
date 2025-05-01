// >  DIR | /core/printer.js

// --- < printSmooth, printLineSmooth > ---

import stripAnsi from "../util/stripAnsi.js";
import sleep from "../util/sleep.js";
import { getPrintSpeed } from "../config/constants.js";
import stringWidth from "../util/stringWidth.js";

const parseAnsiAndText = (str) => {
  const parts = [];
  let i = 0;
  let textBuffer = "";

  while (i < str.length) {
    const ansiMatch = str.slice(i).match(/^\u001b\[[0-9;]*m/);

    if (ansiMatch) {
      // If we have text buffered, add it first
      if (textBuffer) {
        parts.push({ type: "text", content: textBuffer });
        textBuffer = "";
      }

      // Add the ANSI code
      parts.push({ type: "ansi", content: ansiMatch[0] });
      i += ansiMatch[0].length;
    } else {
      // Add to text buffer
      textBuffer += str[i];
      i++;
    }
  }

  // Add any remaining text
  if (textBuffer) {
    parts.push({ type: "text", content: textBuffer });
  }

  return parts;
};

const splitTextIntoChunks = (text, maxWidth) => {
  if (!text) return [];

  const parts = parseAnsiAndText(text);
  const chunks = [];
  let currentChunk = "";
  let currentWidth = 0;
  let activeAnsiCodes = [];

  for (const part of parts) {
    if (part.type === "ansi") {
      // Always add ANSI codes directly
      currentChunk += part.content;

      // Track active codes for next chunk
      if (part.content === "\u001b[0m") {
        activeAnsiCodes = [];
      } else {
        activeAnsiCodes.push(part.content);
      }
    } else {
      let remaining = part.content;

      while (remaining) {
        // Calculate how many characters fit
        let fit = 0;
        let fitWidth = 0;

        for (let i = 0; i < remaining.length; i++) {
          const charWidth = stringWidth(remaining[i]);

          if (currentWidth + fitWidth + charWidth <= maxWidth) {
            fit++;
            fitWidth += charWidth;
          } else {
            break;
          }
        }

        if (fit === 0 && currentWidth > 0) {
          // Can't fit any more characters, start a new chunk
          chunks.push(currentChunk);
          currentChunk = activeAnsiCodes.join("");
          currentWidth = 0;
          // Don't advance in the text
        } else {
          // Add what fits
          const textToAdd = remaining.slice(0, fit || 1);
          currentChunk += textToAdd;
          currentWidth += fitWidth || stringWidth(textToAdd);
          remaining = remaining.slice(fit || 1);

          // If we have remaining text, start a new chunk
          if (remaining && currentWidth > 0) {
            chunks.push(currentChunk);
            currentChunk = activeAnsiCodes.join("");
            currentWidth = 0;
          }
        }
      }
    }
  }

  // Add the last chunk if there is one
  if (currentChunk) {
    chunks.push(currentChunk);
  }

  return chunks;
};

const printLineSmooth = async (line, currentPrefix, terminalWidth) => {
  const prefixWidth = stripAnsi(currentPrefix).length;
  const availWidth = terminalWidth - prefixWidth;

  // Split the line into properly sized chunks
  const chunks = splitTextIntoChunks(line, availWidth);

  // If no chunks, just print the prefix
  if (chunks.length === 0) {
    process.stdout.write(`\r${currentPrefix}\n`);
    return;
  }

  // Print each chunk
  for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex++) {
    const chunk = chunks[chunkIndex];
    const prefix = chunkIndex === 0 ? currentPrefix : " ".repeat(36) + " | ";

    process.stdout.write(`\r${prefix}`);

    // Print the chunk character by character
    const parts = parseAnsiAndText(chunk);

    for (const part of parts) {
      if (part.type === "ansi") {
        // ANSI codes print instantly
        process.stdout.write(part.content);
      } else {
        // Text prints with delay
        for (const char of part.content) {
          process.stdout.write(char);
          await sleep(getPrintSpeed());
        }
      }
    }

    process.stdout.write("\n");
  }
};

const printSmooth = async (prefix, lines) => {
  const terminalWidth = Math.floor(process.stdout.columns * 0.9) || 80;

  for (let i = 0; i < lines.length; i++) {
    const linePrefix = i === 0 ? prefix : " ".repeat(36) + " | ";
    await printLineSmooth(lines[i], linePrefix, terminalWidth);
  }
};

export default printSmooth;
