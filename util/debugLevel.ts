// >  DIR | /util/debugLevel.js

// --- < Debug level > ---

const getDebugLevel = (levelLabel: string) => {
  switch (levelLabel) {
    case "MUTE":
      return { level: -1, color: "dim" };
    case "TRACE":
      return { level: 0, color: "muteCyan" };
    case "DEBUG":
      return { level: 1, color: "brightCyan" };
    case "INFO":
      return { level: 2, color: "yellow" };
    case "ERROR":
      return { level: 3, color: "orange" };
    case "FATAL":
      return { level: 4, color: "red" };
    default:
      return { level: 5, color: "dim" };
  }
};

export default getDebugLevel;