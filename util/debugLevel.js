
// >  DIR | /util/debugLevel.js

// --- < Debug level > ---


const getDebugLevel = (levelLabel) => {
  switch (levelLabel) {
    case 'MUTE': return { level: -1, color: 'dim' };
    case 'FATAL': return { level: 0, color: 'red' };
    case 'ERROR': return { level: 1, color: 'orange' };
    case 'INFO':  return { level: 2, color: 'yellow' };
    case 'DEBUG': return { level: 3, color: 'brightCyan' };
    case 'TRACE': return { level: 4, color: 'muteCyan' };
    default: return { level: 5, color: 'dim' };
  }
}

module.exports = getDebugLevel;