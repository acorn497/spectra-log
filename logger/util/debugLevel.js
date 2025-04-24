
// >  DIR | /util/debugLevel.js

// --- < Debug level > ---


const getProcessLevel = (levelLabel) => {
  switch (levelLabel) {
    case 'MUTE': return -1;
    case 'FATAL': return 0;
    case 'ERROR': return 1;
    case 'INFO': return 2;
    case 'DEBUG': return 3;
    case 'TRACE': return 4;
    default: return 5;
  }
}

module.exports = getProcessLevel;