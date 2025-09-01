// >  DIR | /core/printer.ts

import stripAnsi from "../util/stripAnsi.js";
import sleep from "../util/sleep.js";
import { getPrintSpeed } from "../config/constants.js";
import stringWidth from "../util/stringWidth.js";

const parseAnsiAndText = (str: string) => {
  const parts: { type: string, content: string }[] = [];
  let i = 0;
  let textBuffer = "";

  while (i < str.length) {
    const ansiMatch = str.slice(i).match(/^\u001b\[[0-9;]*m/);

    if (ansiMatch) {
      if (textBuffer) {
        parts.push({ type: "text", content: textBuffer });
        textBuffer = "";
      }

      parts.push({ type: "ansi", content: ansiMatch[0] });
      i += ansiMatch[0].length;
    } else {
      textBuffer += str[i];
      i++;
    }
  }

  if (textBuffer) {
    parts.push({ type: "text", content: textBuffer });
  }

  return parts;
};

const splitTextIntoChunks = (text: string, maxWidth: number) => {
  if (!text) return [];

  const parts = parseAnsiAndText(text);
  const chunks: string[] = [];
  let currentChunk: string = "";
  let currentWidth: number = 0;
  let activeAnsiCodes: string[] = [];

  for (const part of parts) {
    if (part.type === "ansi") {
      currentChunk += part.content;

      // Track active codes for next chunk
      if (part.content === "\u001b[0m") {
        activeAnsiCodes = [];
      } else {
        activeAnsiCodes.push(part.content);
      }
    } else {
      let remaining: string = part.content;

      while (remaining) {
        let fit: number = 0;
        let fitWidth: number = 0;

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
          chunks.push(currentChunk);
          currentChunk = activeAnsiCodes.join("");
          currentWidth = 0;
        } else {
          const textToAdd: string = remaining.slice(0, fit || 1);
          currentChunk += textToAdd;
          currentWidth += fitWidth || stringWidth(textToAdd);
          remaining = remaining.slice(fit || 1);

          if (remaining && currentWidth > 0) {
            chunks.push(currentChunk);
            currentChunk = activeAnsiCodes.join("");
            currentWidth = 0;
          }
        }
      }
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk);
  }

  return chunks;
};

const printLineSmooth = async (line: string, currentPrefix: string, terminalWidth: number) => {
  const prefixWidth = stripAnsi(currentPrefix).length;
  const availWidth = terminalWidth - prefixWidth;

  const chunks = splitTextIntoChunks(line, availWidth);

  if (chunks.length === 0) {
    process.stdout.write(`\r${currentPrefix}\n`);
    return;
  }

  for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex++) {
    const chunk = chunks[chunkIndex];
    const prefix = chunkIndex === 0 ? currentPrefix : " ".repeat(36) + " | ";

    process.stdout.write(`\r${prefix}`);

    const parts = parseAnsiAndText(chunk);

    for (const part of parts) {
      if (part.type === "ansi") {
        process.stdout.write(part.content);
      } else {
        for (const char of part.content) {
          process.stdout.write(char);
          await sleep(getPrintSpeed());
        }
      }
    }

    process.stdout.write("\n");
  }
};

const printSmooth = async (prefix: string, lines: string[]) => {
  const terminalWidth = Math.floor(process.stdout.columns * 0.9) || 80;

  for (let i = 0; i < lines.length; i++) {
    const linePrefix = i === 0 ? prefix : " ".repeat(36) + " | ";
    await printLineSmooth(lines[i], linePrefix, terminalWidth);
  }
};

export default printSmooth;